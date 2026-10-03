# Mushaf Device Runbook

**Policy:** Do not modify Quran content, mapping, or 604-page architecture  
**Exit today:** `MUSHAF_DEVICE_RUNBOOK_READY` · execution `DEVICE_REQUIRED`  
**Forbidden claim:** `MUSHAF_SILKY` without measured evidence

## Cases

```text
MSH-OPEN
MSH-FIRST-PAGE-RENDER
MSH-TURNS-25-FORWARD
MSH-TURNS-50-FORWARD
MSH-TURNS-100-FORWARD
MSH-TURNS-BACKWARD
MSH-BOOKMARK-SET
MSH-BOOKMARK-RESTORE
MSH-SEARCH
MSH-SELECTION
MSH-TAFSIR
MSH-AUDIO                 (only if licensed path included; else NOT_APPLICABLE / STREAM_ONLY note)
MSH-BG-FG
MSH-MEMORY-PRESSURE
MSH-ROTATION              (where supported)
MSH-IPAD-SPLIT
MSH-DYNAMIC-TYPE
MSH-REDUCE-MOTION
MSH-NO-PERMANENT-PAGER-LOCK
```

## Collect (no invented numbers)

```text
latencyObservations (measured or leave blank)
crashes
blankPages
stuckLocks
fontFailures
memoryWarnings
artifactPath (screenshot/video)
```

## Build class

Baseline turns allowed on TF_55 / review build with Build declared.  
Tip-aligned certification prefers Build ≥56.

## Related

Historical: `docs/audit/MUSHAF_IOS_DEVICE_CERTIFICATION_REPORT.md` · evidence `t036-mushaf-ios/`
