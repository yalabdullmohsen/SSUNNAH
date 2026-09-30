# Startup Typography FOUC — Phase 2 Scope Manifest

| Field | Value |
|---|---|
| Phase | 2 — Fallback `size-adjust` calibration |
| Branch | `cursor/startup-typography-fouc-p2-v2` |
| Base | latest `origin/main` at start (`93136b271`) |
| Goal | Reduce fallback↔Amiri width jump; sync critical + fonts-ui + index.html |
| Posture | `WEB_RELEASED_NATIVE_HOLD` |

## Objective

After P1 fixed rem authority, measure and set `MajlisAmiriFallback` / `MajlisFallback` `size-adjust` to the value that minimizes width delta vs Amiri 400 (live: **97%**, Δ13.83 vs 105% Δ32.97).

## In scope

| Item | Deliverable |
|---|---|
| Measurement | `scripts/measure-ui-fallback-metrics.mjs` + `reports/ui-fallback-metrics.json` |
| Sync surfaces | `fonts-ui.css` · `critical-first-paint.css` · `index.html` `#mj-lcp-critical` |
| Gate | `startup-typography-fouc-p2-gate.test.ts` + package script |
| Docs | Phase 2 scope · baseline additive note · REPO_INDEX / status tip |

## Out of scope

- New typography / token / theme system
- Quran / mushaf QPC fonts / prayer / adhan
- Dark cascade absorption (later phase)
- Card / button debt waves
- Admin FINAL-2+
- Raising debt ceilings
- Device CLS matrix (DEVICE_REQUIRED)

## Acceptance

1. Metrics prefer 97% over 105% with recorded deltas.
2. Three surfaces agree on `size-adjust: 97%` for Majlis*Fallback.
3. P1 `html` calc authority still holds.
4. Focused gate + `verify:preflight` + `verify:ci` PASS.
5. PR MERGED · Auto Deploy SUCCESS · `version.json` MATCH · smoke PASS.

## Tests

- `pnpm --filter @workspace/majalis run test:startup-typography-fouc-p2`
- `pnpm --filter @workspace/majalis run test:startup-typography-fouc-p1` (regression)
- `pnpm run verify:preflight` then `pnpm run verify:ci`

---

## IMPLEMENTATION_FROZEN

**Declared:** after size-adjust sync + measurement + gate land.

After this marker: no general search expansion · no later-phase requirements · no files outside this manifest · no opportunistic cleanup · no next phase until MERGED + MATCH + smoke-clean.
