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
import MarkdownText from "@/components/MarkdownText";
import { colors } from "@/styles/colors";
import { type SectionPageSection } from "@/lib/content";

export type Locale = "fi" | "en";

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
            {section.image_photographer && (
              <span style={{
                position: "absolute", bottom: "0.4rem", right: "0.5rem",
                backgroundColor: "rgba(0,0,0,0.45)", color: "#fff",
                fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "2px",
                pointerEvents: "none",
              }}>
                {locale === "fi" ? "Kuva" : "Photo"}: {section.image_photographer}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const imageFlex = aspectRatio === "2/3" ? "1 1 40%"
    : aspectRatio === "1/1" ? "1 1 50%"
    : "1 1 55%";

  const imageEl = hasImage ? (
    <div style={{ flex: imageFlex, minWidth: "280px", position: "relative", aspectRatio, borderRadius: "4px", overflow: "hidden" }}>
      <Image
        src={section.image!}
        alt={alt ?? ""}
        fill
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, 60vw"
      />
      {section.image_photographer && (
        <span style={{
          position: "absolute", bottom: "0.4rem", right: "0.5rem",
          backgroundColor: "rgba(0,0,0,0.45)", color: "#fff",
          fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "2px",
          pointerEvents: "none",
        }}>
          {locale === "fi" ? "Kuva" : "Photo"}: {section.image_photographer}
        </span>
      )}
    </div>
  ) : null;

  const textEl = (
    <div style={{ flex: "1 1 200px" }}>
      {hasTitle && hasImage && (
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
      {hasText && <MarkdownText>{text!}</MarkdownText>}
    </div>
  );

  return (
    <div style={{ backgroundColor: bg, width: "100%" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 2rem" }}>
        {hasTitle && !hasImage && (
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
          <div style={{
            display: "flex",
            flexDirection: imagePosition === "left" ? "row-reverse" : "row",
            flexWrap: "wrap",
            gap: "3rem",
            alignItems: "flex-start",
          }}>
            {textEl}
            {imageEl}
          </div>
        ) : (
          hasText ? <MarkdownText>{text!}</MarkdownText> : null
        )}
      </div>
    </div>
  );
}
