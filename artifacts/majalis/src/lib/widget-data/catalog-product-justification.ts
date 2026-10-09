/**
 * PR W1 — Product justification for each registered Widget kind.
 * Gallery entries must be justified; structs alone are not enough.
 */
import { WIDGET_CENTER_CATALOG } from "./catalog";

export const WIDGET_KIND_CLASSIFICATION = [
  "KEEP_SEPARATE_KIND",
  "MERGE_THROUGH_CONFIGURATION",
  "KEEP_BUILD55_COMPATIBILITY",
  "DEFER_FROM_V1",
  "REMOVE_WITH_PROOF",
] as const;

export type WidgetKindClassification = (typeof WIDGET_KIND_CLASSIFICATION)[number];

export type WidgetCatalogProductJustification = {
  kind: string;
  classification: WidgetKindClassification;
  distinctUserValue: string;
  overlapNotes: string;
  galleryVisible: boolean;
  timelineCost: "low" | "medium" | "high";
  refreshCost: "low" | "medium" | "high";
  deviceTestRequired: boolean;
  configurationAlternative: string;
};

export const WIDGET_CATALOG_PRODUCT_JUSTIFICATION: WidgetCatalogProductJustification[] = [
  {
    kind: "PrayerTimesWidget",
    classification: "KEEP_BUILD55_COMPATIBILITY",
    distinctUserValue: "One smart prayer widget: live countdown, then count-up for 30 minutes after the adhan, then the next prayer.",
    overlapNotes: "Replaces all former single-purpose prayer widgets; the kind is kept so installed widgets continue.",
    galleryVisible: true,
    timelineCost: "high",
    refreshCost: "high",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.prayer.all",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "All daily prayer times in one list.",
    overlapNotes: "Distinct from the smart next-prayer widget.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.calendar.hijri",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Hijri, Gregorian and weekday in one place.",
    overlapNotes: "Merges the former hijri, dual and today widgets.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.calendar.ramadan",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Days to Ramadan or the nearest occasion.",
    overlapNotes: "Merges the former Ramadan and event widgets.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.time-aware",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Morning or evening adhkar chosen by time.",
    overlapNotes: "Merges the former morning and evening widgets.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.rotating",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "A short dhikr that changes every hour.",
    overlapNotes: "Distinct from time-aware adhkar.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.streak",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Adhkar streak and Quran daily goal together.",
    overlapNotes: "Merges the former streak and Quran goal widgets.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.quran.ayah",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "A short complete ayah or dua alternating hourly.",
    overlapNotes: "Merges the former ayah and dua widgets.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.mushaf.continue",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Resume reading from the last saved position.",
    overlapNotes: "Merges the former mushaf widgets.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
];

/** The custom-content widget was removed from the gallery; nothing is deferred. */
export const WIDGET_DEFERRED_UNREGISTERED: { kind: string; struct: string; classification: "DEFER_FROM_V1"; reason: string }[] = [];

export function assertWidgetCatalogProductJustified(): {
  ok: true;
  keptSeparate: number;
  build55: number;
  deferred: number;
  removed: number;
  mergeConfig: number;
} {
  const catalogKinds = new Set(WIDGET_CENTER_CATALOG.map((c) => c.kind));
  const justifiedKinds = new Set(WIDGET_CATALOG_PRODUCT_JUSTIFICATION.map((j) => j.kind));
  for (const k of catalogKinds) {
    if (!justifiedKinds.has(k)) {
      throw new Error(`missing product justification for ${k}`);
    }
  }
  for (const j of WIDGET_CATALOG_PRODUCT_JUSTIFICATION) {
    if (!catalogKinds.has(j.kind)) {
      throw new Error(`justification for unknown catalog kind ${j.kind}`);
    }
    if (j.classification === "REMOVE_WITH_PROOF") {
      throw new Error(`REMOVE_WITH_PROOF not allowed without deleting catalog entry: ${j.kind}`);
    }
  }
  const counts = {
    ok: true as const,
    keptSeparate: 0,
    build55: 0,
    deferred: WIDGET_DEFERRED_UNREGISTERED.length,
    removed: 0,
    mergeConfig: 0,
  };
  for (const j of WIDGET_CATALOG_PRODUCT_JUSTIFICATION) {
    if (j.classification === "KEEP_SEPARATE_KIND") counts.keptSeparate += 1;
    if (j.classification === "KEEP_BUILD55_COMPATIBILITY") counts.build55 += 1;
    if (j.classification === "MERGE_THROUGH_CONFIGURATION") counts.mergeConfig += 1;
    if (j.classification === "REMOVE_WITH_PROOF") counts.removed += 1;
  }
  if (counts.mergeConfig !== 0) {
    throw new Error("MERGE_THROUGH_CONFIGURATION entries must be applied or reclassified before claim");
  }
  return counts;
}
