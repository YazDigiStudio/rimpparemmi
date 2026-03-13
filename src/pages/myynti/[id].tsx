// Sales production detail page — /myynti/[id]
// Hidden from navigation. Finnish only.
// Shows full production info + sales-specific fields for bookers.

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import ImageCarousel from "@/components/ImageCarousel";
import { type GetStaticProps, type GetStaticPaths } from "next";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import {
  getProductions,
  getSalesEntries,
  type Production,
  type SalesEntry,
} from "@/lib/content";
import { toNoCookiesEmbed } from "@/lib/mediaUtils";

type Props = { production: Production; sales: SalesEntry };

export default function MyyntiDetailPage({ production, sales }: Props) {
  const title = production.title_fi;
  const subtitle = production.subtitle_fi;
  const longText = sales.description || production.long_text_fi;
  const infoText = production.info_fi;
  const duration = production.duration_fi;
  const ageRecommendation = production.age_recommendation_fi;

  const longTextParagraphs = longText ? longText.trim().split(/\n\n+/) : [];
  const infoLines = infoText ? infoText.trim().split("\n").filter(Boolean) : [];
  const techLines = sales.technical_requirements
    ? sales.technical_requirements.trim().split("\n").filter(Boolean)
    : [];
  const priceLines = sales.price_info
    ? sales.price_info.trim().split("\n").filter(Boolean)
    : [];
  const galleryImages = production.production_images ?? [];

  const sectionHeadingStyle: React.CSSProperties = {
    color: colors.nearBlack,
    fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "0.75rem",
  };

  const infoBlockStyle: React.CSSProperties = {
    borderLeft: `3px solid ${colors.brandFuchsia}`,
    paddingLeft: "1.25rem",
    marginBottom: "2rem",
  };

  return (
    <>
      <Head>
        <title>{title} – Myynti – Tanssiteatteri Rimpparemmi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
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
            Kuva: {production.primary_image_photographer}
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
            href="/myynti"
            style={{
              display: "inline-block",
              color: colors.muted,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            ← Myynti
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
                    Kesto
                  </p>
                  <p style={{ color: colors.nearBlack, fontSize: "0.95rem", fontWeight: 600 }}>
                    {duration}
                  </p>
                </div>
              )}
              {ageRecommendation && (
                <div>
                  <p style={{ color: colors.muted, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.2rem" }}>
                    Suositusikä
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

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div style={{ marginBottom: "3.5rem" }}>
              <ImageCarousel images={galleryImages} />
            </div>
          )}

          {/* Trailer */}
          {sales.trailer_url && (
            <div style={{ marginBottom: "3.5rem" }}>
              <h2 style={sectionHeadingStyle}>Traileri</h2>
              <div style={{ position: "relative", aspectRatio: "16/9", maxWidth: "640px" }}>
                <iframe
                  src={toNoCookiesEmbed(sales.trailer_url)}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: "4px" }}
                />
              </div>
            </div>
          )}

          {/* Touring-specific info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem",
              marginBottom: "3.5rem",
            }}
          >
            {techLines.length > 0 && (
              <div>
                <h2 style={sectionHeadingStyle}>Tilavaatimukset</h2>
                <div style={infoBlockStyle}>
                  {techLines.map((line, i) => (
                    <p key={i} style={{ color: colors.nearBlack, fontSize: "0.875rem", lineHeight: 1.7, opacity: 0.85 }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {priceLines.length > 0 && (
              <div>
                <h2 style={sectionHeadingStyle}>Hinta & matkakulut</h2>
                <div style={infoBlockStyle}>
                  {priceLines.map((line, i) => (
                    <p key={i} style={{ color: colors.nearBlack, fontSize: "0.875rem", lineHeight: 1.7, opacity: 0.85 }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Links: documentation + rider */}
          {(sales.documentation_url || sales.rider_url) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "3.5rem" }}>
              {sales.documentation_url && (
                <a
                  href={sales.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: `1px solid ${colors.nearBlack}`,
                    color: colors.nearBlack,
                    padding: "0.5rem 1.25rem",
                    borderRadius: "2px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Tallenne
                </a>
              )}
              {sales.rider_url && (
                <a
                  href={sales.rider_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: colors.nearBlack,
                    color: colors.white,
                    padding: "0.5rem 1.25rem",
                    borderRadius: "2px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Lataa raideri
                </a>
              )}
            </div>
          )}

          {/* Contact CTA */}
          <div
            style={{
              backgroundColor: colors.white,
              borderLeft: `3px solid ${colors.brandFuchsia}`,
              padding: "1.5rem 2rem",
            }}
          >
            <p style={{ color: colors.nearBlack, fontSize: "1rem", marginBottom: "1rem" }}>
              Kysy lisää ja varaa esitys
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
              Ota yhteyttä
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const salesEntries = getSalesEntries();
  const paths = salesEntries.map((s) => ({ params: { id: s.production_id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const salesEntries = getSalesEntries();
  const sales = salesEntries.find((s) => s.production_id === params?.id);
  if (!sales) return { notFound: true };

  const productions = getProductions();
  const production = productions.find((p) => p.id === sales.production_id);
  if (!production) return { notFound: true };

  return { props: { production, sales } };
};
