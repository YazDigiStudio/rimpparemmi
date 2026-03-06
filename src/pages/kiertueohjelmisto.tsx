// Kiertueohjelmisto / Tour programme page
// Shows productions marked as is_touring: true.

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
    meta: "Kiertueohjelmisto – Tanssiteatteri Rimpparemmi",
    title: "Kiertueohjelmisto",
    description: "Tanssiteatteri Rimpparemmin kiertueelle saatavilla olevat tuotannot.",
    empty: "Kiertueohjelmisto päivitetään pian.",
  },
  en: {
    meta: "Tour Programme – Dance Theatre Rimpparemmi",
    title: "Tour Programme",
    description: "Productions available for touring from Dance Theatre Rimpparemmi.",
    empty: "Tour programme will be updated soon.",
  },
} as const;

type Props = { productions: Production[] };

export default function Kiertueohjelmisto({ productions }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

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

          <div style={{ marginBottom: "3rem" }}>
            <h1
              style={{
                color: colors.nearBlack,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              {t.title}
            </h1>
            <p style={{ color: colors.muted, fontSize: "0.95rem", maxWidth: "600px" }}>
              {t.description}
            </p>
          </div>

          {productions.length === 0 ? (
            <p style={{ color: colors.muted }}>{t.empty}</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {productions.map((prod) => (
                <ProductionCard key={prod.id} production={prod} locale={locale} basePath="/kiertueohjelmisto" />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const all = getProductions();
  const productions = all.filter((p) => p.is_touring === true);
  return { props: { productions } };
};
