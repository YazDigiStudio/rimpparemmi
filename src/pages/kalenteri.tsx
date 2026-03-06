// Kalenteri page — /kalenteri
// Two tabs: "Kalenteri" and "Liput".
// Desktop: production detail panel left, calendar + day cards right (sticky).
// Mobile: calendar top, compact cards below, detail opens as modal.

import { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import CalendarWidget, { type CalendarEvent } from "@/components/CalendarWidget";
import ShowModal, { type ShowInfo, type ShowPerformance } from "@/components/ShowModal";
import { colors } from "@/styles/colors";
import {
  getProductions,
  getPerformances,
  getLiputData,
  type Production,
  type Performance,
  type SectionPageData,
  type SectionPageSection,
} from "@/lib/content";

type Locale = "fi" | "en";
type View = "calendar" | "tickets";

const copy = {
  fi: {
    meta: "Kalenteri & liput – Tanssiteatteri Rimpparemmi",
    tabCalendar: "Kalenteri",
    tabTickets: "Tietoa lipuista",
    calendarTitle: "Esityskalenteri",
    buyTickets: "Osta liput",
    noPerformances: "Ei tulevia esityksiä.",
    upcomingTitle: "Tulevat esitykset",
    readMore: "Lue lisää →",
  },
  en: {
    meta: "Calendar & tickets – Dance Theatre Rimpparemmi",
    tabCalendar: "Calendar",
    tabTickets: "Tickets",
    calendarTitle: "Performance Calendar",
    buyTickets: "Buy tickets",
    noPerformances: "No upcoming performances.",
    upcomingTitle: "Upcoming performances",
    readMore: "Read more →",
  },
} as const;

type Props = {
  productions: Production[];
  performances: Performance[];
  liputData: SectionPageData;
};

// ── Liput section helpers ─────────────────────────────────────────────────────

function renderText(text: string): React.ReactNode[] {
  return text
    .trim()
    .split(/\n\n+/)
    .map((para, i) => {
      const parts = para.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part.split("\n").reduce<React.ReactNode[]>((acc, line, k, arr) => {
          acc.push(line);
          if (k < arr.length - 1) acc.push(<br key={`br-${k}`} />);
          return acc;
        }, []);
      });
      return (
        <p
          key={i}
          style={{
            color: colors.nearBlack,
            fontSize: "0.95rem",
            lineHeight: 1.85,
            opacity: 0.85,
            marginBottom: "1rem",
          }}
        >
          {parts}
        </p>
      );
    });
}

function LiputSectionBlock({ section, locale }: { section: SectionPageSection; locale: Locale }) {
  const title = locale === "fi" ? section.title_fi : (section.title_en ?? section.title_fi);
  const text = locale === "fi" ? section.text_fi : (section.text_en ?? section.text_fi);
  const alt = locale === "fi" ? section.image_alt_fi : (section.image_alt_en ?? section.image_alt_fi);

  const hasTitle = !!(title?.trim());
  const hasText = !!(text?.trim());
  const hasImage = !!(section.image?.trim());

  if (!hasTitle && !hasText && !hasImage) return null;

  const aspectRatio = section.image_orientation === "portrait" ? "2/3" : "16/9";
  const imagePosition = section.image_position ?? "left";

  if (hasImage && !hasTitle && !hasText) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio,
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "4rem",
        }}
      >
        <Image src={section.image!} alt={alt ?? ""} fill style={{ objectFit: "cover" }} sizes="100vw" />
      </div>
    );
  }

  const imageEl = hasImage ? (
    <div style={{ flex: "1 1 280px", position: "relative", aspectRatio, borderRadius: "4px", overflow: "hidden" }}>
      <Image
        src={section.image!}
        alt={alt ?? ""}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  ) : null;

  const textEl = hasText ? (
    <div style={{ flex: "1 1 280px" }}>{renderText(text!)}</div>
  ) : null;

  return (
    <div style={{ marginBottom: "4rem" }}>
      {hasTitle && (
        <h2
          style={{
            color: colors.nearBlack,
            fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: "1.25rem",
          }}
        >
          {title}
        </h2>
      )}
      {hasImage && hasText ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "center" }}>
          {imagePosition === "right" ? textEl : imageEl}
          {imagePosition === "right" ? imageEl : textEl}
        </div>
      ) : (
        textEl
      )}
    </div>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

