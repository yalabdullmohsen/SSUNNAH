# BUTTON_DEBT_DELTA_AUDIT

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Branch | `cursor/design-system-css-authority` vs `origin/main` |
| Counter | `scripts/interaction-system-inventory.mjs` — splits CSS on `button\|btn\|fab`, counts `!important` / `#hex` in first 1200 chars of first 400 chunks **per file** |
| Ceilings | unchanged: important **1138**, hex **975** |

## CI fail

| Metric | Ceiling | Before this fix | After |
|---|---:|---:|---:|
| `buttonRelatedImportantApprox` | 1138 | 1139 | **1137** |
| `buttonRelatedHexApprox` | 975 | 976 | **975** |

No new `!important` or hex was added to button rules. Re-inlining + concatenating feature slices **moved original rules into different 1200-char windows**.

## Offenders (heuristic windows, not new CSS)

### 1. Extra `!important` (+1 net)

| File | Selector that opened the chunk | What the 1200-char window then counted | Original | Classification |
|---|---|---|---|---|
| `styles/design-system.css` | `.login-oauth__btn:disabled` | `.admin-table th/td { padding … !important; font-size … !important; }` | On main, admin-table (line 991) sat **before** oauth (line 1369). Concatenation put the whole admin cluster **after** auth, so those two `!important` fell inside the oauth button window. | KEEP_JUSTIFIED (admin-table still needs the declarations). Fixed by restoring admin-before-auth order. |
| (lost vs main) | `.content-submit-form button` | `.reading-toolbar-inline { display: none !important }` | Still in the file; no longer in that window | KEEP_JUSTIFIED |

Net before fix: −1 (toolbar) +2 (admin-table window) = **+1**.

### 2. Extra hex (+1 net)

| File | Selector that opened the chunk | Hex in window | Original | Classification |
|---|---|---|---|---|
| `styles/design-system.css` | `.hcz-row__move button` | `background: #fff` | On main this block was **after** the premium seal (line 2990), past the 400-chunk cap. Home concatenation pulled it into FEATURE mid-file. | KEEP_JUSTIFIED (`#fff` unchanged). Fixed by moving `hcz-*` / `hpv4-*` back to after the foundation seal (original order). |
| (window noise) | `.content-submit-form button` | `.am-modal { background: #fff }` | `am-*` was at file end on main | KEEP_JUSTIFIED |
| (lost vs main) | `.login-oauth__btn:disabled` | quiz-card `#f0f7f3` `#fefdf5` `#4b5563` | Home quiz no longer follows oauth | KEEP_JUSTIFIED |

## Minimum fix applied (no restyle)

1. **Admin cluster before auth cluster** — matches original line order (admin compact 991 → oauth 1369). Removes admin-table `!important` from the oauth button window.
2. **`hcz-*` / `hpv4-*` after foundation seal** — matches original line order (premium then customize). Drops the customize-button `#fff` from the first 400 chunks.

No token rewrite, no `!important` deleted, no ceiling change.

## Replacement candidates (not used — would be restyle or still count)

| Selector | Original | Candidate | Why unused |
|---|---|---|---|
| `.hcz-row__move button` | `#fff` | `inherit` / `var(--majalis-panel)` | inherit would fail rule-body preservation vs main; panel may not be `#fff` |
| `.admin-table th, td` | `!important` | remove | specificity risk; KEEP_JUSTIFIED |
| `.login-submit` / `.am-submit-btn` | `color: #fff` | `var(--mj-on-brand)` | not required once windows restored |

## Validation

`node scripts/interaction-system-inventory.mjs --check` → PASS  
`css-authority-graph-gate` (rule bodies vs `origin/main`) → PASS
