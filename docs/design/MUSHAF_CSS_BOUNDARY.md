# Mushaf CSS Boundary — Interaction PR-9

| Field | Value |
|---|---|
| Status | **BOUNDARY (Interaction PR-9)** |
| Scope | CSS ownership for live `/mushaf` vs archived Madinah tree |
| Quran text | **IMMUTABLE** — no edits to ayah text, tashkeel, or QPC mapping |
| Store | **HOLD** · Web `WEB_RELEASED_NATIVE_HOLD` |

Companion: `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` · `docs/design/DARK_MODE_AUTHORITY.md` (MUSHAF_SPECIAL).

## Trees

| Tree | Role | Route |
|---|---|---|
| `features/mushaf-reader/` | **LIVE** reader (`NewMushafReader`) | `/mushaf` via `MushafReaderPage` |
| `features/mushaf-madinah/` | **ARCHIVED** reader (`VerifiedMushafReader`) + compatibility CSS/helpers | Gates / lazy sheets only — **not** the production viewport |
| `features/mushaf-shared/` | Neutral shared TS (no CSS SoT) | Imported by both |
| `styles/fonts-quran.css` | Scripture font face load | Lazy / route-scoped with mushaf/quran |
| `styles/quran.css` · hub/player CSS | Quran **hub / non-immersive** surfaces | Not the immersive page ink contract |
| `styles/reader-page-chrome.css` | Chrome polish after reader CSS | Loaded after `mushaf-reader.css` |

### Live CSS (author here)

- `features/mushaf-reader/mushaf-reader.css`
- `features/mushaf-reader/mushaf-display-mode-control.css`
- `features/mushaf-reader/page-goto-dial.css`
- Appearance tokens in reader TS (`data-mushaf-appearance` / warm-yellow / signature presets)

### Archived / compatibility CSS (isolate)

- `features/mushaf-madinah/mushaf-madinah.css` (+ `@import` fonts + `quran-sheet/`)
- `features/mushaf-madinah/mushaf-tafsir-sheet.css`
- `features/mushaf-madinah/quran-sheet/quran-sheet.css`

**Known bridge (documented, not a free merge):** live `NewMushafReader` still imports `mushaf-madinah.css` for `.mm-*` shell classes. Removal is **BLOCKED** until shell CSS is extracted to `mushaf-shared` (or equivalent) with gates green. Do not treat this import as license to grow Madinah CSS for new product chrome.

## Isolation rules

1. **No product-theme binding of page ink** — mushaf paper / QPC ink / waqf must not ride `html[data-theme="dark"]` as SoT; use mushaf appearance (`data-mushaf-appearance` / reader tokens).
2. **No brand cascade pollution** — do not move mushaf page rules into `brand-v4` / `m2030` / `final-release` / Foundation public layers.
3. **No `!important` hide** — forbidden to paper over chrome leaks with `display:none !important` / overflow clips as the fix; fix ownership or specificity.
4. **No Quran text mutation** — CSS/layout only; never alter ayah strings, tashkeel, or protected Quran data bytes.
5. **Archived tree is not production entry** — `/mushaf` must resolve to `NewMushafReader`; `VerifiedMushafReader` stays off the live page import graph.
6. **Lazy sheets stay lazy** — tafsir/search sheets from Madinah remain dynamic imports; do not hoist into critical first paint of the reader.
7. **Debt / retirement** — Madinah CSS is **BLOCKED** for SAFE_REMOVE until the live `.mm-*` bridge is retired with proof.

## Forbidden claims

`FULLY COMPLETE` · `STORE GO` · “mushaf CSS fully retired” · “Madinah tree deleted”

## Gates

```bash
pnpm --filter @workspace/majalis run test:mushaf-css-boundary
pnpm --filter @workspace/majalis run test:legacy-css-retirement
```
