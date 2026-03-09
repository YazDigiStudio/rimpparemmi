// Central theme file — colors and typography for Tanssiteatteri Rimpparemmi
// Import from here instead of colors.ts for new code.
// Typography spec: RR_Typografia_1604.pdf

export { colors, type ColorKey } from "./colors";

export const fonts = {
  // Body text, UI labels, paragraphs — Lexend Regular/Bold
  body: "'Lexend', Arial, Helvetica, sans-serif",
  // All-caps headings and labels only — Kumbh Sans Bold
  caps: "'Kumbh Sans', Arial, Helvetica, sans-serif",
} as const;
