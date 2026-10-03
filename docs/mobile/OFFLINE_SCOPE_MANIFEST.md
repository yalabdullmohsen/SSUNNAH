# OFFLINE_SCOPE_MANIFEST — Capacitor / iOS product (current)

**Status:** `EXTRACTED_NOT_IMPLEMENTED`  
**Source PR closed as obsolete:** `#1791` (`fix/mobile-offline-first`, Expo `artifacts/majalis-mobile`)  
**Authority product surface:** Capacitor shell around `artifacts/majalis` (iOS-first)  
**Deprecated surface:** `artifacts/majalis-mobile` — see `DEPRECATED.md` (2026-08-08 freeze)  
**Generated:** 2026-10-03 · against `origin/main` tip at sync time  

## Decision on PR #1791

| Question | Answer |
|----------|--------|
| Classification | **A — Expo / retired project path** |
| Merge as-is? | **No** |
| Why | Targets `artifacts/majalis-mobile` (Expo RN), MMKV + PersistQueryClient for that stack; product store path is Capacitor/iOS |
| Unique code preserved? | History retained on closed PR branch; requirements extracted here — **do not port Expo MMKV code blindly** |
| New offline implementation in this task? | **Forbidden** — manifest only |

## Security findings (from #1791 tip — do not reintroduce)

1. MMKV id `ssunnah-offline` with **no encryption** configuration.
2. React Query cache persisted wholesale (`ssunnah.react-query.cache`) — risk of persisting user-scoped queries across logout / account switch unless a Capacitor-era Threat Model + purge hooks exist.
3. Mutation queue persisted without explicit NEVER_PERSIST / auth isolation rules.
4. No documented logout / account-switch cleanup contract tied to Keychain auth (#2471–#2477).

## Data classes (future Capacitor offline work)

| Class | Rule | Examples |
|-------|------|----------|
| `PERSIST_ALLOWED` | Public, non-PII, license-cleared, versioned schema | Prayer times snapshot (App Group), public catalog indexes already licensed, UI prefs non-sensitive |
| `SESSION_ONLY` | Memory / Keychain session; clear on logout | Auth session metadata mirrors; short-lived UI state |
| `NEVER_PERSIST` | Must not land in MMKV/IDB/AsyncStorage plaintext | Access/refresh tokens, passwords, recovery secrets, admin payloads |
| `STREAM_ONLY` | Network stream; no durable offline dump | everyayah / mp3quran / unsigned audio editions (see `STORE_ASSET_MANIFEST`) |
| `LICENSE_BLOCKED` | No offline copy until written grant | QPC V2 fonts (see `ATTRIBUTIONS.md`), any content without redistribute rights |

## Required gates before any future Offline PR

1. Threat Model for Capacitor storage (Keychain vs App Group vs Cache vs IDB).
2. Explicit query allowlist — **no** “persist all queries”.
3. Logout + account-switch purge tests.
4. Schema/version migration + corruption recovery.
5. STREAM_ONLY / LICENSE_BLOCKED enforcement tests.
6. iOS device evidence for cold start / kill / upgrade — not Simulator-only claims.

## Exit

```text
OFFLINE_PR_ARCHITECTURE_CLASSIFIED
OFFLINE_PR_OBSOLETE_AND_CLOSED  (#1791)
OFFLINE_SCOPE_MANIFEST_EXTRACTED
NO_OFFLINE_IMPLEMENTATION_IN_THIS_TASK
```
