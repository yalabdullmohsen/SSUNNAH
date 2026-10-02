/**
 * Supabase Auth storage adapter.
 * - Web: localStorage (unchanged contract)
 * - Capacitor iOS/Android: Keychain via SunnahAuthKeychain plugin
 * Migrates legacy WebView localStorage sessions into Keychain once, then purges tokens from LS.
 */

export type SupabaseAuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const MIGRATION_FLAG = "ssunnah-auth-keychain-migrated-v1";
const LEGACY_REVIEW_FLAG = "ssunnah-app-store-review-session-v1";

type KeychainPlugin = {
  get: (opts: { key: string }) => Promise<{ value?: string | null }>;
  set: (opts: { key: string; value: string }) => Promise<{ ok?: boolean }>;
  remove: (opts: { key: string }) => Promise<{ ok?: boolean }>;
};

function isNativePlatform(): boolean {
  try {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return typeof cap?.isNativePlatform === "function" && cap.isNativePlatform();
  } catch {
    return false;
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

function getKeychainPlugin(): KeychainPlugin | null {
  try {
    const plugins = (
      window as unknown as { Capacitor?: { Plugins?: Record<string, KeychainPlugin> } }
    ).Capacitor?.Plugins;
    const p = plugins?.SunnahAuthKeychain;
    if (!p || typeof p.get !== "function" || typeof p.set !== "function" || typeof p.remove !== "function") {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

function looksLikeSessionBlob(value: string): boolean {
  if (!value || value.length < 8) return false;
  try {
    const parsed = JSON.parse(value) as { access_token?: unknown; refresh_token?: unknown; currentSession?: unknown };
    return Boolean(
      (typeof parsed.access_token === "string" && parsed.access_token.length > 0) ||
        (typeof parsed.refresh_token === "string" && parsed.refresh_token.length > 0) ||
        (parsed.currentSession && typeof parsed.currentSession === "object"),
    );
  } catch {
    return false;
  }
}

async function migrateLegacyIfNeeded(plugin: KeychainPlugin, key: string): Promise<void> {
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
    }
    // If verify failed: leave legacy in place; do not half-delete; no reload loop.
  } catch {
    /* bridge unavailable — leave legacy; login may still work until next update */
  }
}

function nativeKeychainStorage(): SupabaseAuthStorage {
  const web = webStorage();
  return {
    async getItem(key) {
      const plugin = getKeychainPlugin();
      if (!plugin) {
        return web.getItem(key);
      }
      await migrateLegacyIfNeeded(plugin, key);
      try {
        const res = await plugin.get({ key });
        const value = res?.value;
        if (typeof value === "string" && value.length > 0) return value;
        if (value === null || value === undefined) return null;
        return null;
      } catch {
        return web.getItem(key);
      }
    },
    async setItem(key, value) {
      const plugin = getKeychainPlugin();
      if (!plugin) {
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
      } catch {
        await web.setItem(key, value);
      }
    },
    async removeItem(key) {
      const plugin = getKeychainPlugin();
      if (plugin) {
        try {
          await plugin.remove({ key });
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
    },
  };
}

/** Factory used by supabase-bootstrap. */
export function createSupabaseAuthStorage(): SupabaseAuthStorage {
  if (typeof window === "undefined") return webStorage();
  return isNativePlatform() ? nativeKeychainStorage() : webStorage();
}

/** Test helpers (no secrets). */
export const __authStorageTest = {
  MIGRATION_FLAG,
  LEGACY_REVIEW_FLAG,
  looksLikeSessionBlob,
  isNativePlatform,
};
