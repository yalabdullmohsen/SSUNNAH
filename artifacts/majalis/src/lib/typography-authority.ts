/**
 * TYPOGRAPHY_AUTHORITY — semantic levels → SsText / scale tokens.
 * See docs/design/TYPOGRAPHY_AUTHORITY_MAP.md
 */
import type { SsTextRole } from "@/lib/ssunnah-theme";

export const TYPOGRAPHY_AUTHORITY = {
  DISPLAY: { role: "screenTitle" as SsTextRole, token: "--sf-type-display", css: "--text-display" },
  PAGE_TITLE: { role: "screenTitle" as SsTextRole, token: "--sf-type-page-title", css: "--text-h1" },
  SECTION_TITLE: { role: "sectionTitle" as SsTextRole, token: "--sf-type-section-title", css: "--text-h2" },
  CARD_TITLE: { role: "cardTitle" as SsTextRole, token: "--sf-type-card-title", css: "--text-h3" },
  SUBTITLE: { role: "supporting" as SsTextRole, token: "--sf-type-supporting", css: "--text-body-sm" },
  BODY: { role: "body" as SsTextRole, token: "--sf-type-body", css: "--text-body" },
  BODY_SMALL: { role: "supporting" as SsTextRole, token: "--sf-type-supporting", css: "--text-body-sm" },
  CAPTION: { role: "caption" as SsTextRole, token: "--sf-type-caption", css: "--text-caption" },
  LABEL: { role: "label" as SsTextRole, token: "--sf-type-metadata", css: "--text-label" },
  BUTTON: { role: "label" as SsTextRole, token: "--sf-type-metadata", css: "--text-label" },
  META: { role: "caption" as SsTextRole, token: "--sf-type-metadata", css: "--text-caption" },
  BADGE: { role: "caption" as SsTextRole, token: "--sf-type-caption", css: "--text-caption" },
} as const;

export type TypographyAuthorityLevel = keyof typeof TYPOGRAPHY_AUTHORITY;

/** Hierarchy: Page Title > Section Title > Card Title > Body > Meta */
export const TYPOGRAPHY_HIERARCHY = [
  "PAGE_TITLE",
  "SECTION_TITLE",
  "CARD_TITLE",
  "BODY",
  "META",
] as const satisfies readonly TypographyAuthorityLevel[];
