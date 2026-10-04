# SELECTOR_OWNER_MAP

TASK_CLASSIFICATION: SHARED_PLATFORM

| Selector | Canonical owner | Role |
|---|---|---|
| `.page-shell` | styles/design-system.css (FOUNDATION) | structural contract |
| `.login-submit` | styles/pages/auth.css (layout/a11y) + design-system premium seal (MODEL B) | auth compatibility mapped to button authority |
| `.search-result-row` | styles/design-system.css (FEATURE) | base row + hover; page may use variants only |
| `.search-page-title` | styles/design-system.css (FEATURE) | search title |
| `.tc-ring-btn` | styles/design-system.css (FEATURE / tasbih) | tasbih ring control |
| `.ui-card` | styles/design-system.css (COMPONENT) | shared card |
| `.ds-card` | styles/design-system.css (COMPONENT) | shared card |
| `.ds-btn` | styles/design-system.css (COMPONENT) | shared button |
| `.ds-stat` | styles/design-system.css (COMPONENT) | shared stat |
| `.fm-parent` | NONE (JSX structural class only) | empty rule removed; class retained for structure |

Regression locks (css-authority-graph-gate + this report):

- `.fm-parent {}` must not return
- Defeated `.search-result-row:hover` rgba(26,107,82,0.25) must not return
- FOUNDATION `.page-shell` max-width contract must remain
- Search/Auth/Tasbih dual-ownership bodies remain on DEFEATED_BODY_ALLOWLIST only
