# Release Asset License Matrix — Phase 6

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Related | `LICENSE_RISKS.md` · `docs/store-release/STORE_LICENSE_DECISIONS.md` · `verify:store-assets` |
| Store effect | Any bundled BINARY asset = BLOCKED_LICENSE or UNKNOWN ⇒ **STORE HOLD** |

Decisions: `APPROVED` · `APPROVED_WITH_ATTRIBUTION` · `WEB_ONLY` · `STREAM_ONLY` · `DO_NOT_BUNDLE` · `BLOCKED_LICENSE` · `BLOCKED_SOURCE` · `UNKNOWN` · `REMOVE_CANDIDATE`

## High-impact assets

| Asset / class | Runtime | Decision | Evidence |
|---|---|---|---|
| UI fonts Amiri (OFL) | bundled web/fonts | APPROVED_WITH_ATTRIBUTION | fonts-ui + CREDITS |
| QPC Quran fonts | bundled / CDN | BLOCKED_LICENSE until written clearance | LICENSE_RISKS |
| Madinah page images | not in repo | DO_NOT_BUNDLE / BLOCKED_SOURCE | LICENSE_RISKS |
| Hisn Muslim texts | app content | BLOCKED_LICENSE / OWNER_ACTION | LICENSE_RISKS |
| Adhan `system-default` | OS | APPROVED | catalog filter |
| Adhan field / field-full CC0 | selectable | APPROVED when verified_for_production | rights registry |
| Adhan Istanbul Commons CC0 | candidate rejected | DO_NOT_BUNDLE · `CC0_ADHAN_REJECTED_QUALITY` (T-027) | HUMAN_QA_RECORD.md |
| Adhan store v1 primary | OS | APPROVED `system-default` | AUDIO_RELEASE_ALLOWLIST.json |
| Adhan madinah / qatami | blocked | DO_NOT_BUNDLE | approvedForProduction:false |
| everyayah / mp3quran | stream | STREAM_ONLY | LICENSE_RISKS |
| Embedded `public/sounds/adhan` unresolved | binary risk | DO_NOT_BUNDLE for store RC | store strip policy |
| npm MIT/Apache deps | bundled JS | APPROVED (gate) | `test:licenses` |
| GPL/AGPL pure | — | REMOVE_CANDIDATE / fail gate | `test:licenses` |
| Library books source_missing | public hidden | BLOCKED_SOURCE | prior waves |

Absence of a license file is **not** APPROVED.

Gate: `pnpm run verify:store-assets` + `pnpm --filter @workspace/majalis run test:licenses` + this matrix.
