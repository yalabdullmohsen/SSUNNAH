# SUNNAH_PLATFORM_CLASSIFICATION_PROTOCOL

**Status:** PERMANENT  
**Companion to:** `docs/governance/SUNNAH_CANONICAL_PLATFORM_IDENTITY.md`  
**Enforcement:** `test:canonical-platform-identity` (same permanent gate)

This protocol must never be removed, overridden, ignored, or reinterpreted.

---

## Before any change

Every task must classify itself **first**, before implementation.

A task may belong to exactly one primary class:

| Class | Meaning |
|---|---|
| `WEB_ONLY` | Affects browser / web surfaces only |
| `IOS_ONLY` | Affects Capacitor / installed-app surfaces only |
| `APP_STORE_ONLY` | Affects store release / review / compliance only |
| `SHARED_PLATFORM` | Affects shared code used by WEB and IOS |

---

## WEB_ONLY

Affects only:

- responsive layouts
- browser UX
- web routing
- SEO
- web rendering
- browser performance
- desktop behavior
- browser memory

Changes here must **not** be reported as iOS improvements.

---

## IOS_ONLY

Affects only:

- Capacitor shell
- application lifecycle
- safe areas
- touch ergonomics
- native keyboard behavior
- foreground/background transitions
- deep links
- push notifications
- installed-app experience

Changes here must **not** be reported as web improvements.

---

## APP_STORE_ONLY

Affects only:

- release readiness
- review readiness
- production readiness
- store compliance
- perceived quality
- release safety

Changes here must **not** be reported as platform performance improvements.  
Agents must not create builds / TestFlight / ASC uploads unless an owner program explicitly authorizes them.

---

## SHARED_PLATFORM

Affects both web and iOS:

- design system
- shared UI
- shared routes
- shared state
- shared business logic
- shared repositories
- search logic
- content rendering

For `SHARED_PLATFORM` tasks, impact must **still** be reported separately:

- **WEB IMPACT**
- **IOS IMPACT**
- **APP STORE IMPACT**

---

## MANDATORY EXECUTION HEADER

Every future report must begin with:

```
TASK_CLASSIFICATION:
WEB_ONLY | IOS_ONLY | APP_STORE_ONLY | SHARED_PLATFORM
```

Any report without classification is **invalid**.

---

## CRITICAL RULE

| Never merge |  |
|---|---|
| Responsive success | ≠ iOS success |
| Web performance | ≠ App performance |
| Build success | ≠ App Store readiness |
| App Store approval | ≠ Product quality |

These concepts must never be merged.

PLATFORM_CLASSIFICATION_PROTOCOL_LOCKED
