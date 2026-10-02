# LICENSE_DECISION_MATRIX — Owner prep (no legal decisions by agent)

| Field | Value |
|-------|-------|
| Tip | `0c4e808f` MATCH |
| Updated | 2026-10-02 |
| Rule | Agent classifies only · Owner decides GRANT / STRIP / STREAM_ONLY |

| Asset class | Current repo posture | Classification | Owner options | Blocks |
|-------------|---------------------|----------------|---------------|--------|
| QPC / QUL fonts | Used on web Mushaf · store redistribute unclear | `GRANT_REQUIRED` or `STRIP_REQUIRED` | Written KFGQPC/QUL grant **or** permanent strip from Store flavor | STORE HOLD · native Mushaf fonts |
| Hisn Muslim edition | Corpus present / rights uncertain | `GRANT_REQUIRED` or replace | Permission letter **or** replace edition **or** feature-flag off | STORE HOLD |
| Quran recitations audio | Policy STREAM_ONLY · kill switch | `STREAM_ONLY` | Keep stream forever **or** signed offline ToS | Offline pack · Watch corpus |
| Adhan Istanbul CC0 | `CC0_ADHAN_REJECTED_QUALITY` | `OWNER_DECISION` | Keep rejected · find other CC0 · system sound | AUDIO_CERTIFIED |
| Adhan madinah / qatami | Not approved for production UI | `OWNER_DECISION` / keep blocked | Approve with rights evidence **or** permanent reject | Store audio packs |
| CAF / non-CC0 adhan packs | Risk for store binary | `STRIP_REQUIRED` (default safe) | Exclude from Store RC **or** clear rights | STORE HOLD |
| Books / lessons / fatwa bodies | Metadata-first · UNKNOWN bodies risk | `STRIP_REQUIRED` for UNKNOWN in RC | Metadata-only Store RC · clear sources | CONTENT_CERTIFIED |
| Images / third-party art | Catalog incomplete for store | `OWNER_DECISION` | Complete catalog · remove UNKNOWN | Attributions / store |

```text
CONTENT_CERTIFIED = false
AUDIO_CERTIFIED = false
STORE_SUBMISSION_READY = false
STORE_GO = false
```
