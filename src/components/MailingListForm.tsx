// MailingListForm — Netlify Forms newsletter signup.
// IMPORTANT: Notification email is set in Netlify dashboard → Forms → Notifications.
// The static form at /public/forms/newsletter.html is required for Netlify bot detection with Next.js.

import { useState } from "react";
import { colors } from "@/styles/colors";

type Locale = "fi" | "en";
type Status = "idle" | "loading" | "success" | "error";

const copy = {
  fi: {
    heading: "Liity postituslistalle",
    subtitle: "Saat tiedon uusista esityksistä ja tapahtumista.",
    namePlaceholder: "Nimi",
    emailPlaceholder: "Sähköposti",
    submit: "Liity",
    success: "Kiitos! Olet nyt postituslistalla.",
    error: "Jotain meni pieleen. Yritä uudelleen.",
  },
  en: {
    heading: "Join our mailing list",
    subtitle: "Get updates on new performances and events.",
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    submit: "Subscribe",
    success: "Thank you! You are now on our mailing list.",
    error: "Something went wrong. Please try again.",
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
    setStatus("loading");
    const form = e.currentTarget;
    const body = Array.from(new FormData(form))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v.toString())}`)
      .join("&");
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
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
          name="newsletter"
          method="POST"
          data-netlify="true"
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <input type="hidden" name="form-name" value="newsletter" />
          <input
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
              outline: "none",
            }}
          />
          <input
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
              outline: "none",
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
        </form>
      )}
    </div>
  );
}
