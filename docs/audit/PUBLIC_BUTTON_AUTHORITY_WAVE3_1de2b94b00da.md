# Public Button Authority — Wave 3

TASK_CLASSIFICATION: SHARED_PLATFORM

WEB_IMPACT: Public Quran control surfaces use official Button/IconButton
IOS_APPLICATION_IMPACT: WebView parity for Quran player/list controls
APP_STORE_PRODUCT_IMPACT: none (no binary)
SHARED_PLATFORM_IMPACT: interaction ceilings lowered

## Base

| Field | Value |
|---|---|
| Main SHA | `1de2b94b00dacc38ca3e0326b424fa1500214898` |
| Prior wave | #2594 public button authority wave2 |

## Migrated (PUBLIC)

| File | Before raw `<button>` | After |
|---|---:|---|
| `SurahList.tsx` | 4 | 0 → Button (tabs/chips/items) |
| `TafsirModalViewer.tsx` | 2 | 0 → Button + IconButton |
| `QuranAudioPlayer.tsx` | 2 | 0 → Button |
| `QuranPlayerView.tsx` | 2 | 0 → Button |
| `HifzAudioLoopPlayer.tsx` | 5 | 0 → Button + IconButton (TOGGLE kept via aria-pressed) |
| `ImmersiveQuranApp.tsx` | 2 | 0 → Button |
| `QuranVerseList.tsx` | 1 | 0 → Button (role=option) |
| `ImmersiveQuranPage.tsx` | 1 | 0 → Button |

## Metrics

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| rawButtonFiles | 60 | **52** | −8 |
| rawButtonElements | 212 | **193** | −19 |
| officialButtonImportFiles | 303 | **311** | +8 |
| iconButtonConsumerFiles | 47 | **49** | +2 |

Ceilings lowered to measured. Floors raised. NO_CEILING_RAISE. NO_GATE_WEAKENING.

## Exit

PUBLIC_RAW_BUTTONS_REDUCED = true
BUTTON_AUTHORITY_HELD = true
KEYBOARD_INTERACTION_PASS = true (type=button retained; roles preserved)
NO_QURAN_INTEGRITY_CHANGE = true
