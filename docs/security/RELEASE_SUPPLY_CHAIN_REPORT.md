# Release Supply Chain Report — Phase 6

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Lockfile | `pnpm-lock.yaml` (frozen installs) |
| Capacitor | `^8.4.1` (core/ios/android) |
| Node (this run) | see baseline |
| pnpm (this run) | see baseline |

## Findings (repository)

| Topic | Status | Notes |
|---|---|---|
| Frozen lockfile install | PASS | `pnpm install --frozen-lockfile` |
| Mass major upgrades | NOT_APPLICABLE | not performed in Phase 6 |
| License gate npm | PASS when `test:licenses` green | |
| Store asset gate | PASS when `verify:store-assets` green | |
| Secret in client configs | PASS heuristics | Capacitor placeholders; Config.xcconfig empty keys |
| Android/iOS appId mismatch | OWNER_ACTION | not a CVE; store identity risk |
| Advisory triage | PARTIAL | no blanket audit auto-fix; critical reachable = follow-up |
| Internal package publish | PASS | workspace private pattern |
| install scripts | PARTIAL | sharp ignored by pnpm policy |

## Policy

- No force resolutions to hide breakage.  
- No dependency confusion via public names for private packages.  
- Upgrade only for critical reachable issues with focused tests.
