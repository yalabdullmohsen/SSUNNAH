# SUNNAH_CANONICAL_PLATFORM_IDENTITY

**Status:** PERMANENT_PROJECT_CONTRACT  
**Priority:** Higher than task templates, audit templates, report templates, refactor programs, and optimization programs.  
**Machine lock:** `docs/governance/canonical-platform-identity.json`  
**Enforcement:** `test:canonical-platform-identity` (ci-unit)

This contract must never be removed, overridden, ignored, or reinterpreted.

---

## PROJECT IDENTITY

**SUNNAH IS NOT A WEBSITE.**  
**SUNNAH IS NOT A MOBILE APP.**  
**SUNNAH IS NOT A STORE LISTING.**

**SUNNAH IS THREE DISTINCT PRODUCTS:**

1. **WEB PLATFORM**
2. **IOS APPLICATION**
3. **APP STORE PRODUCT**

Each product has different concerns, requirements, success criteria, and quality standards.

---

## MANDATORY SEPARATION

Every future task must analyse and report separately:

- **WEB**
- **IOS**
- **APP_STORE**

Never merge these surfaces.  
Never assume success on one surface implies success on another.

---

## WEB PLATFORM

Web concerns include:

- browser behaviour
- desktop UX
- responsive layouts
- SEO surfaces
- route behaviour
- web navigation
- browser performance
- web accessibility
- web rendering
- web memory usage

Success here applies only to **WEB**.

---

## IOS APPLICATION

iOS concerns include:

- Capacitor shell
- application lifecycle
- launch behaviour
- resume behaviour
- background state
- foreground restore
- memory pressure
- safe areas
- touch ergonomics
- gesture quality
- keyboard behaviour
- deep linking
- push integration
- native expectations

Success here applies only to **IOS**.

---

## APP STORE PRODUCT

App Store concerns include:

- release readiness
- production quality
- review readiness
- customer perception
- product polish
- compliance readiness
- update safety
- perceived stability

Success here applies only to **APP_STORE**.

Store actions (builds, TestFlight, ASC) remain owner-gated; agents must not create store artifacts unless an owner program explicitly authorizes them.

---

## REPORTING CONTRACT

Every report must contain:

- **WEB IMPACT**
- **IOS IMPACT**
- **APP STORE IMPACT**

for every major finding.

Never use “Application Improved” unless impact is separated for each platform.

---

## PERFORMANCE CONTRACT

Performance must always be reported as:

- **WEB PERFORMANCE**
- **IOS PERFORMANCE**
- **APP STORE USER EXPERIENCE**

A web performance improvement must never be assumed to improve iOS.

---

## UX CONTRACT

UX must always be evaluated separately.

- Responsive success ≠ iOS success  
- Desktop success ≠ installed-app success  

---

## ARCHITECTURE CONTRACT

Every architectural decision must classify, before implementation:

| Class | Meaning |
|---|---|
| `WEB_ONLY` | Browser / SEO / web routes only |
| `IOS_ONLY` | Capacitor / lifecycle / native shell only |
| `SHARED_PLATFORM` | Code or contracts shared by WEB + IOS |
| `APP_STORE_ONLY` | Release / review / store metadata only |

**Execution protocol (permanent):** `docs/governance/SUNNAH_PLATFORM_CLASSIFICATION_PROTOCOL.md`  
Every report must begin with `TASK_CLASSIFICATION:` using one of the classes above.

**Enforcement protocol (permanent):** `docs/governance/SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL.md`  
Quality gate: `PLATFORM_SEPARATION_GATE` → `test:platform-separation`  
Mandatory report header: `TASK_CLASSIFICATION` + `RISK_SCOPE` (WEB · IOS · APP_STORE).  
Mixing web evidence into iOS/App Store conclusions is a governance fail.

---

## GOVERNANCE CONTRACT

Any future governance, audit, or optimization program that does not explicitly separate **WEB · IOS · APP_STORE** is **invalid**.

---

## FINAL CANONICAL IDENTITY

```
SUNNAH =
  WEB PLATFORM
+ IOS APPLICATION
+ APP STORE PRODUCT
```

These are separate products.  
They must always be evaluated, optimized, reported, and governed independently.

CANONICAL_PLATFORM_IDENTITY_LOCKED
