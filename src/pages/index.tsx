// Home page — Tanssiteatteri Rimpparemmi
// Hero image + two-column section: intro text (left) and ticket calendar (right).
// showCalendar and showEventsList are controlled via content/home.yaml.

import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import CalendarWidget, { type CalendarEvent } from "@/components/CalendarWidget";
import ShowModal, { type ShowInfo, type ShowPerformance } from "@/components/ShowModal";
import MailingListForm from "@/components/MailingListForm";
import { colors } from "@/styles/colors";
import {
  getProductions,
  getPerformances,
  getHomeData,
  type Production,
  type Performance,
  type HomeData,
} from "@/lib/content";

type Locale = "fi" | "en";

// Internal types for the hero carousel
type HeroOverlay = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
};

type HeroSlide = {
  src: string;
  overlay?: HeroOverlay;
  showOn: "both" | "mobile" | "desktop";
};

// Internal type for news cards
type NewsCardItem = {
  cardTitle: string;
  imagePhotographer?: string;
  info: ShowInfo;
};

const copy = {
  fi: {
    meta: "Tanssiteatteri Rimpparemmi – Rovaniemen ammattitanssiteatteri",
    description:
      "Tanssiteatteri Rimpparemmi on rovaniemeläinen ammattitanssiteatteri, joka tuottaa laadukasta tanssiteatteritaidetta.",
    title: "Tanssiteatteri Rimpparemmi",
    tagline: "Rovaniemen ammattitanssiteatteri",
    heroAlt: "Tanssiteatteri Rimpparemmi esitys",
    introTitle: "Tanssiteatteri Rimpparemmi",
    introText: "Tanssiteatteri Rimpparemmi kertoo tarinoita: kauniita ja rumia. Tarinoita, jotka ovat joskus röyhkeitä ja toisinaan vakavia, useimmiten kuitenkin todella hauskoja. Välittyköön Rimpparemmin tekemisestä riemu ja rakkaus taiteeseen sekä esiintymiseen. Rimpparemmi toivoo, että juuri sinä, voit vahvistaa pohjoista identiteettiä osallistumalla tanssitaiteen kokemiseen ja jakaa pohjoisen tunteen palon kanssamme, sen joka meitä kaikkia lopulta yhdistää.\n\nTanssiteatteri Rimpparemmi on Suomen pohjoisin ammattitanssiteatteri. Rimpparemmin juuret ulottuvat 1970-luvulle, jolloin toiminta alkoi Tervolassa kansantanssiyhtyeenä. Kansantanssin karhea ilmaisuvoima yhdistyy tänä päivänä nykytanssin virtaavuuteen Rimpparemmin esityksissä. Musiikki on vahvasti läsnä kaikessa toiminnassa.\n\nTanssiteatteri Rimpparemmi tuottaa Rovaniemellä tanssi- ja teatteriesityksiä Tanssin näyttämöllä Kulttuuritalo Wiljamissa. Tanssin näyttämön ohjelmisto koostuu Rimpparemmin omista tuotannoista, yhteistuotannoista sekä vierailevista esityksistä. Rimpparemmi kiertää aktiivisesti ympäri Suomea esittämässä maailman parasta lappilaista tanssiteatteria.",
    calendarTitle: "Tulevat esitykset",
    calendarWidgetTitle: "Esityskalenteri",
    buyTickets: "Osta liput",
    newsTitle: "Ajankohtaista",
    readMore: "Lue lisää",
    mailingListHeading: "Liity postituslistalle",
  },
  en: {
    meta: "Dance Theatre Rimpparemmi – Professional dance theatre in Rovaniemi",
    description:
      "Dance Theatre Rimpparemmi is a professional dance theatre from Rovaniemi, producing high-quality dance theatre art.",
    title: "Dance Theatre Rimpparemmi",
    tagline: "Professional dance theatre in Rovaniemi",
    heroAlt: "Dance Theatre Rimpparemmi performance",
    introTitle: "Dance Theatre Rimpparemmi",
    introText: "Dance Theatre Rimpparemmi tells stories: both beautiful and ugly. Stories that are sometimes bold and occasionally serious, but most often truly funny. Let the joy and love for art and performance be conveyed through Rimpparemmi\u2019s creations. Rimpparemmi hopes that you, specifically, can strengthen the northern identity by participating in the experience of dance art and by sharing the passion for the northern sentiment with us \u2013 that which ultimately unites all of us.\n\nRimpparemmi Dance Theatre is the northernmost professional dance theatre in Finland. The roots of Rimpparemmi stretch back to the 1970s when its operations began in Tervola as a folk dance ensemble. The raw expressive power of folk dance blends with the fluidity of contemporary dance in Rimpparemmi\u2019s performances. Music is strongly present in all activities.\n\nDance Theatre Rimpparemmi produces dance and theatre performances in Rovaniemi at their home stage in Kulttuuritalo Wiljami. The program consists of Rimpparemmi\u2019s own productions, collaborations, and guest performances. Rimpparemmi actively tours around Finland, presenting the world\u2019s best Lappish dance theatre.",
    calendarTitle: "Upcoming performances",
    calendarWidgetTitle: "Performance calendar",
    buyTickets: "Buy tickets",
    newsTitle: "News",
    readMore: "Read more",
    mailingListHeading: "Join our mailing list",
  },
} as const;

