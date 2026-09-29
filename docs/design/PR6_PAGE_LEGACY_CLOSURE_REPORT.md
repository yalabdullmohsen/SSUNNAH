# PR6 — Page Authority & Legacy CSS Closure

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (awaiting merge/deploy) |
| Branch | `cursor/final-internal-closure-pr6` |
| Baseline main | `109b8d961` (#2368 PR5) · production MATCH |
| cssFiles | **359 → 357** (−2) |
| mjDeclOutsideAllowlist | **0** |

## Page authority contract

| Primitive | Role | Adapter? |
|---|---|---|
| `ScreenShell` | Operational shell: pattern · density · Feedback V2 states | Canonical |
| `DetailScreen` / `ListScreen` / `DashboardScreen` / `ReaderScreen` / … | Thin wrappers → `ScreenShell` + optional layout/`mark` | **Yes — official adapters** |
| `UtilityScreen` | Settings/tools only | KEEP ≤ 3 product consumers |
| `TopicPage` (exported as `AppPage`) | Hub/discover chrome + SEO slots | Canonical for section hubs |
| `SectionTemplatePage` | Adapter → `TopicPage` + `sectionTemplateChrome(route)` | **Yes — official adapter** |
| `LazySectionAccordionPage` | Accordion section content | KEEP (active consumers) |
| `AppBottomSheet` / Filter sheets | Overlay sheets | KEEP — Floating PR7 owns collision |

### Adapter policy

- Do **not** mass-migrate Detail/List mark shells merely to raise AppPage import counts.
- Prefer fixing `ScreenShell` / Feedback V2 once; routes keep SEO + scroll restoration.
- New pages: prefer `AppPage`/`SectionTemplatePage` for hubs; pattern screens for lists/details; UtilityScreen only on KEEP allowlist.

### UtilityScreen KEEP (live)

| File | Class |
|---|---|
| `SettingsView.tsx` | KEEP_JUSTIFIED |
| `NotificationSettingsView.tsx` | KEEP_JUSTIFIED |
| `AdhanSettingsView.tsx` | KEEP_JUSTIFIED |

Gate: `no-new-utility-screen-gate.test.ts` · ceiling **3**.

## Legacy CSS Consumer Map (PR6 actions)

| File | Static imports | Class usage (TSX) | Status |
|---|---:|---:|---|
| `pages/search-legacy.css` | **0** | **0** | **REMOVED** (PR6) |
| `pages/section-hub.css` | **0** | **0** | **REMOVED** (PR6) |
| `pages/home-legacy.css` | HomeBelowFold | yes | ACTIVE_LEGACY / KEEP |
| `pages/lessons-legacy.css` | LessonsView | yes | ACTIVE_LEGACY / KEEP |
| `pages/misc-page-legacy.css` | Tasbih · TopicQuiz | yes | ACTIVE_LEGACY / KEEP |
| `brand-v4.css` · `final-release.css` · `visual-identity-unify` · `sections-calm-polish` | main sync/deferred | yes | KEEP / COMPATIBILITY |
| `modern-ui-refresh.css` | deferred + gates | yes | KEEP (gate-bound) |
| `design-system.css` | deferred | yes | COMPATIBILITY |
| Mushaf / prayer / admin CSS | route | yes | BLOCKED |

Compound selectors for `.section-hub*` remain in polish/unify CSS (harmless dead rules) — not copied into a new file; no debt transfer.

## Metrics

| Metric | Before | After |
|---|---:|---:|
| cssFiles | 359 | **357** |
| hexInCss | 9090 | **9044** |
| mj-outside | 0 | **0** |
| UtilityScreen product | 3 | **3** |

## Success gates

- `test:legacy-css-retirement`
- `test:visual-system-debt-budget`
- `test:final-internal-closure-pr6`
- `no-new-utility-screen-gate`
- `verify:preflight` · `verify:ci`
