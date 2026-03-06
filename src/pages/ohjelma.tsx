// Ohjelma / Programme page
// Card grid of productions. Client-side filter between active and archived.

import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import ProductionCard from "@/components/ProductionCard";
import { colors } from "@/styles/colors";
import { getProductions, type Production } from "@/lib/content";

type Locale = "fi" | "en";

const copy = {
  fi: {
    meta: "Ohjelmisto – Tanssiteatteri Rimpparemmi",
    title: "Ohjelmisto",
    active: "Aktiiviset",
    archive: "Arkisto",
    empty: "Ei tuotantoja.",
  },
  en: {
    meta: "Programme – Dance Theatre Rimpparemmi",
    title: "Programme",
    active: "Current",
    archive: "Archive",
    empty: "No productions.",
  },
} as const;

type Props = { productions: Production[] };

export default function Ohjelma({ productions }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

  const [filter, setFilter] = useState<"active" | "archive">("active");

  const visible = productions.filter((p) => p.status === filter);

  const filterBtnStyle = (active: boolean): React.CSSProperties => ({
    background: active ? colors.nearBlack : "transparent",
    color: active ? colors.white : colors.nearBlack,
    border: `1px solid ${colors.nearBlack}`,
    borderRadius: "2px",
    padding: "0.4rem 1rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
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
          padding: "calc(96px + 4rem) 2rem 6rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "3rem",
            }}
          >
            <h1
              style={{
                color: colors.nearBlack,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {t.title}
            </h1>

            {/* Active / Archive filter */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setFilter("active")}
                style={filterBtnStyle(filter === "active")}
              >
                {t.active}
              </button>
              <button
                onClick={() => setFilter("archive")}
                style={filterBtnStyle(filter === "archive")}
              >
                {t.archive}
              </button>
            </div>
          </div>

          {/* Card grid */}
          {visible.length === 0 ? (
            <p style={{ color: colors.muted }}>{t.empty}</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {visible.map((prod) => (
                <ProductionCard key={prod.id} production={prod} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const productions = getProductions();
  return { props: { productions } };
};
