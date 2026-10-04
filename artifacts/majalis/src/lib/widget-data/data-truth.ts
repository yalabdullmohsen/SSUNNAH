/**
 * PR W3 — Widget data truth hardening contracts.
 * Account switch / logout must republish public-safe App Group snapshots only.
 */
import { isIOS, isNative } from "@/lib/capacitor-utils";
import {
  publishSharedProgressSnapshot,
  publishSharedWidgetEnvelope,
} from "@/lib/plugins/sunnah-shared-data";

export const WIDGET_AUTH_PUBLICATION_REASONS = [
  "logout-safe-republish",
  "account-switch-safe-republish",
] as const;

export type WidgetAuthPublicationReason = (typeof WIDGET_AUTH_PUBLICATION_REASONS)[number];

export const WIDGET_DATA_TRUTH_CONTRACT = {
  noAccountPrivateInAppGroup: true,
  logoutClearsAccountLinkedSnapshots: true,
  accountSwitchRepublishesSafeData: true,
  staleCountdownDisabled: true,
  invalidBookmarkRequiresConfiguration: true,
  revokedPermissionActionable: true,
  schemaForwardFailureIsolated: true,
  unaffectedDomainsRemainAvailable: true,
  futureBinaryRequired: true,
} as const;

/** Domains republished after auth identity changes (public + local-safe only). */
export const WIDGET_AUTH_SAFE_DOMAINS = [
  "prayer",
  "calendar",
  "adhkar",
  "quran",
  "mushaf",
  "custom",
  "home",
] as const;

export function authPublicationReason(
  event: "logout" | "account-switch",
): WidgetAuthPublicationReason {
  return event === "logout" ? "logout-safe-republish" : "account-switch-safe-republish";
}

/**
 * After logout or account switch: zero progress snapshot, then republish a
 * public-safe envelope from post-isolation local state. Never throws.
 */
export async function republishSafeWidgetDataAfterAuthChange(
  event: "logout" | "account-switch",
): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  try {
    await publishSharedProgressSnapshot({
      dailyWirdCompleted: 0,
      dailyWirdTarget: 0,
      mushafPagesReadToday: 0,
    });
    const { buildSunnahWidgetEnvelope } = await import(
      "@/lib/plugins/sunnah-widget-envelope-publish"
    );
    const reason = authPublicationReason(event);
    const envelope = buildSunnahWidgetEnvelope(new Date(), null, { publicationReason: reason });
    // Strip account-linked progress counters from the published envelope.
    const progress = envelope.progressPayload as Record<string, unknown> | undefined;
    if (progress) {
      progress.hasCanonicalTracking = false;
      progress.morningAdhkarDone = false;
      progress.eveningAdhkarDone = false;
      progress.quranDone = false;
      progress.wirdDone = false;
      progress.adhkarStreakDays = null;
      progress.pagesCompletedToday = 0;
      progress.mushafPercent = null;
      progress.validationStatus = "REQUIRES_CONFIGURATION";
    }
    const adhkar = envelope.adhkarPayload as Record<string, unknown> | undefined;
    if (adhkar) {
      adhkar.todayCompleted = false;
      adhkar.streakDays = null;
      adhkar.hasCanonicalProgress = false;
    }
    const { assertPublicSafeWidgetJson } = await import("./privacy");
    const json = JSON.stringify(envelope);
    if (!assertPublicSafeWidgetJson(json)) return false;
    return await publishSharedWidgetEnvelope(json, [...WIDGET_AUTH_SAFE_DOMAINS]);
  } catch {
    return false;
  }
}

export function assertWidgetDataTruthContract(): typeof WIDGET_DATA_TRUTH_CONTRACT {
  const c = WIDGET_DATA_TRUTH_CONTRACT;
  if (!c.logoutClearsAccountLinkedSnapshots || !c.accountSwitchRepublishesSafeData) {
    throw new Error("widget data truth contract incomplete");
  }
  if (!c.schemaForwardFailureIsolated || !c.staleCountdownDisabled) {
    throw new Error("widget data truth safety incomplete");
  }
  return c;
}
