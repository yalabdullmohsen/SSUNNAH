# FEEDBACK_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY MAP** |
| Date | 2026-10-03 |
| Exit | `FEEDBACK_AUTHORITY_ONLY` |
| Related | `FORM_FEEDBACK_AUTHORITY.md` · Status map |

## Approved

| Kind | Component | Notes |
|---|---|---|
| Inline alert strip | `Alert` (`ui/alert`) | Non-blocking page strip |
| Toast / transient | `AchievementToast` · resume toast patterns | Short-lived; do not invent snackbar kit |
| Banner | product banners (`UpdateAvailableBanner`, Friday, prayer) | KEEP_JUSTIFIED product surfaces |
| Field error | `FieldError` | Form authority |
| Page/section feedback | Feedback V2 states | See STATUS map |

## Classification

| Surface | Class |
|---|---|
| `Alert` · FieldError · Feedback V2 · StatusCard | APPROVED |
| Achievement / CrossDevice resume toasts | APPROVED (product toast path) |
| Admin notification chrome | SPECIAL_CASE |
| Ad-hoc colored `div` success/error boxes with hex | LEGACY |
| `window.alert` | FORBIDDEN in product |

## Contract

| Rule | Value |
|---|---|
| Colors | semantic tokens only (`mj` danger/brand/muted) |
| Typography | SsText / ds text scale |
| Dismissal | explicit close or timed toast — never trap |
| Stacking | one primary toast lane; yield under modal |
| Priority | error > warning > success > info |
| Copy | Arabic product language — no raw API strings |

## Gates

`test:overlay-feedback-authority` · `test:form-feedback-authority`
