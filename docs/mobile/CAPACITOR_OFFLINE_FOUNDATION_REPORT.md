# CAPACITOR_OFFLINE_FOUNDATION_REPORT

| Field | Value |
|-------|-------|
| Status | `OFFLINE_FOUNDATION_DEFINED` |
| Date UTC | 2026-10-03 |
| Authority | `docs/mobile/OFFLINE_SCOPE_MANIFEST.md` |
| Implementation | **Forbidden in this task** |

## Non-revival

- Expo / `artifacts/majalis-mobile` — dead
- MMKV offline architecture — do not port
- PR `#1791` code — obsolete (requirements extracted only)

## 1. Threat Model

| Store | Trust | Threat | Control |
|-------|-------|--------|---------|
| iOS Keychain | High | Token theft / residual after logout | Session-only secrets; purge on logout + account-switch; no plaintext tokens in WebView storage |
| App Group (prayer widgets) | Medium | Cross-target leak of location prefs | Prayer snapshot only; no auth tokens; versioned schema |
| Capacitor Preferences / IDB | Low–Med | XSS → offline dump of user data | Allowlist queries only; encrypt-at-rest if PII; NEVER_PERSIST enforcement |
| HTTP cache / CDN | Low | Stale licensed assets | Cache-Control + LICENSE_BLOCKED exclusion |
| Memory (React Query) | Session | Account-switch bleed | Clear client caches on logout / userId change |

## 2. Data classification

| Class | Rule | Examples |
|-------|------|----------|
| `PERSIST_ALLOWED` | Public, non-PII, license-cleared, versioned | Prayer times snapshot (App Group), public catalog indexes |
| `SESSION_ONLY` | Memory / Keychain; clear on logout | Auth session mirrors; short-lived UI |
| `NEVER_PERSIST` | No MMKV/IDB/Preferences plaintext | Access/refresh tokens, passwords, admin payloads |
| `STREAM_ONLY` | Network only; no durable dump | everyayah / mp3quran / unsigned audio |
| `LICENSE_BLOCKED` | No offline copy until written grant | QPC V2 fonts; unlicensed bodies |

## 3. Storage authority

```text
Keychain     → SESSION_ONLY secrets (auth)
App Group    → PERSIST_ALLOWED prayer widget snapshot only
Preferences  → non-sensitive prefs (theme, last route) allowlisted
IDB / Cache  → PERSIST_ALLOWED catalog shards only (future PR)
Memory RQ    → default; purge on logout / account-switch
```

No “persist all queries”. Future offline PR must ship an explicit allowlist.

## 4. Logout purge strategy

1. Clear Keychain session items for app access group.
2. `queryClient.clear()` + drop any Preferences keys tagged `user:`.
3. Wipe IDB databases in offline allowlist namespace (when implemented).
4. Keep `PERSIST_ALLOWED` public catalogs only if not user-scoped.
5. Gate test: after logout, no user-scoped key remains.

## 5. Account-switch strategy

1. Treat as logout purge + login for `userB`.
2. Key cache namespaces by `userId` when any user-scoped persist exists.
3. Refuse restore of `userA` cache into `userB` session (integrity check).

## 6. Cache integrity model

- Schema `version` integer on every persisted blob.
- Checksum (sha256) for catalog shards.
- On mismatch / corruption → delete blob + refetch (no silent serve).
- Migration functions pure + tested; failure → purge class bucket.

## 7. STREAM_ONLY enforcement

- Recitation / adhan remote URLs must not enter offline pack builders.
- CI gate: no bundled mp3/quran-audio assets except explicitly licensed allowlist.
- Kill switch already aligned with store asset manifest.

## 8. LICENSE_BOUNDARY enforcement

- QPC fonts / redistribute-blocked content → `LICENSE_BLOCKED`.
- Offline pack builder must refuse LICENSE_BLOCKED + STREAM_ONLY.
- ATTRIBUTES / ATTRIBUTIONS remain release gate.

## Exit

```text
OFFLINE_FOUNDATION_DEFINED
NO_OFFLINE_IMPLEMENTATION_IN_THIS_TASK
THREAT_MODEL_DOCUMENTED
STREAM_ONLY_AND_LICENSE_BOUNDARY_SPECIFIED
```
