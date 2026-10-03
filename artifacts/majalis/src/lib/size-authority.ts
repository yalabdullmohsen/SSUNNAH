/**
 * SIZE_AUTHORITY — control / icon / chrome dimensions.
 * See docs/design/SIZE_AUTHORITY_MAP.md
 */
export const SIZE_AUTHORITY = {
  TOUCH_MIN: "--touch-min", // 44px
  TOUCH_COMFORTABLE: "--touch-comfortable", // 48px
  CONTROL_HEIGHT: "--touch-min",
  BUTTON_HEIGHT_SM: "--touch-min",
  BUTTON_HEIGHT_MD: "--touch-comfortable",
  INPUT_HEIGHT: "--touch-min",
  ICON_BOX: "--sf2-icon-box",
  ICON_BOX_SM: "--sf2-icon-box-sm",
  TAB_MIN_HEIGHT: "--ss-tab-min-height",
  TABLE_HEADER_MIN: "2.5rem",
  MODAL_MAX_WIDTH: "max-w-lg",
  RADIUS_CONTROL: "--sf-radius-control",
  RADIUS_CARD: "--radius-card",
  BOTTOM_NAV_HEIGHT: "--bottom-nav-height",
} as const;

export type SizeAuthorityKey = keyof typeof SIZE_AUTHORITY;

/** Icon glyph scales (Lucide size prop / CSS). */
export const ICON_SIZE_SCALE = {
  sm: 16,
  md: 18,
  lg: 22,
  xl: 24,
} as const;
