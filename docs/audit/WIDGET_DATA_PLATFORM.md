# Widget Data Platform — Live Inventory

Gate: `IOS_WIDGET_DATA_PLATFORM_GATE`  
Authority: `SUNNAH_WIDGET_DATA_PLATFORM_AND_IN_APP_WIDGET_CENTER_COMPLETE_PROGRAM`  
Inspected: `origin/main` = `f4275d913` plus unmerged PrayerWidget platform on `cursor/ios-sunnah-widget-platform-w0-w8`  
Build in repo: **55** (unchanged) · **FUTURE_IOS_UPDATE_REQUIRED**

## WIDGET_DATA_LIVE_INVENTORY

| Surface | Live finding |
|---|---|
| Widget target | `PrayerWidgetExtension` · `com.yousef.majlisilm.PrayerWidget` |
| Live Activity | `PrayerLiveActivityExtension` · same App Group |
| App Group | `group.com.yousef.majlisilm` (Main · Widget · LA). PR #2299 `*.widgets` is not revived |
| Shared Swift | `SunnahSharedData.swift`, envelope, refresh coordinator, deep links, brand colors |
| Writer | JS `buildSharedPrayerSnapshotPayload` → Capacitor `SunnahSharedData` plugin |
| Reader | WidgetKit `SunnahSharedStore` + isolated envelope decode |
| Prayer payload | `sunnah.shared.prayer.v1` (Build 55) + envelope `sunnah.shared.envelope.v1` |
| Timeline | `PrayerWidgetProvider` / `CatalogWidgetProvider` |
| Placeholder / snapshot / preview | separated on the unmerged platform; Build 55 gallery can still show `—` |
| Canonical engines | Prayer: `prayer-times` · Hijri: `hijri-utils` Intl Umm al-Qura · Quran: `quran-api` local-first · Adhkar: `adhkar-seed` + publish filter · Hadith: `daily-content` · Occasions: `religious-content` validator over `islamic-occasions-seed` |
| Progress | Local `daily-progress` + `user-streak` + `user_progress` RPC (lessons/courses/quran) |
| Mushaf | `lastPage` local · `getMyBookmarks()` · no invented page 1 |
| Settings IA | `/settings` sections; no Widget Center yet |
| Admin | `ReligiousCalendarReviewSection` local overrides; Admin v3 reviews center |
| Secrets | App Group forbids token/password substrings; widget never gets DB credentials |

## WIDGET_DATA_OWNERSHIP_MAP

| Domain | Canonical owner | Widget consumption |
|---|---|---|
| Prayer | App prayer engine | Snapshot only |
| Calendar | `hijri-utils` / Intl Umm al-Qura | Snapshot only |
| Islamic events | `religious-content` verified records | Snapshot of publishable + widget-eligible only |
| Adhkar | Adhkar repository | Widget-safe fields + truthful session completion |
| Quran | Quran repository | Exact daily ayah from reviewed pool |
| Mushaf | last page + bookmarks | NOT_STARTED if none |
| Progress | `daily-progress` / `user_progress` / streak | Honest setup if untracked |
| Preferences | App widget preference store | App Intent > local pref > default |
| Custom selection | Local widget selections | No free-text notes in V1 |

## WIDGET_FEATURE_TO_DATA_DEPENDENCY_MAP

| Widget family | Required data | If missing |
|---|---|---|
| Prayer | prayer snapshot | REQUIRES_INITIALIZATION |
| Calendar / Ramadan | calendar payload | NO_DATA |
| Islamic event | verified events payload | REVIEW_REQUIRED / INFORMATIONAL |
| Adhkar | adhkar payload | open Sunnah |
| Adhkar streak / spiritual day | canonical tracking | setup state, never fake |
| Quran ayah | reviewed daily ayah | empty + open Sunnah |
| Mushaf | last page / bookmark | NOT_STARTED |
| Hadith / Dua / Faidah | reviewed daily content | hidden if ineligible |
| Custom | selection record | CONFIGURATION_REQUIRED |

## WIDGET_PRIVACY_CLASSIFICATION_MAP

| Class | Examples | App Group |
|---|---|---|
| Public-safe | prayer times, Hijri date, reviewed event titles, daily ayah/hadith/dhikr | allowed |
| User-progress (local) | last mushaf page, adhkar completion flags, streak counts | allowed only as counters, no identity |
| Account-linked | `user_progress` rows | never copied wholesale |
| Forbidden | tokens, email, phone, coordinates, private notes, admin JSON | never |

