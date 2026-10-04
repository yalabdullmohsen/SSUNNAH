/**
 * Platform health snapshot — read-only aggregation for diagnostics.
 * Telemetry failure must never throw to callers (Observability Contract).
 */
import { getBootstrapSnapshot, getFailedBlockingStages } from "@/lib/app-bootstrap-pipeline";
import { getAppStartupState, getAppStartupReason, isFatalStartup } from "@/lib/app-startup-controller";
import { getBuildMetadata, lookupLocalErrorReport } from "@/lib/error-report";
import { getSearchObsSnapshot } from "@/lib/search-observability";

export type PlatformHealthSnapshot = {
  at: string;
  online: boolean;
  commitHash: string;
  buildVersion: string;
  startupState: string;
  startupReason: string;
  fatalStartup: boolean;
  bootstrapStages: number;
  failedBlockingStages: number;
  searchEvents: number;
  searchErrors: number;
  recentErrorId: string | null;
};

declare global {
  interface Window {
    __SUNNAH_PLATFORM_HEALTH__?: PlatformHealthSnapshot;
    __SUNNAH_GET_PLATFORM_HEALTH__?: () => PlatformHealthSnapshot;
  }
}

function safeOnline(): boolean {
  try {
    return typeof navigator === "undefined" ? true : navigator.onLine !== false;
  } catch {
    return true;
  }
}

function countSearchErrors(snap: Readonly<Record<string, number>>): number {
  let n = 0;
  for (const [k, v] of Object.entries(snap)) {
    if (k.startsWith("search.error.") || k === "search.timeout" || k === "search.pagination_fail") {
      n += v;
    }
  }
  return n;
}

/** Aggregate runtime visibility — safe for DEV console / support playbooks. */
export function getPlatformHealthSnapshot(): PlatformHealthSnapshot {
  const { commitHash, buildVersion } = getBuildMetadata();
  let searchEvents = 0;
  let searchErrors = 0;
  try {
    const search = getSearchObsSnapshot();
    searchEvents = search["search.events"] ?? 0;
    searchErrors = countSearchErrors(search);
  } catch {
    /* ignore */
  }

  let bootstrapStages = 0;
  let failedBlockingStages = 0;
  try {
    bootstrapStages = getBootstrapSnapshot().length;
    failedBlockingStages = getFailedBlockingStages().length;
  } catch {
    /* ignore */
  }

  return {
    at: new Date().toISOString(),
    online: safeOnline(),
    commitHash,
    buildVersion,
    startupState: getAppStartupState(),
    startupReason: getAppStartupReason(),
    fatalStartup: isFatalStartup(),
    bootstrapStages,
    failedBlockingStages,
    searchEvents,
    searchErrors,
    recentErrorId: null,
  };
}

/** Publish debug hooks — never blocks boot. */
export function publishPlatformHealthDebug(): void {
  if (typeof window === "undefined") return;
  try {
    const snap = getPlatformHealthSnapshot();
    window.__SUNNAH_PLATFORM_HEALTH__ = snap;
    window.__SUNNAH_GET_PLATFORM_HEALTH__ = getPlatformHealthSnapshot;
  } catch {
    /* ignore */
  }
}

/** Optional: attach last known local error id when investigating a report. */
export function attachRecentErrorId(errorId: string): void {
  if (typeof window === "undefined") return;
  try {
    const found = lookupLocalErrorReport(errorId);
    const base = window.__SUNNAH_PLATFORM_HEALTH__ ?? getPlatformHealthSnapshot();
    window.__SUNNAH_PLATFORM_HEALTH__ = {
      ...base,
      recentErrorId: found?.errorId ?? errorId,
    };
  } catch {
    /* ignore */
  }
}
