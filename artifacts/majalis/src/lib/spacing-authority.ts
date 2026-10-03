/**
 * SPACING_AUTHORITY — rhythm scale → foundation tokens.
 * See docs/design/SPACING_AUTHORITY_MAP.md
 */
export const SPACING_AUTHORITY = {
  /** 4px */ XS: "--sf2-space-1",
  /** 8px */ SM: "--sf2-space-2",
  /** 12px */ MD: "--sf2-space-3",
  /** 16px */ LG: "--sf2-space-4",
  /** 20px */ XL: "--sf2-space-5",
  /** 24px */ XXL: "--sf2-space-6",
  /** 32px */ SECTION: "--sf2-space-8",
  /** 48px */ PAGE: "--sf-space-12",
} as const;

export type SpacingAuthorityStep = keyof typeof SPACING_AUTHORITY;

/** Product recipes (not a second scale). */
export const SPACING_RECIPES = {
  cardPadding: "--sf2-space-4",
  formFieldGap: "--sf2-space-3",
  sectionGap: "--sf2-space-6",
  pageEndGap: "--sf2-page-end-gap",
  iconTextGap: "--sf2-gap-icon-text",
  titleDescGap: "--sf2-gap-title-desc",
  pageInline: "--page-pad-x",
} as const;

/** Compat aliases that must track foundation (not invent values). */
export const SPACING_COMPAT = ["--ds-space-1", "--ds-space-2", "--ds-space-3", "--ds-space-4", "--ds-space-5", "--ds-space-6", "--ds-space-8"] as const;
