// Liput / Tickets page — /liput
// CMS-driven via content/liput.yaml

import Head from "next/head";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import SectionBlock, { type Locale } from "@/components/SectionBlock";
import { colors } from "@/styles/colors";
import { getLiputData, type SectionPageData } from "@/lib/content";

const copy = {
  fi: {
    meta: "Liput – Tanssiteatteri Rimpparemmi",
    title: "Liput",
  },
  en: {
    meta: "Tickets – Dance Theatre Rimpparemmi",
    title: "Tickets",
  },
} as const;

type Props = { data: SectionPageData };

export default function Liput({ data }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];
  const showTitle = data.show_page_title !== false;
  const pageTitle = locale === "fi"
    ? (data.page_title_fi || t.title)
    : (data.page_title_en || data.page_title_fi || t.title);

  return (
    <>
      <Head>
        <title>{t.meta}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
  const data = getLiputData();
  return { props: { data } };
};
