# T-032 — iOS App Shell Stability Report

| Field | Value |
|-------|-------|
| Phase | `T-032 IOS_APP_SHELL_STABILITY` |
| Date (UTC) | `2026-10-01` |
| Tip commit at run | `4d26acf5` (production MATCH at capture) |
| Evidence | `docs/audit/evidence/t032-ios-app-shell/` |
| Exit | **`IOS_APP_SHELL_NOT_STABLE`** → **FAIL** |

Depends on: Prayer Live Activity certified (T-031).  
Device class: **iOS Simulator** (iPhone 17 Pro · iPad Pro 13-inch). Physical TestFlight matrix = later phase (not started).

---

## 1. Startup Paths

| Path | iPhone | iPad | Evidence |
|------|--------|------|----------|
| Cold Start | **PASS** (~14.7s to Home chrome) | **PASS** (solo retry) | `iphone/01-cold-start.png` · `ipad-retry/01-cold.png` |
| Warm Start | **PASS** | **PASS** (solo retry) | `02-warm-start.png` |
| Process Kill → Relaunch | **PASS** | PARTIAL | `05-kill-relaunch.png` |

Must-not checks on passing Home frames: no white/blank · chrome present · RTL · theme cream/green stable.

First dual-boot iPad capture produced false WHITE (wrong display) — discarded; solo retry used.

---

## 2. Resume Paths

| Path | iPhone | iPad | Notes |
|------|--------|------|-------|
| Background → Foreground | **PASS** | unproven dual-run | `03-bg-fg.png` full Home |
| Resume after idle | **PASS** | unproven dual-run | `04-idle-resume.png` |
| Offline start | **PASS*** | PARTIAL | `*remote server.url` — non-blank; full Offline Certification = M5 (not started) |

---

## 3. Navigation Integrity

| Check | Result |
|-------|--------|
| Route loss on resume (Home) | No evidence of loss on iPhone PASS frames |
| Reload loop | Not observed on PASS frames |
| Startup chrome jump | Static U4 / shell gates PASS; Home screenshots show reserved chrome |
| Deep Link Launch → target route | **FAIL** — see §4 |

Custom scheme `majlisilm://` presents iOS dialog «فتح في "سُنّة"؟» and automation did **not** reach `/prayer-times` or `/mushaf` inside the Cap shell.

---

## 4. Prayer Validation

| Scenario | Result | Evidence |
|----------|--------|----------|
| Cold start (Home shell) | PASS | no immersive leak on Home |
| App resume (Home) | PASS | `03-bg-fg` / `04-idle-resume` |
| Deep link → Prayer Screen | **FAIL** | `iphone/07-deeplink-prayer.png` · `iphone-deeplink-retry/prayer.png` = OS dialog over Home |
| Theme / surface leak after prayer deep link | **UNPROVEN** | Prayer UI never opened |

Static code gates (`prayer-page-flash-gate`) PASS — insufficient alone for this exit.

---

## 5. Mushaf Validation

| Scenario | Result | Evidence |
|----------|--------|----------|
| Direct route / deep link | **FAIL** | Dialog intercept; earlier Safari capture discarded |
| Resume / rotation on Mushaf | **UNPROVEN** | Not reached in Cap shell |

---

## 6. Safe Area Validation

| Device | Result | Evidence |
|--------|--------|----------|
| iPhone Home | **PASS** | Dynamic Island + bottom nav clear of home indicator |
| iPad Home (solo) | **PASS** | Top chrome below status bar |

---

## 7. Performance Summary

| Metric | iPhone (Simulator) |
|--------|---------------------|
| Cold start → first Home chrome | ~14704 ms |
| First visible route (cold) | `/` Home |
| Theme correctness (Home) | Light cream + emerald hero |
| Safe area | OK on Home PASS frames |
| Route restore after kill | Home restored |

---

## 8. Exit Decision

### Required board

```text
Cold Start PASS          (iPhone · iPad solo)
Warm Start PASS          (iPhone · iPad solo)
Resume PASS              (iPhone)
Offline PASS*            (iPhone; *remote URL caveat)
Rotation PASS            (iPhone)
Split View FAIL          (multitasking never entered)
Deep Link Launch FAIL    (Prayer/Mushaf not opened in-app)
```

### Blocking

1. Deep Link Launch does not open Prayer Screen (OS confirmation blocks route proof).  
2. iPad Split View not evidenced.  
3. Mushaf in-app deep-link path not evidenced.

### Exit code

```text
IOS_APP_SHELL_NOT_STABLE
T-032=FAIL
STATIC_SHELL_GATES=PASS
SIMULATOR_EVIDENCE=PARTIAL
DEEP_LINKS_CERT=NOT_STARTED
AUTH_CERT=NOT_STARTED
OFFLINE_CERT=NOT_STARTED
MUSHAF_CERT=NOT_STARTED
DEVICE_MATRIX=NOT_STARTED
TESTFLIGHT=NOT_STARTED
```

**Verdict: FAIL** — do not claim `IOS_APP_SHELL_STABLE`. Do not start Deep Links / Auth / Offline / Mushaf / Device Matrix / TestFlight certifications until shell exit is actually closed with in-app deep-link + Split View proof.
