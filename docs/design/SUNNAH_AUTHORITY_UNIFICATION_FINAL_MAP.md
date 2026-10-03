# سُنّة — Authority Unification Final Map

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Tip | `74a38cac` |
| Rule | One authority per concern · adapters OK · parallel systems forbidden |

## Token Authority

| Role | Canonical files | Forbidden alternatives |
|---|---|---|
| Foundation SoT | `sunnah-foundation-tokens.css` (`--sf-*`), `sunnah-foundation-v2.css` (`--sf2-*`) | New `--sf3-*` / new token family CSS |
| Theme API / aliases | `ssunnah-theme-api.css`, `theme-aliases.css`, `app/styles/theme.css` | Page-local palette redefinition |
| Compatibility bridges | `design-tokens.css` (`--ss-*`), `tokens.css`, `brand-v4.css`, `visual-redesign-v2-tokens.css` | Treating bridges as SoT for new work |
| Motion / z-index | `motion-policy.css`, `z-index-layers.css` | Raw z-index in official components |

**Consumers:** sync graph in `main.tsx` (Foundation before aliases before polish).  
**Retirement:** bridges only after consumer count = 0 + parity + contrast PASS.

## Dark Mode Authority

| Role | Canonical | Notes |
|---|---|---|
| Mode keys | `html[data-theme=light\|dark]` + System via preference | No third palette |
| Semantic remap | Theme aliases + Dark Mode Authority doc | |
| Compatibility | `dark-mode-recovery.css` (sync), deferred `dark-mode-surfaces` / `dark-design-system` / `premium-dark-refine` | ACTIVE_COMPATIBILITY — not a second design system |
| Forbidden | Independent “night kit” tokens for new UI | |

## Interaction Authority

| Intent | Canonical | Forbidden |
|---|---|---|
| Action | `Button` | Clickable `div`/`span` when semantic control fits |
| Navigate | `Link` / wouter Link | Button-as-link without href semantics |
| Icon-only | `IconButton` | Unnamed icon `<button>` |
| Binary state | Toggle / Switch | Fake button toggles without state a11y |
| Menu | MenuTrigger | Ad-hoc absolute menus without focus trap policy |
| Interactive surface | `InteractiveCard` | Hover on non-interactive cards |

Docs/gates: `INTERACTION_COMPONENT_AUTHORITY.md` · `test:interaction-system-authority`.

## Card Authority

| Surface | Canonical |
|---|---|
| Default | `AppCard` |
| Interactive | `InteractiveCard` |
| Status / entry / nav | `StatusCard` · `SectionEntryCard` · `NavigationCard` |
| Elevation | `ElevatedSurface` · `InsetSurface` |
| Tokens | Card Surface Authority + Foundation |

Forbidden: new Card System v3 CSS/package. Gates: `test:card-surface-authority`.

## Form & Feedback Authority

Canonical: Input · Textarea · Select · Checkbox · Radio · Switch · FormLabel · FieldDescription · FieldError · Loading · Skeleton · Empty · NoResults · Error · Offline · Stale · PermissionDenied · RateLimited (Feedback V2).

Forbidden: Feedback V3 / parallel form kits. Gate: `test:form-feedback-authority`.

## Table Authority

Canonical: `ui/table` + `.ss-data-table` (`ssunnah-card-unify.css`).  
Map: `docs/design/TABLE_AUTHORITY_MAP.md`.  
Admin `.av3-table` / legacy `.admin-table` = SPECIAL_CASE.

## List Authority

Canonical façades: `SimpleList` · `InteractiveList` · `NavigationList` · `ResultList`  
→ ContentRow / SettingsList / VirtualList (`ListSystem.tsx`).  
Map: `docs/design/LIST_AUTHORITY_MAP.md`.

## Data Presentation Authority

Cards + tables + lists + `StatusBadge` + `FilterChips` + SsText metadata.  
Doc: `docs/design/DATA_PRESENTATION_AUTHORITY.md`. Gate: `test:table-list-authority`.

## Modal / Overlay Authority

Canonical: `Dialog` · `AlertDialog` · product `ConfirmDialog` · `AppBottomSheet` / `Sheet`.  
Maps: `MODAL_AUTHORITY_MAP.md` · `OVERLAY_AUTHORITY_MAP.md`.  
AdminConfirmDialog / Mushaf sheets = SPECIAL_CASE. Gate: `test:overlay-feedback-authority`.

## Feedback / Status Authority

Feedback V2 states + `Alert` + FieldError + StatusBadge.  
Maps: `FEEDBACK_AUTHORITY_MAP.md` · `STATUS_AUTHORITY_MAP.md`.  
Exit: `FEEDBACK_AUTHORITY_ONLY` · `STATUS_AUTHORITY_ONLY`.

## Tab Authority

Canonical: `ContentTabs` / `PageTabs` · `SegmentedFilter` for filters.  
Map: `TAB_AUTHORITY_MAP.md`. Gate: `test:tab-nav-authority`.  
Exit: `TAB_AUTHORITY_ONLY`.

## Navigation Authority

Canonical: `BottomNavBar` · `NavBar` · `SideNavDrawer` · `Breadcrumbs` · `config/navigation.ts`.  
Maps: `NAVIGATION_AUTHORITY_MAP.md` · `NAVIGATION_EXPERIENCE_AUTHORITY.md`.  
Exit: `NAVIGATION_AUTHORITY_ONLY` · `NAVIGATION_EXPERIENCE_UNIFIED`.

