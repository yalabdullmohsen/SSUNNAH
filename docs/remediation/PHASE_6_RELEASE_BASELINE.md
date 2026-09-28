# PHASE 6 — Release Baseline

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/release-rc-stabilization-p6` |
| Tip (Phase 5) | `7716977d7` |
| Worktree | `/Users/alabdullmohsen/wt-release-rc-p6` |
| Node | `v24.17.0` |
| pnpm | `10.34.4` |
| Capacitor (package) | `^8.4.1` |
| Dirty files at start | none |

## Commands measured (pre / during Phase 6)

| Command | Result | Notes |
|---|---|---|
| `pnpm install --frozen-lockfile` | **Pass** | 8.5s |
| `pnpm run verify:preflight` | **Pass** | 0.7s |
| `pnpm run typecheck` | **Pass** | ~29s |
| `pnpm run verify:store-assets` | **Pass** | |
| `pnpm --filter @workspace/majalis run test:prayer-engine-p0` | **Pass** | |
| `pnpm --filter @workspace/majalis run test:ios-gates` | **Pass** | |
| `pnpm run verify:ci` | **Pass** | ~296s then fingerprint cache |
| `pnpm run release:verify` | **Pass** | verdict TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS · STORE HOLD |
| iOS Archive / signed IPA | **BLOCKED_CREDENTIAL** | not run |
| Android signed AAB | **BLOCKED_CREDENTIAL** | not run |
| Real device matrices | **DEVICE_REQUIRED** | not run |
| ASC / Play upload | **OWNER_ACTION** | not run |

## Identity findings (measured)

| Key | Value |
|---|---|
| Capacitor appId | `com.yousef.majlisilm` |
| iOS Bundle ID | `com.yousef.majlisilm` |
| Android applicationId | `com.majlisilm.app` |
| server.url | `https://www.ssunnah.com` |
| cleartext | false |
| localhost in capacitor config | absent |

## Prior phases tip chain

| Phase | Tip |
|---|---|
| P4 content/perf | `b64319d06` |
| P5 design/UX | `7716977d7` |
| P6 (this) | branch from P5 tip |

## Constraints honored

No merge · no Vercel deploy · no TestFlight/Play upload · no appId change · no signing · no hosted SQL · no religious text/page-map changes · no invented licenses · no STORE GO.


## FINAL (measured)

| Item | Value |
|---|---|
| `release:verify` | PASS · 40 steps |
| Verdict | TECHNICALLY_VERIFIED_WITH_EXTERNAL_BLOCKERS |
| Store status | HOLD |
| warning | Android applicationId ≠ Capacitor appId |
| ENOSPC during first verify:ci | Class C — freed old worktree node_modules; retried once |
| Key report | `reports/release-candidate/release-verify-report.json` |
