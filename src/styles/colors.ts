// Color palette for Tanssiteatteri Rimpparemmi
// Brand: vivid fuchsia #E8175D on dark/dramatic backgrounds

export const colors = {
  brandFuchsia: "#E8175D",
  fuchsiaHover: "#FF2B6D",
  nearBlack: "#111111",
  darkGray: "#1E1E1E",
  offWhite: "#F5F5F5",
  white: "#FFFFFF",
  muted: "#888888",
  borderDark: "#2E2E2E",
  borderLight: "#E0E0E0",
} as const;

export type ColorKey = keyof typeof colors;
