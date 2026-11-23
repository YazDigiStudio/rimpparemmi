// Remmiklubikevät 2027 page
// Shows productions marked as remmiklubi: true (club evenings of spring 2027).
// Cards link to the normal production pages, which have intro and tickets.

import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import Seo from "@/components/Seo";
import ProductionCard from "@/components/ProductionCard";
import { colors } from "@/styles/colors";
import { getProductions, type Production } from "@/lib/content";

type Locale = "fi" | "en";

const copy = {
  fi: {
    meta: "Remmiklubikevät 2027 – Tanssiteatteri Rimpparemmi",
    title: "Remmiklubikevät 2027",
    description:
      "Kevään 2027 klubi-illat Kulttuuritalo Wiljamissa. Katso esittelyt ja osta liput.",
    empty: "Klubi-illat julkaistaan pian.",
  },
  en: {
    meta: "Remmi Club Spring 2027 – Dance Theatre Rimpparemmi",
    title: "Remmi Club Spring 2027",
    description:
      "The club evenings of spring 2027 at Culture House Wiljami. See the programme and buy tickets.",
    empty: "The club evenings will be published soon.",
  },
} as const;

type Props = { productions: Production[] };

export default function Remmiklubikevat2027({ productions }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

  return (
    <>
      <Seo
        title={t.meta}
        description={t.description}
        path="/remmiklubikevat2027"
        locale={locale}
        breadcrumbs={[
          { name: "Etusivu", path: "/" },
          { name: "Remmiklubikevät 2027", path: "/remmiklubikevat2027" },
        ]}
      />
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
  const productions = getProductions().filter((p) => p.remmiklubi === true);
  return { props: { productions } };
};
