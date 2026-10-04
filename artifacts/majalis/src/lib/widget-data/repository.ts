import { isIOS, isNative } from "@/lib/capacitor-utils";
import { getPluginAppGroupAvailability } from "@/lib/plugins/sunnah-shared-data";
import {
  WIDGET_CALENDAR_AUTHORITY,
  WIDGET_ENVELOPE_SCHEMA_VERSION,
  WIDGET_FUTURE_BINARY_REQUIRED,
  type WidgetValidationStatus,
} from "./types";
import { listWidgetIslamicEvents, pickUpcomingWidgetEvent } from "./islamic-events";
import { loadWidgetPreferences } from "./preferences";
import { loadWidgetSelections } from "./selections";
import { assertPublicSafeWidgetJson } from "./privacy";
import { WIDGET_PROGRESS_CONTRACTS } from "./progress-contract";

export type WidgetDiagnostics = {
  schemaVersion: number;
  generatedAtEpochMs: number;
  expiresAtEpochMs: number | null;
  sourceAuthority: string;
  validationStatus: WidgetValidationStatus;
  appGroupAvailable: boolean | null;
  lastPublicationEpochMs: number | null;
  futureBinaryRequired: boolean;
  publicationStatus: string;
  staleDomains: string[];
  missingSetup: string[];
};

const LAST_PUBLISH_KEY = "sunnah-widget-last-publish-v1";

export function rememberWidgetPublication(epochMs: number): void {
  try {
    localStorage.setItem(LAST_PUBLISH_KEY, String(epochMs));
  } catch {
    /* ignore */
  }
}

export function lastWidgetPublicationEpochMs(): number | null {
  try {
    const raw = localStorage.getItem(LAST_PUBLISH_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function getAppGroupAvailability(): Promise<boolean | null> {
  if (!isNative || !isIOS) return false;
  try {
    return await getPluginAppGroupAvailability();
  } catch {
    return null;
  }
}

export function domainMeta(
  sourceAuthority: string,
  validationStatus: WidgetValidationStatus,
  generatedAtEpochMs: number,
  ttlMs = 36 * 3600_000,
) {
  return {
    domainVersion: 1,
    generatedAtEpochMs,
    expiresAtEpochMs: generatedAtEpochMs + ttlMs,
    sourceAuthority,
    validationStatus,
  };
}

export function buildIslamicEventsDomain(hijri: { month: number; day: number }, generatedAt: number) {
  const events = listWidgetIslamicEvents(hijri).filter((event) => event.widgetEligible);
  const upcoming = pickUpcomingWidgetEvent(hijri);
  return {
    ...domainMeta("religious-content", events.length ? "VALID" : "AUTHORITY_REVIEW_REQUIRED", generatedAt),
    schemaVersion: 1,
    events,
    upcomingEventId: upcoming?.id ?? null,
  };
}

export function buildDiagnosticsDomain(generatedAt: number, missingSetup: string[], staleDomains: string[]): WidgetDiagnostics {
  return {
    schemaVersion: 1,
    generatedAtEpochMs: generatedAt,
    expiresAtEpochMs: generatedAt + 36 * 3600_000,
    sourceAuthority: "widget-data-repository",
    validationStatus: missingSetup.length ? "REQUIRES_INITIALIZATION" : "VALID",
    appGroupAvailable: isNative && isIOS ? null : false,
    lastPublicationEpochMs: lastWidgetPublicationEpochMs(),
    futureBinaryRequired: WIDGET_FUTURE_BINARY_REQUIRED,
    publicationStatus: "published",
    staleDomains,
    missingSetup,
  };
}

export function buildEnvelopeHeader(generatedAt: number, timezoneIdentifier: string, reason: string) {
  return {
    schemaVersion: WIDGET_ENVELOPE_SCHEMA_VERSION,
    payloadId: `env-${generatedAt}`,
    generatedAtEpochMs: generatedAt,
    expiresAtEpochMs: generatedAt + 36 * 3600_000,
    timezoneIdentifier,
    localeIdentifier: "ar",
    calendarAuthority: WIDGET_CALENDAR_AUTHORITY,
    dataVersion: "widget-data-v1",
    publicationReason: reason,
    publicationStatus: "published" as const,
  };
}

export { loadWidgetPreferences, loadWidgetSelections, assertPublicSafeWidgetJson, WIDGET_PROGRESS_CONTRACTS };
