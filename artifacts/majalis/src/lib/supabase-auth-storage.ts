/**
 * Supabase Auth storage adapter.
 * - Web: localStorage (unchanged contract)
 * - Capacitor iOS: Keychain via registered SunnahAuthKeychain plugin
 * Migrates legacy WebView localStorage sessions into Keychain once, then purges tokens from LS.
 */

import {
  clearNativeLegacyAuthSession,
  getSunnahAuthKeychainPlugin,
  type SunnahAuthKeychainPlugin,
} from "@/lib/plugins/sunnah-auth-keychain";

export type SupabaseAuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const MIGRATION_FLAG = "ssunnah-auth-keychain-migrated-v1";
const LEGACY_REVIEW_FLAG = "ssunnah-app-store-review-session-v1";
/** Explicit classification when native Keychain bridge is unavailable — not Keychain success. */
const FALLBACK_FLAG = "ssunnah-auth-storage-mode-v1";
const FALLBACK_MODE = "localStorage_fallback";

export type AuthStorageBackend = "web" | "keychain" | "localStorage_fallback";

function isNativePlatform(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return typeof cap?.isNativePlatform === "function" && cap.isNativePlatform();
  } catch {
    return false;
  }
}

function markFallback(reason: string): void {
  try {
    localStorage.setItem(FALLBACK_FLAG, FALLBACK_MODE);
  } catch {
    /* ignore */
  }
  try {
    // Safe: no tokens / no session blob
    console.warn("[auth-storage] keychain_unavailable_fallback", reason);
  } catch {
    /* ignore */
  }
}

function clearFallbackFlag(): void {
  try {
    localStorage.removeItem(FALLBACK_FLAG);
  } catch {
    /* ignore */
  }
}

function webStorage(): SupabaseAuthStorage {
  return {
    async getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* ignore quota */
      }
    },
    async removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

function looksLikeSessionBlob(value: string): boolean {
  if (!value || value.length < 8) return false;
  try {
    const parsed = JSON.parse(value) as {
      access_token?: unknown;
      refresh_token?: unknown;
      currentSession?: unknown;
    };
    return Boolean(
      (typeof parsed.access_token === "string" && parsed.access_token.length > 0) ||
        (typeof parsed.refresh_token === "string" && parsed.refresh_token.length > 0) ||
        (parsed.currentSession && typeof parsed.currentSession === "object"),
    );
  } catch {
    return false;
  }
}

async function migrateLegacyIfNeeded(plugin: SunnahAuthKeychainPlugin, key: string): Promise<void> {
  try {
    if (localStorage.getItem(MIGRATION_FLAG) === "1") return;
  } catch {
    /* continue */
  }

  let legacy: string | null;
  try {
    legacy = localStorage.getItem(key);
  } catch {
    legacy = null;
  }
  if (!legacy || !looksLikeSessionBlob(legacy)) {
    try {
      localStorage.setItem(MIGRATION_FLAG, "1");
    } catch {
      /* ignore */
    }
    return;
  }

  try {
    const existing = await plugin.get({ key });
    const current = existing?.value;
    if (typeof current === "string" && current.length > 0) {
      try {
        localStorage.removeItem(key);
        localStorage.setItem(MIGRATION_FLAG, "1");
      } catch {
        /* ignore */
      }
      clearFallbackFlag();
      return;
    }
    await plugin.set({ key, value: legacy });
    const verify = await plugin.get({ key });
    if (typeof verify?.value === "string" && verify.value.length > 0) {
      try {
        localStorage.removeItem(key);
        localStorage.setItem(MIGRATION_FLAG, "1");
      } catch {
        /* ignore */
      }
      clearFallbackFlag();
    }
    // If verify failed: leave legacy; do not half-delete; no reload loop.
  } catch {
    markFallback("migration_bridge_error");
  }
}

function nativeKeychainStorage(): SupabaseAuthStorage {
  const web = webStorage();
  return {
    async getItem(key) {
      const plugin = getSunnahAuthKeychainPlugin();
      if (!plugin) {
        markFallback("plugin_null_get");
        return web.getItem(key);
      }
      await migrateLegacyIfNeeded(plugin, key);
      try {
        const res = await plugin.get({ key });
        const value = res?.value;
        if (typeof value === "string" && value.length > 0) {
          clearFallbackFlag();
          return value;
        }
        return null;
      } catch {
        markFallback("plugin_get_failed");
        return web.getItem(key);
      }
    },
    async setItem(key, value) {
      const plugin = getSunnahAuthKeychainPlugin();
      if (!plugin) {
        markFallback("plugin_null_set");
        await web.setItem(key, value);
        return;
      }
      try {
        await plugin.set({ key, value });
        try {
          localStorage.removeItem(key);
          localStorage.setItem(MIGRATION_FLAG, "1");
        } catch {
          /* ignore */
        }
        clearFallbackFlag();
      } catch {
        markFallback("plugin_set_failed");
        await web.setItem(key, value);
      }
    },
    async removeItem(key) {
      const plugin = getSunnahAuthKeychainPlugin();
      if (plugin) {
        try {
          await plugin.remove({ key });
        } catch {
          /* ignore */
        }
        try {
          await plugin.clearNativeLegacySession();
        } catch {
          /* ignore */
        }
      }
      await web.removeItem(key);
      try {
        localStorage.removeItem(LEGACY_REVIEW_FLAG);
      } catch {
        /* ignore */
      }
      clearFallbackFlag();
    },
  };
}

/** Factory used by supabase-bootstrap. */
export function createSupabaseAuthStorage(): SupabaseAuthStorage {
  if (typeof window === "undefined") return webStorage();
  return isNativePlatform() ? nativeKeychainStorage() : webStorage();
}

/**
 * Clears Cap supabase keys (via removeItem callers) + NetworkService legacy account.
 * Safe to call on web (no-op for native legacy).
 */
export async function clearAllNativeAuthSessions(): Promise<void> {
  await clearNativeLegacyAuthSession();
  try {
    localStorage.removeItem(LEGACY_REVIEW_FLAG);
  } catch {
    /* ignore */
  }
  clearFallbackFlag();
}

/** Test helpers (no secrets). */
export const __authStorageTest = {
  MIGRATION_FLAG,
  LEGACY_REVIEW_FLAG,
  FALLBACK_FLAG,
  FALLBACK_MODE,
  looksLikeSessionBlob,
  isNativePlatform,
};
