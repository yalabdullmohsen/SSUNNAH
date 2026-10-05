/**
 * جسر App Group — نشر لقطات الصلاة/التقدم غير السرّية لـ Widget/Watch/LA.
 * التنفيذ: ios/App/App/SunnahSharedDataPlugin.swift · Shared/SunnahSharedData.swift
 */
import { registerPlugin } from "@capacitor/core";
import { isIOS, isNative } from "@/lib/capacitor-utils";

export type SharedPrayerSnapshotPayload = {
  locationLabel: string;
  timeZoneIdentifier: string;
  dayKey: string;
  timesEpochMs: Record<string, number>;
  nextPrayerKey?: string;
  nextPrayerNameAr?: string;
  nextPrayerEpochMs?: number;
  nextHasStarted?: boolean;
  previousPrayerKey?: string;
  previousPrayerNameAr?: string;
  previousPrayerEpochMs?: number;
  currentPrayerKey?: string;
  currentPrayerNameAr?: string;
  currentPrayerStartedAtEpochMs?: number;
  nextTransitionAtEpochMs?: number;
  calculationDate?: string;
  calculationMethodIdentifier?: string;
  permissionState?: string;
  initializationState?: string;
  /** Engine times for the following days — Swift `SharedPrayerSnapshot.upcomingDays`. */
  upcomingDays?: SharedPrayerDay[];
};

/** Swift `SharedPrayerDay` — one calendar day of engine prayer epochs. */
export type SharedPrayerDay = {
  dayKey: string;
  timesEpochMs: Record<string, number>;
};

export type SharedProgressSnapshotPayload = {
  dailyWirdCompleted: number;
  dailyWirdTarget: number;
  mushafPagesReadToday: number;
};

interface SunnahSharedDataPlugin {
  getAppGroupId(): Promise<{ appGroupId: string; available: boolean }>;
  publishPrayerSnapshot(options: SharedPrayerSnapshotPayload): Promise<{ ok: boolean }>;
  publishProgressSnapshot(options: SharedProgressSnapshotPayload): Promise<{ ok: boolean }>;
  publishWidgetEnvelope(options: { envelopeJson: string; domains: string[] }): Promise<{ ok: boolean }>;
  readPrayerSnapshot(): Promise<Record<string, unknown> & { found: boolean }>;
  readWidgetDiagnostics(): Promise<{
    appGroupAvailable: boolean;
    schemaVersion?: number;
    generatedAtEpochMs?: number;
    domainsPresent: string[];
    futureBinaryRequired: boolean;
  }>;
}

function getPlugin(): SunnahSharedDataPlugin | null {
  if (!isNative || !isIOS) return null;
  return registerPlugin<SunnahSharedDataPlugin>("SunnahSharedData");
}

export const SUNNAH_APP_GROUP_ID = "group.com.yousef.majlisilm";

export async function publishSharedPrayerSnapshot(
  payload: SharedPrayerSnapshotPayload,
): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.publishPrayerSnapshot(payload);
    return Boolean(res.ok);
  } catch {
    return false;
  }
}

export async function publishSharedProgressSnapshot(
  payload: SharedProgressSnapshotPayload,
): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.publishProgressSnapshot(payload);
    return Boolean(res.ok);
  } catch {
    return false;
  }
}

export async function publishSharedWidgetEnvelope(
  envelopeJson: string,
  domains: string[],
): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.publishWidgetEnvelope({ envelopeJson, domains });
    return Boolean(res.ok);
  } catch {
    return false;
  }
}

export async function getPluginAppGroupAvailability(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.getAppGroupId();
    return Boolean(res.available);
  } catch {
    return false;
  }
}

export async function readNativeWidgetDiagnostics(): Promise<{
  appGroupAvailable: boolean;
  schemaVersion?: number;
  generatedAtEpochMs?: number;
  domainsPresent: string[];
  futureBinaryRequired: boolean;
} | null> {
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    return await plugin.readWidgetDiagnostics();
  } catch {
    return null;
  }
}
