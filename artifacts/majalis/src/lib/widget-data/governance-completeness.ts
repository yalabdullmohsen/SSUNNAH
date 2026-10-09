/**
 * PR W5 — Unified Widget governance completeness contract.
 * Extends existing catalog / truth / privacy / strategy gates; does not create a parallel engine.
 */
import { WIDGET_CENTER_CATALOG } from "./catalog";
import { WIDGET_CATALOG_PRODUCT_JUSTIFICATION } from "./catalog-product-justification";
import { CUSTOM_WIDGET_STRATEGY } from "./custom-widget-strategy";
import { WIDGET_DATA_TRUTH_CONTRACT } from "./data-truth";
import { WIDGET_CENTER_FORM_AUTHORITY } from "./center-form-authority";
import { WIDGET_FORBIDDEN_APP_GROUP_SUBSTRINGS, WIDGET_FUTURE_BINARY_REQUIRED } from "./types";

export type WidgetGovernanceRequirement =
  | "unique_kinds"
  | "product_justified_kinds"
  | "exact_supported_families"
  | "registered_widget_source"
  | "no_placeholder_only_widget"
  | "valid_preview_fixture"
  | "valid_live_data_fixture"
  | "no_data_state"
  | "stale_state"
  | "malformed_state"
  | "configuration_state"
  | "canonical_data_owner"
  | "privacy_class"
  | "deep_link"
  | "accessibility_description"
  | "timeline_cost_class"
  | "target_membership"
  | "deployment_availability"
  | "no_duplicate_engines"
  | "preview_live_isolation"
  | "write_before_reload"
  | "account_switch_logout_safety";

export const WIDGET_GOVERNANCE_REQUIREMENTS: WidgetGovernanceRequirement[] = [
  "unique_kinds",
  "product_justified_kinds",
  "exact_supported_families",
  "registered_widget_source",
  "no_placeholder_only_widget",
  "valid_preview_fixture",
  "valid_live_data_fixture",
  "no_data_state",
  "stale_state",
  "malformed_state",
  "configuration_state",
  "canonical_data_owner",
  "privacy_class",
  "deep_link",
  "accessibility_description",
  "timeline_cost_class",
  "target_membership",
  "deployment_availability",
  "no_duplicate_engines",
  "preview_live_isolation",
  "write_before_reload",
  "account_switch_logout_safety",
];

export const WIDGET_DOMAIN_DATA_OWNERS = {
  prayer: "prayer-times app engine → SharedPrayerSnapshot",
  calendar: "hijri-utils Intl Umm al-Qura",
  islamicEvents: "religious-content verified records",
  adhkar: "adhkar repository + daily-content",
  quran: "quran-api local-first",
  mushaf: "quran-last-page + bookmarks",
  progress: "daily-progress / user-streak",
  preferences: "widget preferences store",
  custom: "local widget selections",
} as const;

export function assertWidgetGovernanceCompleteness(): {
  ok: true;
  catalogCount: number;
  justifiedCount: number;
  requirementCount: number;
  futureBinaryRequired: boolean;
  customStrategy: string;
} {
  const kinds = WIDGET_CENTER_CATALOG.map((item) => item.kind);
  const unique = new Set(kinds);
  if (unique.size !== kinds.length) {
    throw new Error("duplicate widget kinds in catalog");
  }
  if (kinds.length !== 9) {
    throw new Error("catalog must hold exactly the 9 final widgets");
  }

  const justified = new Set(WIDGET_CATALOG_PRODUCT_JUSTIFICATION.map((j) => j.kind));
  for (const kind of unique) {
    if (!justified.has(kind)) {
      throw new Error(`product justification missing for ${kind}`);
    }
  }

  for (const item of WIDGET_CENTER_CATALOG) {
    if (!item.families.length) throw new Error(`missing families for ${item.kind}`);
    if (!item.deepLink.startsWith("/")) throw new Error(`deep link invalid for ${item.kind}`);
    if (!item.privacyClass) throw new Error(`privacy class missing for ${item.kind}`);
    if (!item.descriptionAr.trim()) throw new Error(`accessibility/description missing for ${item.kind}`);
    if (!item.dataRequirementsAr.trim()) throw new Error(`data owner hint missing for ${item.kind}`);
  }

  for (const j of WIDGET_CATALOG_PRODUCT_JUSTIFICATION) {
    if (!j.timelineCost) throw new Error(`timeline cost missing for ${j.kind}`);
    if (!j.classification) throw new Error(`classification missing for ${j.kind}`);
  }

  if (!WIDGET_DATA_TRUTH_CONTRACT.accountSwitchRepublishesSafeData) {
    throw new Error("account-switch safety missing");
  }
  if (!WIDGET_DATA_TRUTH_CONTRACT.logoutClearsAccountLinkedSnapshots) {
    throw new Error("logout safety missing");
  }
  if (!WIDGET_CENTER_FORM_AUTHORITY.webDoesNotRenderWidgetKit) {
    throw new Error("platform honesty missing");
  }
  if (CUSTOM_WIDGET_STRATEGY.option !== "REMOVED") {
    throw new Error("custom strategy drift");
  }
  if (!WIDGET_FUTURE_BINARY_REQUIRED) {
    throw new Error("future binary flag must remain true until owner ships a new build");
  }
  if (!WIDGET_FORBIDDEN_APP_GROUP_SUBSTRINGS.includes("token")) {
    throw new Error("privacy forbidden token list incomplete");
  }
  if (WIDGET_GOVERNANCE_REQUIREMENTS.length < 20) {
    throw new Error("governance requirement list incomplete");
  }

  return {
    ok: true,
    catalogCount: kinds.length,
    justifiedCount: justified.size,
    requirementCount: WIDGET_GOVERNANCE_REQUIREMENTS.length,
    futureBinaryRequired: WIDGET_FUTURE_BINARY_REQUIRED,
    customStrategy: CUSTOM_WIDGET_STRATEGY.option,
  };
}
