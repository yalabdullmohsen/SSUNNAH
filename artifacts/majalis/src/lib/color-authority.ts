/**
 * COLOR_AUTHORITY — semantic roles → canonical tokens.
 * See docs/design/COLOR_AUTHORITY_MAP.md
 * Policy: Foundation `--sf2-*` · Product `--mj-*` · Bridge `--ss-*` · no new family.
 */
export const COLOR_AUTHORITY = {
  PRIMARY: "--mj-brand",
  SECONDARY: "--mj-brand-deep",
  ACCENT: "--mj-accent",
  SUCCESS: "--sf2-success",
  WARNING: "--mj-warning",
  ERROR: "--mj-danger",
  INFO: "--mj-info",
  SURFACE: "--mj-surface",
  BACKGROUND: "--mj-bg",
  BORDER: "--mj-hairline",
  TEXT: "--mj-ink",
  MUTED: "--mj-ink-2",
  OVERLAY: "--sf2-overlay",
} as const;

export type ColorAuthorityRole = keyof typeof COLOR_AUTHORITY;

/** Foundation / product duals accepted for the same meaning (not competing palettes). */
export const COLOR_AUTHORITY_ALIASES: Record<ColorAuthorityRole, readonly string[]> = {
  PRIMARY: ["--sf2-action-primary", "--color-primary", "--color-brand"],
  SECONDARY: ["--mj-brand-deep", "--color-brand-deep"],
  ACCENT: ["--sf2-accent-gold", "--color-accent"],
  SUCCESS: ["--majalis-success", "--mj-success-soft"],
  WARNING: ["--sf2-warning", "--color-warning"],
  ERROR: ["--sf2-error", "--color-danger", "--ss-danger"],
  INFO: ["--color-info"],
  SURFACE: ["--sf2-card-bg", "--color-surface"],
  BACKGROUND: ["--sf2-page-bg", "--surface-app", "--color-bg"],
  BORDER: ["--sf2-border-subtle", "--color-hairline", "--color-border"],
  TEXT: ["--sf2-text-primary", "--color-ink", "--color-text"],
  MUTED: ["--sf2-text-muted", "--color-muted", "--mj-muted"],
  OVERLAY: ["--color-overlay"],
};
