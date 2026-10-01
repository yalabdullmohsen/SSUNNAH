# T-028 — iOS App Groups Foundation Report

| Field | Value |
|-------|-------|
| Phase | `T-028 IOS_APP_GROUPS_FOUNDATION` |
| Date (UTC) | `2026-10-01` |
| Bundle ID | `com.yousef.majlisilm` |
| Canonical App Group | `group.com.yousef.majlisilm` |
| Exit | **`IOS_SHARED_DATA_FOUNDATION_READY`** |

Contract detail: `docs/mobile/IOS_SHARED_DATA_CONTRACT.md`.

---

## 1. Current State

| Surface | Status |
|---------|--------|
| Android Capacitor | **RETIRED** (out of scope) |
| Main App target | `com.yousef.majlisilm` — present |
| PrayerLiveActivity | `com.yousef.majlisilm.PrayerLiveActivity` — present |
| Home Screen Widget extension | **NOT IMPLEMENTED** (intentional — T-028) |
| Watch app | **NOT IMPLEMENTED** (intentional — T-028) |
| App Groups (pre–T-028) | **MISSING** |
| App Groups (post–T-028) | **Prepared in repo** — entitlements + shared suite |

### Inventory (targets / entitlements / storage)

| Item | Finding |
|------|---------|
| Xcode targets | `App`, `PrayerLiveActivityExtension` only |
| App entitlements | `App.debug` / `App.release` / `App.entitlements` declare `com.apple.security.application-groups` → `group.com.yousef.majlisilm` |
| LA entitlements | `PrayerLiveActivity/PrayerLiveActivity.entitlements` + `CODE_SIGN_ENTITLEMENTS` on LA target |
| Alternate App Group in tree | **None** — no Decision Record / OWNER_ACTION rename required |
| Shared storage | `UserDefaults(suiteName: group.com.yousef.majlisilm)` via `SunnahSharedStore` |
| Auth storage | `KeychainStore` service `com.yousef.majlisilm.auth` — unchanged; not mirrored to App Group |
| PrayerLiveActivity data flow | ActivityKit `PrayerActivityAttributes` + mirror to App Group on start/update |

### Portal capability

Registering `group.com.yousef.majlisilm` on Apple Developer / provisioning profiles remains **OWNER_ACTION** (cannot be completed from repo alone). Repo entitlements and shared layer are ready.

---

## 2. Data Owners

| Data | Owner (write) | Storage | Readers (now / future) |
|------|---------------|---------|-------------------------|
| Day prayer times + next + countdown anchors | Web scheduler → `SunnahSharedData` plugin → `SunnahSharedStore` | App Group key `sunnah.shared.prayer.v1` | Main · LA mirror · future Widget/Watch |
| LA next-prayer state | `PrayerLiveActivityPlugin` → `publishLiveActivityState` | Same prayer.v1 (merge, no wipe of day times) | Main · LA · future Widget/Watch |
| Progress counters | Future JS/native callers → `publishProgressSnapshot` | `sunnah.shared.progress.v1` | Future Widget/Watch |
| Auth tokens / credentials | `NetworkService` / `KeychainStore` | Keychain only | Main App only — **never** App Group |

Single write path for shared prayer/progress: `SunnahSharedStore` in `ios/App/Shared/SunnahSharedData.swift`. No duplicate App Group suite names.

---

## 3. Shared Data Model

### Allowed

| Payload | Key | Fields (summary) |
|---------|-----|------------------|
| Prayer | `sunnah.shared.prayer.v1` | `locationLabel`, `timeZoneIdentifier`, `dayKey`, `timesEpochMs`, `nextPrayerKey`, `nextPrayerNameAr`, `nextPrayerEpochMs`, `nextHasStarted`, `updatedAtEpochMs` |
| Progress | `sunnah.shared.progress.v1` | `dailyWirdCompleted`, `dailyWirdTarget`, `mushafPagesReadToday`, `updatedAtEpochMs` |
| Schema | `sunnah.shared.schemaVersion` | Integer (current = 1) |

### Forbidden (guarded)

Substrings rejected for non-allowlisted keys: `token`, `secret`, `password`, `refresh`, `accessToken`, `authorization`, `apikey`, `api_key`, `bearer`, `session`, `credential`, `privateKey`, `keychain`.

