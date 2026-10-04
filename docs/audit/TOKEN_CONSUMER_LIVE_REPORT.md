# TOKEN_CONSUMER_LIVE_REPORT

TASK_CLASSIFICATION: SHARED_PLATFORM
Source: PR B branch on `c3e8a3e37` (post-migration)

| Family | Status | Notes |
|---|---|---|
| `--sf-*` | CANONICAL | refs ↑ (floor 1220) |
| `--ss-*` | CANONICAL | refs held (floor 769) |
| `--mj-*` | CANONICAL | primary migration destination |
| `--cs-*` | CANONICAL (Card bridge) | unchanged |
| `--ds-*` | SEMANTIC_BRIDGE_REQUIRED | DS/startup contract kept |
| `--elite-*` | MOSTLY_MIGRATED | ~10 refs remain (`--elite-forest` dark bridge + KEEP sites) |
| `--em-*` | SEMANTIC_BRIDGE (theme-aliases) | brand-v4 hex literals removed; external consumers → `--mj-brand*` |
| `--msk-*` / `--majalis-*` | KEEP_COMPATIBILITY | high consumer counts |
| `--color-*` | PRODUCT dual | unchanged |
| `--dm-*` / `--pd-*` | KEEP_COMPATIBILITY | dark recovery / premium-dark |
| `--brand-*` | KEEP_COMPATIBILITY | brand-v4 / theme dual |

TOKEN_AUTHORITY_SINGLE = false (bridges remain; growth prevented; elite/em debt reduced)

Measured after PR B:

- cssFiles 355
- important 4739 (ceiling lowered)
- hexInCss 5601 (ceiling lowered)
- buttonRelatedImportantApprox 1138
- buttonRelatedHexApprox 973 (ceiling lowered)
