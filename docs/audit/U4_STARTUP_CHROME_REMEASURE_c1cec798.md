# U4 Startup Chrome — Remeasure on tip `c1cec798`

| Field | Value |
|-------|-------|
| Measured | 2026-10-02T22:25Z |
| Tool | `measure-startup-flicker-u4.mjs` · cache disabled · 390×844 @2x |
| URL | `https://www.ssunnah.com` · production MATCH tip |
| Code base | includes #2480 flow-reserve + #2481 hus/tab geometry |

## CLS contract (&lt; 0.01)

| `home` | 0.063501 | **FAIL** |
| `search` | 0.007209 | **PASS** |
| `quran-hub` | 0.006615 | **PASS** |
| `mushaf` | 0.000000 | **PASS** |
| `prayer-times` | 0.001985 | **PASS** |

## Exit

**NOT CLOSED** — `STARTUP_CHROME_STABLE` blocked by Home cold CLS ≥ 0.01.
Prayer / Search / Quran-hub / Mushaf meet CLS &lt; 0.01 on this tip.
Home residual emitters (top): `home-start-here` · `bottom-nav__tab` · `home-start-here-band` · `page-hero-mj`.
No artificial min-height inflation added in Batch A.
