# Android Release Checklist — **RETIRED / HISTORICAL**

| Field | Value |
|-------|-------|
| Status | **`OUT_OF_SCOPE` · `ANDROID_PRODUCT_RETIRED`** |
| Decision | 2026-10-01 — product is **iOS-only** (`com.yousef.majlisilm`) |
| Tree | `artifacts/majalis/android` **removed** from active product |
| History | Recoverable via Git tag `android-last-supported-state` |
| Inventory | `docs/mobile/ANDROID_RETIREMENT_INVENTORY.md` |
| Active store path | Apple App Store / TestFlight only — see `STORE_100_PERCENT_READINESS.md` |

Do **not** treat rows below as live release work. Preserved for historical reference only.

---

## Historical notes (pre-retirement)

| Item | Historical note |
|---|---|
| Gradle project | Lived under `artifacts/majalis/android` |
| `applicationId` | Was `com.majlisilm.app` ≠ Capacitor iOS id |
| Play internal / AAB | Never certified · now permanently out of product scope |

Google Play · Wear OS · Android Auto = **OUT OF SCOPE**.
