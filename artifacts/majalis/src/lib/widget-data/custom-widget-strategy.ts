/**
 * PR W2 — Custom content Widget configuration strategy.
 *
 * OPTION C selected and proven:
 * - Canonical registered kind owner: CustomContentStaticWidget
 * - AppIntent implementation exists behind @available(iOS 17+) but is NOT registered
 * - Same kind identifier must never be dual-registered
 */
export const CUSTOM_WIDGET_KIND = "sunnah.widget.custom";

export const CUSTOM_WIDGET_STRATEGY = {
  option: "C" as const,
  canonicalOwner: "CustomContentStaticWidget",
  deferredImplementation: "CustomContentWidget",
  kind: CUSTOM_WIDGET_KIND,
  olderIosCompatibility: "Static V1 owns the kind for all currently supported iOS builds including Build 55.",
  migrationPlan:
    "When minimum deployment target is iOS 17+ and product requires per-instance App Intent configuration, replace Static registration with AppIntentConfiguration under the same kind in one release, with TestFlight validation of existing configured instances.",
  multipleInstancesSafe: true,
  duplicateKindForbidden: true,
};

export function assertCustomWidgetStrategy(): typeof CUSTOM_WIDGET_STRATEGY {
  if (CUSTOM_WIDGET_STRATEGY.option !== "C") {
    throw new Error("unexpected custom widget strategy");
  }
  if (CUSTOM_WIDGET_STRATEGY.kind !== CUSTOM_WIDGET_KIND) {
    throw new Error("custom kind drift");
  }
  return CUSTOM_WIDGET_STRATEGY;
}
