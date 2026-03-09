// Production detail page — /ohjelmisto/[id]
// Full-page view: hero image, long text, credits, upcoming performances, press photos.

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type GetStaticProps, type GetStaticPaths } from "next";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import {
  getProductions,
  getPerformances,
  type Production,
  type Performance,
} from "@/lib/content";

type Locale = "fi" | "en";

const copy = {
  fi: {
    meta: (title: string) => `${title} – Tanssiteatteri Rimpparemmi`,
    back: "← Ohjelmisto",
    upcomingTitle: "Tulevat esitykset",
    buyTickets: "Osta liput",
    noPerformances: "Ei tulevia esityksiä.",
  },
  en: {
    meta: (title: string) => `${title} – Dance Theatre Rimpparemmi`,
    back: "← Programme",
    upcomingTitle: "Upcoming performances",
    buyTickets: "Buy tickets",
    noPerformances: "No upcoming performances.",
  },
} as const;

type Props = {
  production: Production;
  performances: Performance[];
};

export default function ProductionPage({ production, performances }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

  const title = locale === "fi"
    ? production.title_fi
    : (production.title_en ?? production.title_fi);

  const subtitle = locale === "fi"
    ? production.subtitle_fi
    : (production.subtitle_en ?? production.subtitle_fi);

  const longText = locale === "fi"
    ? production.long_text_fi
    : (production.long_text_en ?? production.long_text_fi);

  const infoText = locale === "fi"
    ? production.info_fi
    : (production.info_en ?? production.info_fi);

  const additionalInfo = locale === "fi"
    ? production.additional_info_fi
    : (production.additional_info_en ?? production.additional_info_fi);

  const badge = locale === "fi"
    ? production.badge_fi
    : (production.badge_en ?? production.badge_fi);

  // Only upcoming performances for this production
  const today = new Date().toISOString().split("T")[0];
  const upcomingPerfs = performances
    .filter((p) => p.production_id === production.id && p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const formatDate = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${parseInt(dd, 10)}.${parseInt(mm, 10)}.${yyyy}`;
  };

  const longTextParagraphs = longText
    ? longText.trim().split(/\n\n+/)
    : [];

  const infoLines = infoText
    ? infoText.trim().split("\n").filter(Boolean)
    : [];

  const pressImages = production.production_images ?? [];

  return (
    <>
      <Head>
        <title>{t.meta(title)}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />

      {/* Hero image — full bleed, offset by nav height */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(320px, 55vh, 640px)",
          marginTop: "96px",
          overflow: "hidden",
        }}
      >
        <Image
          src={production.primary_image}
          alt={title}
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
        {/* Dark gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />
        {/* Title overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "2rem",
            right: "2rem",
          }}
        >
          {badge && (
            <span
              style={{
                display: "inline-block",
                backgroundColor: colors.brandFuchsia,
                color: colors.white,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.25rem 0.6rem",
                borderRadius: "2px",
                marginBottom: "0.75rem",
              }}
            >
              {badge}
            </span>
          )}
          <h1
            style={{
              color: colors.white,
              fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
                marginTop: "0.5rem",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Main content */}
      <main
        style={{
          backgroundColor: colors.offWhite,
          padding: "3.5rem 2rem 6rem",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>

          {/* Back link */}
          <Link
            href="/ohjelmisto"
            style={{
              display: "inline-block",
              color: colors.muted,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            {t.back}
          </Link>

          {/* Two-column layout: long text + info */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3rem",
              marginBottom: "3.5rem",
            }}
          >
            {/* Long text */}
            {longTextParagraphs.length > 0 && (
              <div style={{ flex: "1 1 400px" }}>
                {longTextParagraphs.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      color: colors.nearBlack,
                      fontSize: "1rem",
                      lineHeight: 1.85,
                      opacity: 0.85,
                      marginBottom: i < longTextParagraphs.length - 1 ? "1.25rem" : 0,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Info / credits */}
            {infoLines.length > 0 && (
              <div style={{ flex: "0 1 280px" }}>
                <div
                  style={{
                    borderLeft: `3px solid ${colors.brandFuchsia}`,
                    paddingLeft: "1.25rem",
                  }}
                >
                  {infoLines.map((line, i) => (
                    <p
                      key={i}
                      style={{
                        color: colors.nearBlack,
                        fontSize: "0.85rem",
                        lineHeight: 1.7,
                        opacity: line === "" ? undefined : 0.85,
                        marginBottom: "0.1rem",
                      }}
                    >
                      {line || "\u00A0"}
                    </p>
                  ))}
                </div>

                {additionalInfo && (
                  <p
                    style={{
                      color: colors.muted,
                      fontSize: "0.8rem",
                      lineHeight: 1.6,
                      marginTop: "1.25rem",
                    }}
                  >
                    {additionalInfo}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Upcoming performances */}
          <div>
            <h2
              style={{
                color: colors.nearBlack,
                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              {t.upcomingTitle}
            </h2>

            {upcomingPerfs.length === 0 ? (
              <p style={{ color: colors.muted, fontSize: "0.9rem" }}>{t.noPerformances}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {upcomingPerfs.map((perf, i) => {
                  const ticketUrl = perf.ticket_url ?? production.ticket_url_fallback ?? "";
                  const addInfo = locale === "fi" ? perf.additional_info_fi : perf.additional_info_en;
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: colors.white,
                        borderLeft: `3px solid ${colors.brandFuchsia}`,
                        padding: "0.75rem 1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: colors.muted,
                            fontSize: "0.75rem",
                            letterSpacing: "0.06em",
                            marginBottom: "0.2rem",
                          }}
                        >
                          {formatDate(perf.date)}{perf.time ? ` · ${perf.time}` : ""}
                          {addInfo ? ` · ${addInfo}` : ""}
                        </p>
                        <p
                          style={{
                            color: colors.nearBlack,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
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
                            padding: "0.4rem 0.875rem",
                            borderRadius: "2px",
                            fontSize: "0.75rem",
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
          </div>

          {/* Press photos */}
          {pressImages.length > 0 && (
            <div style={{ marginTop: "3.5rem" }}>
              <h2
                style={{
                  color: colors.nearBlack,
                  fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                {locale === "fi" ? "Pressikuvat" : "Press photos"}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "1rem",
                }}
              >
                {pressImages.map((img, i) => (
                  <a
                    key={i}
                    href={img.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "3/2",
                        overflow: "hidden",
                        borderRadius: "4px",
                      }}
                    >
                      <Image
                        src={img.src}
                        alt={locale === "fi" ? (img.caption_fi ?? "") : (img.caption_en ?? img.caption_fi ?? "")}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    </div>
                    {(img.caption_fi || img.caption_en) && (
                      <p style={{ color: colors.muted, fontSize: "0.75rem", marginTop: "0.4rem" }}>
                        {locale === "fi" ? img.caption_fi : (img.caption_en ?? img.caption_fi)}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const productions = getProductions();
  const paths = productions.flatMap((prod) => [
    { params: { id: prod.id }, locale: "fi" },
    { params: { id: prod.id }, locale: "en" },
  ]);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const productions = getProductions();
  const performances = getPerformances();
  const production = productions.find((p) => p.id === params?.id);
  if (!production) return { notFound: true };
  return { props: { production, performances } };
};
