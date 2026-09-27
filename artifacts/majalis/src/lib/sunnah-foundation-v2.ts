/**
 * Foundation V2 — أسماء أدوار للاستهلاك في TypeScript.
 * القيم: `styles/sunnah-foundation-v2.css` (جسر إلى --sf-*).
 */

export const SF2_SURFACE = {
  page: "var(--sf2-page-bg)",
  elevated: "var(--sf2-elevated-bg)",
  card: "var(--sf2-card-bg)",
  overlay: "var(--sf2-overlay)",
  skeleton: "var(--sf2-skeleton)",
} as const;

export const SF2_TEXT = {
  primary: "var(--sf2-text-primary)",
  secondary: "var(--sf2-text-secondary)",
  muted: "var(--sf2-text-muted)",
  onBrand: "var(--sf2-text-on-brand)",
  disabled: "var(--sf2-text-disabled)",
} as const;

export const SF2_ACTION = {
  primary: "var(--sf2-action-primary)",
  primaryDeep: "var(--sf2-action-primary-deep)",
  focusRing: "var(--sf2-focus-ring)",
  selectedBg: "var(--sf2-selected-bg)",
} as const;

export const SF2_STATUS = {
  success: "var(--sf2-success)",
  warning: "var(--sf2-warning)",
  error: "var(--sf2-error)",
  info: "var(--sf2-info)",
} as const;

export const SF2_RADIUS = {
  control: "var(--sf2-radius-control)",
  card: "var(--sf2-radius-card)",
  feature: "var(--sf2-radius-feature)",
  sheet: "var(--sf2-radius-sheet)",
} as const;

/** تباين مرجعي موثّق (تقريبي) للأزواج الفاتحة — لا يغني عن بوابة Playwright */
export const SF2_CONTRAST_NOTES = {
  primaryOnPage: { fg: "#15382D", bg: "#F8F6F1", min: 4.5 },
  secondaryOnPage: { fg: "#48645A", bg: "#F8F6F1", min: 4.5 },
  mutedOnPage: { fg: "#5F7168", bg: "#F8F6F1", min: 4.5 },
  primaryOnCard: { fg: "#15382D", bg: "#FFFFFF", min: 4.5 },
  actionOnCard: { fg: "#0F5C3F", bg: "#FFFFFF", min: 4.5 },
} as const;
