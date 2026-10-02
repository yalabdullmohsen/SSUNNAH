# T-034 — iOS Auth Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-034 IOS_AUTH_CERTIFICATION` |
| Date (UTC) | `2026-10-01` |
| Tip commit at run | `27b98bc42` (`origin/main` after T-032) |
| Evidence | `docs/audit/evidence/t034-ios-auth/` |
| Exit | **`IOS_AUTH_NOT_CERTIFIED`** → **FAIL** |

Prerequisite note: T-033 exit is **`IOS_DEEP_LINKS_NOT_CERTIFIED`** (not CERTIFIED). User CURRENT STATE claiming Deep Links CERTIFIED is contradicted by that report.

Bundle ID: `com.yousef.majlisilm` (LOCKED). Device class: **iOS Simulator** + static code audit. No authenticated test fixture in environment.

---

## 1. Login Validation

| Device state | Result | Notes |
|--------------|--------|-------|
| Cold / Warm / BG / Terminated / Offline / Resume | **FAIL** | No end-to-end Login executed — no test credentials / confirmed account in agent env |
| UI logged-out shell | OBSERVED | Home shows «دخول» (`sim/01-cold-home-logged-out.png`) |
| Code path | PRESENT | `AuthProvider` → `supabase.auth.signInWithPassword` (+ App Store review bypass) |

**Board: Login FAIL**

---

## 2. Logout Validation

| Check | Result |
|-------|--------|
| Device Logout clears session (all states) | **FAIL / UNPROVEN** |
| Code path | PRESENT — `signOut` + `queryClient.clear()` (static gate `auth-session-status-gate`) |

**Board: Logout FAIL**

---

## 3. Session Validation

| Contract | Result |
|----------|--------|
| Session persists correctly on Cap path | **FAIL** — default Supabase `persistSession` → **WebView localStorage**, not Keychain |
| Session recovery after kill/cold | **UNPROVEN** on device |
| Expired session redirect | **UNPROVEN** |
| Return route restored after login | **UNPROVEN** |
| Register / Password reset device flows | **UNPROVEN** (features exist in UI/API) |

**Board: Recovery FAIL · Expiration FAIL · Register FAIL**

---

## 4. Keychain Validation

| Claim | Evidence |
|-------|----------|
| Native `KeychainStore` exists | **YES** — service `com.yousef.majlisilm.auth`, account `majlis.auth.session.v1` |
| Native `NetworkService` persists AuthSession to Keychain only | **YES** (static) · purges legacy UserDefaults key |
| Cap WebView login uses Keychain as PRIMARY store | **NO** — `supabase-bootstrap.ts` has no custom storage adapter; JS session ≠ Keychain |
| No auth token in UserDefaults (native write) | **PASS (static)** — no Swift write of token blobs to UserDefaults found; purge present |
| No debug credential storage | **FAIL** — `app-store-review-auth.ts` hardcodes review email/password; session flag in `localStorage` |
| Keychain ownership correct for Cap auth | **UNPROVEN / FAIL vs contract** — Cap path does not own Keychain session |

---

## 5. Prayer Validation

| After Login → Prayer | Result |
|----------------------|--------|
| Theme / calculation / immersive boundary | **UNPROVEN** — Login never completed on device in this phase |

---

## 6. Mushaf Validation

| After Login → Mushaf | Result |
|----------------------|--------|
| Bookmark ownership / mapping / reader state | **UNPROVEN** — Login never completed |

---

## 7. Failure Modes

| Mode | Status |
|------|--------|
| Account Delete feature | **PRESENT** (`/account-deletion`, `/api/account/delete`) — device request/confirm/post-delete **UNPROVEN** (not OWNER_ACTION missing; feature exists but uncertified) |
| Account Export feature | **PRESENT** (`/api/account/export` via Privacy/Settings) — delivery **UNPROVEN** |
| Dual session stores | Cap localStorage vs native Keychain — risk of split-brain |
| Deep link to `/account` | OS dialog intercept (`sim/04-account-deeplink-dialog.png`) |
| No agent auth fixture | Blocks Login/Logout/Register/Recovery/Expiration PASS board |

---

## 8. Exit Decision

### Required board

```text
Login PASS       → FAIL
Logout PASS      → FAIL
Register PASS    → FAIL
Recovery PASS    → FAIL
Expiration PASS  → FAIL
```

### Exit code

```text
IOS_AUTH_NOT_CERTIFIED
T-034=FAIL
KEYCHAIN_NATIVE=PRESENT
CAP_SESSION_STORE=localStorage
REVIEW_CREDENTIALS_IN_CLIENT=YES
ACCOUNT_DELETE=FEATURE_PRESENT_UNPROVEN
ACCOUNT_EXPORT=FEATURE_PRESENT_UNPROVEN
DEEP_LINKS_PREREQ=NOT_CERTIFIED
OFFLINE_CERT=NOT_STARTED
MUSHAF_DEVICE_CERT=NOT_STARTED
PRAYER_CERT=NOT_STARTED
PUSH_CERT=NOT_STARTED
A11Y_CERT=NOT_STARTED
DEVICE_MATRIX=NOT_STARTED
TESTFLIGHT=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_AUTH_CERTIFIED`. Do not start Offline / Mushaf Device / Prayer / Push / Accessibility / Device Matrix / TestFlight certifications until Login–Expiration board is proven on device with Cap session store meeting the Keychain contract (or contract explicitly revised by OWNER).