## WIDGET_LICENSE_BOUNDARY_MAP

| Content | License / integrity | Widget rule |
|---|---|---|
| Quran text | canonical repository only | no paraphrase, no truncation that changes meaning |
| Hadith | reviewed pools + grade/source | hide rejected/unverified |
| Adhkar | publishable items only | no partial dhikr |
| Audio | reciter licenses | never required for widget text |
| Events | religious-content review | disputed not auto-featured |

## WIDGET_DATA_GAPS_PROVEN

| Field group | Classification |
|---|---|
| Prayer times + next | EXISTING_CANONICAL_DATA, published |
| Previous/current prayer keys on snapshot | EXISTING_BUT_NOT_PUBLISHED (derived in WidgetKit) |
| Hijri dual date | EXISTING_CANONICAL_DATA, published |
| Islamic events authority workflow | EXISTING_BUT_NOT_TRACKED for widget eligibility / moon confirmation |
| Adhkar morning completion | EXISTING_CANONICAL_DATA (milestones) — evening/sleep/after-prayer not fully connected |
| Streak | EXISTING_CANONICAL_DATA (`user-streak`) |
| Mushaf last page | EXISTING_CANONICAL_DATA |
| Daily Quran goal pages | EXISTING_BUT_NOT_TRACKED as pages (task target = 1) |
| Custom widget instance selection | NEW_LOCAL_DATA_REQUIRED |
| Widget preferences | NEW_LOCAL_DATA_REQUIRED |
| In-app Widget Center | NEW (UI) |
| Account-synced widget selections | NEW_ACCOUNT_DATA_REQUIRED — deferred; local-first |
| Production SQL | not required for V1 |

## Storage authority

- APP_GROUP_SNAPSHOT: envelope + legacy prayer.v1 + publication metadata  
- LOCAL_APPLICATION_STORAGE: daily-progress, streak, lastPage, widget prefs/selections, admin review overrides  
- ACCOUNT_DATABASE: existing `user_progress` only; no new Production tables in this program  
- PRODUCTION_DATABASE_MIGRATION_APPLIED = false

## Program outputs

| Output | Status |
|---|---|
| WIDGET_DOMAIN_MODEL_SINGLE | `src/lib/widget-data/types.ts` + envelope v1 |
| DOMAIN_FAILURE_ISOLATION_PASS | Swift `decodeIsolated` + JS privacy scan |
| WIDGET_STORAGE_AUTHORITY_SINGLE | `WidgetDataRepository` / `repository.ts` |
| NO_PRIVATE_DATA_IN_APP_GROUP | forbidden substrings + `assertPublicSafeWidgetJson` |
| ATOMIC_WIDGET_PUBLICATION | existing refresh coordinator write+synchronize |
| WIDGET_DATA_GAPS_PROVEN | table above · no duplicate DB model |
| USER_PROGRESS_WRITES_CONNECTED | Adhkar full-session → `setTaskProgress` |
| MUSHAF_LAST_POSITION_CANONICAL | `lastPage` · NOT_STARTED if null |
| DAILY_READING_GOAL_SUPPORTED | `daily-progress.quran` task |
| ADHKAR_COMPLETION_SUPPORTED | morning/evening/after-prayer session complete |
| STREAK_MODEL_SUPPORTED | `user-streak` never fabricated |
| NO_FAKE_PROGRESS | setup state when untracked |
| PRAYER_WIDGET_DATA_COMPLETE | previous/current/next published from engine times |
| NO_PRAYER_ENGINE_DUPLICATION | WidgetKit still consumes snapshots only |
| CALENDAR_DATA_AUTHORITY_SINGLE | Intl Umm al-Qura via app |
| ISLAMIC_EVENTS_DOMAIN_COMPLETE | verified records + moon-sighting provisional |
| UNREVIEWED_EVENT_PUBLICATION_BLOCKED | disputed/review-not-approved skipped |
| IN_APP_WIDGET_CENTER_COMPLETE | `/widget-center` · مركز الويدجت |
| WIDGET_CENTER_FEEDBACK_COMPLETE | 12 UX states |
| BUILD_55_PAYLOAD_BACKWARD_COMPATIBLE | optional additive fields |
| FUTURE_IOS_UPDATE_REQUIRED | true |

