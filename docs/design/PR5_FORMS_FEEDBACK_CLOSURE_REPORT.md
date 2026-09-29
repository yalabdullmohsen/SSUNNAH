# PR5 — Forms & Feedback Closure

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (awaiting merge/deploy) |
| Branch | `cursor/final-internal-closure-pr5` |
| Baseline main | `95d564f32` (#2367 PR4) |
| Authority | `FORM_FEEDBACK_AUTHORITY.md` |
| Password / Auth | unchanged (`PasswordPolicyAuthority`, Supabase settings) |
| Prayer calc / Adhan | unchanged |

## Native Select CLASSIFICATION (live)

| File | Decision | Notes |
|---|---|---|
| `SettingsView.tsx` fontSize | **MIGRATE_NOW → done** | Radix Select + FieldLabel · `min-h-11 text-base` |
| `SettingsView.tsx` quran font | **MIGRATE_NOW → done** | 3 fonts |
| `SettingsView.tsx` playback rate | **MIGRATE_NOW → done** | 6 rates |
| `SettingsView.tsx` reciter / tafsir | **MUSHAF_SPECIAL** / long list | native kept |
| `NotificationSettingsView.tsx` | **NATIVE_JUSTIFIED** | 24h window hours |
| `NotificationsAndSoundView.tsx` | **PRAYER_SPECIAL** | alert/voice/stream |
| `AdhanSettingsView.tsx` · `AudioPromptsSettingsCard.tsx` | **PRAYER_SPECIAL** | |
| `QuranMemorizationView` · `QuranWorshipHubView` | **NATIVE_JUSTIFIED** / ACCESSIBILITY | ~114 surahs |
| `QuranHifzLoopView` · MiniPlayer · AudioDock · AyahActionSheet · HifzAudioLoop | **MUSHAF_SPECIAL** | |
| Admin | **ADMIN_ONLY** | out of scope |

**publicNative files = 12** (unchanged file ceiling — Settings still hosts justified natives). Element-level debt reduced inside Settings.

## Forms / feedback migrations

| Surface | Change |
|---|---|
| `LoginView` | `Input` + `min-h-11 text-base` · `aria-describedby` / `aria-invalid` |
| `SearchView` | no raw API/error.message in UI · friendly Arabic copy + Retry |
| `MushafBookmarksView` | `window.alert` → `FieldError` (friendly import failure) |
| `TasbihView` | `window.confirm` → in-page `alertdialog` |
| `TasbeehCounter` | confirm reset via `alertdialog` + Button |
| `ArbaeenNawawiView` | confirm reset via `alertdialog` |

## Contracts

- Mobile inputs ≥ 16px (`text-base` / `min-h-11`)
- Labels via `FormLabel` / `FieldLabel`
- Errors via `FieldError` / product copy — no provider payloads
- No `window.confirm` / `window.alert` on migrated product flows
- Double-submit: Login submit already `loading` + rate limit
- RTL · Light/Dark untouched at token layer

## Remaining justified debt

Public native select **file** count stays **12** until a dedicated wave clears remaining MUSHAF/PRAYER/hour natives (do not force).

## Gates

- `test:final-internal-closure-pr5`
- `test:form-feedback-authority`
- `test:public-select` ceilings ≤ 12
- `verify:preflight` · `verify:ci`
