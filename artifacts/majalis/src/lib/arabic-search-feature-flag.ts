/**
 * Client feature flag for Arabic DB RPC search path (search_hadiths / search_sources).
 * Default OFF until Production migration is applied with owner approval.
 * Staging may enable via localStorage / env for validation only.
 */

export const ARABIC_DB_RPC_SEARCH_FLAG = "ssunnah.arabic_db_rpc_search";

/** Production default: disabled. Never auto-enable from merge alone. */
export function isArabicDbRpcSearchEnabled(): boolean {
  try {
    if (typeof import.meta !== "undefined") {
      const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
      if (env?.VITE_ARABIC_DB_RPC_SEARCH === "1" || env?.VITE_ARABIC_DB_RPC_SEARCH === "true") {
        return true;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(ARABIC_DB_RPC_SEARCH_FLAG) === "1";
    }
  } catch {
    /* ignore */
  }
  return false;
}

export type ArabicSearchPath = "rpc" | "legacy_fallback" | "disabled_empty";

export function resolveArabicSearchPath(opts?: { preferRpc?: boolean }): ArabicSearchPath {
  if (opts?.preferRpc === false) return "legacy_fallback";
  if (!isArabicDbRpcSearchEnabled()) return "legacy_fallback";
  return "rpc";
}
