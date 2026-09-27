/**
 * تصنيف توفّر مجموعات الحديث في الفلاتر — مشتق من السجل الكانوني.
 */

import {
  getCollectionRegistryEntry,
  REGISTRY_NETWORK_CATALOG,
  REGISTRY_SAHIHAYN,
  USER_LABELS,
  type LocalAvailability,
} from "./hadith-collection-registry";
import { NETWORK_ACCESS_NOTE_AR, NETWORK_NUMBERING_NOTE_AR } from "./hadith-dataset-stats";

/** حالات الفلتر المبسّطة (متوافقة مع الموجة السابقة) */
export type CollectionAvailability =
  | "LOCAL_COMPLETE"
  | "LOCAL_CURATED_SAMPLE"
  | "NETWORK_AVAILABLE"
  | "UNAVAILABLE"
  | "UNKNOWN";

export type HadithCollectionMeta = {
  key: string;
  labelAr: string;
  availability: CollectionAvailability;
  filterSuffixAr: string | null;
  advertiseWhenEmpty: boolean;
};

function mapLocalToFilter(local: LocalAvailability | undefined): CollectionAvailability {
  switch (local) {
    case "LOCAL_COMPLETE":
      return "LOCAL_COMPLETE";
    case "LOCAL_PARTIAL":
    case "LOCAL_CURATED_SAMPLE":
      return "LOCAL_CURATED_SAMPLE";
    case "NOT_IMPORTED":
    case "BLOCKED_LICENSE":
    case "BLOCKED_SOURCE":
    case "BLOCKED_INTEGRITY":
      return "UNAVAILABLE";
    default:
      return "UNKNOWN";
  }
}

export function getCollectionAvailability(key: string | null | undefined): CollectionAvailability {
  if (!key) return "UNKNOWN";
  const entry = getCollectionRegistryEntry(key);
  if (!entry) {
    // مفاتيح كتالوج شبكي ara-*
    if (key.startsWith("ara-") || key === "nawawi" || key === "qudsi" || key === "mutafaq") {
      return "NETWORK_AVAILABLE";
    }
    return "UNKNOWN";
  }
  if (
    entry.networkAvailability === "NETWORK_REFERENCE_ONLY" &&
    entry.localAvailability === "NOT_IMPORTED"
  ) {
    return "NETWORK_AVAILABLE";
  }
  return mapLocalToFilter(entry.localAvailability);
}

export function getCollectionMeta(key: string): HadithCollectionMeta | undefined {
  const entry = getCollectionRegistryEntry(key);
  if (!entry) return undefined;
  const availability = getCollectionAvailability(key);
  let filterSuffixAr: string | null = null;
  if (availability === "LOCAL_CURATED_SAMPLE") filterSuffixAr = USER_LABELS.curated;
  if (availability === "NETWORK_AVAILABLE") filterSuffixAr = USER_LABELS.network;
  if (availability === "UNAVAILABLE") filterSuffixAr = USER_LABELS.unavailable;
  return {
    key: entry.id,
    labelAr: entry.nameAr,
    availability,
    filterSuffixAr,
    advertiseWhenEmpty: availability === "LOCAL_COMPLETE",
  };
}

export function collectionFilterLabel(key: string, fallbackLabel?: string): string {
  const meta = getCollectionMeta(key);
  const base = meta?.labelAr ?? fallbackLabel ?? key;
  if (!meta) return `${base} · ${USER_LABELS.unavailable}`;
  if (meta.availability === "LOCAL_COMPLETE") return base;
  if (meta.filterSuffixAr) return `${base} · ${meta.filterSuffixAr}`;
  return base;
}

export function isFilterSelectable(key: string): boolean {
  const a = getCollectionAvailability(key);
  return a === "LOCAL_COMPLETE" || a === "LOCAL_CURATED_SAMPLE";
}

export function localCompleteCollectionKeys(): string[] {
  return ["bukhari", "muslim"];
}

export function networkCatalogNoteForCdnId(cdnId: string): string {
  const count = REGISTRY_NETWORK_CATALOG[cdnId as keyof typeof REGISTRY_NETWORK_CATALOG];
  if (count == null) return `${NETWORK_ACCESS_NOTE_AR} · ${NETWORK_NUMBERING_NOTE_AR}`;
  return `${NETWORK_ACCESS_NOTE_AR} · ${count.toLocaleString("ar-EG")} ${NETWORK_NUMBERING_NOTE_AR}`;
}

export function numberingConflictNoteAr(): string {
  return (
    `الترقيم المحلي: البخاري ${REGISTRY_SAHIHAYN.bukhari.toLocaleString("ar-EG")} · مسلم ${REGISTRY_SAHIHAYN.muslim.toLocaleString("ar-EG")}. ` +
    `كتالوج الشبكة يستخدم ترقيمًا مختلفًا (البخاري ${REGISTRY_NETWORK_CATALOG["ara-bukhari"].toLocaleString("ar-EG")} · مسلم ${REGISTRY_NETWORK_CATALOG["ara-muslim"].toLocaleString("ar-EG")}) — ${NETWORK_NUMBERING_NOTE_AR}.`
  );
}

export const ALL_COLLECTION_KEYS_FOR_AUDIT = [
  "bukhari",
  "muslim",
  "nawawi40",
  "verified-curated",
  "tirmidhi",
  "abudawud",
  "nasai",
  "ibnmajah",
  "mutafaq",
  "various",
  "riyadh",
  "jawami",
  "silsila",
  "bulugh",
  "umdat",
  "qudsi",
  "ara-abudawud",
  "ara-tirmidhi",
  "ara-nasai",
  "ara-ibnmajah",
  "ara-malik",
  "muwatta",
  "ahmad",
  "darimi",
];
