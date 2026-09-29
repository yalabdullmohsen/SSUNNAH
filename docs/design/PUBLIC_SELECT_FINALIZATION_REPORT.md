# Public Select Finalization Report (PR1 wave)

| Field | Value |
|---|---|
| Captured | 2026-09-29 |
| Baseline tip | `dbb880426` |
| Public native `<select>` files at baseline | **16** |
| Goal | Every remaining native select justified + tested — not arbitrary zero |

## Inventory (public, excl. admin / admin-v3)

| File | Domain | Options (approx) | Decision | Notes |
|---|---|---|---|---|
| `components/notifications/SunnahChannelsPanel.tsx` | notifications cadence | 2–3 | **MIGRATE_NOW → done (PR1)** | Radix Select + FieldLabel |
| `pages/quran/ui/QuranPeopleView.tsx` | quran people filters | 3–8 | **MIGRATE_NOW → done (PR1)** | 3 filters → Select |
| `pages/quran/ui/QuranCirclesView.tsx` | circles FilterSheet | 4 selects | MIGRATE_NOW | PR1+ follow-up |
| `pages/quran/ui/QuranMemorizationView.tsx` | hifz UI | 1 | MIGRATE_NOW | next wave |
| `pages/quran/ui/QuranHifzLoopView.tsx` | hifz loop | 1 | MIGRATE_NOW / MUSHAF_SPECIAL | review audio coupling |
| `pages/quran/ui/QuranWorshipHubView.tsx` | surah picker ~114 | 1 | NATIVE_JUSTIFIED / ACCESSIBILITY_EXCEPTION | long list; keep native until proven Radix parity |
| `pages/quran/ui/MushafBookmarksView.tsx` | bookmarks chrome | 2 | MIGRATE_NOW | UI-only |
| `pages/account/ui/SettingsView.tsx` | settings | 5 | MIGRATE_NOW (non-prayer) / PRAYER_SPECIAL subset | split carefully |
| `pages/account/ui/NotificationSettingsView.tsx` | notifications | 2 | MIGRATE_NOW / PRAYER_SPECIAL | |
| `pages/account/ui/NotificationsAndSoundView.tsx` | prayer alert + adhan voice + stream | 5 | **PRAYER_SPECIAL** (alert/voice) · MIGRATE_NOW (stream/reciter UI) | do not regress adhan |
| `pages/worship/ui/AdhanSettingsView.tsx` | adhan | 1 | **PRAYER_SPECIAL** | |
| `components/adhan/AudioPromptsSettingsCard.tsx` | adhan prompts | 1 | **PRAYER_SPECIAL** | |
| `components/quran/QuranMiniPlayerBar.tsx` | mushaf audio | 3 | **MUSHAF_SPECIAL** | |
| `components/quran/HifzAudioLoopPlayer.tsx` | mushaf/hifz audio | 3 | **MUSHAF_SPECIAL** | |
| `features/mushaf-madinah/MushafAudioDock.tsx` | mushaf dock | 1 | **MUSHAF_SPECIAL** | |
| `features/mushaf-madinah/AyahActionSheet.tsx` | mushaf sheet | 2 | **MUSHAF_SPECIAL** | |

## PR1 migrations

### SunnahChannelsPanel cadence

| | |
|---|---|
| Before | native `<select>` inside label |
| After | `Select` + `FieldLabel` + `SelectTrigger` `min-h-11 text-base` |
| Decision | MIGRATE_NOW |
| Tests | source contract in this report wave; prefs API unchanged |
| Remaining | none in this file |

### QuranPeopleView filters (×3)

| | |
|---|---|
| Before | three native `<select>` in toolbar |
| After | three Radix `Select` + visible `FieldLabel` |
| Decision | MIGRATE_NOW |
| Tests | filter values unchanged (`all` / category / mention / sort) |
| Remaining | none in this file |

## Post-PR1 measured public native file count

**14** (16 − 2 files fully cleared). Ceiling must not rise above baseline 16; gate `public-select-pr1-gate.test.ts` enforces ≤ 14.

## Deferred (justified)

- Prayer/adhan voice & alert style selects — **PRAYER_SPECIAL** until dedicated wave with adhan regression suite.
- Mushaf mini-player / dock / ayah sheet — **MUSHAF_SPECIAL** (PR7).
- Worship hub surah picker (114 options) — keep native pending accessibility proof.

Admin native selects (**32**) out of this wave.