export default function Kalenteri({ productions, performances, liputData }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

  const [view, setView] = useState<View>("calendar");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [modalInfo, setModalInfo] = useState<ShowInfo | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-select the next upcoming production on load
  const nextProductionId = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const next = performances
      .filter((p) => p.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
    return next?.production_id ?? null;
  }, [performances]);

  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(nextProductionId);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return performances.map((p) => {
      const prod = productions.find((pr) => pr.id === p.production_id);
      const title = prod
        ? (locale === "fi" ? prod.title_fi : (prod.title_en ?? prod.title_fi))
        : p.production_id;
      const [yyyy, mm, dd] = p.date.split("-");
      return {
        date: `${parseInt(dd, 10)}.${parseInt(mm, 10)}.${yyyy}`,
        time: p.time,
        title,
        venue: locale === "fi" ? p.venue_fi : (p.venue_en ?? p.venue_fi),
        ticketUrl: p.ticket_url ?? prod?.ticket_url_fallback ?? "",
        productionId: p.production_id,
      };
    });
  }, [productions, performances, locale]);

  // showInfoMap for mobile modal — keyed by productionId
  const showInfoMap = useMemo<Record<string, ShowInfo>>(() => {
    const today = new Date().toISOString().split("T")[0];
    const map: Record<string, ShowInfo> = {};
    productions.forEach((prod) => {
      const title = locale === "fi" ? prod.title_fi : (prod.title_en ?? prod.title_fi);
      const subtitle = locale === "fi" ? prod.subtitle_fi : (prod.subtitle_en ?? prod.subtitle_fi);
      const longText = locale === "fi" ? prod.long_text_fi : (prod.long_text_en ?? prod.long_text_fi);
      const description = longText ? longText.trim().split(/\n\n+/) : [prod.short_text_fi];
      const infoText = locale === "fi" ? prod.info_fi : (prod.info_en ?? prod.info_fi);
      const credits = infoText ? infoText.trim().split("\n").filter(Boolean) : [];
      const prodPerfs: ShowPerformance[] = performances
        .filter((p) => p.production_id === prod.id && p.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
        .map((p) => {
          const [yyyy, mm, dd] = p.date.split("-");
          return {
            date: `${parseInt(dd, 10)}.${parseInt(mm, 10)}.${yyyy}`,
            time: p.time,
            ticketUrl: p.ticket_url ?? prod.ticket_url_fallback ?? "",
          };
        });
      map[prod.id] = { title, subtitle, image: prod.primary_image, description, credits, performances: prodPerfs };
    });
    return map;
  }, [productions, performances, locale]);

  // Default cards: events on the day of the next upcoming performance
  const nextDayEvents = useMemo<CalendarEvent[]>(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextPerf = performances
      .filter((p) => p.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    if (!nextPerf) return [];
    const [yyyy, mm, dd] = nextPerf.date.split("-");
    const nextDate = `${parseInt(dd, 10)}.${parseInt(mm, 10)}.${yyyy}`;
    return calendarEvents.filter((e) => e.date === nextDate);
  }, [performances, calendarEvents]);

  // Deduplicated events for card display (one card per production)
  const displayCards = useMemo<CalendarEvent[]>(() => {
    const source = selectedDayEvents.length > 0 ? selectedDayEvents : nextDayEvents;
    const seen = new Set<string>();
    return source.filter((e) => {
      const key = e.productionId ?? e.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedDayEvents, nextDayEvents]);

  const handleDayClick = (events: CalendarEvent[]) => {
    setSelectedDayEvents(events);
    const firstProdId = events[0]?.productionId ?? null;
    if (firstProdId) setSelectedProductionId(firstProdId);
  };

  // Desktop detail panel — driven by selectedProductionId
  const selectedProduction = selectedProductionId
    ? productions.find((p) => p.id === selectedProductionId) ?? null
    : null;

  const formatDate = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${parseInt(dd, 10)}.${parseInt(mm, 10)}.${yyyy}`;
  };

  const today = new Date().toISOString().split("T")[0];

  const selectedPerformances = selectedProduction
    ? performances
        .filter((p) => p.production_id === selectedProduction.id && p.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    : [];

  const selectedTitle = selectedProduction
    ? (locale === "fi" ? selectedProduction.title_fi : (selectedProduction.title_en ?? selectedProduction.title_fi))
    : null;

  const selectedLongText = selectedProduction
    ? (locale === "fi" ? selectedProduction.long_text_fi : (selectedProduction.long_text_en ?? selectedProduction.long_text_fi))
    : null;

  const selectedInfoText = selectedProduction
    ? (locale === "fi" ? selectedProduction.info_fi : (selectedProduction.info_en ?? selectedProduction.info_fi))
    : null;

  const longTextParagraphs = selectedLongText ? selectedLongText.trim().split(/\n\n+/) : [];
  const infoLines = selectedInfoText ? selectedInfoText.trim().split("\n").filter(Boolean) : [];

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1.5rem",
    borderRadius: "2px",
    fontSize: "0.875rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    cursor: "pointer",
    border: `2px solid ${colors.brandFuchsia}`,
    backgroundColor: active ? colors.brandFuchsia : "transparent",
    color: active ? colors.white : colors.brandFuchsia,
    transition: "background-color 0.15s, color 0.15s",
  });

  return (
    <>
      <Head>
        <title>{t.meta}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <main
        style={{
          backgroundColor: colors.offWhite,
          minHeight: "100vh",
          padding: "calc(96px + 3rem) 2rem 6rem",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          {/* Tab toggle buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "3rem" }}>
            <button style={tabBtn(view === "calendar")} onClick={() => setView("calendar")}>
              {t.tabCalendar}
            </button>
            <button style={tabBtn(view === "tickets")} onClick={() => setView("tickets")}>
              {t.tabTickets}
            </button>
          </div>

          {/* ── Calendar view — Desktop ── */}
          {view === "calendar" && !isMobile && (
            <div
              className="calendar-page-grid"
              style={{
                display: "grid",
                gridTemplateColumns: selectedProduction ? "1fr minmax(300px, 400px)" : "minmax(300px, 460px)",
                gap: "3rem",
                alignItems: "start",
              }}
            >
              {/* Left: Production detail panel */}
              {selectedProduction && (
                <div
                  style={{
                    maxHeight: "calc(100vh - 96px - 6rem)",
                    overflowY: "auto",
                    paddingRight: "0.5rem",
                  }}
                >
                  {/* Hero image */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16/9",
                      overflow: "hidden",
                      borderRadius: "4px",
                      marginBottom: "1.75rem",
                    }}
                  >
                    <Image
                      src={selectedProduction.primary_image}
                      alt={selectedTitle ?? ""}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 768px) 100vw, 55vw"
                    />
                  </div>

                  <h2
                    style={{
                      color: colors.nearBlack,
                      fontSize: "clamp(1.25rem, 3vw, 2rem)",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {selectedTitle}
                  </h2>

                  {selectedProduction.subtitle_fi && (
                    <p style={{ color: colors.muted, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                      {locale === "fi"
                        ? selectedProduction.subtitle_fi
                        : (selectedProduction.subtitle_en ?? selectedProduction.subtitle_fi)}
                    </p>
                  )}

                  {longTextParagraphs.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {longTextParagraphs.map((para, i) => (
                        <p
                          key={i}
                          style={{
                            color: colors.nearBlack,
                            fontSize: "0.9rem",
                            lineHeight: 1.8,
                            opacity: 0.85,
                            marginBottom: i < longTextParagraphs.length - 1 ? "1rem" : 0,
                          }}
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  {infoLines.length > 0 && (
                    <div
                      style={{
                        borderLeft: `3px solid ${colors.brandFuchsia}`,
                        paddingLeft: "1rem",
                        marginBottom: "2rem",
                      }}
                    >
                      {infoLines.map((line, i) => (
                        <p
                          key={i}
                          style={{
                            color: colors.nearBlack,
                            fontSize: "0.8rem",
                            lineHeight: 1.6,
                            opacity: 0.85,
                          }}
                        >
                          {line || "\u00A0"}
                        </p>
                      ))}
                    </div>
                  )}

                  <h3
                    style={{
                      color: colors.nearBlack,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {t.upcomingTitle}
                  </h3>

                  {selectedPerformances.length === 0 ? (
                    <p style={{ color: colors.muted, fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                      {t.noPerformances}
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                      {selectedPerformances.map((perf, i) => {
                        const ticketUrl = perf.ticket_url ?? selectedProduction.ticket_url_fallback ?? "";
                        const addInfo = locale === "fi" ? perf.additional_info_fi : perf.additional_info_en;
                        return (
                          <div
                            key={i}
                            style={{
                              backgroundColor: colors.white,
                              borderLeft: `3px solid ${colors.brandFuchsia}`,
                              padding: "0.6rem 1rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <p style={{ color: colors.muted, fontSize: "0.7rem", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>
                                {formatDate(perf.date)}{perf.time ? ` · ${perf.time}` : ""}
                                {addInfo ? ` · ${addInfo}` : ""}
                              </p>
                              <p style={{ color: colors.nearBlack, fontSize: "0.85rem", fontWeight: 600 }}>
                                {locale === "fi" ? perf.venue_fi : (perf.venue_en ?? perf.venue_fi)}
                                {perf.city ? `, ${perf.city}` : ""}
                              </p>
                            </div>
                            {ticketUrl && (
                              <Link
                                href={ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  backgroundColor: colors.brandFuchsia,
                                  color: colors.white,
                                  padding: "0.35rem 0.75rem",
                                  borderRadius: "2px",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.05em",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                {t.buyTickets}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Link
                    href={`/ohjelma/${selectedProduction.id}`}
                    style={{
                      color: colors.brandFuchsia,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t.readMore}
                  </Link>
                </div>
              )}

              {/* Right: Calendar + day cards (sticky) */}
              <div style={{ position: "sticky", top: "calc(96px + 3rem)" }}>
                <CalendarWidget
                  events={calendarEvents}
                  locale={locale}
                  calendarTitle={t.calendarTitle}
                  buyTickets={t.buyTickets}
                  onDayClick={handleDayClick}
                  selectedProductionId={selectedProductionId ?? undefined}
                />

                {/* Compact cards below calendar — click to change detail panel */}
                <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {displayCards.length === 0 ? (
                    <p style={{ color: colors.muted, fontSize: "0.85rem" }}>{t.noPerformances}</p>
                  ) : (
                    displayCards.map((event, i) => {
                      const isSelected = event.productionId === selectedProductionId;
                      return (
                        <div
                          key={i}
                          onClick={() => event.productionId && setSelectedProductionId(event.productionId)}
                          style={{
                            backgroundColor: isSelected ? colors.white : "rgba(0,0,0,0.03)",
                            border: `2px solid ${isSelected ? colors.brandFuchsia : "transparent"}`,
                            borderRadius: "4px",
                            padding: "0.6rem 0.875rem",
                            cursor: "pointer",
                            transition: "border-color 0.15s",
                          }}
                        >
                          <p style={{ color: colors.muted, fontSize: "0.7rem", letterSpacing: "0.06em", marginBottom: "0.15rem" }}>
                            {event.date}{event.time ? ` · ${event.time}` : ""} · {event.venue}
                          </p>
                          <p style={{ color: isSelected ? colors.brandFuchsia : colors.nearBlack, fontSize: "0.85rem", fontWeight: 600 }}>
                            {event.title}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Calendar view — Mobile ── */}
          {view === "calendar" && isMobile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <CalendarWidget
                events={calendarEvents}
                locale={locale}
                calendarTitle={t.calendarTitle}
                buyTickets={t.buyTickets}
                onDayClick={handleDayClick}
                selectedProductionId={selectedProductionId ?? undefined}
              />

              {/* Compact cards — click opens modal */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {displayCards.length === 0 ? (
                  <p style={{ color: colors.muted, fontSize: "0.85rem" }}>{t.noPerformances}</p>
                ) : (
                  displayCards.map((event, i) => {
                    const prod = event.productionId ? showInfoMap[event.productionId] : undefined;
                    return (
                      <div
                        key={i}
                        onClick={() => prod && setModalInfo(prod)}
                        style={{
                          backgroundColor: colors.white,
                          borderRadius: "8px",
                          overflow: "hidden",
                          cursor: prod ? "pointer" : "default",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                        }}
                      >
                        {prod?.image && (
                          <div style={{ position: "relative", aspectRatio: "16/9", width: "100%" }}>
                            <Image
                              src={prod.image}
                              alt={event.title}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="100vw"
                            />
                          </div>
                        )}
                        <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
                          <p style={{ color: colors.muted, fontSize: "0.75rem", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                            {event.date}{event.time ? ` · ${event.time}` : ""} · {event.venue}
                          </p>
                          <h3
                            style={{
                              color: colors.nearBlack,
                              fontSize: "1rem",
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              marginBottom: "0.75rem",
                            }}
                          >
                            {event.title}
                          </h3>
                          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                            {prod && (
                              <span
                                style={{
                                  color: colors.brandFuchsia,
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {t.readMore}
                              </span>
                            )}
                            {event.ticketUrl && (
                              <Link
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  backgroundColor: colors.brandFuchsia,
                                  color: colors.white,
                                  padding: "0.35rem 0.75rem",
                                  borderRadius: "2px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.05em",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {t.buyTickets}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── Tickets view ── */}
          {view === "tickets" && (
            <div style={{ maxWidth: "900px" }}>
              {liputData.sections.map((section, i) => (
                <LiputSectionBlock key={i} section={section} locale={locale} />
              ))}
            </div>
          )}

        </div>
      </main>

      <ShowModal info={modalInfo} onClose={() => setModalInfo(null)} />
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const productions = getProductions();
  const performances = getPerformances();
  const liputData = getLiputData();
  return { props: { productions, performances, liputData } };
};
