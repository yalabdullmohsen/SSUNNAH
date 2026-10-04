/**
 * Explicit progress contracts. Widgets never invent completion percentages.
 */

export const WIDGET_PROGRESS_TYPES = [
  "LESSON_PROGRESS",
  "COURSE_PROGRESS",
  "QURAN_PAGE_PROGRESS",
  "MUSHAF_LAST_POSITION",
  "QURAN_DAILY_GOAL",
  "QURAN_DAILY_COMPLETION",
  "ADHKAR_SESSION_PROGRESS",
  "ADHKAR_DAILY_COMPLETION",
  "ADHKAR_STREAK",
  "CUSTOM_CONTENT_SELECTION",
] as const;

export type WidgetProgressType = (typeof WIDGET_PROGRESS_TYPES)[number];

export type WidgetProgressContract = {
  type: WidgetProgressType;
  unit: string;
  source: string;
  writeTrigger: string;
  readTrigger: string;
  accountOwnership: "none" | "optional" | "required";
  anonymousBehavior: string;
  syncBehavior: string;
  resetBehavior: string;
  timezoneBoundary: string;
  privacyClass: "public-safe" | "local-progress" | "account-linked";
  widgetEligibility: "eligible-if-tracked" | "never" | "setup-only";
};

export const WIDGET_PROGRESS_CONTRACTS: WidgetProgressContract[] = [
  {
    type: "LESSON_PROGRESS",
    unit: "percent",
    source: "user_progress",
    writeTrigger: "upsertProgress",
    readTrigger: "fetchRecentProgress",
    accountOwnership: "required",
    anonymousBehavior: "local knowledge-loader only",
    syncBehavior: "authenticated RPC",
    resetBehavior: "account switch / logout",
    timezoneBoundary: "server updated_at",
    privacyClass: "account-linked",
    widgetEligibility: "never",
  },
  {
    type: "COURSE_PROGRESS",
    unit: "percent",
    source: "user_progress",
    writeTrigger: "upsertProgress",
    readTrigger: "fetchRecentProgress",
    accountOwnership: "required",
    anonymousBehavior: "not published",
    syncBehavior: "authenticated RPC",
    resetBehavior: "account switch / logout",
    timezoneBoundary: "server updated_at",
    privacyClass: "account-linked",
    widgetEligibility: "never",
  },
  {
    type: "QURAN_PAGE_PROGRESS",
    unit: "page",
    source: "lastPage",
    writeTrigger: "saveLastPage (settled page)",
    readTrigger: "loadLastPageSync",
    accountOwnership: "optional",
    anonymousBehavior: "local last page",
    syncBehavior: "resume position if signed in",
    resetBehavior: "clear last page",
    timezoneBoundary: "device local",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
  {
    type: "MUSHAF_LAST_POSITION",
    unit: "page",
    source: "lastPage",
    writeTrigger: "saveLastPage",
    readTrigger: "loadLastPageSync",
    accountOwnership: "optional",
    anonymousBehavior: "NOT_STARTED if null",
    syncBehavior: "resume position if signed in",
    resetBehavior: "null last page",
    timezoneBoundary: "device local",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
  {
    type: "QURAN_DAILY_GOAL",
    unit: "task",
    source: "daily-progress.quran",
    writeTrigger: "setTaskProgress(quran)",
    readTrigger: "getTodayProgress",
    accountOwnership: "none",
    anonymousBehavior: "local day key",
    syncBehavior: "local only",
    resetBehavior: "next local date",
    timezoneBoundary: "en-CA local calendar day",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
  {
    type: "QURAN_DAILY_COMPLETION",
    unit: "boolean-task",
    source: "daily-progress.quran",
    writeTrigger: "setTaskProgress when canonical read is recorded",
    readTrigger: "getTodayProgress",
    accountOwnership: "none",
    anonymousBehavior: "local",
    syncBehavior: "local only",
    resetBehavior: "next local date",
    timezoneBoundary: "en-CA local calendar day",
    privacyClass: "local-progress",
    widgetEligibility: "setup-only",
  },
  {
    type: "ADHKAR_SESSION_PROGRESS",
    unit: "item-index",
    source: "adhkar_progress_{category}",
    writeTrigger: "tap complete on dhikr item",
    readTrigger: "localStorage session",
    accountOwnership: "none",
    anonymousBehavior: "local",
    syncBehavior: "local + native-storage mirror",
    resetBehavior: "category change / new day not auto-reset",
    timezoneBoundary: "device local",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
  {
    type: "ADHKAR_DAILY_COMPLETION",
    unit: "boolean-task",
    source: "daily-progress morning/evening",
    writeTrigger: "full category session complete",
    readTrigger: "getTodayProgress",
    accountOwnership: "none",
    anonymousBehavior: "local",
    syncBehavior: "local only",
    resetBehavior: "next local date",
    timezoneBoundary: "en-CA local calendar day",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
  {
    type: "ADHKAR_STREAK",
    unit: "day",
    source: "user-streak + morning milestones",
    writeTrigger: "recordUserActivity(adhkar)",
    readTrigger: "getUserStreak",
    accountOwnership: "none",
    anonymousBehavior: "local streak, never fabricated",
    syncBehavior: "local only",
    resetBehavior: "gap > 1 local day → 1",
    timezoneBoundary: "en-CA local calendar day",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
  {
    type: "CUSTOM_CONTENT_SELECTION",
    unit: "content-id",
    source: "widget selections store",
    writeTrigger: "Widget Center save",
    readTrigger: "loadWidgetSelections",
    accountOwnership: "none",
    anonymousBehavior: "local instance map",
    syncBehavior: "local only (account sync deferred)",
    resetBehavior: "remove selection",
    timezoneBoundary: "n/a",
    privacyClass: "local-progress",
    widgetEligibility: "eligible-if-tracked",
  },
];
