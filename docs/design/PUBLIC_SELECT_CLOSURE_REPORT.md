# Public Select Closure Report — PR3

| Field | Value |
|---|---|
| Baseline tip | `81b20440b` |
| Public native files before PR3 | **14** |
| Goal | Migrate low-risk MIGRATE_NOW; justify remainder |

## CLASSIFICATION

| File | Decision | Notes |
|---|---|---|
| `pages/quran/ui/QuranCirclesView.tsx` | **MIGRATE_NOW → done (PR3)** | 4 FilterSheet filters → Radix Select + FieldLabel |
| `pages/quran/ui/MushafBookmarksView.tsx` | **MIGRATE_NOW → done (PR3)** | kind + surah filters (surah uses sentinel `all`) |
| `pages/quran/ui/QuranMemorizationView.tsx` | **NATIVE_JUSTIFIED** / ACCESSIBILITY_EXCEPTION | ~114 surah picker |
| `pages/quran/ui/QuranWorshipHubView.tsx` | **NATIVE_JUSTIFIED** | long surah list |
| `pages/quran/ui/QuranHifzLoopView.tsx` | **MUSHAF_SPECIAL** | audio loop coupling |
| `components/quran/QuranMiniPlayerBar.tsx` | **MUSHAF_SPECIAL** | |
| `components/quran/HifzAudioLoopPlayer.tsx` | **MUSHAF_SPECIAL** | |
| `features/mushaf-madinah/MushafAudioDock.tsx` | **MUSHAF_SPECIAL** | |
| `features/mushaf-madinah/AyahActionSheet.tsx` | **MUSHAF_SPECIAL** | |
| `pages/worship/ui/AdhanSettingsView.tsx` | **PRAYER_SPECIAL** | |
| `components/adhan/AudioPromptsSettingsCard.tsx` | **PRAYER_SPECIAL** | |
| `pages/account/ui/NotificationsAndSoundView.tsx` | **PRAYER_SPECIAL** (alert/voice) | do not regress adhan |
| `pages/account/ui/NotificationSettingsView.tsx` | **NATIVE_JUSTIFIED** | 24h window hours ×2 |
| `pages/account/ui/SettingsView.tsx` | **MIXED** · MIGRATE_NOW done (fontSize · quran font · playback) · MUSHAF_SPECIAL remains (reciter/tafsir) | PR5 |
| Admin `views/admin/*` · `admin-v3/*` | **ADMIN_ONLY** | out of scope |

Prior PR1 done: `SunnahChannelsPanel`, `QuranPeopleView`.

## PR3 migrations

### QuranCirclesView FilterSheet (×4)

| | |
|---|---|
| Before | native `<select>` in `<label>` |
| After | `Select` + `FieldLabel` + `SelectTrigger` `min-h-11 text-base` |
| Behavior | level / track / mode / governorate values unchanged |

### MushafBookmarksView toolbar (×2)

| | |
|---|---|
| Before | native kind + surah `<select>` |
| After | Radix Select; surah empty → `all` sentinel |
| Mushaf | UI chrome only — no Quran text / mapping |

## Post-PR3 measured

**publicNative = 12** (14 − 2). Gate `public-select-pr3-gate.test.ts` enforces ≤ 12.

## PR5 (forms wave) select notes

- Migrated Settings **fontSize**, **quran font**, **playback rate** → Select + FieldLabel.
- File-level publicNative remains **12** because Settings still hosts reciter/tafsir natives (MUSHAF_SPECIAL) and other justified files unchanged.
- See `docs/design/PR5_FORMS_FEEDBACK_CLOSURE_REPORT.md`.

## Deferred justified

PRAYER_SPECIAL · MUSHAF_SPECIAL · long lists · hour windows · Settings reciter/tafsir — documented above; no forced migrate.
