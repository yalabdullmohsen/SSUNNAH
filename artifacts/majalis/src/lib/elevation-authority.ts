/**
 * ELEVATION_AUTHORITY — depth levels → foundation/product shadow tokens.
 * See docs/design/ELEVATION_AUTHORITY_MAP.md
 * No new shadow family — aliases over `--sf2-shadow-*` / `--sf-shadow-*` / `--mj-sh*`.
 */
export const ELEVATION_AUTHORITY = {
  LEVEL_0: "--sf2-shadow-none", // flat / inset chrome
  LEVEL_1: "--sf2-shadow-card", // cards · list raised
  LEVEL_2: "--sf-shadow-elevated", // dropdown · sticky
  LEVEL_3: "--mj-sh", // floating · sheets · soft modal
  LEVEL_4: "--mj-sh-lg", // dialog focus · feature tour
} as const;

export type ElevationLevel = keyof typeof ELEVATION_AUTHORITY;

export const ELEVATION_USE = {
  LEVEL_0: ["flat surfaces", "hairline-only cards", "tables"],
  LEVEL_1: ["AppCard", "hub cards", "result rows"],
  LEVEL_2: ["menus", "tooltips", "sticky bars"],
  LEVEL_3: ["AppBottomSheet", "FAB lane", "soft dialogs"],
  LEVEL_4: ["blocking dialogs", "critical overlays"],
} as const;
