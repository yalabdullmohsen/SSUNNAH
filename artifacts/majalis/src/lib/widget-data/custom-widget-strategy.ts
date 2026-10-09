/**
 * Custom content widget: removed from the gallery (9-widget final set).
 * The kind id is kept only so stale installed instances resolve to "choose widget".
 */
export const CUSTOM_WIDGET_KIND = "sunnah.widget.custom";

export const CUSTOM_WIDGET_STRATEGY = {
  option: "REMOVED" as const,
  canonicalOwner: null,
  kind: CUSTOM_WIDGET_KIND,
  duplicateKindForbidden: true,
};

export function assertCustomWidgetStrategy(): typeof CUSTOM_WIDGET_STRATEGY {
  if (CUSTOM_WIDGET_STRATEGY.option !== "REMOVED") {
    throw new Error("custom widget must stay removed");
  }
  return CUSTOM_WIDGET_STRATEGY;
}
