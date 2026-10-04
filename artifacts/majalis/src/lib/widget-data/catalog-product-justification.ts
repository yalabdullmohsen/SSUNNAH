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
    distinctUserValue: "Legacy Build 55 installed widgets continue resolving this kind.",
    overlapNotes: "Overlaps next-prayer UX; retained solely for installed-binary compatibility.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "sunnah.widget.prayer.next for new installs after future binary",
  },
  {
    kind: "sunnah.widget.prayer.current",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Shows the prayer currently in progress (not the next countdown).",
    overlapNotes: "Distinct from next/previous.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none — temporal role differs",
  },
  {
    kind: "sunnah.widget.prayer.next",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Primary countdown to the next prayer.",
    overlapNotes: "Closest to legacy PrayerTimesWidget.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "display style intent (future) without collapsing kind",
  },
  {
    kind: "sunnah.widget.prayer.previous",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Last entered prayer — different decision moment than next.",
    overlapNotes: "Pairs with previous-next composite.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.prayer.hijri",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Next prayer plus Hijri day in one glance.",
    overlapNotes: "Not a pure calendar widget.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.prayer.previous-next",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Composite previous+next for medium/large families.",
    overlapNotes: "Could theoretically configure next/previous, but layout is a distinct product.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none for V1",
  },
  {
    kind: "sunnah.widget.prayer.morning",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Fajr/Sunrise/Dhuhr group for morning planning.",
    overlapNotes: "Subset of all-prayers; morning intent is distinct.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "group filter on all-prayers rejected — worse gallery clarity",
  },
  {
    kind: "sunnah.widget.prayer.evening",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Asr/Maghrib/Isha group for evening planning.",
    overlapNotes: "Symmetric to morning.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.prayer.all",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Full six-slot day table (large family).",
    overlapNotes: "Superset of morning/evening groups.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.calendar.hijri",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Hijri-only date focus.",
    overlapNotes: "Overlaps dual/today; Hijri-only remains simplest Lock Screen entry.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "calendar style intent deferred — keeps gallery clarity",
  },
  {
    kind: "sunnah.widget.calendar.dual",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Hijri + Gregorian together.",
    overlapNotes: "Distinct from Hijri-only.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "MERGE_THROUGH_CONFIGURATION candidate post-V1",
  },
  {
    kind: "sunnah.widget.calendar.today",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Day card with optional confirmed event context.",
    overlapNotes: "Richer than dual date.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.calendar.ramadan",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Ramadan countdown / in-month state.",
    overlapNotes: "Seasonal specialist.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.calendar.event",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Next confirmed Islamic event only (authority-gated).",
    overlapNotes: "Must stay separate from date widgets to avoid disputed auto-feature.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.morning",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Direct morning wird entry.",
    overlapNotes: "time-aware can cover it, but dedicated kind reduces mis-tap.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "time-aware with fixed morning — rejected for gallery clarity",
  },
  {
    kind: "sunnah.widget.adhkar.evening",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Direct evening wird entry.",
    overlapNotes: "Symmetric to morning.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.time-aware",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Automatic morning/evening selection by Sunnah window.",
    overlapNotes: "Distinct automation product vs fixed morning/evening.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.rotating",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Daily reviewed dhikr spotlight (not a full wird).",
    overlapNotes: "Content-like, not navigation-like.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.adhkar.streak",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Local progress streak when tracking exists — never fabricated.",
    overlapNotes: "Privacy class local-progress.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.quran.ayah",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Reviewed ayah of the day (QPC text integrity).",
    overlapNotes: "Distinct from mushaf continue/progress.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.quran.goal",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Daily Quran goal when tracking exists.",
    overlapNotes: "Progress domain.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.mushaf.continue",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Resume last Mushaf page (action-forward).",
    overlapNotes: "Close to progress; continue emphasizes open action.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "MERGE_THROUGH_CONFIGURATION with progress deferred — distinct CTAs kept for V1",
  },
  {
    kind: "sunnah.widget.mushaf.bookmark",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "User-selected bookmark instance (configuration-required).",
    overlapNotes: "Requires selection; invalid bookmark → configuration state.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.mushaf.progress",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Last page position without invented percentage.",
    overlapNotes: "Informational vs continue CTA.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none for V1",
  },
  {
    kind: "sunnah.widget.mushaf.quick-open",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Large tap target to open Mushaf quickly.",
    overlapNotes: "Accessibility / large-target specialist.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.content.hadith",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Daily reviewed hadith with source.",
    overlapNotes: "Distinct corpus from faidah/dua.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "custom content type — rejected; daily spotlight must remain zero-config",
  },
  {
    kind: "sunnah.widget.content.faidah",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Daily reviewed faidah with source.",
    overlapNotes: "Distinct corpus.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.content.dua",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Daily reviewed dua with complete meaning.",
    overlapNotes: "Distinct corpus.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.custom",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "User-configured content instance (static V1 kind).",
    overlapNotes: "AppIntent twin deferred (same kind forbidden).",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "AppIntent migration tracked in W2 OPTION C",
  },
  {
    kind: "sunnah.widget.home.today",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Multi-domain day summary.",
    overlapNotes: "Composite home — not replaceable by single domain.",
    galleryVisible: true,
    timelineCost: "medium",
    refreshCost: "medium",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.home.actions",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Deep-link action launcher without progress claims.",
    overlapNotes: "Distinct from spiritual progress card.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
  {
    kind: "sunnah.widget.home.spiritual",
    classification: "KEEP_SEPARATE_KIND",
    distinctUserValue: "Approved completions only — never invented ratios.",
    overlapNotes: "Progress privacy class.",
    galleryVisible: true,
    timelineCost: "low",
    refreshCost: "low",
    deviceTestRequired: true,
    configurationAlternative: "none",
  },
];

/** AppIntent custom widget shares kind with static V1 — not a gallery entry. */
export const WIDGET_DEFERRED_UNREGISTERED = [
  {
    kind: "sunnah.widget.custom",
    struct: "CustomContentWidget",
    classification: "DEFER_FROM_V1" as const,
    reason: "Same kind as CustomContentStaticWidget; registering both is forbidden.",
  },
];

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
