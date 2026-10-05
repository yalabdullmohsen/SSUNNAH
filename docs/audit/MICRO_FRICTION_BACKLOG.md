# MICRO_FRICTION_BACKLOG

Updated: 2026-10-05T04:50Z · tip f8ba02f3a → micro-friction C5

Items remaining FIXABLE: **0** · All closed or KEEP_JUSTIFIED.

| ID | Issue | Result | Class |
|---|---|---|---|
| MF1 | Home → Mushaf 2 clicks | Hero meta + DailyWird CTA + deep link `/mushaf` / `?page=` — 1 tap above fold | FIXED |
| MF2 | Home → Search 2 clicks | `HomeUniversalSearch` mounted above hero in `App.tsx` — 1 tap field | FIXED |
| MF3 | Two continue surfaces | `HomeContinueWidget` dead (zero production imports) — removed; primary = `HomeContinueLearning` | DEAD_WITH_PROOF_AND_REMOVED |
| MF4 | window.confirm | Native-only: `openExternalUrl(confirmLeave)` + Android back exit — no React tree; ConfirmDialog not applicable without Cap listener bridge | KEEP_JUSTIFIED_WITH_EVIDENCE |

## KEEP_JUSTIFIED — MF4

| Field | Value |
|---|---|
| ID | MF4 |
| file | `src/lib/capacitor-utils.ts` · `src/components/NativeBackButtonListener.tsx` |
| selector/component | `window.confirm` (native path only) |
| consumer | Capacitor Browser leave · Android `backButton` exit |
| current behavior | Blocks leaving app / exiting until user confirms |
| reason to keep | Outside React render tree; ConfirmDialog requires mounted host; native `window.confirm` is the OS-safe modal for exit/leave |
| attempted alternative | ConfirmDialog — rejected (no host at CapApp listener time without global overlay owner) |
| proof | Both sites gated by `isNative` / `isAndroid` |
| user impact | Web unaffected; native gets system confirm |
| platform impact | IOS_ONLY / ANDROID_NATIVE |
| regression gate | Do not introduce `window.confirm` on web public routes |
| owner | platform-native |
| review trigger | When global native ConfirmHost ships |

MICRO_FRICTION_ZERO_OR_JUSTIFIED = true
