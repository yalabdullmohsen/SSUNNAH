# U4 READY PACK — Startup Chrome and CLS Closure

| Field | Value |
|-------|-------|
| Phase | **U4** Startup Chrome + CLS |
| Status | **LOCAL_CONTRACTS_PASS** — awaiting prod MATCH + measure |
| Unlocked by | `#2444` MERGED · tip/prod **`f864a975` MATCH** · Smoke 200 |
| Exit | `CHROME_FP_EQUALS_FINAL` / `STARTUP_CHROME_STABLE` |

## Root cause

1. Stripping `#mj-startup-chrome` on first `#root` child → Header/Bottom Jump.
2. `--app-top-chrome-h` omitted navbar `padding-block-start: max(inset,12px)` → 48→65 rect jump.
3. `--nav-h` overwritten mid-boot (56 vs 64) → Bottom Jump.
4. Clearing `data-sc` removed `#root` padding while chrome left `position:fixed` → **CLS on `.app-shell`**.

## Fix

- Wait for React chrome (`isStartupChromeReady`) before skeleton remove.
- Keep `data-sc` after boot (App maintains it) — fixed chrome + padding reserve.
- Lock `--app-top-chrome-h` to **65px** (non-home) / **113px** (home) on `data-sc=top`.
- Bottom skeleton **height:64px** (not clobberable `--nav-h`).
- Home hero placeholder `mj-startup-hero-ph` (measure prefers real `.page-hero-mj`).
- Prayer keeps bottom ph; Mushaf strips full skeleton.

## Local measure (`zero-startup-flicker-local-u4`)

| Route | CLS | H/Hero/Nav Jump |
|-------|----:|-----------------|
| `/` | **0.0003** | 0/0/0 |
| `/search` | **0** | 0/0/0 |
| `/quran-hub` | **0** | 0/0/0 |
| `/mushaf` | **0** | 0/0/0 |
| `/prayer-times` | **0** | 0/0/0 |

Tool: `artifacts/majalis/scripts/measure-startup-flicker-u4.mjs` · 390×844 @2x · Hero Jump = presence only (CLS owns content rect).

## Forbidden

Splash longer · artificial delay · `overflow:hidden` · snapshot update to hide regression.

## Gates

`test:u4-startup-chrome` · `test:zero-startup-flicker` · `test:cls-home-gate`

## Exit

Production re-measure after MATCH → claim `STARTUP_CHROME_STABLE`.
