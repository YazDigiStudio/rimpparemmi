// MailingListForm — Mailchimp newsletter signup via /api/subscribe.

import { useState } from "react";
import { colors } from "@/styles/colors";

type Locale = "fi" | "en";
type Status = "idle" | "loading" | "success" | "error" | "invalid-email";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const copy = {
  fi: {
    heading: "Liity postituslistalle",
    subtitle: "Saat tiedon uusista esityksistä ja tapahtumista.",
    namePlaceholder: "Nimi",
    emailPlaceholder: "Sähköposti",
    submit: "Liity",
    success: "Kiitos! Olet nyt postituslistalla.",
    error: "Jotain meni pieleen. Yritä uudelleen.",
    invalidEmail: "Tarkista sähköpostiosoite.",
  },
  en: {
    heading: "Join our mailing list",
    subtitle: "Get updates on new performances and events.",
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    submit: "Subscribe",
    success: "Thank you! You are now on our mailing list.",
    error: "Something went wrong. Please try again.",
    invalidEmail: "Please check your email address.",
  },
} as const;

type Props = {
  locale: Locale;
};

export default function MailingListForm({ locale }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const t = copy[locale];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Honeypot: if bot-field is filled, silently discard
    if ((form.elements.namedItem("bot-field") as HTMLInputElement)?.value) {
      setStatus("success");
      return;
    }
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
    if (!emailRegex.test(email)) {
      setStatus("invalid-email");
      return;
    }
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value ?? "";
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <h2
        style={{
          color: colors.nearBlack,
          fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}
      >
        {t.heading}
      </h2>
      <p
        style={{
          color: colors.nearBlack,
          fontSize: "0.9rem",
          lineHeight: 1.6,
          opacity: 0.7,
          marginBottom: "1.5rem",
        }}
      >
        {t.subtitle}
      </p>

      {status === "success" ? (
        <p
          style={{
            color: colors.brandFuchsia,
            fontSize: "0.9rem",
            lineHeight: 1.7,
            fontWeight: 500,
          }}
        >
          {t.success}
        </p>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {/* Honeypot — hidden from humans, bots fill it and get silently rejected */}
          <input type="text" name="bot-field" style={{ display: "none" }} aria-hidden="true" />
          <label htmlFor="newsletter-name" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
            {t.namePlaceholder}
          </label>
          <input
            id="newsletter-name"
            type="text"
            name="name"
            placeholder={t.namePlaceholder}
            style={{
              padding: "0.65rem 0.875rem",
              background: colors.white,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: "2px",
              color: colors.nearBlack,
              fontSize: "0.9rem",
            }}
          />
          <label htmlFor="newsletter-email" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
            {t.emailPlaceholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder={t.emailPlaceholder}
            style={{
              padding: "0.65rem 0.875rem",
              background: colors.white,
              border: `1px solid ${colors.borderLight}`,
              borderRadius: "2px",
              color: colors.nearBlack,
              fontSize: "0.9rem",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              backgroundColor: colors.brandFuchsia,
              color: colors.white,
              border: "none",
              borderRadius: "2px",
              padding: "0.65rem 1.5rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: status === "loading" ? "wait" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {status === "loading" ? "..." : t.submit}
          </button>
          {status === "error" && (
            <p style={{ color: "#c0392b", fontSize: "0.8rem" }}>{t.error}</p>
          )}
          {status === "invalid-email" && (
            <p style={{ color: "#c0392b", fontSize: "0.8rem" }}>{t.invalidEmail}</p>
          )}
        </form>
      )}
    </div>
  );
}
