# DESIGN_SYSTEM_SELECTOR_INVENTORY

| Field | Value |
|---|---|
| Date | 2026-10-04 |
| Source | `artifacts/majalis/src/styles/design-system.css` |
| Initial lines | 3147 |
| Initial bytes | 85391 |
| Phase | 0 — live inventory after exact-line partition |

CONSUMER METHOD: literal class token search across `artifacts/majalis/src` (`.ts/.tsx/.js/.css`). DYNAMIC = string/template hit without a class-attribute token. KEEP_TEMPORARILY = zero hits; **not deleted** (Phase 6: NO_UNPROVEN_CSS_DELETION).

## Totals

| Category | Selectors |
|---|---:|
| ADMIN_FEATURE | 7 |
| UTILITY | 74 |
| NAVIGATION | 6 |
| FOUNDATION | 22 |
| COMPONENT | 46 |
| LAYOUT | 14 |
| SEARCH | 18 |
| HOME_FEATURE | 64 |
| AUTH_FEATURE | 8 |
| LEARNING_SEASONS_FEATURE | 16 |
| TASBIH_FEATURE | 29 |
| CONTENT_PROSE | 7 |
| TAWHID_FEATURE | 21 |
| USER_STATS_FEATURE | 8 |
| ALL | 340 |

## Selectors

