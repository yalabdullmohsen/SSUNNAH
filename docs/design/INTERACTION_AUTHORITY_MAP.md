# INTERACTION_AUTHORITY_MAP — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `INTERACTION_SYSTEM_UNIFIED` |
| Related | `INTERACTION_COMPONENT_AUTHORITY.md` · `lib/interaction/tokens.ts` · Feedback/State maps |
| Code | `artifacts/majalis/src/lib/interaction/tokens.ts` (`InteractionState`) |

**Canonical interactive states** for product chrome. Controls must express these via authority primitives — not page-local hover/focus/disabled kits.

## State → authority

| State | Canonical expression | Tokens / cues |
|---|---|---|
| **idle** | Default surface of `Button` / `AppCard` / field | `--mj-surface` · hairline · type tokens |
| **hovered** | `hover-elevate` on Button · card hover only when Interactive/nav | Motion: `MOTION_DURATION_MS.fast` · no new shadow scale |
| **focused** | `focus-visible:ring-*` on Button/inputs · `--ss-border-focus` / `--sf2-focus-ring` | Never remove outline without replacement |
| **pressed** | `active-elevate-2` · brief press feedback | `MOTION_DURATION_MS.instant` |
| **selected** | Tabs (`ContentTabs` indicator) · toggles · list selected row | `--ss-tab-indicator-*` · brand ink — not ad-hoc underline kits |
| **loading** | `Button loading` (`aria-busy`) · `LoadingStateV2` for regions | Spinner must not erase accessible name |
| **disabled** | `disabled` attr + muted surface/text (opacity-100 policy on Button) | Distinct from loading |
| **success** | Toast / inline success · status chips via Feedback V2 | `--sf2-success` / `--mj-*` success roles |
| **error** | `FieldError` · `ErrorStateV2` · destructive Button | `--mj-danger` · never hex-only alert boxes |

## Forbidden

- Parallel hover/focus CSS systems per page
- Opacity-only disabled without surface change
- Inconsistent motion curves outside `MOTION_EASING`
- Custom loading spinners that replace authority `LoadingStateV2` / Button `loading`
- `window.alert` / `window.confirm` for product feedback

## SPECIAL_CASE

Mushaf immersive chrome · Prayer immersive · Admin thin `av3-*` wrappers that **compose** authority primitives.

## Gates

```bash
pnpm --filter @workspace/majalis run test:interaction-system-authority
pnpm --filter @workspace/majalis run test:polish-consistency
```

## Non-claims

لا UNIFIED_100 · لا إعادة كتابة كل `:hover` في CSS القديم في هذه المرحلة · الدين عبر decreasing ceilings فقط.
