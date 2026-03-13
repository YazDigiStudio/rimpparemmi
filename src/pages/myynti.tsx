// Myynti / Sales listing page — /myynti
// Hidden from navigation. Shows productions that have a sales entry.
// Finnish only.

import Head from "next/head";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import ProductionCard from "@/components/ProductionCard";
import { colors } from "@/styles/colors";
import { getProductions, getSalesEntries, type Production } from "@/lib/content";

type Props = { productions: Production[] };

export default function Myynti({ productions }: Props) {
  return (
    <>
      <Head>
        <title>Myynti – Tanssiteatteri Rimpparemmi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
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
              Myynti
            </h1>
            <p style={{ color: colors.muted, fontSize: "0.95rem", maxWidth: "600px" }}>
              Tanssiteatteri Rimpparemmin ostettavissa olevat tuotannot.
            </p>
          </div>

          {productions.length === 0 ? (
            <p style={{ color: colors.muted }}>Myyntiohjelmisto päivitetään pian.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {productions.map((prod) => (
                <ProductionCard key={prod.id} production={prod} locale="fi" basePath="/myynti" />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const salesEntries = getSalesEntries();
  const salesIds = new Set(salesEntries.map((s) => s.production_id));
  const all = getProductions();
  const productions = all.filter((p) => salesIds.has(p.id));
  return { props: { productions } };
};
