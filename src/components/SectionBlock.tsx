// SectionBlock — shared section renderer for CMS-driven content pages.
// Used by /liput, /wiljami, /tanssiteatteri and any future section-based page.
//
// Section types (determined by which fields are filled):
//  1. Text only       — full-width text block
//  2. Image only      — full-width image
//  3. Title + text    — heading + full-width text
//  4. Title+text+img  — heading, then image/text side by side
//     landscape image → 60% width | portrait image → 40% width
//
// index prop controls alternating background: even = offWhite, odd = white

import Image from "next/image";
import { colors } from "@/styles/colors";
import { type SectionPageSection } from "@/lib/content";

export type Locale = "fi" | "en";

function renderText(text: string): React.ReactNode[] {
  return text
    .trim()
    .split(/\n\n+/)
    .map((para, i) => {
      const parts = para.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part.split("\n").reduce<React.ReactNode[]>((acc, line, k, arr) => {
          acc.push(line);
          if (k < arr.length - 1) acc.push(<br key={`br-${k}`} />);
          return acc;
        }, []);
      });
      return (
        <p
          key={i}
          style={{
            color: colors.nearBlack,
            fontSize: "0.95rem",
            lineHeight: 1.85,
            opacity: 0.85,
            marginBottom: "1rem",
          }}
        >
          {parts}
        </p>
      );
    });
}

type Props = {
  section: SectionPageSection;
  locale: Locale;
  index?: number;
};

export default function SectionBlock({ section, locale, index = 0 }: Props) {
  const title = locale === "fi" ? section.title_fi : (section.title_en ?? section.title_fi);
  const text = locale === "fi" ? section.text_fi : (section.text_en ?? section.text_fi);
  const alt = locale === "fi" ? section.image_alt_fi : (section.image_alt_en ?? section.image_alt_fi);

  const hasTitle = !!(title?.trim());
  const hasText = !!(text?.trim());
  const hasImage = !!(section.image?.trim());

  if (!hasTitle && !hasText && !hasImage) return null;

  const bg = index % 2 === 0 ? colors.offWhite : "#FFFFFF";
  const aspectRatio = section.image_orientation === "portrait" ? "2/3"
    : section.image_orientation === "square" ? "1/1"
    : "16/9";
  const imagePosition = section.image_position ?? "left";

  // Type 2: image only — full width
  if (hasImage && !hasTitle && !hasText) {
    return (
      <div style={{ backgroundColor: bg, width: "100%" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 2rem" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <Image src={section.image!} alt={alt ?? ""} fill style={{ objectFit: "cover" }} sizes="100vw" />
          </div>
        </div>
      </div>
    );
  }

  const imageFlex = aspectRatio === "2/3" ? "0 0 40%"
    : aspectRatio === "1/1" ? "0 0 50%"
    : "0 0 60%";

  const imageEl = hasImage ? (
    <div style={{ flex: imageFlex, position: "relative", aspectRatio, borderRadius: "4px", overflow: "hidden" }}>
      <Image
        src={section.image!}
        alt={alt ?? ""}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, 60vw"
      />
    </div>
  ) : null;

  const textEl = hasText ? (
    <div style={{ flex: "1 1 200px" }}>{renderText(text!)}</div>
  ) : null;

  return (
    <div style={{ backgroundColor: bg, width: "100%" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 2rem" }}>
        {hasTitle && (
          <h2
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            {title}
          </h2>
        )}
        {hasImage && hasText ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "flex-start" }}>
            {imagePosition === "right" ? textEl : imageEl}
            {imagePosition === "right" ? imageEl : textEl}
          </div>
        ) : (
          textEl
        )}
      </div>
    </div>
  );
}
