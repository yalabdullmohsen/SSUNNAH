import { readLocalJson, writeLocalJson, isPlainObject } from "@/lib/safe-json";

export const WIDGET_SELECTIONS_KEY = "sunnah-widget-selections-v1";

export const WIDGET_CUSTOM_CONTENT_TYPES = [
  "AYAH",
  "HADITH",
  "DHIKR",
  "DUA",
  "MUSHAF_BOOKMARK",
  "APPROVED_REMINDER",
] as const;

export type WidgetCustomContentType = (typeof WIDGET_CUSTOM_CONTENT_TYPES)[number];

export type WidgetSelectionRecord = {
  id: string;
  ownerScope: "local";
  widgetInstanceId: string;
  contentType: WidgetCustomContentType;
  contentId: string;
  displayStyle: "standard" | "compact";
  showSource: boolean;
  textSizePreference: "default" | "small";
  createdAt: string;
  updatedAt: string;
  syncStatus: "local-only";
  privacyClass: "local-progress";
};

function isSelection(v: unknown): v is WidgetSelectionRecord {
  return isPlainObject(v) && typeof v.id === "string" && typeof v.widgetInstanceId === "string";
}

function isStore(v: unknown): v is WidgetSelectionRecord[] {
  return Array.isArray(v) && v.every(isSelection);
}

export function loadWidgetSelections(): WidgetSelectionRecord[] {
  return readLocalJson<WidgetSelectionRecord[]>(WIDGET_SELECTIONS_KEY, [], isStore);
}

export function upsertWidgetSelection(
  input: Omit<WidgetSelectionRecord, "createdAt" | "updatedAt" | "ownerScope" | "syncStatus" | "privacyClass" | "id"> & {
    id?: string;
  },
): WidgetSelectionRecord {
  const now = new Date().toISOString();
  const list = loadWidgetSelections();
  const existing = list.find((row) => row.widgetInstanceId === input.widgetInstanceId);
  const record: WidgetSelectionRecord = {
    id: input.id || existing?.id || `sel-${input.widgetInstanceId}`,
    ownerScope: "local",
    widgetInstanceId: input.widgetInstanceId,
    contentType: input.contentType,
    contentId: input.contentId,
    displayStyle: input.displayStyle,
    showSource: input.showSource,
    textSizePreference: input.textSizePreference,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    syncStatus: "local-only",
    privacyClass: "local-progress",
  };
  const next = [record, ...list.filter((row) => row.widgetInstanceId !== input.widgetInstanceId)];
  writeLocalJson(WIDGET_SELECTIONS_KEY, next);
  return record;
}

export function removeWidgetSelection(widgetInstanceId: string): void {
  writeLocalJson(
    WIDGET_SELECTIONS_KEY,
    loadWidgetSelections().filter((row) => row.widgetInstanceId !== widgetInstanceId),
  );
}
