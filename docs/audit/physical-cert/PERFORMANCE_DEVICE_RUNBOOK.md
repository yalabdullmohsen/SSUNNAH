# Performance Device Runbook

**Exit today:** `PERFORMANCE_RUNBOOK_READY` · execution `DEVICE_REQUIRED`  
**Rule:** No invented numbers · No estimates · Blank metric allowed until measured

## Metric fields (each sample row)

```text
metricId
deviceModel
osVersion
appVersion
appBuild
measurementMethod   (Instruments / stopwatch / Xcode Metrics / os_signpost / other declared)
sampleData          (raw samples array or single measured value)
unit
result              (PASS|FAIL|BLOCKED_*|NOT_APPLICABLE)
artifactPath
tester
testedAt
notes
```

## Required metric IDs

```text
PERF-COLD-START
PERF-WARM-START
PERF-RESUME
PERF-NAV-HOME
PERF-NAV-SEARCH
PERF-NAV-QURAN-HUB
PERF-MUSHAF-FIRST-RENDER
PERF-MUSHAF-PAGE-TURN
PERF-PRAYER-SCREEN
PERF-MEMORY
PERF-SUSTAINED-FPS          (where measurable; else NOT_APPLICABLE)
PERF-NETWORK-REQUEST-COUNT
PERF-BATTERY-THERMAL-NOTES  (observational)
```

## Build class

Every metric must declare Build. Tip-aligned claims prefer ≥56.

## Related

`docs/audit/MOBILE_PERFORMANCE_CERTIFICATION_REPORT.md` · `MOBILE_PERFORMANCE_NOT_CERTIFIED`
