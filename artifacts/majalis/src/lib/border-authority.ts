/**
 * BORDER_AUTHORITY — stroke roles → hairline / brand / focus tokens.
 * See docs/design/BORDER_AUTHORITY_MAP.md
 */
export const BORDER_AUTHORITY = {
  PRIMARY: "--mj-brand", // emphasis / selected outline
  SECONDARY: "--sf-border-strong", // stronger structural
  SUBTLE: "--mj-hairline", // default card/control edge
  DIVIDER: "--mj-hairline", // list/table separators
  FOCUS: "--sf2-focus-ring", // focus-visible ring
} as const;

export type BorderAuthorityRole = keyof typeof BORDER_AUTHORITY;

export const BORDER_WIDTH = {
  hairline: "1px",
  emphasis: "2px",
  focusRing: "2px",
} as const;

export const BORDER_COMPAT = [
  "--sf-hairline",
  "--sf2-border-subtle",
  "--color-hairline",
  "--color-border",
  "--majalis-line",
] as const;
