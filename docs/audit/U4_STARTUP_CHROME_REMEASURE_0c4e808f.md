# U4 Startup Chrome — Remeasure on tip `0c4e808f`

| Field | Value |
|-------|-------|
| Measured | 2026-10-02T20:53Z |
| Tool | `artifacts/majalis/scripts/measure-startup-flicker-u4.mjs` |
| Base | `https://www.ssunnah.com` |
| version.json | `0c4e808f` MATCH |
| Evidence | `docs/performance/evidence/u4-startup-0c4e808f/` |
| Contract | Chrome jumps = 0 · Theme mut = 0 · CLS &lt; 0.01 per route · `CHROME_FP_EQUALS_FINAL` |

## Results (390×844 @2x)

| Route | FP (ms) | CLS | Theme | H/Hero/Nav/Back | Contract |
|-------|--------:|----:|------:|----------------:|----------|
| `/` | 792 | **0.0128** | 0 | 0/0/0/0 | **FAIL** CLS |
| `/search` | 1004 | **0.0023** | 0 | 0/0/0/0 | **PASS** |
| `/quran-hub` | 972 | **0.0020** | 0 | 0/0/0/0 | **PASS** |
| `/mushaf` | 812 | **0** | 0 | 0/0/0/0 | **PASS** |
| `/prayer-times` | 916 | **0.0127** | 0 (bgΔ=1) | 0/0/0/0 | **FAIL** CLS |

## Top CLS culprits (live)

- Home: `home-start-here--compact` + bottom-nav tabs (~0.0086) · then hero/start-here band (~0.004)
- Prayer: `lrf-skel--prayer` → real shell + bottom-nav (~0.011)

## Exit

**NOT CLOSED** — `STARTUP_CHROME_STABLE` / `CHROME_FP_EQUALS_FINAL` still blocked by Home + Prayer CLS ≥ 0.01.

Progress vs prior FAIL on `459878cf`: Search improved 0.0304 → **0.0023 PASS**; Home 0.1267 → **0.0128** (closer); Prayer still ~0.0127.

## Next fix lane (no min-height hacks)

1. Flow-level home reserve for start-here/hero band so bottom-nav does not co-shift.
2. Align prayer Suspense skel geometry with final `pts` shell (equal-height silent fallback).
3. Re-measure production after merge.
