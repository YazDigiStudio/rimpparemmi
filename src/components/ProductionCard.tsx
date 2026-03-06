// ProductionCard — clickable card linking to the production detail page.
// Shows primary image, title, subtitle, and an optional corner badge.

import Image from "next/image";
import Link from "next/link";
import { colors } from "@/styles/colors";
import type { Production } from "@/lib/content";

type Props = {
  production: Production;
  locale: "fi" | "en";
  basePath?: string;
};

export default function ProductionCard({ production, locale, basePath = "/ohjelma" }: Props) {
  const title = locale === "fi"
    ? production.title_fi
    : (production.title_en ?? production.title_fi);

  const subtitle = locale === "fi"
    ? production.subtitle_fi
    : (production.subtitle_en ?? production.subtitle_fi);

  const badge = locale === "fi"
    ? production.badge_fi
    : (production.badge_en ?? production.badge_fi);

  return (
    <Link
      href={`${basePath}/${production.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.white,
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        textDecoration: "none",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
      className="production-card"
    >
      {/* Primary image */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        <Image
          src={production.primary_image}
          alt={title}
          fill
          style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
          className="production-card-img"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Corner badge */}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              left: "0.75rem",
              backgroundColor: colors.brandFuchsia,
              color: colors.white,
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.25rem 0.6rem",
              borderRadius: "2px",
            }}
          >
            {badge}
          </div>
        )}
      </div>

      {/* Text block */}
      <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
        <h2
          style={{
            color: colors.nearBlack,
            fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            lineHeight: 1.2,
            marginBottom: subtitle ? "0.4rem" : 0,
          }}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            style={{
              color: colors.muted,
              fontSize: "0.85rem",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}
