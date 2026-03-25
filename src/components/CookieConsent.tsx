// CookieConsent — GDPR cookie consent banner.
// Shown on first visit. Stores choice in localStorage.
// On accept: loads Netticket embed script dynamically.
// On decline: no third-party scripts loaded.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { colors } from "@/styles/colors";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const { locale } = useRouter();
  const fi = locale !== "en";

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    window.location.reload();
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9000,
        backgroundColor: colors.nearBlack,
        borderTop: `4px solid ${colors.brandFuchsia}`,
        padding: "2rem 2.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "1.5rem",
        justifyContent: "space-between",
      }}
    >
      <p style={{ color: colors.white, fontSize: "1rem", lineHeight: 1.7, flex: "1 1 300px", margin: 0 }}>
        {fi ? (
          <>
            Käytämme lipunmyyntipalveluna <strong>Netticket.fi</strong>-widgetiä, joka asettaa kolmannen osapuolen evästeitä (mm. Google Analytics, Facebook).{" "}
            <Link href="/tietosuojaseloste" style={{ color: colors.brandFuchsia, textDecoration: "underline" }}>
              Lue lisää tietosuojaselosteesta.
            </Link>
          </>
        ) : (
          <>
            We use the <strong>Netticket.fi</strong> ticket sales widget, which sets third-party cookies (e.g. Google Analytics, Facebook).{" "}
            <Link href="/tietosuojaseloste" style={{ color: colors.brandFuchsia, textDecoration: "underline" }}>
              Read our privacy policy.
            </Link>
          </>
        )}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: "none",
            border: `1px solid rgba(255,255,255,0.3)`,
            color: "rgba(255,255,255,0.7)",
            padding: "0.75rem 1.75rem",
            borderRadius: "2px",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          {fi ? "Hylkää" : "Decline"}
        </button>
        <button
          onClick={accept}
          style={{
            backgroundColor: colors.brandFuchsia,
            border: "none",
            color: colors.white,
            padding: "0.75rem 1.75rem",
            borderRadius: "2px",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
          }}
        >
          {fi ? "Hyväksy evästeet" : "Accept cookies"}
        </button>
      </div>
    </div>
  );
}
