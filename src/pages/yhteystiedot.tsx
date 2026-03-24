// Yhteystiedot / Contact page

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import {
  getYhteystiedotData,
  type YhteystiedotData,
  type ContactPerson,
} from "@/lib/content";

type Locale = "fi" | "en";

type Props = { data: YhteystiedotData };

const copy = {
  fi: {
    meta: "Yhteystiedot – Tanssiteatteri Rimpparemmi",
    title: "Yhteystiedot",
    address: "Toimiston käyntiosoite",
  },
  en: {
    meta: "Contact – Dance Theatre Rimpparemmi",
    title: "Contact",
    address: "Office address",
  },
} as const;

export default function Yhteystiedot({ data }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];
  const contacts: ContactPerson[] = data.contacts ?? [];
  const addressValue = locale === "fi" ? data.address_fi : (data.address_en || data.address_fi);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(navigator.maxTouchPoints > 0);
  }, []);

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
          padding: "calc(96px + 4rem) 2rem 5rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "3rem",
            }}
          >
            {t.title}
          </h1>

          {/* Contact cards — responsive auto-fill grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 280px))",
              gap: "2rem",
              marginBottom: "4rem",
            }}
          >
            {contacts.map((person) => (
              <div
                key={person.email}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: "4px",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                {person.image && (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "3/4" }}>
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      style={{ objectFit: "cover", objectPosition: "center top" }}
                    />
                  </div>
                )}

                <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
                  <p
                    style={{
                      color: colors.brandFuchsia,
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {locale === "fi" ? person.role_fi : person.role_en}
                  </p>
                  <h2
                    style={{
                      color: colors.nearBlack,
                      fontSize: "1rem",
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                      marginBottom: "1rem",
                    }}
                  >
                    {person.name}
                  </h2>
                  {isMobile ? (
                    <a
                      href={`tel:${person.phone.replace(/\s/g, "")}`}
                      style={{
                        display: "block",
                        color: colors.nearBlack,
                        fontSize: "0.875rem",
                        opacity: 0.8,
                        marginBottom: "0.35rem",
                        textDecoration: "none",
                      }}
                    >
                      {person.phone}
                    </a>
                  ) : (
                    <span
                      style={{
                        display: "block",
                        color: colors.nearBlack,
                        fontSize: "0.875rem",
                        opacity: 0.8,
                        marginBottom: "0.35rem",
                      }}
                    >
                      {person.phone}
                    </span>
                  )}
                  <a
                    href={`mailto:${person.email}`}
                    style={{
                      display: "block",
                      color: colors.brandFuchsia,
                      fontSize: "0.8rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {person.email}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Office address */}
          <div
            style={{
              borderTop: `1px solid ${colors.borderLight}`,
              paddingTop: "2rem",
            }}
          >
            <p
              style={{
                color: colors.brandFuchsia,
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
              }}
            >
              {t.address}
            </p>
            {addressValue.split("\n").map((line: string, i: number) => (
              <p key={i} style={{ color: colors.nearBlack, fontSize: "0.95rem", lineHeight: 1.7 }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = getYhteystiedotData();
  return { props: { data } };
};
