/**
 * App Store Review — no client credentials, no demo bypass.
 * Reviewers sign in with a real confirmed account whose password lives only in
 * App Store Connect Review Notes (OWNER_ACTION to rotate after this hardening).
 */

const LEGACY_STORAGE_KEY = "ssunnah-app-store-review-session-v1";

/** Clear legacy local demonstration flag from older builds. */
export function clearLegacyAppStoreReviewSession(): void {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** @deprecated Use clearLegacyAppStoreReviewSession — kept for logout callers. */
export function clearAppStoreReviewSession(): void {
  clearLegacyAppStoreReviewSession();
}