No Quran text / QPC / fatwa bodies / auth blobs in App Group.

### Bridges

| Layer | Path |
|-------|------|
| Swift SoT | `artifacts/majalis/ios/App/Shared/SunnahSharedData.swift` |
| Capacitor plugin | `artifacts/majalis/ios/App/App/SunnahSharedDataPlugin.swift` |
| JS | `artifacts/majalis/src/lib/plugins/sunnah-shared-data.ts` |
| Publisher | `prayer-alert-scheduler.ts` → `publishSharedPrayerSnapshot` on iOS native |

---

## 4. App Group Design

```
group.com.yousef.majlisilm
├── Main App (read/write)
├── PrayerLiveActivity (read/write mirror)
├── [future] Widget Extension (read)
└── [future] Watch (read; WatchConnectivity fallback later)
```

| Rule | Decision |
|------|----------|
| Canonical id | `group.com.yousef.majlisilm` (matches Bundle ID vendor) |
| Conflicting id in repo | None found → no OWNER_ACTION Decision Record for rename |
| Secrets | Keychain only; App Group = public-ish snapshots |
| Duplicate storage path | Forbidden — one suite, allowlisted keys only |

---

## 5. Live Activity Integration

| Check | Result |
|-------|--------|
| ActivityKit path retained | ✓ `PrayerLiveActivityPlugin` start/update/end unchanged |
| App Group mirror on start | ✓ `SunnahSharedStore.publishLiveActivityState` |
| App Group mirror on update | ✓ same |
| Shared file in LA Sources | ✓ `SunnahSharedData.swift` in App + LA targets |
| LA entitlements App Group | ✓ |
| Token leakage via LA | ✓ no Keychain / token fields in shared model |

Compatibility: existing Live Activity UX remains; Widget/Watch can later read the same prayer.v1 snapshot.

---

## 6. Widget Readiness

**Contracts only** — no Widget Extension target created.

| Family | Kind | Data | Content (license-safe) |
|--------|------|------|------------------------|
| Small | `systemSmall` | prayer.v1 | Next name + countdown |
| Medium | `systemMedium` | prayer.v1 | Next + today’s times strip |
| Large | `systemLarge` | prayer.v1 + progress.v1 | Day grid + wird progress |
| Inline Lock Screen | `accessoryInline` | prayer.v1 | Next prayer name |
| Circular Lock Screen | `accessoryCircular` | prayer.v1 | Countdown ring |
| Rectangular Lock Screen | `accessoryRectangular` | prayer.v1 | Name + time |

Deep link: `https://www.ssunnah.com/prayer-times`. Full detail: `IOS_SHARED_DATA_CONTRACT.md`.

---

## 7. Watch Readiness

**Contracts only** — no Watch app target created.

| Surface | Data | Notes |
|---------|------|-------|
| Complications | prayer.v1 next + countdown | Numbers/times only |
| Smart Stack | prayer.v1 | Prayer overview card |
| Prayer Overview | prayer.v1 day times | No corpus text |
| Countdown | prayer.v1 `nextPrayerEpochMs` | System timer style |

---

## 8. Exit Decision

### Validation checklist

| Check | Result |
|-------|--------|
| No duplicate storage path | ✓ single suite + allowlisted keys |
| No token leakage | ✓ forbidden substrings + Keychain-only auth |
| No Keychain regression | ✓ `NetworkService` / `KeychainStore` untouched for secrets |
| Live Activity compatibility | ✓ ActivityKit + App Group mirror |
| Widget / Watch not started | ✓ no targets |
| Shared architecture documented | ✓ this report + contract |
| App Group integration prepared | ✓ entitlements + shared layer |

### Exit code

```text
IOS_SHARED_DATA_FOUNDATION_READY
APP_GROUP=group.com.yousef.majlisilm
WIDGET_EXTENSION=NOT_STARTED
WATCH_APP=NOT_STARTED
PORTAL_APP_GROUP_REGISTRATION=OWNER_ACTION
```

**Verdict:** foundation complete for future Widgets / Watch / LA shared reads. Do **not** start Widget Extension, Watch App, Device Matrix, TestFlight, or Store Upload until this exit is accepted and later phases open.
