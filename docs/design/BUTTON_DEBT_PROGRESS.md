# Button Debt Progress

| Wave | Raw button files | Raw button elements | Notes |
|---|---:|---:|---|
| Pre-#2354 (main) | 265 | — | Baseline docs |
| #2354 W1 tip | 230 | 992 | Interaction debt cut |
| Wave 2 (measured) | **229** | **983** | Careful conversions only (PWA banner, Nations reset, AcademicResearch filters, KnowledgeGraph actions). Blind batch reverted (semantics). |

## Rules

- Use `Button` / `IconButton` / `Link` only.
- No blind `<button>` → `<Button>` rewrites.
- Do not convert `mj.Button` local alias without import rename.
- Preserve `role="tab"` / form submit semantics.
- Lower `rawButtonFiles` / `rawButtonElements` ceilings only after measured drop + green CI.

## Wave 2 conversions (intentional)

| File | Change |
|---|---|
| `PwaInstallBanner.tsx` | Install + dismiss → `Button` |
| `NationsPage.tsx` | Filter reset → `Button` |
| `AcademicResearchPage.tsx` | Filter apply/clear → `Button` |
| `KnowledgeGraphPage.tsx` | Expand + close → `Button` |
