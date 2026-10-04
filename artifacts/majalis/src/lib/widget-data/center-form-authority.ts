/**
 * PR W4 — Widget Center Form Authority contract.
 */
export const WIDGET_CENTER_FORM_AUTHORITY = {
  canonicalButton: "@/components/ui/button",
  canonicalSelect: "@/components/ui/select",
  canonicalInput: "@/components/ui/input",
  canonicalSearchInput: "@/components/design-system SearchInput",
  canonicalToggle: "@/components/design-system/SettingsList SettingsToggleRow",
  rawInteractiveElementsAllowed: false,
  iosSafeInputMinFontPx: 16,
  webDoesNotRenderWidgetKit: true,
  futureBinaryNoticeRequired: true,
} as const;

export function assertWidgetCenterFormAuthority(): typeof WIDGET_CENTER_FORM_AUTHORITY {
  if (WIDGET_CENTER_FORM_AUTHORITY.rawInteractiveElementsAllowed) {
    throw new Error("raw interactive elements must remain forbidden");
  }
  if (!WIDGET_CENTER_FORM_AUTHORITY.webDoesNotRenderWidgetKit) {
    throw new Error("platform copy contract missing");
  }
  return WIDGET_CENTER_FORM_AUTHORITY;
}
