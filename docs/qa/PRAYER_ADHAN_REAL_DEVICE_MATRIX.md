# Prayer & Adhan Real Device Matrix — Phase 6

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/release-rc-stabilization-p6` |
| Sensitivity | High — worship timing; no absolute OS guarantees |

## Automated (repository)

| Check | Status |
|---|---|
| `test:prayer-engine-p0` (calc + schedule idempotency) | PASS when green |
| Adhan catalog production filter (`verified_for_production`) | PASS via `verify:store-assets` |
| madinah/qatami remain non-production | PASS via rights registry gates |
| Permission denial UX (code paths) | PARTIAL — unit/static only |

## Device / OS matrix

| Scenario | iOS | Android | Status |
|---|---|---|---|
| Schedule at enter time | — | — | DEVICE_REQUIRED |
| Duplicate prevention after reschedule | — | — | DEVICE_REQUIRED |
| Permission denied — app remains usable | — | — | DEVICE_REQUIRED |
| Exact alarm limitations | N/A | — | DEVICE_REQUIRED |
| Reboot recovery | — | — | DEVICE_REQUIRED |
| Timezone / travel change | — | — | DEVICE_REQUIRED |
| Adhan audio full play | — | — | DEVICE_REQUIRED |
| Early audio stop / interruption | — | — | DEVICE_REQUIRED |
| Silent / Focus / DND behavior | — | — | DEVICE_REQUIRED |
| Battery optimization impact | N/A | — | DEVICE_REQUIRED |
| Terminated app delivery | — | — | DEVICE_REQUIRED |
| Location denied + manual city | — | — | DEVICE_REQUIRED |

**Non-claim:** Do not assert that the “adhan stops after seconds” class of bugs is closed without DEVICE_REQUIRED evidence for the specific build.
