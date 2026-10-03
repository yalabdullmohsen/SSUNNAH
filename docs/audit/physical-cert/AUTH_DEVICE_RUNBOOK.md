# Auth Device Runbook — FUTURE Build ≥56 only

**Exit today:** `AUTH_DEVICE_RUNBOOK_READY`  
**Execution class:** `REQUIRES_FUTURE_BUILD_GE_56`  
**Forbidden claim:** `IOS_AUTH_CERTIFIED` until physical rows PASS on Build ≥56  
**Do not run for certification on Build 55** (binary predates Keychain/hardening)

## Why ≥56

Build 55 does **not** include Keychain adapter / credential removal / #2477 native fixes
(`docs/store-release/BUILD_55_TRACEABILITY.md`).

## Scenarios (each → separate evidence row)

```text
AUTH-FRESH-INSTALL
AUTH-LOGIN
AUTH-SESSION-CREATE
AUTH-FORCE-CLOSE
AUTH-SESSION-RESTORE
AUTH-DEVICE-RESTART
AUTH-RESTORE-AFTER-RESTART
AUTH-TOKEN-REFRESH
AUTH-LOGOUT
AUTH-FORCE-CLOSE-AFTER-LOGOUT
AUTH-STILL-LOGGED-OUT
AUTH-PASSWORD-RECOVERY
AUTH-DEEP-LINK-CALLBACK          (product-supported callback only; AASA /auth/* excluded)
AUTH-OFFLINE-OPEN-EXISTING-SESSION
AUTH-ACCOUNT-SWITCH              (if supported; else NOT_APPLICABLE)
AUTH-CORRUPTED-LEGACY-STORAGE
AUTH-KEYCHAIN-MIGRATION
```

## Evidence distinction (mandatory notes field tags)

```text
LAYER_REPOSITORY   — code/static only
LAYER_SIMULATOR    — sim behavior (not cert)
LAYER_PHYSICAL     — required for IOS_AUTH_CERTIFIED
```

## Pass criteria (physical)

- Session survives force-close and reboot when expected  
- Logout clears Cap storage + Keychain session; force-close stays logged out  
- No plaintext tokens in UserDefaults/MMKV  
- Recovery path reaches update-password without leaking secrets into artifacts  
- Artifacts must not contain emails/phones/tokens (redact)

## Operator sequence (future Build ≥56)

1. Install fresh TF build ≥56  
2. Capture build number from device  
3. Run scenarios in order; screenshot each terminal state  
4. Ingest rows; gate rejects Build <56 for these caseIds  

## Related

Historical sim FAIL pack: `docs/audit/evidence/t034-ios-auth/`  
Future Archive checklist: `FUTURE_BUILD_56_CHECKLIST.md`
