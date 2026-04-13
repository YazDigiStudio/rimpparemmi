// Tanssiteatteri page — /tanssiteatteri
// CMS-driven via content/tanssiteatteri.yaml

import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import Seo from "@/components/Seo";
import SectionBlock, { type Locale } from "@/components/SectionBlock";
import { colors } from "@/styles/colors";
import { getTanssiteatteriData, type SectionPageData } from "@/lib/content";

const copy = {
  fi: {
    meta: "Tanssiteatteri – Tanssiteatteri Rimpparemmi",
    title: "Tanssiteatteri",
  },
  en: {
    meta: "Dance Theatre – Dance Theatre Rimpparemmi",
    title: "Dance Theatre",
  },
} as const;

type Props = { data: SectionPageData };

export default function Tanssiteatteri({ data }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];
  const showTitle = data.show_page_title !== false;
  const pageTitle = locale === "fi"
    ? (data.page_title_fi || t.title)
    : (data.page_title_en || data.page_title_fi || t.title);

  return (
    <>
      <Seo
        title={t.meta}
        description={locale === "fi"
          ? "Tietoa Tanssiteatteri Rimpparemmista, Suomen pohjoisimmasta ammattitanssiteatterista."
          : "About Dance Theatre Rimpparemmi, the northernmost professional dance theatre in Finland."}
        path="/tanssiteatteri"
        locale={locale}
        breadcrumbs={[
          { name: "Etusivu", path: "/" },
          { name: "Tanssiteatteri", path: "/tanssiteatteri" },
        ]}
      />
      <Navigation />
      <main style={{ minHeight: "100vh", paddingTop: "calc(96px + 4rem)" }}>
        {showTitle && (
          <div style={{ backgroundColor: colors.offWhite }}>
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 2rem 2rem" }}>
              <h1
                style={{
                  color: colors.nearBlack,
                  fontSize: "clamp(1.75rem, 4vw, 3rem)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {pageTitle}
              </h1>
            </div>
          </div>
        )}

        {data.sections.map((section, i) => (
          <SectionBlock key={i} section={section} locale={locale} index={i} />
        ))}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = getTanssiteatteriData();
  return { props: { data } };
};
