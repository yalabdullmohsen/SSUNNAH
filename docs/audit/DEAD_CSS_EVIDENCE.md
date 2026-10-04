# DEAD_CSS_EVIDENCE

| ID | File | Classification | Proof |
|---|---|---|---|
| E0 | `styles/pages/fiqh-council-section.css` | DEAD_WITH_PROOF_AND_REMOVED | prior #2561; gate asserts absence |
| E1 | `styles/pages/more-page.css` | DEAD_WITH_PROOF_AND_REMOVED | no import; no TSX `more-page-*`; route redirects |
| E2 | `styles/components/chunk-recovery-toast.css` | DEAD_WITH_PROOF_AND_REMOVED | no import; component `return null` |
| E3 | Uncommented empty selectors | DEAD_WITH_PROOF_AND_REMOVED | PR F sweep (fm-child, unused block variants, …) |
| E4 | Comment-only empty anchors | KEEP_SPECIAL_WITH_EVIDENCE | Back Authority P7, drawer-root, status-strip exclusions, pressable card carve-out |

No text-search-only deletions. Micro-sheet explosion remains forbidden.

DEAD_CSS_GROWTH_PREVENTED = true
