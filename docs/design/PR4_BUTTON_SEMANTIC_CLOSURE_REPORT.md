# PR4 — Button & Semantic Interaction Closure

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (awaiting merge/deploy) |
| Branch | `cursor/final-internal-closure-pr4` |
| Baseline main | `723d27f62` (#2366) · production MATCH |
| Authority | `INTERACTION_COMPONENT_AUTHORITY.md` |
| Budget | decreasing-ceilings · `interaction-system-debt-budget.json` |

## Metrics

| Metric | Pre-PR4 | Post-PR4 | Δ |
|---|---:|---:|---:|
| rawButtonFiles | 225 | **212** | −13 |
| rawButtonElements | 971 | **917** | −54 |
| official Button import files | 139 | **151** | +12 |
| IconButton consumers | 28 | **31** | +3 |
| divSpanOnClick | 59 | 59 | 0 |
| formButtonsMissingType | 0 | 0 | 0 |
| public native selects | 12 | 12 | 0 (PR5) |
| mjDeclOutsideAllowlist | 0 | 0 | 0 |

## Migrated files (USE_BUTTON / USE_ICON_BUTTON / USE_LINK)

| File | Classification | Notes |
|---|---|---|
| `ErrorBoundary.tsx` | USE_BUTTON + USE_LINK | Escape nav stays `<a>` |
| `SectionErrorBoundary` (same) | USE_BUTTON | Retry / hard recover |
| `reading/ContentActionBar.tsx` | USE_BUTTON + USE_LINK | Settings remains Link |
| `ShareFaida.tsx` | USE_BUTTON + USE_ICON_BUTTON | loading + aria-busy |
| `CrossDeviceResumeToast.tsx` | USE_BUTTON | Toast chrome CSS deferred to PR7 |
| `filters/UnifiedPrimaryFilters.tsx` | USE_BUTTON | Filter chips `aria-pressed` |
| `citation/CitationActionBar.tsx` | USE_BUTTON | Tooltip + toolbar |
| `citation/CitationModal.tsx` | USE_BUTTON + USE_ICON_BUTTON | Dialog actions + loading save |
| `fawaid/FaidaImageCardModal.tsx` | USE_BUTTON + USE_ICON_BUTTON | Download loading |
| `onboarding/FirstVisitIntro.tsx` | USE_BUTTON | Mark-seen + navigate (not pure Link) |
| `majlis/SmartSearchPanel.tsx` | USE_BUTTON + USE_ICON_BUTTON | Tabs + rows |
| `reading/HighlightedContentCard.tsx` | USE_BUTTON | Collapse / local reading |
| `rulings/RulingCategoryGrid.tsx` | USE_BUTTON | Fiqh hub filters |
| `prophets/ProphetStoryTabs.tsx` | USE_BUTTON | role=tab preserved |

## Remaining debt (justified / deferred)

| Bucket | Count / scope | Owner wave |
|---|---|---|
| Quiz / game raw buttons | IslamicQuizGame etc. | Follow-up / product |
| Mushaf audio chrome | MUSHAF_SPECIAL | PR7 |
| Admin review-hub bulk | ADMIN_ONLY | Separate admin wave |
| `div`/`span` onClick | 59 | Classify in PR5/PR7; EVENT_DELEGATION / FALSE_POSITIVE |
| Pressable / drag handles | NATIVE / DRAG_HANDLE | Keep |
| Third-party wrappers | THIRD_PARTY_WRAPPER | Keep |

## Contracts enforced in migrated surfaces

- Default `type="button"`
- Explicit `loading` + `aria-busy` on async (share, save, PNG)
- Icon-only → `IconButton` with `label`
- Navigation escape → `<a>` / `Link` (not Button)
- No new `!important`, raw hex, token families, or design systems
- No Mushaf text/mapping or prayer calc changes

## CLASSIFICATION summary (inventory wave)

| Class | Action |
|---|---|
| USE_BUTTON | Done for listed shared files |
| USE_ICON_BUTTON | Close / share icons / search chrome |
| USE_LINK | ErrorBoundary escapes · ContentActionBar settings |
| MUSHAF_SPECIAL | Excluded |
| ADMIN_ONLY | Excluded (except shared Citation/AdminInline untouched bulk) |
| NATIVE_BUTTON_JUSTIFIED | Quiz timing / Pressable — documented keep |
| FALSE_POSITIVE | Button component source itself |
| BLOCKED | None blocking PR4 merge |

## Success gates

- `test:interaction-system-debt-budget`
- `test:interaction-system-authority`
- `test:final-internal-closure-pr4`
- `verify:preflight` · `verify:ci`
- visual-snapshot / contrast as required by CI
- Production smoke after deploy
