/**
 * جسر Capacitor لودجات الشاشة — يكتب لقطة JSON إلى App Group / SharedPreferences.
 * على الويب: no-op آمن.
 */
import { registerPlugin } from "@capacitor/core";
import { isNative } from "@/lib/capacitor-utils";

export type SunnahWidgetsWriteResult = { ok: boolean; reason?: string };
export type SunnahWidgetsReloadResult = { ok: boolean };

interface SunnahWidgetsPlugin {
  writeSnapshot(options: { json: string }): Promise<SunnahWidgetsWriteResult>;
  reloadAll(): Promise<SunnahWidgetsReloadResult>;
  isSupported(): Promise<{ supported: boolean }>;
}

function getPlugin(): SunnahWidgetsPlugin | null {
  if (!isNative) return null;
  return registerPlugin<SunnahWidgetsPlugin>("SunnahWidgets");
}

export async function isSunnahWidgetsSupported(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    return Boolean((await plugin.isSupported()).supported);
  } catch {
    return false;
  }
}

export async function writeSunnahWidgetSnapshotJson(json: string): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    const res = await plugin.writeSnapshot({ json });
    return Boolean(res.ok);
  } catch {
    return false;
  }
}

export async function reloadSunnahWidgets(): Promise<boolean> {
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    return Boolean((await plugin.reloadAll()).ok);
  } catch {
    return false;
  }
}
