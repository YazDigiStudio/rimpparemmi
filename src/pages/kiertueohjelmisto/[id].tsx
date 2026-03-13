// Touring production page — /kiertueohjelmisto/[id]
// Shows production description, credits, duration and age recommendation.
// Sales-specific fields (price, tech requirements, rider, trailer) are on /myynti/[id].

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type GetStaticProps, type GetStaticPaths } from "next";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import { getProductions, type Production } from "@/lib/content";

type Locale = "fi" | "en";

const copy = {
  fi: {
    meta: (title: string) => `${title} – Kiertueohjelmisto – Tanssiteatteri Rimpparemmi`,
    back: "← Kiertueohjelmisto",
    duration: "Kesto",
    ageRecommendation: "Suositusikä",
    contact: "Kysy lisää ja varaa esitys",
    contactLink: "Ota yhteyttä",
  },
  en: {
    meta: (title: string) => `${title} – Tour Programme – Dance Theatre Rimpparemmi`,
    back: "← Tour Programme",
    duration: "Duration",
    ageRecommendation: "Recommended age",
    contact: "Enquire and book",
    contactLink: "Contact us",
  },
} as const;

type Props = { production: Production };

export default function TourProductionPage({ production }: Props) {
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

  const duration = locale === "fi"
    ? production.duration_fi
    : (production.duration_en ?? production.duration_fi);

  const ageRecommendation = locale === "fi"
    ? production.age_recommendation_fi
    : (production.age_recommendation_en ?? production.age_recommendation_fi);

  const longTextParagraphs = longText ? longText.trim().split(/\n\n+/) : [];
  const infoLines = infoText ? infoText.trim().split("\n").filter(Boolean) : [];

  const infoBlockStyle: React.CSSProperties = {
    borderLeft: `3px solid ${colors.brandFuchsia}`,
    paddingLeft: "1.25rem",
    marginBottom: "2rem",
  };

  return (
    <>
      <Head>
        <title>{t.meta(title)}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />

      {/* Hero */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(280px, 45vh, 520px)",
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
        {production.primary_image_photographer && (
          <span style={{
            position: "absolute", bottom: "0.4rem", right: "0.5rem", zIndex: 2,
            backgroundColor: "rgba(0,0,0,0.45)", color: "#fff",
            fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "2px",
            pointerEvents: "none",
          }}>
            {locale === "fi" ? "Kuva" : "Photo"}: {production.primary_image_photographer}
          </span>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "2rem",
            right: "2rem",
          }}
        >
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
            href="/kiertueohjelmisto"
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

          {/* Quick specs row */}
          {(duration || ageRecommendation) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "2rem",
                backgroundColor: colors.white,
                borderLeft: `3px solid ${colors.brandFuchsia}`,
                padding: "1rem 1.5rem",
                marginBottom: "3rem",
              }}
            >
              {duration && (
                <div>
                  <p style={{ color: colors.muted, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                    {t.duration}
                  </p>
                  <p style={{ color: colors.nearBlack, fontSize: "0.95rem", fontWeight: 600 }}>
                    {duration}
                  </p>
                </div>
              )}
              {ageRecommendation && (
                <div>
                  <p style={{ color: colors.muted, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                    {t.ageRecommendation}
                  </p>
                  <p style={{ color: colors.nearBlack, fontSize: "0.95rem", fontWeight: 600 }}>
                    {ageRecommendation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Two-column: long text + info */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3rem",
              marginBottom: "3.5rem",
            }}
          >
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

            {infoLines.length > 0 && (
              <div style={{ flex: "0 1 280px" }}>
                <div style={infoBlockStyle}>
                  {infoLines.map((line, i) => (
                    <p
                      key={i}
                      style={{
                        color: colors.nearBlack,
                        fontSize: "0.85rem",
                        lineHeight: 1.7,
                        opacity: 0.85,
                        marginBottom: "0.1rem",
                      }}
                    >
                      {line || "\u00A0"}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div
            style={{
              backgroundColor: colors.white,
              borderLeft: `3px solid ${colors.brandFuchsia}`,
              padding: "1.5rem 2rem",
            }}
          >
            <p style={{ color: colors.nearBlack, fontSize: "1rem", marginBottom: "1rem" }}>
              {t.contact}
            </p>
            <Link
              href="/yhteystiedot"
              style={{
                backgroundColor: colors.brandFuchsia,
                color: colors.white,
                padding: "0.5rem 1.25rem",
                borderRadius: "2px",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {t.contactLink}
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const productions = getProductions();
  const touring = productions.filter((p) => p.is_touring === true);
  const paths = touring.flatMap((prod) => [
    { params: { id: prod.id }, locale: "fi" },
    { params: { id: prod.id }, locale: "en" },
  ]);
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const productions = getProductions();
  const production = productions.find((p) => p.id === params?.id);
  if (!production || !production.is_touring) return { notFound: true };
  return { props: { production } };
};