| Selector | Category | File | Lines | TSX | CSS | Dynamic | Consumers | Status | Dup | Authority target |
|---|---|---|---|---:|---:|---:|---:|---|---|---|
| `.admin-bootstrap-flag` | ADMIN_FEATURE | `styles/features/admin.css` | 1329-1367 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/admin.css |
| `.admin-bootstrap-flag--ok` | ADMIN_FEATURE | `styles/features/admin.css` | 1329-1367 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/admin.css |
| `.admin-bootstrap-owner-actions` | ADMIN_FEATURE | `styles/features/admin.css` | 1329-1367 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/admin.css |
| `.admin-feature-status__bootstrap-grid` | ADMIN_FEATURE | `styles/features/admin.css` | 1329-1367 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/admin.css |
| `.admin-feature-status__head` | ADMIN_FEATURE | `styles/features/admin.css` | 423-427 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/admin.css |
| `.admin-shell` | ADMIN_FEATURE | `styles/features/admin.css` | 990-1000 | 1 | 3 | 2 | 6 | ACTIVE | SINGLE | styles/features/admin.css |
| `.admin-table` | ADMIN_FEATURE | `styles/features/admin.css` | 990-1000 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/admin.css |
| `.am-loading` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-modal` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-modal__body` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-modal__close` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-modal__head` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-option` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-options` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-overlay` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-question` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-question__text` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-result` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/legacy-surfaces.css |
| `.am-result__msg` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-result__score` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-result--failed` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-result--passed` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-submit-btn` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.am-text-input` | UTILITY | `styles/features/legacy-surfaces.css` | 3067-3147 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.bottom-nav__tab` | NAVIGATION | `styles/design-system.css` | 2571-2988 | 0 | 10 | 9 | 19 | DYNAMIC | SINGLE | styles/design-system.css premium seal (chrome colors only) |
| `.btn-primary` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 2 | 2 | 1 | 5 | ACTIVE | SINGLE | styles/design-system.css |
| `.btn-secondary` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css |
| `.citation-btn` | COMPONENT | `styles/design-system.css` | 2571-2988 | 6 | 0 | 0 | 6 | ACTIVE | SINGLE | styles/components/* |
| `.content-hub` | LAYOUT | `styles/design-system.css` | 1302-1328 | 1 | 1 | 19 | 21 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.content-hub__body` | LAYOUT | `styles/design-system.css` | 1302-1328 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.content-hub__toolbar` | LAYOUT | `styles/design-system.css` | 1102-1209, 1302-1328 | 1 | 0 | 0 | 1 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.content-hub-chip` | COMPONENT | `styles/components/chips.css` | 524-554 | 10 | 2 | 5 | 17 | ACTIVE | SINGLE | styles/components/* |
| `.content-hub-chip--active` | COMPONENT | `styles/components/chips.css` | 524-554 | 12 | 2 | 0 | 14 | ACTIVE | SINGLE | styles/components/* |
| `.content-hub-chips` | COMPONENT | `styles/components/chips.css` | 524-554 | 8 | 5 | 0 | 13 | ACTIVE | SINGLE | styles/components/* |
| `.content-hub-search` | SEARCH | `styles/components/search-ui.css` | 502-523 | 5 | 1 | 0 | 6 | ACTIVE | SINGLE | styles/features/search.css |
| `.content-submit-form` | UTILITY | `styles/features/legacy-surfaces.css` | 1040-1082 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.content-submit-panel` | UTILITY | `styles/features/legacy-surfaces.css` | 1040-1082 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.dark` | COMPONENT | `styles/components/stats.css` | 1210-1258 | 92 | 188 | 57 | 337 | ACTIVE | SINGLE | styles/components/* |
| `.decorative` | FOUNDATION | `styles/design-system.css` | 428-432, 1259-1276 | 3 | 4 | 6 | 13 | ACTIVE | MULTI_BLOCK | styles/design-system.css |
| `.ds-btn` | COMPONENT | `styles/components/buttons.css` | 217-265, 2571-2988 | 5 | 6 | 0 | 11 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-btn--ghost` | COMPONENT | `styles/components/buttons.css` | 217-265 | 4 | 1 | 0 | 5 | ACTIVE | SINGLE | styles/components/* |
| `.ds-btn--primary` | COMPONENT | `styles/components/buttons.css` | 217-265, 2571-2988 | 3 | 0 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-btn--sm` | COMPONENT | `styles/components/buttons.css` | 217-265 | 2 | 2 | 0 | 4 | ACTIVE | SINGLE | styles/components/* |
| `.ds-card` | COMPONENT | `styles/components/cards.css` | 123-144, 145-208, 2571-2988 | 3 | 2 | 4 | 9 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-empty` | COMPONENT | `styles/components/empty-states.css` | 319-326 | 6 | 2 | 2 | 10 | ACTIVE | SINGLE | styles/components/* |
| `.ds-filter-toggle` | COMPONENT | `styles/components/chips.css` | 657-707, 1302-1328 | 1 | 4 | 2 | 7 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-filters-panel` | COMPONENT | `styles/components/chips.css` | 657-707 | 4 | 1 | 2 | 7 | ACTIVE | SINGLE | styles/components/* |
| `.ds-filters-panel__head` | COMPONENT | `styles/components/chips.css` | 657-707 | 4 | 1 | 0 | 5 | ACTIVE | SINGLE | styles/components/* |
| `.ds-filters-panel--desktop` | COMPONENT | `styles/components/chips.css` | 1089-1101, 1302-1328 | 5 | 2 | 1 | 8 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-grid` | LAYOUT | `styles/design-system.css` | 286-318 | 1 | 0 | 4 | 5 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-input` | COMPONENT | `styles/components/forms.css` | 266-285, 2571-2988 | 8 | 1 | 1 | 10 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-page` | LAYOUT | `styles/design-system.css` | 1-50, 145-208 | 10 | 2 | 5 | 17 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-page-header` | LAYOUT | `styles/design-system.css` | 87-122, 1302-1328 | 0 | 4 | 0 | 4 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-page-header__eyebrow` | LAYOUT | `styles/design-system.css` | 87-122 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-page-header__subtitle` | LAYOUT | `styles/design-system.css` | 87-122 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-page-header__title` | LAYOUT | `styles/design-system.css` | 87-122, 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-quiz-home-card` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__badge` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__btn` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__cat` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__challenge` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__challenge-badge` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__challenge-cat` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__challenge-q` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__content` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__desc` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__grid` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__stat` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__stats-empty` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__stats-skel` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__text` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-quiz-home-card__title` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.ds-section` | LAYOUT | `styles/design-system.css` | 286-318 | 1 | 2 | 7 | 10 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-section__head` | LAYOUT | `styles/design-system.css` | 286-318, 657-707 | 5 | 1 | 0 | 6 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-section__link` | LAYOUT | `styles/design-system.css` | 286-318 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-section__title` | LAYOUT | `styles/design-system.css` | 286-318, 2571-2988 | 1 | 3 | 0 | 4 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.ds-skeleton` | COMPONENT | `styles/design-system.css` | 327-362 | 3 | 1 | 0 | 4 | ACTIVE | SINGLE | styles/components/* |
| `.ds-skeleton--line` | COMPONENT | `styles/design-system.css` | 327-362 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/components/* |
| `.ds-stat` | COMPONENT | `styles/components/stats.css` | 1210-1258, 2571-2988 | 2 | 2 | 1 | 5 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ds-stats-row` | COMPONENT | `styles/components/stats.css` | 1210-1258, 1302-1328 | 1 | 2 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.faidah-grid` | COMPONENT | `styles/components/cards.css` | 555-656 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/components/* |
| `.filter-tabs` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.fiqh-comparative-pending` | UTILITY | `styles/features/legacy-surfaces.css` | 209-216 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.fiqh-comparative-section` | UTILITY | `styles/features/legacy-surfaces.css` | 209-216 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.fiqh-context-disclaimer` | UTILITY | `styles/features/legacy-surfaces.css` | 209-216 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.fiqh-opinion-evidence` | UTILITY | `styles/features/legacy-surfaces.css` | 209-216 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.fiqh-opinions-list` | UTILITY | `styles/features/legacy-surfaces.css` | 209-216 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.fm-parent` | UTILITY | `styles/features/legacy-surfaces.css` | 2349-2350 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.full` | SEARCH | `styles/components/search-ui.css` | 502-523 | 85 | 0 | 142 | 227 | ACTIVE | SINGLE | styles/features/search.css |
| `.full-content` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css |
| `.hadith-content` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.hcp-next-hint` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-prayer-cell` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-prayer-cell__name` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-prayer-cell__time` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-prayer-cell--next` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-since-pill` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-since-pill__bar` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-since-pill__text` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip__countdown` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip__countdown--elapsed` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip__countdown-time` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip__head` | HOME_FEATURE | `styles/features/home.css` | 1422-1836, 2175-2253 | 1 | 2 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/features/home.css |
| `.hcp-strip__head-end` | HOME_FEATURE | `styles/features/home.css` | 1422-1836, 2175-2253 | 1 | 2 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/features/home.css |
| `.hcp-strip__label` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip__link` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcp-strip__prayers` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-hint` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-list` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-reset` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-row` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/home.css |
| `.hcz-row__label` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-row__move` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-row__visibility` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.hcz-row--hidden` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__actions` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__body` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__cta` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__cta--primary` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__cta--secondary` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__eyebrow` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__head-row` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__pillar` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__pillar-deco` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__pillar-desc` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__pillar-icon` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__pillar-title` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__pillars` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-about__title` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-daily-row` | HOME_FEATURE | `styles/features/home.css` | 363-374 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-divider` | HOME_FEATURE | `styles/design-system.css` | 1259-1276 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/features/home.css |
| `.home-kicker--v3` | HOME_FEATURE | `styles/features/home.css` | 433-437 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/features/home.css |
| `.home-quick-grid` | HOME_FEATURE | `styles/features/home.css` | 363-374 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-quick-link` | HOME_FEATURE | `styles/design-system.css` | 2571-2988 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/home.css |
| `.home-section-title` | HOME_FEATURE | `styles/design-system.css` | 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/home.css |
| `.hpv4-customize-trigger` | HOME_FEATURE | `styles/features/home.css` | 2989-3066 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/home.css |
| `.is-active` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86, 935-989, 1837-2101, 2571-2988 | 66 | 73 | 15 | 154 | ACTIVE | MULTI_BLOCK | styles/features/legacy-surfaces.css |
| `.lesson-card` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 1 | 1 | 18 | 20 | ACTIVE | SINGLE | styles/design-system.css |
| `.lesson-card__title` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/design-system.css |
| `.lesson-content` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 3 | 0 | 3 | ACTIVE | SINGLE | styles/design-system.css |
| `.lesson-detail-title` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/design-system.css |
| `.lesson-unified-grid` | COMPONENT | `styles/components/cards.css` | 555-656 | 7 | 2 | 0 | 9 | ACTIVE | SINGLE | styles/components/* |
| `.lessons-v2-filter-toggle` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 3 | 0 | 3 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.lessons-v2-search` | COMPONENT | `styles/components/forms.css` | 266-285 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/components/* |
| `.lessons-v2-section__title` | UTILITY | `styles/features/legacy-surfaces.css` | 375-401 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.lessons-v2-sheet-backdrop` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.lessons-v2-sidebar` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.lessons-v2-stat` | UTILITY | `styles/features/legacy-surfaces.css` | 375-401 | 0 | 3 | 0 | 3 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.lessons-v2-stats` | UTILITY | `styles/features/legacy-surfaces.css` | 375-401 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.library-card` | COMPONENT | `styles/components/cards.css` | 555-656, 2571-2988 | 0 | 1 | 4 | 5 | DYNAMIC | MULTI_BLOCK | styles/components/* |
| `.login-card` | AUTH_FEATURE | `styles/features/auth.css` | 402-422 | 4 | 4 | 0 | 8 | ACTIVE | SINGLE | styles/features/auth.css |
| `.login-card__title` | AUTH_FEATURE | `styles/features/auth.css` | 402-422 | 2 | 2 | 0 | 4 | ACTIVE | SINGLE | styles/features/auth.css |
| `.login-field` | AUTH_FEATURE | `styles/components/forms.css` | 266-285, 2571-2988 | 2 | 5 | 0 | 7 | ACTIVE | MULTI_BLOCK | styles/features/auth.css |
| `.login-logo` | AUTH_FEATURE | `styles/features/auth.css` | 402-422 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/auth.css |
| `.login-oauth` | AUTH_FEATURE | `styles/features/auth.css` | 1368-1421 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/auth.css |
| `.login-oauth__btn` | AUTH_FEATURE | `styles/features/auth.css` | 1368-1421 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/auth.css |
| `.login-oauth__divider` | AUTH_FEATURE | `styles/features/auth.css` | 1368-1421 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/auth.css |
| `.login-submit` | AUTH_FEATURE | `styles/components/buttons.css` | 217-265, 2571-2988 | 2 | 5 | 0 | 7 | ACTIVE | MULTI_BLOCK | styles/features/auth.css |
| `.lsw-badge` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__countdown` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__cta` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__days` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__desc` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__header` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__name` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__now` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-featured__suggestion` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-mini-item` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-mini-item__days` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-mini-item__dot` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-mini-item__name` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-mini-list` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.lsw-section` | LEARNING_SEASONS_FEATURE | `styles/features/learning-seasons.css` | 2270-2348 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/learning-seasons.css |
| `.majalis-geo-bg` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.majalis-hero-pattern` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.miracle-item` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__body` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__head` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__ref` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__source` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__tags` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__title` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracle-item__toggle` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracles-disclaimer` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.miracles-filters` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.narrow` | FOUNDATION | `styles/design-system.css` | 454-481 | 37 | 3 | 6 | 46 | ACTIVE | SINGLE | styles/design-system.css |
| `.navbar-brand` | NAVIGATION | `styles/design-system.css` | 2571-2988 | 0 | 3 | 0 | 3 | ACTIVE | SINGLE | styles/design-system.css premium seal (chrome colors only) |
| `.navbar-login` | NAVIGATION | `styles/design-system.css` | 2571-2988 | 1 | 3 | 1 | 5 | ACTIVE | SINGLE | styles/design-system.css premium seal (chrome colors only) |
| `.navbar-menu-btn` | NAVIGATION | `styles/design-system.css` | 2571-2988 | 2 | 4 | 5 | 11 | ACTIVE | SINGLE | styles/design-system.css premium seal (chrome colors only) |
| `.navbar-v3` | NAVIGATION | `styles/design-system.css` | 2571-2988 | 4 | 10 | 15 | 29 | ACTIVE | SINGLE | styles/design-system.css premium seal (chrome colors only) |
| `.page-action-btn` | COMPONENT | `styles/components/buttons.css` | 217-265, 2571-2988 | 1 | 0 | 0 | 1 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.page-action-btn--secondary` | COMPONENT | `styles/components/buttons.css` | 217-265, 2571-2988 | 1 | 2 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.page-card` | COMPONENT | `styles/components/cards.css` | 555-656, 2571-2988 | 0 | 0 | 7 | 7 | DYNAMIC | MULTI_BLOCK | styles/components/* |
| `.page-card-grid` | COMPONENT | `styles/components/cards.css` | 555-656, 1277-1282 | 5 | 3 | 0 | 8 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.page-card-grid--compact` | COMPONENT | `styles/components/cards.css` | 555-656 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/components/* |
| `.page-card-header` | COMPONENT | `styles/components/cards.css` | 555-656, 2571-2988 | 0 | 2 | 0 | 2 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.page-chip-row` | COMPONENT | `styles/components/chips.css` | 524-554 | 0 | 2 | 1 | 3 | DYNAMIC | SINGLE | styles/components/* |
| `.page-desc` | COMPONENT | `styles/components/cards.css` | 555-656 | 8 | 1 | 2 | 11 | ACTIVE | SINGLE | styles/components/* |
| `.page-divider` | FOUNDATION | `styles/design-system.css` | 1259-1276 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.page-enter` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css |
| `.page-header` | UTILITY | `styles/features/legacy-surfaces.css` | 449-453 | 0 | 3 | 9 | 12 | DYNAMIC | SINGLE | styles/features/legacy-surfaces.css |
| `.page-link` | COMPONENT | `styles/components/cards.css` | 555-656 | 0 | 1 | 5 | 6 | DYNAMIC | SINGLE | styles/components/* |
| `.page-meta` | COMPONENT | `styles/components/cards.css` | 555-656 | 1 | 1 | 2 | 4 | ACTIVE | SINGLE | styles/components/* |
| `.page-search-input` | SEARCH | `styles/components/search-ui.css` | 502-523 | 21 | 4 | 0 | 25 | ACTIVE | SINGLE | styles/features/search.css |
| `.page-shell` | LAYOUT | `styles/design-system.css` | 1-50, 145-208, 428-432, 454-481 | 57 | 11 | 9 | 77 | ACTIVE | MULTI_BLOCK | styles/design-system.css (BASE_LAYOUT / PAGE_SHELL) |
| `.page-stats-row` | COMPONENT | `styles/components/stats.css` | 482-501 | 4 | 1 | 0 | 5 | ACTIVE | SINGLE | styles/components/* |
| `.page-tag` | COMPONENT | `styles/components/cards.css` | 555-656 | 7 | 2 | 0 | 9 | ACTIVE | SINGLE | styles/components/* |
| `.profile-section-title` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/design-system.css |
| `.profile-stat-card__value` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/design-system.css |
| `.push-prompt` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.push-prompt__btn` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/tasbih.css |
| `.push-prompt__btn--off` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.push-prompt__text` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.push-prompt--info` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.push-prompt--warn` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.qa-card__font-tools` | FOUNDATION | `styles/design-system.css` | 1083-1088 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.qa-disclaimer` | UTILITY | `styles/features/legacy-surfaces.css` | 708-821 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.qa-grid` | COMPONENT | `styles/components/cards.css` | 555-656 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/components/* |
| `.qa-sort-row` | COMPONENT | `styles/components/chips.css` | 524-554 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/components/* |
| `.qa-v2-category-card` | UTILITY | `styles/features/legacy-surfaces.css` | 375-401 | 0 | 2 | 1 | 3 | DYNAMIC | SINGLE | styles/features/legacy-surfaces.css |
| `.qa-v2-category-grid` | UTILITY | `styles/features/legacy-surfaces.css` | 375-401 | 1 | 2 | 1 | 4 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.qa-v2-section-title` | UTILITY | `styles/features/legacy-surfaces.css` | 375-401 | 1 | 3 | 0 | 4 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.qa-v2-sort-row` | COMPONENT | `styles/components/chips.css` | 524-554 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/components/* |
| `.quran-search` | SEARCH | `styles/components/search-ui.css` | 502-523 | 1 | 1 | 5 | 7 | ACTIVE | SINGLE | styles/features/search.css |
| `.quran-subnav` | UTILITY | `styles/features/legacy-surfaces.css` | 935-989 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.quran-subnav__link` | UTILITY | `styles/features/legacy-surfaces.css` | 935-989 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.reading-prose` | CONTENT_PROSE | `styles/design-system.css` | 2571-2988 | 0 | 3 | 3 | 6 | DYNAMIC | SINGLE | styles/design-system.css (prose rhythm) |
| `.reading-text` | CONTENT_PROSE | `styles/design-system.css` | 1102-1209, 2571-2988 | 1 | 1 | 1 | 3 | ACTIVE | MULTI_BLOCK | styles/design-system.css (prose rhythm) |
| `.reading-toolbar__settings` | CONTENT_PROSE | `styles/design-system.css` | 1259-1276 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css (prose rhythm) |
| `.reading-toolbar--minimal` | CONTENT_PROSE | `styles/design-system.css` | 1259-1276 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css (prose rhythm) |
| `.reading-toolbar-inline` | CONTENT_PROSE | `styles/design-system.css` | 1083-1088 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css (prose rhythm) |
| `.revelation-badge` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-badge--madani` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-badge--makki` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-comparison` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-review-note` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-rule` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-sources` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-toolbar` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.revelation-why` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.ruling-card-grid` | COMPONENT | `styles/components/cards.css` | 555-656 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/components/* |
| `.ruling-pagination` | COMPONENT | `styles/components/pagination.css` | 1011-1039 | 1 | 3 | 0 | 4 | ACTIVE | SINGLE | styles/components/* |
| `.ruling-stats-bar` | COMPONENT | `styles/components/stats.css` | 482-501 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/components/* |
| `.rulings-encyclopedia-page` | UTILITY | `styles/features/legacy-surfaces.css` | 449-453 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.search-filters-grid` | SEARCH | `styles/features/search.css` | 822-934 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-page-form` | SEARCH | `styles/features/search.css` | 822-934 | 0 | 6 | 0 | 6 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-page-hint` | SEARCH | `styles/features/search.css` | 822-934 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-page-summary` | SEARCH | `styles/features/search.css` | 822-934 | 2 | 2 | 0 | 4 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-page-title` | SEARCH | `styles/features/search.css` | 822-934, 2571-2988 | 1 | 1 | 0 | 2 | ACTIVE | MULTI_BLOCK | styles/features/search.css |
| `.search-result-copy` | SEARCH | `styles/features/search.css` | 822-934 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-result-meta` | SEARCH | `styles/features/search.css` | 822-934 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-result-row` | SEARCH | `styles/features/search.css` | 438-448, 822-934, 1283-1301, 2571-2988 | 1 | 2 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/features/search.css |
| `.search-results-count` | SEARCH | `styles/features/search.css` | 822-934 | 1 | 3 | 0 | 4 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-results-group` | SEARCH | `styles/features/search.css` | 438-448, 822-934 | 1 | 2 | 0 | 3 | ACTIVE | MULTI_BLOCK | styles/features/search.css |
| `.search-results-group-title` | SEARCH | `styles/features/search.css` | 822-934, 1283-1301, 2571-2988 | 1 | 3 | 0 | 4 | ACTIVE | MULTI_BLOCK | styles/features/search.css |
| `.search-toolbar` | SEARCH | `styles/features/search.css` | 822-934 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-topic-chip` | SEARCH | `styles/features/search.css` | 822-934 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/search.css |
| `.search-topic-chips` | SEARCH | `styles/features/search.css` | 822-934 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/search.css |
| `.section-dash` | FOUNDATION | `styles/design-system.css` | 1259-1276 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.section-divider` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.section-divider__gem` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 0 | 0 | 0 | KEEP_TEMPORARILY | SINGLE | styles/design-system.css |
| `.seo-listing-intro` | CONTENT_PROSE | `styles/features/legacy-surfaces.css` | 1040-1082 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css (prose rhythm) |
| `.seo-listing-intro--flush` | CONTENT_PROSE | `styles/features/legacy-surfaces.css` | 1040-1082 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css (prose rhythm) |
| `.settings-account-card` | UTILITY | `styles/features/legacy-surfaces.css` | 1001-1010 | 2 | 4 | 1 | 7 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.settings-toggle-row` | UTILITY | `styles/features/legacy-surfaces.css` | 1001-1010 | 1 | 8 | 0 | 9 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.sheikh-detail-tags` | UTILITY | `styles/features/legacy-surfaces.css` | 1040-1082 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.site-brand-name` | NAVIGATION | `styles/design-system.css` | 2571-2988 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/design-system.css premium seal (chrome colors only) |
| `.site-footer-email` | HOME_FEATURE | `styles/features/home.css` | 1422-1836 | 1 | 4 | 0 | 5 | ACTIVE | SINGLE | styles/features/home.css |
| `.story-content` | FOUNDATION | `styles/design-system.css` | 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/design-system.css |
| `.surah-info-card` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-card__body` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-card__link` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-card__link--secondary` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-card__links` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-card__meta` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-card__number` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-info-grid` | UTILITY | `styles/features/legacy-surfaces.css` | 51-86 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-stories-grid` | COMPONENT | `styles/components/cards.css` | 555-656 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/components/* |
| `.surah-story-card` | UTILITY | `styles/features/legacy-surfaces.css` | 935-989 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-story-meta` | UTILITY | `styles/features/legacy-surfaces.css` | 935-989 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.surah-story-num` | UTILITY | `styles/features/legacy-surfaces.css` | 935-989 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/legacy-surfaces.css |
| `.tasbeeh-counter__presets` | TASBIH_FEATURE | `styles/features/tasbih.css` | 2175-2253 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-add-row` | TASBIH_FEATURE | `styles/features/tasbih.css` | 2175-2253 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-pill-badge` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-pill-phrase` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-pro-card` | TASBIH_FEATURE | `styles/features/tasbih.css` | 2175-2253 | 1 | 0 | 0 | 1 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-pro-card--v2` | TASBIH_FEATURE | `styles/features/tasbih.css` | 2175-2253 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-stat--streak` | TASBIH_FEATURE | `styles/features/tasbih.css` | 2158-2162 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-stats-grid--v2` | TASBIH_FEATURE | `styles/features/tasbih.css` | 2175-2253 | 0 | 2 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tasbih-wird-pill` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/tasbih.css |
| `.tasbih-wird-pills` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101, 2175-2253 | 1 | 1 | 0 | 2 | ACTIVE | MULTI_BLOCK | styles/features/tasbih.css |
| `.tawheed-hadith-badge` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-page-header` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-page-header__ayah` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-page-header__subtitle` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-page-header__title` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-principle-card` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 2 | 3 | 0 | 5 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-principle-card__body` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 2 | 1 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-principle-card__title` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 2 | 1 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-principles-grid` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 2 | 1 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-principles-heading` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-related-card` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-related-card__desc` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-related-card__label` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-related-grid` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-type-card` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 3 | 3 | 1 | 7 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-type-card__ayah` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 2 | 1 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-type-card__desc` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 4 | 0 | 5 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-type-card__num` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 3 | 0 | 4 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-type-card__subtitle` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-type-card__title` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 3 | 0 | 4 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tawheed-types-grid` | TAWHID_FEATURE | `styles/features/tawhid.css` | 2351-2570 | 1 | 2 | 0 | 3 | ACTIVE | SINGLE | styles/features/tawhid.css |
| `.tc-keyboard-hint` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-btn` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101, 2175-2253 | 1 | 1 | 0 | 2 | ACTIVE | MULTI_BLOCK | styles/features/tasbih.css |
| `.tc-ring-btn--done` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-btn--pulse` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-count` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101, 2175-2253 | 1 | 1 | 0 | 2 | ACTIVE | MULTI_BLOCK | styles/features/tasbih.css |
| `.tc-ring-fill` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 0 | 1 | 1 | 2 | DYNAMIC | SINGLE | styles/features/tasbih.css |
| `.tc-ring-fill--done` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-hint` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-inner` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-rounds` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-svg` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-total` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.tc-ring-track` | TASBIH_FEATURE | `styles/features/tasbih.css` | 1837-2101 | 1 | 1 | 0 | 2 | ACTIVE | SINGLE | styles/features/tasbih.css |
| `.ui-card` | COMPONENT | `styles/components/cards.css` | 123-144, 145-208, 2571-2988 | 13 | 10 | 1 | 24 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ui-card-btn` | COMPONENT | `styles/components/buttons.css` | 217-265, 2571-2988 | 6 | 3 | 0 | 9 | ACTIVE | MULTI_BLOCK | styles/components/* |
| `.ui-card-btn--danger` | COMPONENT | `styles/components/buttons.css` | 2163-2174 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/components/* |
| `.user-stat-card` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/user-stats.css |
| `.user-stat-card__label` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/user-stats.css |
| `.user-stat-card__sub` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/user-stats.css |
| `.user-stat-card__value` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157, 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | MULTI_BLOCK | styles/features/user-stats.css |
| `.user-stats-grid` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/user-stats.css |
| `.user-stats-link` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/user-stats.css |
| `.user-stats-section` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157 | 0 | 1 | 0 | 1 | ACTIVE | SINGLE | styles/features/user-stats.css |
| `.user-stats-section__title` | USER_STATS_FEATURE | `styles/features/user-stats.css` | 2102-2157, 2571-2988 | 0 | 1 | 0 | 1 | ACTIVE | MULTI_BLOCK | styles/features/user-stats.css |
| `.wide` | FOUNDATION | `styles/design-system.css` | 454-481 | 7 | 2 | 18 | 27 | ACTIVE | SINGLE | styles/design-system.css |
