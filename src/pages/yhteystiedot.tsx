// Yhteystiedot / Contact page

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";

type Locale = "fi" | "en";

type ContactPerson = {
  name: string;
  role_fi: string;
  role_en: string;
  phone: string;
  email: string;
  image?: string;
};

const contacts: ContactPerson[] = [
  {
    name: "Matti Paloniemi",
    role_fi: "Taiteellinen johtaja",
    role_en: "Artistic Director",
    phone: "+358 (0)44 550 4835",
    email: "matti.paloniemi@rimpparemmi.fi",
    image: "/images/Matti-Paloniemi-768x768.jpg",
  },
  {
    name: "Liisa Penttilä",
    role_fi: "Myynti",
    role_en: "Sales",
    phone: "+358 (0)50 511 5055",
    email: "liisa.penttila@rimpparemmi.fi",
    image: "/images/Liisa-Penttila-768x768.jpg",
  },
  {
    name: "Atte Herd",
    role_fi: "Tekniikkavastaava",
    role_en: "Technical Manager",
    phone: "+358 (0)40 684 4097",
    email: "atte.herd@rimpparemmi.fi",
    image: "/images/Atte_Herd.jpg",
  },
  {
    name: "Helmi Järvensivu",
    role_fi: "Markkinointi- ja viestintävastaava",
    role_en: "Marketing & Communications",
    phone: "+358 (0)50 4344557",
    email: "helmi.jarvensivu@rimpparemmi.fi",
    image: "/images/Helmi-Jarvensivu-720x720.jpg",
  },
  {
    name: "Viivi Vesala",
    role_fi: "Tuottaja",
    role_en: "Producer",
    phone: "+358 (0)50 4989701",
    email: "viivi.vesala@rimpparemmi.fi",
    image: "/images/viivi_vesala.jpg",
  },
];

const copy = {
  fi: {
    meta: "Yhteystiedot – Tanssiteatteri Rimpparemmi",
    title: "Yhteystiedot",
    address: "Toimiston käyntiosoite",
    addressValue: "Hallituskatu 20 A (3. krs.)\n96100 Rovaniemi",
  },
  en: {
    meta: "Contact – Dance Theatre Rimpparemmi",
    title: "Contact",
    address: "Office address",
    addressValue: "Hallituskatu 20 A (3rd floor)\n96100 Rovaniemi",
  },
} as const;

export default function Yhteystiedot() {
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

          {/* Contact cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
                  <a
                    href={`tel:${person.phone.replace(/\s/g, "")}`}
                    style={{
                      display: "block",
                      color: colors.nearBlack,
                      fontSize: "0.875rem",
                      opacity: 0.8,
                      marginBottom: "0.35rem",
                    }}
                  >
                    {person.phone}
                  </a>
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
            {t.addressValue.split("\n").map((line, i) => (
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
