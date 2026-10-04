# INTERACTION_DEBT_EXACT_DELTA_PROVEN

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Branch | `cursor/design-system-css-authority` vs `origin/main` |
| Scanner | `artifacts/majalis/scripts/interaction-system-inventory.mjs --check` |
| Split | `(?=[.#\[]?[a-zA-Z_-]*(?:button\|btn\|fab\|action-btn\|icon-btn))` |
| Window | first 400 chunks / file; `!important` and `#[0-9a-fA-F]{3,8}` in first 1200 chars of chunks whose first 80 chars match `button\|btn\|fab` |
| Ceilings | unchanged: important **1138**, hex **975** |

## Measured (same scanner as CI)

| Source | `buttonRelatedImportantApprox` | `buttonRelatedHexApprox` |
|---|---:|---:|
| origin/main `design-system.css` only | 6 | 15 |
| ed737b841 `design-system.css` only | 7 | 16 |
| Repo-wide ed737b841 | **1139** | **976** |
| After exact-delta fix | **≤1138** | **≤975** |

No new button `!important` or hex was authored. Re-inlining feature slices moved original rules into different 1200-char / 400-chunk windows.

## Extra `!important` (+1 net)

| File | Chunk opener | Counted declaration | origin/main | Branch (ed737) | Duplicate? | Active? | Safe to remove? |
|---|---|---|---|---|---|---|---|
| `styles/design-system.css` | `.login-oauth__btn:disabled` | `.admin-table th, td { padding: 0.4rem 0.625rem !important; font-size: var(--ds-text-xs) !important; }` | admin-table @ L991 **before** oauth @ L1369, so those two `!important` were **outside** the oauth 1200-char window | Auth concatenated before admin; both `!important` fall inside the oauth button window | No. Single admin compact rule. | ACTIVE — admin compact tables | No — table cells still need the compact override vs competing table CSS. Classification: **KEEP_JUSTIFIED** |
| (lost vs main) | `.content-submit-form button` | `.reading-toolbar-inline { display: none !important }` | Counted on main | Still in the file; no longer in that window | — | KEEP_JUSTIFIED | — |

Net windowing: −1 (toolbar) +2 (admin-table) = **+1**.

**Fix applied (not window-shifting):** drop one unjustified button `!important` in PR scope.

| File | Selector | Property | Line (ed737) | Why `!important` is unnecessary |
|---|---|---|---:|---|
| `styles/design-system.css` | `.ui-card-btn--danger` | `color` | 211 | Specificity `(0,2,0)` already beats `.ui-card-btn { color: #fff }` `(0,1,0)` in the component region, `index.css`, and premium (premium does not set `color`). No later `!important` competitor. `border-color` / `background` keep `!important` so premium `.ui-card-btn { background; border-color }` cannot wash out the danger surface if a later equal-weight shorthand appears. |

Before: `color: #dc2626 !important;`  
After: `color: #dc2626;`

## Extra Hex (+1 net)

| File | Selector | Property | Hex | Line (ed737) | origin/main | Semantic role | Token |
|---|---|---|---|---:|---|---|---|
| `styles/design-system.css` | `.hcz-row__move button` | `background` | `#fff` | 994 | After premium seal (~L2990), **past the 400-chunk cap**, so uncounted | Raised white chip on home customize move controls (`HomeCustomizeSheet`) | `--sf-color-warm-ivory-surface` (`#ffffff` in `sunnah-foundation-tokens.css`; dark overrides `--sf-surface-raised`, **not** this token, so light/dark stay `#ffffff`) |

Window noise (not the net +1): `.content-submit-form button` window also sees `.am-modal { background: #fff }`. Lost vs main: oauth window no longer sees quiz-card `#f0f7f3` `#fefdf5` `#4b5563`.

Before: `background: #fff;`  
After: `background: var(--sf-color-warm-ivory-surface);`

Not used: `--mj-on-brand` (inverts to `#06231A` in dark), `--sf-surface-raised` (dark → luxury night), `--mj-surface` (theme surface, not always white).

## Reassembly duplication (listed selectors)

Repeated selector names are original COMPONENT + premium (or base + hover) blocks from origin/main, not copies introduced by inlining the 18 sheets.

| Selector | Classification |
|---|---|
| `.ds-btn` `.ui-card-btn` `.page-action-btn` `.login-submit` | **ACTIVE_CANONICAL** in COMPONENT region; later premium polish is **COMPATIBILITY_REQUIRED** (same as main) |
| `.ui-card-btn--danger` | **ACTIVE_CANONICAL** (variant kept; no TSX className today, still the documented danger surface) |
| `.hcz-row__move button` | **ACTIVE_CANONICAL** — `HomeCustomizeSheet` IconButtons |
| `.login-submit` extra FEATURE mention | **COMPATIBILITY_REQUIRED** |
| `.btn-primary` `.btn-secondary` `.push-prompt__btn` `.content-submit-form button` `.ruling-pagination button` `.am-submit-btn` `.navbar-menu-btn` `.navbar-login` `.miracle-item__toggle` `.tasbih-wird-pill` `.tc-ring-btn` `.ds-filter-toggle` `.content-hub-chip` `.quran-subnav__link` `.ds-quiz-home-card__btn` `.lsw-featured__cta` | **ACTIVE_CANONICAL** (base/hover/disabled, not reassembly clones) |

No `DUPLICATE_FROM_REASSEMBLY`. No `DEAD_WITH_PROOF` deleted.

## What this fix does not do

- Does not restore admin-before-auth or hcz-after-premium to hide tokens from the 400-chunk / 1200-char windows
- Does not recreate extracted CSS files
- Does not raise ceilings, weaken the scanner, add inventory allowlists, or convert hex to rgb

## Required flags

INTERACTION_DEBT_EXACT_DELTA_PROVEN  
BUTTON_RELATED_IMPORTANT_APPROX_WITHIN_BUDGET  
BUTTON_RELATED_HEX_APPROX_WITHIN_BUDGET  
NO_METRIC_GAMING  
NO_BUDGET_CHANGE  
NO_GATE_WEAKENING  
NO_AUTHORITY_ROLLBACK  
