# Prayer / Notification / Push Device Runbook

**Policy:** Do not change prayer calculation methods or scheduling formulas  
**Exit today:** `PRAYER_PUSH_RUNBOOK_READY` · execution `DEVICE_REQUIRED`

## Channels (never conflate)

```text
LOCAL_NOTIFICATION
REMOTE_PUSH          (APNs)
LIVE_ACTIVITY
WIDGET_TIMELINE
```

A local notification PASS does **not** certify APNs remote push.

## Prayer / local cases

```text
PRY-CURRENT
PRY-NEXT
PRY-COUNTDOWN
PRY-LOCAL-FG
PRY-LOCAL-BG
PRY-LOCAL-TERMINATED
PRY-LOCK-SCREEN
PRY-PERM-DENIED
PRY-PERM-GRANTED
PRY-TIMEZONE-CHANGE
PRY-LOCATION-CHANGE
PRY-REBOOT
PRY-SILENT-MODE
PRY-FOCUS-MODE
PRY-LOW-POWER
PRY-LA-INTERACTION
PRY-WIDGET-SYNC
```

## Remote push cases (separate)

```text
PUSH-REGISTER
PUSH-FG-DELIVERY
PUSH-BG-DELIVERY
PUSH-TERMINATED-DELIVERY
PUSH-DUPLICATE-GUARD
PUSH-DEEP-LINK-OPEN
```

## Build class

```text
Local/prayer UX baseline     = CAN_TEST_ON_BUILD_55
Tip-aligned APNs / LA / sync = REQUIRES_FUTURE_BUILD_GE_56
```

## Related

`docs/audit/IOS_PRAYER_ADHAN_CERTIFICATION_REPORT.md`  
`docs/audit/IOS_PUSH_CERTIFICATION_REPORT.md`  
`docs/store-release/DEVICE_NOTIFICATION_MATRIX.md`
