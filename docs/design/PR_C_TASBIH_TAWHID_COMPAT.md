# PR C — Tasbih / Tawhid compatibility retirement

| Field | Value |
|---|---|
| Branch | `cursor/design-pr-c-tasbih-tawhid-compat` |
| Base | `origin/main` `c63de6b0e` |
| TASK_CLASSIFICATION | SHARED_PLATFORM |

## Model

| Feature | Sole owner for shared base | Route file retains |
|---|---|---|
| Tasbih `.tc-*` / wird pills / ring | `design-system.css` FEATURE | `pages/tasbih.css` page chrome + **sole** `.tasbih-add-row` |
| Tawhid `.tawheed-type-card*` / grid / hadith badge | `design-system.css` FEATURE | `pages/tawhid.css` hub/v2-app compounds + `.twh-*` |

## Removed dual ownership

- DS `.tasbih-add-row` → absorbed into `pages/tasbih.css`
- Page base `.tawheed-type-card*` / `.tawheed-types-grid` / `.tawheed-hadith-badge*` → absorbed into DS
- Deferred theme cluster no longer includes `.tawheed-type-card`

## Integrity

- Quran ayah CSS blocks unchanged in content (typography/cite only as before)
- Reduced-motion for `.tc-ring-btn--pulse` unchanged in DS
- Page files not deleted (exclusive route rules remain > 0)

## Gate

`css-authority-graph-gate` allowlists absorbed bodies; asserts DS winners + no `.tasbih-add-row` in DS.
