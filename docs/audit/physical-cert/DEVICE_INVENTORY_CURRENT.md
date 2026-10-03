# DEVICE_INVENTORY_CURRENT

**Captured (UTC):** `2026-10-03T16:22:12Z`  
**Method:** `xcrun xctrace list devices` + `xcrun devicectl list devices`  
**Mutation:** none (read-only discovery)

## Classification

```text
DEVICE_CONNECTION_REQUIRED
```

No physical iOS device is currently connected/available for interactive certification.
Offline/paired hosts were observed but `unavailable`.

## Physical devices observed (offline — not usable this session)

```text
ID: D-IP-PRIMARY-CANDIDATE
Model: iPhone 17 Pro (iPhone18,1)
OS: 26.5 (as reported by xctrace)
Connection: Offline / unavailable (devicectl)
Tester id (non-PII): tester-owner-primary
Installed Sunnah version/build: UNKNOWN (device not connected — do not invent)
TestFlight availability: UNKNOWN until connected
Storage: NOT_READ (unsafe/unavailable)
Role: iPhone primary (modern) when connected

ID: D-IP-SECONDARY-CANDIDATE
Model: iPhone 13 (iPhone14,5)
OS: 18.7.8
Connection: Offline / unavailable
Tester id (non-PII): tester-secondary-compact
Installed Sunnah version/build: UNKNOWN
Role: iPhone secondary (older/smaller) — REQUIRED by T-040 Older/Smaller class
```

## Missing required classes

```text
iPad                 = MISSING (no physical iPad discovered)
iPad Split View      = MISSING (depends on physical iPad)
```

## Simulators (diagnosis only — never physical PASS)

Examples present: iPhone 17 Pro Simulator, iPad Pro 13-inch Simulator, etc.  
Any evidence with `runtime=simulator` is `NOT_APPLICABLE` for physical certification gates.

## Rule

Do not fabricate filled inventory rows. When a device connects, update this file and create a dated pack under `docs/audit/device-evidence/`.
