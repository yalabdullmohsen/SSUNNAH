/**
 * Islamic events for widgets — verified religious records only.
 * Unreviewed seed lists are never treated as unquestioned religious truth.
 */
import { enrichOccasionForPublish } from "@/lib/religious-content";
import { ISLAMIC_OCCASIONS } from "@/lib/islamic-occasions-seed";
import { readLocalJson, writeLocalJson, isPlainObject } from "@/lib/safe-json";

export const WIDGET_EVENT_OVERRIDE_KEY = "sunnah-widget-event-overrides-v1";

export type WidgetEventConfirmation =
  | "CALCULATED"
  | "PROVISIONAL"
  | "OFFICIALLY_CONFIRMED"
  | "MANUALLY_ADJUSTED"
  | "CANCELLED"
  | "HIDDEN";

export type WidgetReligiousAuthorityStatus =
  | "APPROVED"
  | "REVIEW_REQUIRED"
  | "DISPUTED_DO_NOT_FEATURE"
  | "INFORMATIONAL_ONLY";

export type WidgetEventCountdownState =
  | "UPCOMING"
  | "TODAY"
  | "ACTIVE"
  | "COMPLETED"
  | "PROVISIONAL_DATE"
  | "AWAITING_CONFIRMATION"
  | "NOT_WIDGET_ELIGIBLE";

export type WidgetIslamicEventRecord = {
  id: string;
  slug: string;
  titleArabic: string;
  shortTitleArabic: string;
  descriptionArabic: string;
  eventType: string;
  hijriMonth: number | null;
  hijriDay: number | null;
  confirmationStatus: WidgetEventConfirmation;
  religiousAuthorityStatus: WidgetReligiousAuthorityStatus;
  contentReviewStatus: string;
  sourceReferences: string;
  widgetEligible: boolean;
  notificationEligible: boolean;
  deepLink: string;
  caveat: string | null;
  daysUntil: number | null;
  countdownState: WidgetEventCountdownState;
  version: number;
};

type EventOverride = {
  confirmationStatus?: WidgetEventConfirmation;
  widgetEligible?: boolean;
  notificationEligible?: boolean;
  note?: string;
  updatedAt: string;
};

function isOverrideMap(v: unknown): v is Record<string, EventOverride> {
  return isPlainObject(v);
}

export function loadWidgetEventOverrides(): Record<string, EventOverride> {
  return readLocalJson(WIDGET_EVENT_OVERRIDE_KEY, {}, isOverrideMap);
}

export function saveWidgetEventOverride(id: string, patch: Omit<EventOverride, "updatedAt">): void {
  const current = loadWidgetEventOverrides();
  current[id] = { ...current[id], ...patch, updatedAt: new Date().toISOString() };
  writeLocalJson(WIDGET_EVENT_OVERRIDE_KEY, current);
}

const MOON_SIGHTING_IDS = new Set(["ramadan", "eid-fitr", "eid-adha"]);

function defaultConfirmation(id: string, dateCertainty: string): WidgetEventConfirmation {
  if (MOON_SIGHTING_IDS.has(id)) return "PROVISIONAL";
  if (dateCertainty === "disputed" || dateCertainty === "approximate") return "PROVISIONAL";
  return "CALCULATED";
}

function authorityStatus(confidence: string, review: string): WidgetReligiousAuthorityStatus {
  if (review !== "approved" || confidence === "disputed") return "DISPUTED_DO_NOT_FEATURE";
  if (confidence === "low") return "INFORMATIONAL_ONLY";
  if (review === "needs_review" || review === "draft") return "REVIEW_REQUIRED";
  return "APPROVED";
}

function countdownState(
  days: number | null,
  confirmation: WidgetEventConfirmation,
  eligible: boolean,
): WidgetEventCountdownState {
  if (!eligible || confirmation === "HIDDEN" || confirmation === "CANCELLED") return "NOT_WIDGET_ELIGIBLE";
  if (confirmation === "PROVISIONAL") return days === 0 ? "AWAITING_CONFIRMATION" : "PROVISIONAL_DATE";
  if (days == null) return "UPCOMING";
  if (days === 0) return "TODAY";
  if (days < 0) return "COMPLETED";
  return "UPCOMING";
}

export function listWidgetIslamicEvents(hijri: { month: number; day: number }): WidgetIslamicEventRecord[] {
  const overrides = loadWidgetEventOverrides();
  const out: WidgetIslamicEventRecord[] = [];
  for (const occasion of ISLAMIC_OCCASIONS) {
    const published = enrichOccasionForPublish(occasion);
    if (!published?.publishable || !published.verified) continue;
    const verified = published.verified;
    if (verified.confidenceLevel === "disputed" || verified.reviewStatus !== "approved") continue;
    const override = overrides[occasion.id];
    const confirmation =
      override?.confirmationStatus ?? defaultConfirmation(occasion.id, verified.dateCertainty);
    const eligible = override?.widgetEligible ?? true;
    let days: number | null = null;
    if (verified.hijriMonth && verified.hijriMonth > 0 && verified.hijriDay) {
      let months = verified.hijriMonth - hijri.month;
      if (months < 0) months += 12;
      let raw = verified.hijriDay - hijri.day + months * 29.5;
      if (raw < 0) raw += 354;
      days = Math.round(raw);
    }
    out.push({
      id: occasion.id,
      slug: occasion.id,
      titleArabic: verified.eventName,
      shortTitleArabic: verified.eventName,
      descriptionArabic: verified.verifiedDescription,
      eventType: verified.eventType,
      hijriMonth: verified.hijriMonth,
      hijriDay: verified.hijriDay,
      confirmationStatus: confirmation,
      religiousAuthorityStatus: authorityStatus(verified.confidenceLevel, verified.reviewStatus),
      contentReviewStatus: verified.reviewStatus,
      sourceReferences: `${verified.evidence} — ${verified.sourceName}`,
      widgetEligible: eligible && confirmation !== "HIDDEN" && confirmation !== "CANCELLED",
      notificationEligible: override?.notificationEligible ?? eligible,
      deepLink: "/occasions",
      caveat: verified.caveat,
      daysUntil: days,
      countdownState: countdownState(days, confirmation, eligible),
      version: 1,
    });
  }
  return out.sort((a, b) => (a.daysUntil ?? 999) - (b.daysUntil ?? 999));
}

export function pickUpcomingWidgetEvent(hijri: { month: number; day: number }): WidgetIslamicEventRecord | null {
  return (
    listWidgetIslamicEvents(hijri).find(
      (event) =>
        event.widgetEligible &&
        event.religiousAuthorityStatus === "APPROVED" &&
        event.countdownState !== "NOT_WIDGET_ELIGIBLE",
    ) ?? null
  );
}
