# WAVE — Shubuhat Center W1

| Field | Value |
|---|---|
| Branch | `cursor/shubuhat-center-w1` |
| Base | `origin/main` @ Search Blocked Exclude (#2322) |
| Programs | 13 (doubt responses) · 1 (product honesty) |

## Scope Manifest

| Field | Value |
|---|---|
| Wave | SHUBUHAT_CENTER_W1 |
| Objective | Canonical center + contract + nav + provenance honesty |
| Confirmed defects | Product INTERNAL/HUB_ONLY; sources mostly empty; no dedicated nav |
| Root cause | Doubts lived only as discover-islam embed without Program 13 contract |
| Content impact | No new rebuttals; no invented sources |
| Religious-content impact | Display honesty only |
| Search impact | Remain EXCLUDED until PROVENANCE_COMPLETE |
| Rollback | Revert commit |

## Delivered

- Contract + docs + gate
- Product canonical `/discover-islam/doubts`
- Nav seed `shubuhat`
- Alias redirect `/shubuhat`
- Detail page: language, updated_at, missing-sources limitation

## Next safe waves

1. Enrich `sources[]` from approved references (human/editorial)
2. Related-question IDs + multilingual approved translations
3. Index PROVENANCE_COMPLETE rows into public search only
