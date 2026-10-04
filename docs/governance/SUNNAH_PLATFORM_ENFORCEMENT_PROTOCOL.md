# SUNNAH_PLATFORM_ENFORCEMENT_PROTOCOL

**Status:** PERMANENT  
**Companions:**  
- `docs/governance/SUNNAH_CANONICAL_PLATFORM_IDENTITY.md`  
- `docs/governance/SUNNAH_PLATFORM_CLASSIFICATION_PROTOCOL.md`  
**Quality gate:** `PLATFORM_SEPARATION_GATE` → `test:platform-separation`

This protocol is mandatory. It prevents all future platform-mixing errors.  
It must never be removed, overridden, ignored, or reinterpreted.

---

## INVALID TASK RULE

Any task, report, audit, review, refactor, optimization, implementation, or analysis that fails to classify itself as:

- `WEB_ONLY`
- `IOS_ONLY`
- `APP_STORE_ONLY`
- `SHARED_PLATFORM`

is automatically **INVALID**.

The task must **stop**.  
No implementation may start until classification is declared.

Fail code: `PLATFORM_CLASSIFICATION_MISSING`

---

## INVALID REPORT RULE

Any report that contains conclusions such as:

- performance improved
- UX improved
- navigation improved
- loading improved
- application improved
- quality improved
- readiness improved

without separately reporting:

- **WEB IMPACT**
- **IOS IMPACT**
- **APP STORE IMPACT**

is **INVALID**.

Such results must not be accepted.

Fail code: `PLATFORM_IMPACT_MISSING`

---

## IMPLEMENTATION BLOCKER

Before implementation begins, the task must produce:

```
TASK_CLASSIFICATION:
WEB_ONLY | IOS_ONLY | APP_STORE_ONLY | SHARED_PLATFORM
```

Implementation without classification is **forbidden**.

---

## SHARED_PLATFORM ENFORCEMENT

If classification is `SHARED_PLATFORM`, the task must still produce individually:

- **WEB IMPACT**
- **IOS IMPACT**
- **APP STORE IMPACT**

Shared code does not mean shared evaluation.

---

## FALSE SUCCESS PREVENTION

The following statements are **prohibited**:

| Prohibited claim | Based solely on |
|---|---|
| "iOS improved" | browser evidence |
| "App Store ready" | successful builds |
| "App improved" | web testing |
| "Navigation improved" | without platform separation |
| "Performance improved" | without platform separation |

Fail codes:

- `WEB_ONLY_ASSUMED_AS_IOS`
- `IOS_ONLY_ASSUMED_AS_WEB`
- `IOS_ONLY_ASSUMED_AS_APP_STORE`
- `APP_STORE_ONLY_ASSUMED_AS_PRODUCT_QUALITY`
- `PLATFORM_MIXING_DETECTED`

---

## MANDATORY REPORT HEADER

Every future report must begin with:

```
TASK_CLASSIFICATION:
<value>

RISK_SCOPE:
WEB
IOS
APP_STORE
```

A report missing this header **fails governance**.

---

## CI GOVERNANCE REQUIREMENT

Any future governance, audit, or reporting framework must reject reports where:

- `PLATFORM_CLASSIFICATION_MISSING`
- `PLATFORM_IMPACT_MISSING`

---

## ARCHITECTURE REVIEW REQUIREMENT

Every architecture review must contain, before approval:

- **WEB_ARCHITECTURE_IMPACT**
- **IOS_ARCHITECTURE_IMPACT**
- **APP_STORE_ARCHITECTURE_IMPACT**

---

## QUALITY GATE — PLATFORM_SEPARATION_GATE

Script: `test:platform-separation`

The gate fails when:

1. Platform classification missing (docs/contract absent or incomplete).
2. Web conclusions are reused as iOS conclusions (contract violation markers absent / mixing allowed).
3. iOS conclusions are reused as App Store conclusions.
4. App Store conclusions are reused as platform conclusions.
5. Impact separation missing.

Instant fail codes:

- `PLATFORM_MIXING_DETECTED`
- `WEB_ONLY_ASSUMED_AS_IOS`
- `IOS_ONLY_ASSUMED_AS_WEB`
- `IOS_ONLY_ASSUMED_AS_APP_STORE`
- `APP_STORE_ONLY_ASSUMED_AS_PRODUCT_QUALITY`
- `MISSING_PLATFORM_SEPARATION`

---

## CANONICAL RULE

SUNNAH consists of:

1. **WEB PLATFORM**
2. **IOS APPLICATION**
3. **APP STORE PRODUCT**

These are separate products.

Future tasks must:

- classify separately  
- implement separately  
- evaluate separately  
- report separately  
- approve separately  

Failure to do so is a **governance violation**.

PLATFORM_ENFORCEMENT_PROTOCOL_LOCKED  
PLATFORM_SEPARATION_GATE_ACTIVE
