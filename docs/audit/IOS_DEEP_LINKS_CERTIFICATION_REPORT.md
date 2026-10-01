# T-033 — iOS Deep Links Certification Report

| Field | Value |
|-------|-------|
| Phase | `T-033 IOS_DEEP_LINKS_CERTIFICATION` |
| Date (UTC) | `2026-10-01` |
| Tip commit at run | `4d26acf5` (branch base = `origin/main`) |
| Evidence | `docs/audit/evidence/t033-ios-deep-links/` |
| Exit | **`IOS_DEEP_LINKS_NOT_CERTIFIED`** → **FAIL** |

Depends on: T-032 App Shell report (`IOS_APP_SHELL_NOT_STABLE` — Deep Link Launch already FAIL).  
Device class: **iOS Simulator** (iPhone 17 Pro). Physical Universal Link device matrix = **MISSING** (not claimed).

---

## 1. Supported Links

| Kind | Status | Notes |
|------|--------|-------|
| AASA live | **LIVE** HTTP 200 | `https://www.ssunnah.com/.well-known/apple-app-site-association` · evidence `aasa.live.json` |
| Associated Domains | **CONFIGURED** | `applinks:www.ssunnah.com` (+ apex + majlisilm hosts) in entitlements |
| Custom scheme (native) | **`majlisilm://`** | `CFBundleURLSchemes` in `Info.plist` |
| `sunnah://` | **NOT REGISTERED** | Notification path sanitizer only (`sanitizeSunnahDeepLink`); simctl open fails `LSApplicationWorkspaceErrorDomain` 115 |
| Resolver unit | **PASS** (static) | `native-deep-link.ts` + `ios-stability-audit` |
| Home Universal Link | **EXCLUDED by AASA** | component `{ "/": "/", "exclude": true }` — intentional Safari for `/` |

Scoped routes (AASA components include): `/search*` `/quran*` `/mushaf*` `/prayer-times*` `/lessons*` `/hadith*` `/fiqh*` `/library*` `/settings*` `/account*` (+ others).

---

## 2. Universal Link Validation

| Mode | Result | Evidence |
|------|--------|----------|
| App Closed → `https://www.ssunnah.com/<route>` | **FAIL** | Safari + OS dialog «فتح في "سُنّة"؟» — Cap shell target route not confirmed (`closed/*-ul.png`) |
| App Background | **FAIL** | Dialog / Safari; no Cap route land (`background/mushaf-ul.png`) |
| App Foreground | **FAIL** | Prayer/Mushaf UL do not prove Cap navigation (`foreground/prayer-ul.png`, `mushaf-ul.png`) |
| Correct route open | **FAIL** | No automation path completed Open → in-app route without dialog intercept |
| No blank / fallback | **PARTIAL** | Some UL frames show web content (e.g. Mushaf in Safari); not Cap shell certification |

**Universal Link Device Evidence: still MISSING** for certified in-app opens.

---

## 3. URL Scheme Validation

| Scheme | Decision |
|--------|----------|
| `majlisilm://` | **Canonical native scheme** — registered; resolver maps to paths |
| `sunnah://` | **Documented non-use as OS scheme** — keep as notification-path prefix only; do not claim store deep-link scheme |

| Mode | Result | Evidence |
|------|--------|----------|
| Closed `majlisilm://<route>` (11 routes) | **FAIL** | Identical OS confirm dialog over SpringBoard — Cap never opened (`closed/*-scheme.png`) |
| Foreground `majlisilm://prayer-times` | **FAIL** | Home tab remains active behind dialog (`foreground/prayer-scheme.png`) |
| Background `majlisilm://prayer-times` | **FAIL** | Safari `example.com` + dialog (`background/prayer-scheme.png`) |

---

## 4. Auth Boundary Validation

| Scenario | Result |
|----------|--------|
| Logged Out deep link | **UNPROVEN** — no auth fixture in T-033 |
| Expired Session | **UNPROVEN** |
| First Install | **UNPROVEN** — not a clean first-install device |
| Preserve return target / restore after login | **UNPROVEN** |

Auth Certification = separate phase (not started).

---

## 5. Prayer Validation

| Check | Result |
|-------|--------|
| Deep Link → Prayer Screen (Cap) | **FAIL** — dialog intercept; FG still on Home |
| Theme leak / immersive leak / startup corruption | **UNPROVEN** — Prayer Cap route not opened via deep link in this matrix |

Static prayer flash gates remain separate from this exit.

---

## 6. Mushaf Validation

| Check | Result |
|-------|--------|
| Deep Link → Mushaf (Cap) | **FAIL** — UL shows Safari web Mushaf + dialog; scheme blocked by dialog |
| Page mapping / bookmark / reader ownership | **UNPROVEN** — Cap Mushaf not reached via deep link |

---

## 7. Failure Modes

1. **OS confirmation intercept** — `فتح في "سُنّة"؟` blocks automated Closed/BG/FG proof for both `majlisilm://` and `https://www.ssunnah.com`.  
2. **UL → Safari fallback** — `simctl openurl https://…` does not hand off into Cap without user Open.  
3. **`sunnah://` unregistered** — expected; documented.  
4. **Session modes** — no fixture → cannot claim Session PASS.  
5. **Invalid/missing entity** — dialog/Safari dominate captures; graceful Cap error UI not proven.  
6. **Prerequisite** — T-032 already recorded Deep Link Launch FAIL; shell not stable.

---

## 8. Exit Decision

### Required board

```text
Closed PASS          → FAIL
Background PASS      → FAIL
Foreground PASS      → FAIL
Invalid PASS         → UNPROVEN / FAIL
Session PASS         → FAIL (UNPROVEN)
```

### Exit code

```text
IOS_DEEP_LINKS_NOT_CERTIFIED
T-033=FAIL
AASA=LIVE
ASSOCIATED_DOMAINS=CONFIGURED
UNIVERSAL_LINK_DEVICE_EVIDENCE=MISSING
CUSTOM_SCHEME=majlisilm (registered; route proof FAIL)
SUNNAH_SCHEME=NOT_REGISTERED (documented)
AUTH_CERT=NOT_STARTED
OFFLINE_CERT=NOT_STARTED
MUSHAF_DEVICE_CERT=NOT_STARTED
PUSH_CERT=NOT_STARTED
A11Y_CERT=NOT_STARTED
TESTFLIGHT=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_DEEP_LINKS_CERTIFIED`. Do not start Authentication / Offline / Mushaf Device / Push / Accessibility / TestFlight certifications until deep-link in-app route proof exists (user Open confirmation path or physical-device UL evidence pack).
