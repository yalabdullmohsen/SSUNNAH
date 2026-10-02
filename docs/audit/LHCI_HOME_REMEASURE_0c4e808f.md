# LHCI Home Mobile — Remeasure on tip `0c4e808f`

| Field | Value |
|-------|-------|
| Measured | 2026-10-02T20:58Z |
| Tool | `@lhci/cli@0.15.1` · `lighthouserc.cjs` · 3 runs |
| URL | `https://www.ssunnah.com/` (production MATCH tip) |
| Thresholds | `lhci-thresholds.cjs` **unchanged** |

## Numeric contract

| Audit | Required | Runs | Selected | Result |
|-------|----------|------|----------|--------|
| unused-css-rules | ≤ 80 (min) | 150 / 150 / 150 | **150** | **FAIL** |
| unused-javascript | ≤ 500 (min) | 300 / 300 / 300 | **300** | PASS |
| forced-reflow-insight | score ≥ 1 **all runs** | 1 / 1 / 0 | unstable | **FAIL** |

## Exit

**NOT CLOSED** — `LHCI_HOME_MOBILE_CLOSED` not claimed on tip `0c4e808f`.

Prior T-003 local PASS on older tip does **not** transfer without re-proof on current main.
