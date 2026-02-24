// Footer — site-wide footer with logo, legal links, and social media icons.
// Background matches the solid navigation bar colour.

import Image from "next/image";
import Link from "next/link";
import { colors } from "@/styles/colors";

const FOOTER_BG = "rgb(232,232,232)";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/TanssiteatteriRimpparemmi",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCk1dlkJfbXqLOujrtXyK3Fw",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/rimpparemmi/",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer style={{ backgroundColor: FOOTER_BG }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Image
            src="/images/RRemmi_FUKS_rgb_10Mt.jpeg"
            alt="Tanssiteatteri Rimpparemmi"
            width={56}
            height={56}
            style={{ borderRadius: "2px" }}
          />
        </Link>

        {/* Legal links */}
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link
            href="/saavutettavuus"
            style={{
              color: colors.muted,
              fontSize: "0.8rem",
              letterSpacing: "0.03em",
            }}
          >
            Saavutettavuus
          </Link>
          <Link
            href="/tietosuojaseloste"
            style={{
              color: colors.muted,
              fontSize: "0.8rem",
              letterSpacing: "0.03em",
            }}
          >
            Tietosuojaseloste
          </Link>
        </div>

        {/* Social icons */}
        <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
          {socialLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              style={{ color: colors.nearBlack, opacity: 0.65, display: "flex" }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
