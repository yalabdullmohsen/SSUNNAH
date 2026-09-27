/**
 * Product-level section completeness contract (Wave PLATFORM_SECTION_REGISTRY_W1).
 * Complements — does not replace — `config/sections.registry.ts` navigation SSOT.
 */

export const SECTION_AVAILABILITY_STATES = [
  "COMPLETE",
  "PARTIAL",
  "CURATED",
  "LIVE_DATA",
  "OFFLINE_AVAILABLE",
  "NETWORK_REQUIRED",
  "COMING_SOON",
  "BLOCKED_SOURCE",
  "BLOCKED_LICENSE",
  "BLOCKED_INCOMPLETE",
  "UNKNOWN",
] as const;

export type SectionAvailabilityState = (typeof SECTION_AVAILABILITY_STATES)[number];

export const SECTION_PUBLICATION_STATES = [
  "PUBLISHED",
  "CURATED_PUBLIC",
  "COMING_SOON",
  "INTERNAL",
  "BLOCKED",
  "REGISTRY_GAP",
] as const;

export type SectionPublicationState = (typeof SECTION_PUBLICATION_STATES)[number];

export type SectionLearningType =
  | "curriculum"
  | "reference"
  | "directory"
  | "tool"
  | "live_events"
  | "assistant"
  | "quiz"
  | "worship"
  | "hub";

export type SectionIaGroupId =
  | "quran-ulum"
  | "sunnah-hadith"
  | "aqidah-seerah-history"
  | "fiqh-usul-maqasid"
  | "language-talib"
  | "dawah-intro"
  | "lessons-institutions"
  | "daily-worship";

export interface SectionProductEntry {
  /** Stable product key (matches required section list). */
  id: string;
  arabicName: string;
  englishName: string;
  description: string;
  /** Link to sections.registry id when present. */
  registrySectionId: string | null;
  canonicalRoute: string;
  iaGroup: SectionIaGroupId;
  learningType: SectionLearningType;
  targetAudience: string;
  availability: SectionAvailabilityState;
  publication: SectionPublicationState;
  contentCount: number | null;
  completeContentCount: number | null;
  sourceStatus: string;
  licenseStatus: string;
  searchStatus: "INDEXED" | "PARTIAL" | "EXCLUDED" | "UNKNOWN";
  offlineStatus: "OFFLINE_READY" | "PARTIAL" | "NETWORK_REQUIRED" | "UNKNOWN";
  detailRouteStatus: "OK" | "HUB_ONLY" | "COMING_SOON" | "MISSING" | "REDIRECT";
  progressSupport: boolean;
  bookmarkSupport: boolean;
  notificationSupport: boolean;
  multilingualSupport: boolean;
  interactiveFeatureSupport: boolean;
  /** Honest notes for auditors — not user-facing marketing. */
  auditNotes: string;
}

export interface SectionIaGroup {
  id: SectionIaGroupId;
  titleAr: string;
  order: number;
  sectionIds: readonly string[];
}