## Search / Filter / State / Responsive

Canonical search: `SearchInput` · `SearchResultCard` · `GlobalSearchModal` / `/search`.  
Canonical filters: `components/filters/*` (`SegmentedFilter` · `ActiveFilters` · sheets).  
State: Feedback V2 (= `STATE_AUTHORITY_ONLY`).  
Responsive: `breakpoints.css` only.  
Maps: `SEARCH_` · `FILTER_` · `STATE_` · `RESPONSIVE_AUTHORITY_MAP.md`.  
Gate: `test:search-filter-state-authority`.

## Color / Typography / Design Language

Canonical color roles: `COLOR_AUTHORITY_MAP` · `lib/color-authority.ts` → `--mj-*` / `--sf2-*`.  
Canonical type: `TYPOGRAPHY_AUTHORITY_MAP` · SsText · `typography-scale.css`.  
Language: `DESIGN_LANGUAGE_AUTHORITY.md`.  
Exit: `COLOR_AUTHORITY_ONLY` · `TYPOGRAPHY_AUTHORITY_ONLY` · `DESIGN_LANGUAGE_UNIFIED`.  
Gate: `test:color-typography-authority`.

## Spacing / Size / A11y / Contrast

Spacing: `--sf2-space-*` · `SPACING_AUTHORITY_MAP`.  
Size: `--touch-min` · icon boxes · `SIZE_AUTHORITY_MAP`.  
A11y: `ACCESSIBILITY_AUTHORITY_MAP` (+ `ACCESSIBILITY_STANDARD`).  
Contrast: `CONTRAST_AUTHORITY_MAP` + existing AA/on-brand gates.  
Exit: `SPACING_AUTHORITY_ONLY` · `SIZE_AUTHORITY_ONLY` · `ACCESSIBILITY_STANDARDIZED` · `CONTRAST_STANDARDIZED`.  
Gate: `test:spacing-size-a11y-contrast-authority`.

## Elevation / Border / Design Governance

Elevation LEVEL_0…4 → `--sf2-shadow-*` / `--mj-sh*` · `ELEVATION_AUTHORITY_MAP`.  
Border PRIMARY…FOCUS → hairline / brand / focus · `BORDER_AUTHORITY_MAP`.  
Automation: `scripts/design-governance-report.mjs` → DESIGN_AUTHORITY/DRIFT reports + consistency score.  
Exit: `ELEVATION_AUTHORITY_ONLY` · `BORDER_AUTHORITY_ONLY` · `DESIGN_GOVERNANCE_AUTOMATED`.  
Gates: `test:design-governance` · preflight `design-governance-preflight.mjs`.

## Unified Design Tokens Authority

Catalog: `DESIGN_TOKENS_AUTHORITY.md` · `lib/design-tokens-authority.ts`  
Logical paths (`color.primary`, `spacing.md`, …) → sf/mj/ss only.  
Compliance: `TOKEN_COMPLIANCE_REPORT` · `test:design-tokens-authority`.  
Exit: `DESIGN_TOKENS_AUTHORITY_ACTIVE` · `TOKEN_COMPLIANCE_ENFORCED` · `VISUAL_SYSTEM_UNIFIED`.

## Page Authority

Canonical: `AppPage` · `PageHeader` · Screen adapters (`DetailScreen`, …) per `PAGE_CONTRACT_MATRIX.md`.

Forbidden: new page shell framework. UtilityScreen: KEEP_JUSTIFIED allowlist only.

## Floating Authority

Canonical: `FloatingLayerManager` + `FLOATING_CONTROLS_POLICY.md`.

Forbidden: ad-hoc fixed FAB stacks outside manager policy.

## Identity cascade (post-WAVE7)

| File | Classification | Condition to retire |
|---|---|---|
| `visual-identity-unify.css` | ACTIVE_COMPATIBILITY (sync) | consumer rules absorbed + gate green |
| `dark-mode-recovery.css` | ACTIVE_COMPATIBILITY (sync) | same |
| Deferred reload-to-win of unify/recovery after `final-release` | **REMOVED** (WAVE7) | must not return — gated |
| `final-release.css` | KEEP / release overrides | shrink via absorption only |
| `design-system.css` | SAFE_REMOVE_CANDIDATE | unused proof + screenshots |
| `m2030/*` | KEEP campaign layer | migrate consumers first |
| `index.css` | CANONICAL shell + residual | further WAVE12-style batches |

## Import graph contract (`main.tsx`)

1. Foundation + Theme API (sync).  
2. Compatibility tokens / identity reset / typography / `index.css`.  
3. Theme aliases + sync polish (unify, calm, ux-polish, interaction-states, dark-mode-recovery).  
4. Deferred: z-index, motion, cards, brand contrast, final-release **without** re-import unify/recovery.  
5. Route/page CSS via route imports or `index-deferred-pages.css`.

## Gate

`artifacts/majalis/src/lib/__tests__/authority-unification-final-gate.test.ts`  
Wired as `test:authority-unification-final` → `test:sunnah-ui-refinement`.

## Non-claims

Does not claim zero CSS debt · no STORE GO · DEVICE_TESTED.
