// Ihmiset page — /ihmiset & /en/ihmiset
// Sections and titles are CMS-editable via content/ihmiset.yaml.
// Person cards with optional photo, name, bilingual title.
// Cards with a bio open a modal on click.

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import {
  getIhmisetData,
  type IhmisetData,
  type IhmisetSection,
  type Person,
} from "@/lib/content";

type Locale = "fi" | "en";

const pageCopy = {
  fi: { meta: "Ihmiset – Tanssiteatteri Rimpparemmi", pageTitle: "Ihmiset" },
  en: { meta: "People – Dance Theatre Rimpparemmi", pageTitle: "People" },
} as const;

type Props = { data: IhmisetData };

// ── Person card ────────────────────────────────────────────────────────────

function PersonCard({
  person,
  locale,
  onOpen,
}: {
  person: Person;
  locale: Locale;
  onOpen: (p: Person) => void;
}) {
  const title = locale === "fi"
    ? person.title_fi
    : (person.title_en ?? person.title_fi);
  const hasBio = !!(locale === "fi" ? person.bio_fi : (person.bio_en ?? person.bio_fi));
  const imgSrc = person.image || "/images/person-placeholder.svg";

  return (
    <div
      role={hasBio ? "button" : undefined}
      tabIndex={hasBio ? 0 : undefined}
      onClick={hasBio ? () => onOpen(person) : undefined}
      onKeyDown={hasBio ? (e) => { if (e.key === "Enter" || e.key === " ") onOpen(person); } : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: hasBio ? "pointer" : "default",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          overflow: "hidden",
          marginBottom: "1rem",
          backgroundColor: colors.borderLight,
          flexShrink: 0,
          outline: hasBio ? `2px solid transparent` : undefined,
          transition: "outline-color 0.15s",
        }}
      >
        <Image
          src={imgSrc}
          alt={person.name}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <p style={{ color: colors.nearBlack, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.2rem" }}>
        {person.name}
      </p>
      {title && (
        <p style={{ color: colors.muted, fontSize: "0.8rem", letterSpacing: "0.04em" }}>
          {title}
        </p>
      )}
    </div>
  );
}

// ── Bio modal ──────────────────────────────────────────────────────────────

function BioModal({
  person,
  locale,
  onClose,
}: {
  person: Person;
  locale: Locale;
  onClose: () => void;
}) {
  const title = locale === "fi"
    ? person.title_fi
    : (person.title_en ?? person.title_fi);
  const bio = locale === "fi"
    ? person.bio_fi
    : (person.bio_en ?? person.bio_fi);
  const imgSrc = person.image || "/images/person-placeholder.svg";
  const paragraphs = bio ? bio.trim().split(/\n\n+/) : [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.white,
          borderRadius: "4px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          padding: "2.5rem 2rem 2rem",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Sulje"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.4rem",
            color: colors.muted,
            lineHeight: 1,
            padding: "0.25rem",
          }}
        >
          ×
        </button>

        {/* Photo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              position: "relative",
              width: "96px",
              height: "96px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: colors.borderLight,
            }}
          >
            <Image src={imgSrc} alt={person.name} fill style={{ objectFit: "cover" }} />
          </div>
          <div>
            <p style={{ color: colors.nearBlack, fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.2rem" }}>
              {person.name}
            </p>
            {title && (
              <p style={{ color: colors.muted, fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                {title}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div style={{ borderTop: `2px solid ${colors.brandFuchsia}`, paddingTop: "1.25rem" }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                color: colors.nearBlack,
                fontSize: "0.95rem",
                lineHeight: 1.8,
                opacity: 0.85,
                marginBottom: i < paragraphs.length - 1 ? "1rem" : 0,
              }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────────────

function PeopleSection({
  section,
  locale,
  onOpen,
}: {
  section: IhmisetSection;
  locale: Locale;
  onOpen: (p: Person) => void;
}) {
  const people = section.people ?? [];
  if (people.length === 0) return null;

  const title = locale === "fi"
    ? section.title_fi
    : (section.title_en ?? section.title_fi);

  return (
    <section style={{ marginBottom: "4rem" }}>
      <h2
        style={{
          color: colors.nearBlack,
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "2.5rem",
          paddingBottom: "0.75rem",
          borderBottom: `2px solid ${colors.brandFuchsia}`,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "2.5rem 2rem",
        }}
      >
        {people.map((person, i) => (
          <PersonCard key={i} person={person} locale={locale} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Ihmiset({ data }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = pageCopy[locale];

  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const openModal = useCallback((p: Person) => setActivePerson(p), []);
  const closeModal = useCallback(() => setActivePerson(null), []);

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
            {t.pageTitle}
          </h1>
          {(data.sections ?? []).map((section, i) => (
            <PeopleSection key={i} section={section} locale={locale} onOpen={openModal} />
          ))}
        </div>
      </main>

      {activePerson && (
        <BioModal person={activePerson} locale={locale} onClose={closeModal} />
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = getIhmisetData();
  return { props: { data } };
};
