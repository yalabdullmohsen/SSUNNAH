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
/** Last Supabase auth storage key name only (never the session blob). */
const LAST_AUTH_KEY_FLAG = "ssunnah-auth-storage-key-v1";
const AUTH_TOKEN_KEY_RE = /^sb-.+-auth-token$/;

export type AuthStorageBackend = "web" | "keychain" | "localStorage_fallback";

function isNativePlatform(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return typeof cap?.isNativePlatform === "function" && cap.isNativePlatform();
  } catch {
    return false;
  }
}

function rememberAuthStorageKey(key: string): void {
  if (!AUTH_TOKEN_KEY_RE.test(key)) return;
  try {
    localStorage.setItem(LAST_AUTH_KEY_FLAG, key);
  } catch {
    /* ignore */
  }
}

function collectAuthStorageKeys(): string[] {
  const keys = new Set<string>();
  try {
    const remembered = localStorage.getItem(LAST_AUTH_KEY_FLAG);
    if (remembered && AUTH_TOKEN_KEY_RE.test(remembered)) keys.add(remembered);
  } catch {
    /* ignore */
  }
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && AUTH_TOKEN_KEY_RE.test(key)) keys.add(key);
    }
  } catch {
    /* ignore */
  }
  return [...keys];
}

async function verifyKeychainWrite(
  plugin: SunnahAuthKeychainPlugin,
  key: string,
  value: string,
): Promise<boolean> {
  try {
    const res = await plugin.get({ key });
    return typeof res?.value === "string" && res.value === value;
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
          rememberAuthStorageKey(key);
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
        rememberAuthStorageKey(key);
        return;
      }
      try {
        await plugin.set({ key, value });
        const verified = await verifyKeychainWrite(plugin, key, value);
        if (!verified) {
          // Never pretend Keychain write succeeded.
          markFallback("plugin_set_unverified");
          await web.setItem(key, value);
          rememberAuthStorageKey(key);
          return;
        }
        try {
          localStorage.removeItem(key);
          localStorage.setItem(MIGRATION_FLAG, "1");
        } catch {
          /* ignore */
        }
        rememberAuthStorageKey(key);
        clearFallbackFlag();
      } catch {
        markFallback("plugin_set_failed");
        await web.setItem(key, value);
        rememberAuthStorageKey(key);
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
        if (localStorage.getItem(LAST_AUTH_KEY_FLAG) === key) {
          localStorage.removeItem(LAST_AUTH_KEY_FLAG);
        }
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
 * Unified native leftovers cleanup (Cap Keychain + NetworkService legacy).
 * Call AFTER supabase.auth.signOut() so the access token is still available for server revoke.
 * Safe on web (native calls no-op when plugin missing).
 */
export async function clearAllNativeAuthSessions(): Promise<void> {
  const keys = collectAuthStorageKeys();
  const plugin = getSunnahAuthKeychainPlugin();
  if (plugin) {
    for (const key of keys) {
      try {
        await plugin.remove({ key });
      } catch {
        /* continue */
      }
    }
    try {
      await plugin.clearNativeLegacySession();
    } catch {
      /* ignore */
    }
  } else {
    await clearNativeLegacyAuthSession();
  }
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.removeItem(LEGACY_REVIEW_FLAG);
    localStorage.removeItem(LAST_AUTH_KEY_FLAG);
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
  LAST_AUTH_KEY_FLAG,
  looksLikeSessionBlob,
  isNativePlatform,
  collectAuthStorageKeys,
};
