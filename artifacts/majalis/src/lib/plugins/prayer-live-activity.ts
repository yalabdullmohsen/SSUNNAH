/**
 * واجهة JS لـ Live Activity الصلاة (iOS 16.2+ / ActivityKit).
 * الحالات: upcoming · active · completed · appLaunch
 * التنفيذ: ios/App/App/PrayerLiveActivityPlugin.swift
 */
import { registerPlugin } from "@capacitor/core";
import { isIOS, isNative } from "@/lib/capacitor-utils";

export type PrayerLivePhase = "upcoming" | "active" | "completed" | "appLaunch";

export type PrayerLiveActivityStartOptions = {
  prayerKey: string;
  prayerName: string;
  prayerTimeIso: string;
  locationLabel?: string;
  phase?: PrayerLivePhase;
  statusLabel?: string;
  hasStarted?: boolean;
  nextPrayerName?: string;
  nextPrayerKey?: string;
  nextPrayerTimeIso?: string;
};

export type PrayerLiveActivityUpdateOptions = {
  phase?: PrayerLivePhase;
  hasStarted?: boolean;
  statusLabel?: string;
  prayerName?: string;
  prayerTimeIso?: string;
  locationLabel?: string;
  nextPrayerName?: string;
  nextPrayerKey?: string;
  nextPrayerTimeIso?: string;
};

interface PrayerLiveActivityPlugin {
  areActivitiesSupported(): Promise<{ supported: boolean }>;
  startActivity(options: PrayerLiveActivityStartOptions | { phase: "appLaunch"; locationLabel?: string }): Promise<{ started: boolean }>;
  updateActivity(options: PrayerLiveActivityUpdateOptions): Promise<{ updated: boolean; phase?: string }>;
  endActivity(): Promise<{ ended: boolean }>;
  syncFromSharedSnapshot(): Promise<{ synced: boolean; phase?: string }>;
}

const NOOP = { supported: false, started: false, updated: false, ended: false, synced: false };

function getPlugin(): PrayerLiveActivityPlugin | null {
  if (!isNative || !isIOS) return null;
  return registerPlugin<PrayerLiveActivityPlugin>("PrayerLiveActivity");
}

export async function areLiveActivitiesSupported(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    return Boolean((await plugin.areActivitiesSupported()).supported);
  } catch {
    return false;
  }
}

export async function startPrayerLiveActivity(options: PrayerLiveActivityStartOptions): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return NOOP.started;
  try {
    const res = await plugin.startActivity({
      ...options,
      phase: options.phase ?? "upcoming",
    });
    return Boolean(res.started);
  } catch {
    return false;
  }
}

/** حالة دعوة فتح شاشة المواقيت عند غياب الجدول. */
export async function presentPrayerLiveActivityAppLaunch(locationLabel?: string): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return NOOP.started;
  try {
    const res = await plugin.startActivity({ phase: "appLaunch", locationLabel });
    return Boolean(res.started);
  } catch {
    return false;
  }
}

export async function updatePrayerLiveActivity(options: PrayerLiveActivityUpdateOptions): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return NOOP.updated;
  try {
    const res = await plugin.updateActivity(options);
    return Boolean(res.updated);
  } catch {
    return false;
  }
}

export async function markPrayerLiveActivityEntered(): Promise<boolean> {
  return updatePrayerLiveActivity({
    phase: "active",
    hasStarted: true,
    statusLabel: "مضى على الأذان",
  });
}

export async function markPrayerLiveActivityCompleted(options: {
  completedPrayerName?: string;
  nextPrayerKey: string;
  nextPrayerName: string;
  nextPrayerTimeIso: string;
  locationLabel?: string;
}): Promise<boolean> {
  return updatePrayerLiveActivity({
    phase: "completed",
    hasStarted: true,
    statusLabel: "اكتملت",
    prayerName: options.completedPrayerName,
    nextPrayerKey: options.nextPrayerKey,
    nextPrayerName: options.nextPrayerName,
    nextPrayerTimeIso: options.nextPrayerTimeIso,
    locationLabel: options.locationLabel,
  });
}

export async function endPrayerLiveActivity(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return NOOP.ended;
  try {
    return Boolean((await plugin.endActivity()).ended);
  } catch {
    return false;
  }
}

export async function syncPrayerLiveActivityFromAppGroup(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return NOOP.synced;
  try {
    return Boolean((await plugin.syncFromSharedSnapshot()).synced);
  } catch {
    return false;
  }
}
