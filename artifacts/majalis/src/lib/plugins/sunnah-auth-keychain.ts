/**
 * جسر Keychain لجلسة Supabase على Capacitor.
 * التنفيذ: ios/App/App/SunnahAuthKeychainPlugin.swift
 */
import { registerPlugin } from "@capacitor/core";

export type SunnahAuthKeychainPlugin = {
  get: (opts: { key: string }) => Promise<{ value?: string | null }>;
  set: (opts: { key: string; value: string }) => Promise<{ ok?: boolean }>;
  remove: (opts: { key: string }) => Promise<{ ok?: boolean }>;
  /** Clears NetworkService account majlis.auth.session.v1 */
  clearNativeLegacySession: () => Promise<{ ok?: boolean }>;
};

const PLUGIN_NAME = "SunnahAuthKeychain";

let cached: SunnahAuthKeychainPlugin | null | undefined;
/** Test-only override (null = force missing plugin). */
let testOverride: SunnahAuthKeychainPlugin | null | undefined;

function isNativeIosRuntime(): boolean {
  try {
    const cap = (
      window as unknown as {
        Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string };
      }
    ).Capacitor;
    if (typeof cap?.isNativePlatform !== "function" || !cap.isNativePlatform()) return false;
    const platform = typeof cap.getPlatform === "function" ? cap.getPlatform() : "";
    return platform === "ios";
  } catch {
    return false;
  }
}

/**
 * Registered Capacitor proxy — same runtime pattern as SunnahSharedData / PrayerLiveActivity.
 * Never use legacy Capacitor.Plugins.SunnahAuthKeychain map lookup.
 */
export function getSunnahAuthKeychainPlugin(): SunnahAuthKeychainPlugin | null {
  if (testOverride !== undefined) return testOverride;
  if (typeof window === "undefined") return null;
  if (!isNativeIosRuntime()) return null;
  if (cached !== undefined) return cached;
  try {
    // registerPlugin returns the bridged proxy; get/set/remove must go through it.
    cached = registerPlugin<SunnahAuthKeychainPlugin>(PLUGIN_NAME);
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

/** Clears Cap Keychain bridge cache + NetworkService legacy account when plugin available. */
export async function clearNativeLegacyAuthSession(): Promise<boolean> {
  const plugin = getSunnahAuthKeychainPlugin();
  if (!plugin) return false;
  try {
    await plugin.clearNativeLegacySession();
    return true;
  } catch {
    return false;
  }
}

/** Test helpers — product code must not call these. */
export function __resetSunnahAuthKeychainPluginCacheForTests(): void {
  cached = undefined;
  testOverride = undefined;
}

export function __setSunnahAuthKeychainPluginForTests(
  plugin: SunnahAuthKeychainPlugin | null | undefined,
): void {
  testOverride = plugin;
  cached = undefined;
}

export const SUNNAH_AUTH_KEYCHAIN_PLUGIN_NAME = PLUGIN_NAME;
export const NATIVE_LEGACY_SESSION_ACCOUNT = "majlis.auth.session.v1";
