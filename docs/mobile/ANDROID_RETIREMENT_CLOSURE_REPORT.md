# Android Retirement Closure Report — سُنّة

| Field | Value |
|-------|-------|
| Closed (UTC) | `2026-10-01T16:50:00Z` |
| Base tip | `52aa7b2f` MATCH production |
| Local tag | `android-last-supported-state` → `21dd6169b` (pre-delete tip-sync parent chain) |
| Inventory | `ANDROID_RETIREMENT_INVENTORY.md` · **NO UNKNOWN** |
| Board | `docs/audit/IOS_ONLY_CLOSURE_BOARD.md` |

## Actions completed (repository)

1. Full inventory classified (DELETE / REMOVE_* / KEEP_*).
2. Local Git tag `android-last-supported-state` recorded (not force-pushed remotely unless owner requests).
3. Deleted `artifacts/majalis/android/` from active tree (~107 MB / ~2607 files).
4. Removed `@capacitor/android` dependency.
5. `mobile:sync` → iOS-only · `mobile:android` → retired stub (exit 1).
6. Updated `release-verify.mjs` · `store-compliance-audit.mjs` · `verify-cap-shim.mjs`.
7. Rewrote gates: phase6 · phase7 · release-lockdown · adhan-android-alarm (retirement assert).
8. Added `test:ios-only-product-scope` into `test:ios-gates`.
9. Capacitor config: dropped android splash/scheme keys.
10. Historical checklist marked RETIRED.

## Preserved (intentional)

- `src/lib/adhan-android-alarm.ts` and callers — **no-op** when `isAndroid` false (iOS/web).
- `isAndroid` helper in capacitor-utils — safe dead branch.
- Historical docs under `docs/qa/ANDROID_RELEASE_CHECKLIST.md` (header RETIRED).
- Full Android history in Git (tag + prior commits).

## Not claimed

- Tag pushed to `origin` (optional OWNER).
- Apple Archive / TestFlight.
- STORE_GO.

## Exit

```text
ANDROID_PRODUCT_RETIRED
IOS_ONLY_PRODUCT_SCOPE_LOCKED
```

## Next serial

Phase 2 — `IOS_NATIVE_ARCHITECTURE_CERTIFIED` (Bundle ID `com.yousef.majlisilm` already pinned; signing = OWNER).
