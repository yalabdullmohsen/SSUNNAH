# PR4–PR8 Live Baseline

| Field | Value |
|---|---|
| Captured | 2026-09-29T21:50Z (re-verified) |
| `origin/main` | `723d27f62` (#2366) |
| Production `https://www.ssunnah.com/version.json` | `723d27f6` **MATCH** · `builtAt=2026-09-29T21:34:21.266Z` |
| PR2 #2364 | RESOLVED_AND_DEPLOYED |
| PR3 #2366 | MERGED_AND_DEPLOYED (`mergedAt=2026-09-29T21:32:55Z`) |
| Open unrelated PRs | #2299 widgets CONFLICTING · #1791 offline — out of program |
| Worktrees | many historical; program branch `cursor/final-internal-closure-pr4` only |
| Stashes | noise only — not applied |

## Pre-PR4 metrics (live at discovery)

| Metric | Value |
|---|---:|
| rawButtonFiles | **225** |
| rawButtonElements | **971** |
| official Button imports | **139** |
| divSpanOnClick | **59** |
| formButtonsMissingType | **0** |
| public native selects | **12** |
| mjDeclOutsideAllowlist | **0** |
| cssFiles | **359** |
| important | **4798** |
| hexInCss | **9090** |

## Exact scope

| PR | In | Out |
|---|---|---|
| **PR4** | Shared public buttons · retry/error · toolbars · filters · share · toast · citation dialog · onboarding · search panel · fiqh grid · prophet tabs | Mushaf audio chrome · admin mass · quiz game bulk · div/span mass |
| **PR5** | Forms/feedback · remaining low-risk selects | Password policy · prayer calc |
| **PR6** | Page adapters docs/tests · SAFE_REMOVE legacy only with proof | Mass page rewrites |
| **PR7** | FloatingLayer owner · Mushaf UI chrome only | Quran text/mapping |
| **PR8** | Startup/CLS/CSS margin · final matrices · final report | Store GO |

## Risks

- Over-migrating MUSHAF_SPECIAL controls → blocked in PR4
- Empty PR / budget rise → fail CI
- Combining waves → forbidden

## Success gates (each PR)

`verify:preflight` · `verify:ci` · required GitHub checks · production `version.json` match · no mj-outside rise · no ceiling rise

## Checks confirmed at discovery

1. PR2 = RESOLVED_AND_DEPLOYED — yes
2. PR3 = MERGED_AND_DEPLOYED — yes
3. main matches production — yes (`723d27f6`)
4. No PR3 changes stuck on branch-only — tip is main
5. Open PRs #2299/#1791 do not reintroduce dark-token / select debt into this program
6. No Dark Token or Public Select regression at tip (mj-outside 0 · public selects 12)
