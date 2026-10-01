# Button Debt Progress

| Wave | Raw button files | Raw button elements | Notes |
|---|---:|---:|---|
| Pre-#2354 (main) | 265 | — | Baseline docs |
| #2354 W1 tip | 230 | 992 | Interaction debt cut |
| Wave 2 (measured) | **229** | **983** | Careful conversions only (PWA banner, Nations reset, AcademicResearch filters, KnowledgeGraph actions). Blind batch reverted (semantics). |
| Wave 3 (measured) | **227** | **978** | ResearchSubmit submit · UpdatePassword submit · CitationModal actions. No blind batch. |
| Phase 6 (residual absorb) | **168** | **650** | Privacy/Progress/Glossary/Circles/Updates/Upload/Contact/Support/Submit/UserStats/Alamat/Institutions/NewMuslim/Sects/UniCompare → Button/IconButton. No mushaf/admin. |

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

## Wave 3 conversions (intentional)

| File | Change |
|---|---|
| `ResearchSubmitPage.tsx` | Submit → `Button` |
| `UpdatePasswordPage.tsx` | Submit → `Button` |
| `CitationModal.tsx` | Copy / download / copy-link → `Button` |
