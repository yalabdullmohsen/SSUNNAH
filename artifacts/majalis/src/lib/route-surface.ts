/**
 * مالك وحيد لسطح المسار العام (pts-immersive / chrome-immersive).
 * لا تُستدعَ classList على documentElement من الشريط أو Prefetch.
 */
import { isImmersiveChromePath, isPrayerTimesPath } from "@/lib/immersive-chrome";

export type RouteSurfaceMode = "standard-light" | "prayer-dark" | "mushaf-immersive";

export function resolveRouteSurfaceMode(pathname: string): RouteSurfaceMode {
  if (isPrayerTimesPath(pathname)) return "prayer-dark";
  if (isImmersiveChromePath(pathname)) return "mushaf-immersive";
  return "standard-light";
}

/** يُستدعى من App useLayoutEffect فقط عند تغيّر الموقع المُلتزَم */
export function commitRouteSurface(pathname: string): RouteSurfaceMode {
  if (typeof document === "undefined") return resolveRouteSurfaceMode(pathname);
  const root = document.documentElement;
  const mode = resolveRouteSurfaceMode(pathname);
  /* Idempotent — لا تلمس class/dataset إن طابق الإقلاع (يمنع themeMut الزائف) */
  if (root.dataset.routeSurface !== mode) {
    root.dataset.routeSurface = mode;
  }
  const wantPts = mode === "prayer-dark";
  const wantChrome = mode === "mushaf-immersive";
  if (root.classList.contains("pts-immersive") !== wantPts) {
    root.classList.toggle("pts-immersive", wantPts);
  }
  if (root.classList.contains("chrome-immersive") !== wantChrome) {
    root.classList.toggle("chrome-immersive", wantChrome);
  }
  if (mode !== "prayer-dark" && root.dataset.routeIntent != null) {
    delete root.dataset.routeIntent;
  }
  return mode;
}

/** Prefetch: حمّل أصول الصلاة بلا طلاء سطح عالمي */
export function prefetchPrayerRouteAssets(): void {
  void import("@/styles/pages/prayer-times.css").catch(() => undefined);
  void import("@/pages/worship/PrayerTimesPage").catch(() => undefined);
}
