// MarkdownText — renders CMS markdown content (headings, bold, italic, links, lists, etc.)
// Shared component used wherever widget: "markdown" content is displayed.

import ReactMarkdown from "react-markdown";
import { colors } from "@/styles/colors";

type Props = {
  children: string;
  fontSize?: string;
  lineHeight?: number;
};

export default function MarkdownText({
  children,
  fontSize = "0.95rem",
  lineHeight = 1.85,
}: Props) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children: c }) => (
          <p style={{ color: colors.nearBlack, fontSize, lineHeight, opacity: 0.85, marginBottom: "1rem" }}>
            {c}
          </p>
        ),
        h1: ({ children: c }) => (
          <h2 style={{ color: colors.nearBlack, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
            {c}
          </h2>
        ),
        h2: ({ children: c }) => (
          <h3 style={{ color: colors.nearBlack, fontSize: "1.35rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
            {c}
          </h3>
        ),
        h3: ({ children: c }) => (
          <h4 style={{ color: colors.nearBlack, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "0.6rem" }}>
            {c}
          </h4>
        ),
        h4: ({ children: c }) => (
          <h5 style={{ color: colors.nearBlack, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "0.5rem" }}>
            {c}
          </h5>
        ),
        h5: ({ children: c }) => (
          <h6 style={{ color: colors.nearBlack, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {c}
          </h6>
        ),
        h6: ({ children: c }) => (
          <h6 style={{ color: colors.nearBlack, fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            {c}
          </h6>
        ),
        a: ({ href, children: c }) => {
          const isInternal = href?.startsWith("/") || href?.startsWith("#");
          return (
            <a
              href={href}
              target={isInternal ? undefined : "_blank"}
              rel={isInternal ? undefined : "noopener noreferrer"}
              style={{ color: colors.brandFuchsia }}
            >
              {c}
            </a>
          );
        },
        ul: ({ children: c }) => (
          <ul style={{ color: colors.nearBlack, fontSize, lineHeight, opacity: 0.85, paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            {c}
          </ul>
        ),
        ol: ({ children: c }) => (
          <ol style={{ color: colors.nearBlack, fontSize, lineHeight, opacity: 0.85, paddingLeft: "1.5rem", marginBottom: "1rem" }}>
            {c}
          </ol>
        ),
        li: ({ children: c }) => (
          <li style={{ marginBottom: "0.25rem" }}>{c}</li>
        ),
        blockquote: ({ children: c }) => (
          <blockquote style={{
            borderLeft: `3px solid ${colors.brandFuchsia}`,
            paddingLeft: "1rem",
            margin: "1rem 0",
            color: colors.muted,
            fontStyle: "italic",
          }}>
            {c}
          </blockquote>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