type HomeProps = {
  productions: Production[];
  performances: Performance[];
  homeData: HomeData;
};

// Shared news card used in both desktop and mobile carousel
function NewsCard({
  item,
  readMore,
  onOpen,
}: {
  item: NewsCardItem;
  readMore: string;
  onOpen: (info: ShowInfo) => void;
}) {
  return (
    <div
      onClick={() => onOpen(item.info)}
      style={{
        flex: "0 0 260px",
        backgroundColor: colors.offWhite,
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        scrollSnapAlign: "start",
      }}
    >
      {item.info.image && (
        <div style={{ position: "relative" }}>
          <Image
            src={item.info.image}
            alt={item.cardTitle}
            width={520}
            height={640}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          {item.imagePhotographer && (
            <span style={{
              position: "absolute", bottom: "0.4rem", right: "0.5rem",
              backgroundColor: "rgba(0,0,0,0.45)", color: "#fff",
              fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "2px",
              pointerEvents: "none",
            }}>
              Kuva: {item.imagePhotographer}
            </span>
          )}
        </div>
      )}
      <div
        style={{
          padding: "1.25rem 1.5rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {item.info.subtitle && (
          <p
            style={{
              color: colors.brandFuchsia,
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            {item.info.subtitle}
          </p>
        )}
        <h3
          style={{
            color: colors.nearBlack,
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: "0.02em",
            marginBottom: "1rem",
            flex: 1,
          }}
        >
          {item.cardTitle}
        </h3>
        <span
          style={{
            color: colors.brandFuchsia,
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {readMore} →
        </span>
      </div>
    </div>
  );
}

export default function Home({ productions, performances, homeData }: HomeProps) {
  const router = useRouter();
  const locale = (router.locale ?? "fi") as Locale;
  const t = copy[locale];

  const tagline = (locale === "fi" ? homeData.tagline_fi : homeData.tagline_en) ?? t.tagline;
  const introTitle = (locale === "fi" ? homeData.intro_title_fi : homeData.intro_title_en) ?? t.introTitle;
  const introText = (locale === "fi" ? homeData.intro_text_fi : homeData.intro_text_en) ?? t.introText;
  const introParagraphs = introText.trim().split(/\n\n+/);

  // Map CMS hero slides to internal format — overlays hidden when events list is on
  const heroSlides: HeroSlide[] = homeData.hero_slides.map((s) => ({
    src: s.image,
    showOn: s.show_on,
    overlay: s.overlay_active && !homeData.show_events_list ? {
      title: s.overlay_title ?? "",
      subtitle: s.overlay_subtitle ?? "",
      buttonLabel: s.overlay_button_label ?? "",
      buttonUrl: s.overlay_button_url ?? "",
    } : undefined,
  }));

  // Map CMS news items to internal format
  const newsItems: NewsCardItem[] = homeData.news_items.map((item) => ({
    cardTitle: item.card_title,
    imagePhotographer: item.image_photographer,
    info: {
      title: item.title,
      subtitle: item.subtitle,
      image: item.image,
      imageHeight: item.image_height,
      description: item.body ? item.body.trim().split(/\n\n+/) : [],
      credits: [],
      extra: item.extra ? item.extra.trim().split("\n").filter(Boolean) : undefined,
    },
  }));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalInfo, setModalInfo] = useState<ShowInfo | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Build locale-specific CalendarEvents from performances + productions
  const homeEvents = useMemo<CalendarEvent[]>(() => {
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
        ticketUrl: p.ticket_url ?? "",
      };
    });
  }, [productions, performances, locale]);

  // Build ShowInfo map keyed by locale-specific production title
  const showInfoMap = useMemo<Record<string, ShowInfo>>(() => {
    const map: Record<string, ShowInfo> = {};
    productions.forEach((prod) => {
      const title = locale === "fi"
        ? prod.title_fi
        : (prod.title_en ?? prod.title_fi);
      const subtitle = locale === "fi"
        ? prod.subtitle_fi
        : (prod.subtitle_en ?? prod.subtitle_fi);
      const longText = locale === "fi"
        ? prod.long_text_fi
        : (prod.long_text_en ?? prod.long_text_fi);
      const description = longText
        ? longText.trim().split(/\n\n+/)
        : [prod.short_text_fi];
      const infoText = locale === "fi"
        ? prod.info_fi
        : (prod.info_en ?? prod.info_fi);
      const credits = infoText
        ? infoText.trim().split("\n").filter(Boolean)
        : [];
      const addInfo = locale === "fi"
        ? prod.additional_info_fi
        : (prod.additional_info_en ?? prod.additional_info_fi);
      const extra = addInfo ? [addInfo] : undefined;
      const prodPerfs: ShowPerformance[] = performances
        .filter((p) => p.production_id === prod.id)
        .map((p) => {
          const [yyyy, mm, dd] = p.date.split("-");
          return {
            date: `${parseInt(dd, 10)}.${parseInt(mm, 10)}.${yyyy}`,
            time: p.time,
            ticketUrl: p.ticket_url ?? "",
          };
        });
      map[title] = {
        title,
        subtitle,
        image: prod.primary_image,
        description,
        credits,
        extra,
        performances: prodPerfs,
      };
    });
    return map;
  }, [productions, performances, locale]);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Filter slides by device type
  const visibleSlides = heroSlides.filter((slide) =>
    slide.showOn === "both" ||
    (slide.showOn === "mobile" && isMobile) ||
    (slide.showOn === "desktop" && !isMobile)
  );

  // Advance hero image every 6 seconds — reset when device type changes
  useEffect(() => {
    setCurrentImageIndex(0);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % visibleSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>{t.meta}</title>
        <meta name="description" content={t.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      {/* Full-bleed hero */}
      <section
        className="hero-section"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "600px",
          overflow: "hidden",
        }}
      >
        {/* Hero images — stacked, crossfade via opacity */}
        {visibleSlides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={t.heroAlt}
            fill
            priority={i === 0}
            style={{
              objectFit: "cover",
              objectPosition: "center 30%",
              opacity: i === currentImageIndex ? 1 : 0,
              transition: "opacity 2s ease-in-out",
            }}
          />
        ))}

        {/* Slide overlays — each fades with its image */}
        {visibleSlides.map((slide, i) =>
          slide.overlay ? (
            <div
              key={`overlay-${i}`}
              className="hero-overlay"
              style={{
                position: "absolute",
                backgroundColor: "rgba(17,17,17,0.88)",
                borderLeft: `3px solid ${colors.brandFuchsia}`,
                opacity: i === currentImageIndex ? 1 : 0,
                transition: "opacity 2s ease-in-out",
                pointerEvents: i === currentImageIndex ? "auto" : "none",
                zIndex: 2,
              }}
            >
              <p
                style={{
                  color: colors.brandFuchsia,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {slide.overlay.subtitle}
              </p>
              <h2
                style={{
                  color: colors.white,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                }}
              >
                {slide.overlay.title}
              </h2>
              <a
                href={slide.overlay.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  backgroundColor: colors.brandFuchsia,
                  color: colors.white,
                  borderRadius: "2px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {slide.overlay.buttonLabel}
              </a>
            </div>
          ) : null
        )}

        {/* Events list panel — shown on hero when show_events_list is true */}
        {homeData.show_events_list && (
          <div className="hero-events-panel">
            <p
              style={{
                color: colors.white,
                fontSize: "clamp(0.75rem, 1.35vw, 0.9rem)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              {t.calendarTitle}
            </p>
            <div className="hero-events-panel-list">
            {homeEvents.map((event, i) => (
              <div
                key={i}
                className="hero-events-row"
                style={{
                  backgroundColor: "rgba(45,20,32,0.82)",
                  borderLeft: `3px solid ${colors.brandFuchsia}`,
                  padding: "0.6rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  flexShrink: 0,
                }}
              >
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
                      letterSpacing: "0.08em",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {event.date}{event.time ? ` · ${event.time}` : ""}
                  </p>
                  <p
                    style={{
                      color: colors.white,
                      fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)",
                      fontWeight: 600,
                      marginBottom: "0.15rem",
                    }}
                  >
                    {event.title}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.8rem, 1.4vw, 1rem)" }}>
                    {event.venue}
                  </p>
                  {showInfoMap[event.title] && (
                    <button
                      onClick={() =>
                        setModalInfo(showInfoMap[event.title] ?? null)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: colors.brandFuchsia,
                        fontSize: "clamp(0.75rem, 1.35vw, 0.85rem)",
                        letterSpacing: "0.05em",
                        padding: 0,
                        marginTop: "0.25rem",
                      }}
                    >
                      {t.readMore} →
                    </button>
                  )}
                </div>
                <Link
                  href={event.ticketUrl}
                  style={{
                    backgroundColor: colors.brandFuchsia,
                    color: colors.white,
                    padding: "0.35rem 0.65rem",
                    borderRadius: "2px",
                    fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {t.buyTickets}
                </Link>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Title block bottom-left */}
        <div
          className="hero-title"
          style={{
            position: "absolute",
            left: "2rem",
            right: "2rem",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              color: colors.white,
              fontSize: "clamp(1.75rem, 5vw, 3.75rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            {locale === "fi"
              ? (homeData.hero_text_fi ?? t.title)
              : (homeData.hero_text_en ?? homeData.hero_text_fi ?? t.title)}
          </h1>
          {tagline && (
            <p
              style={{
                color: colors.white,
                fontSize: "clamp(0.8rem, 1.5vw, 1rem)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: "0.5rem",
                opacity: 0.75,
              }}
            >
              {tagline}
            </p>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            cursor: "pointer",
          }}
          onClick={() =>
            window.scrollTo({ top: window.innerHeight - 96, behavior: "smooth" })
          }
          aria-label="Scroll down"
        >
          <div className="scroll-arrow-bounce">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 13L18 22L27 13"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Two-column section: intro text + ticket calendar */}
      <section
        style={{
          backgroundColor: colors.offWhite,
          padding: "5rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "4rem",
            alignItems: "flex-start",
          }}
        >
          {/* Left column: intro text */}
          <div style={{ flex: "1 1 400px" }}>
            {introTitle && (
              <h2
                style={{
                  color: colors.nearBlack,
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                }}
              >
                {introTitle}
              </h2>
            )}
            {introParagraphs.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  color: colors.nearBlack,
                  fontSize: "1rem",
                  lineHeight: 1.85,
                  opacity: 0.85,
                  marginBottom:
                    i < introParagraphs.length - 1 ? "1.5rem" : 0,
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Right column: ticket calendar — hidden when show_calendar is false */}
          {homeData.show_calendar && (
            <div style={{ flex: "0 1 340px", minWidth: "280px" }}>

              {/* Section title */}
              <h2
                style={{
                  color: colors.nearBlack,
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                {t.calendarWidgetTitle}
              </h2>

              {/* Monthly calendar widget — title rendered above */}
              <CalendarWidget
                events={homeEvents}
                locale={locale}
                calendarTitle={t.calendarWidgetTitle}
                buyTickets={t.buyTickets}
                onShowInfo={(title) => setModalInfo(showInfoMap[title] ?? null)}
                hideTitle
              />


            </div>
          )}
        </div>
      </section>

      {/* Ajankohtaista / News — desktop: form left + scrollable cards right; mobile: cards carousel then form */}
      {isMobile ? (
        <>
          {/* Mobile: news carousel */}
          <section style={{ backgroundColor: colors.white, padding: "3rem 0 3rem 2rem" }}>
            <h2
              style={{
                color: colors.nearBlack,
                fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
                paddingRight: "2rem",
              }}
            >
              {t.newsTitle}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                overflowX: "auto",
                paddingRight: "2rem",
                paddingBottom: "0.5rem",
                scrollSnapType: "x mandatory",
              }}
            >
              {newsItems.map((item, i) => (
                <NewsCard key={i} item={item} readMore={t.readMore} onOpen={setModalInfo} />
              ))}
            </div>
          </section>

          {/* Mobile: mailing list form as separate section */}
          <section
            style={{
              padding: "4rem 2rem",
              minHeight: "580px",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url('https://firebasestorage.googleapis.com/v0/b/rimpparemmi-b3154.firebasestorage.app/o/cms%2Fweb%2F1773075379826-Tapahtuma_Piaf_Kuva_Antti_Kurola__5_.webp?alt=media')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <MailingListForm locale={locale} />
          </section>
        </>
      ) : (
        /* Desktop: form left (image bg) + news right (colored bg) */
        <section style={{ display: "flex", alignItems: "stretch" }}>
          {/* Left: image background + form */}
          <div
            style={{
              flex: "0 0 400px",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url('https://firebasestorage.googleapis.com/v0/b/rimpparemmi-b3154.firebasestorage.app/o/cms%2Fweb%2F1773075379826-Tapahtuma_Piaf_Kuva_Antti_Kurola__5_.webp?alt=media')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "5rem 2.5rem",
            }}
          >
            <MailingListForm locale={locale} />
          </div>

          {/* Right: colored background + news */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.white,
              padding: "5rem 2rem",
              minWidth: 0,
            }}
          >
            <h2
              style={{
                color: colors.nearBlack,
                fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              {t.newsTitle}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "1.25rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
                scrollSnapType: "x mandatory",
              }}
            >
              {newsItems.map((item, i) => (
                <NewsCard key={i} item={item} readMore={t.readMore} onOpen={setModalInfo} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ShowModal info={modalInfo} onClose={() => setModalInfo(null)} />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const productions = getProductions();
  const performances = getPerformances();
  const homeData = getHomeData();
  return { props: { productions, performances, homeData } };
}
