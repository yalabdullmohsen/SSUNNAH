# Widget + Live Activity Device Runbook

**Authority on main only:** `PrayerWidget/` + `PrayerLiveActivity/` + App Group foundation  
**Do not restore PR #2299 architecture**  
**Exit today:** `WIDGET_LIVE_ACTIVITY_RUNBOOK_READY` · physical execution `DEVICE_REQUIRED`  
**Static cert on main:** `IOS_WIDGETS_PRAYER_CERTIFIED` (T-029) ≠ device photo proof

## Supported families (from source)

```text
Home: systemSmall · systemMedium · systemLarge
Lock: accessoryInline · accessoryCircular · accessoryRectangular
Bundle: com.yousef.majlisilm.PrayerWidget
App Group: group.com.yousef.majlisilm
```

## Critical interpretation rule

A Widget Gallery / Xcode preview showing `—` is **not alone a failure**.  
Real result requires: add widget to Home Screen → launch Sunnah → allow data publication → verify timeline on device.

## Widget cases

```text
WGT-ADD-BEFORE-APP-LAUNCH
WGT-ADD-AFTER-APP-LAUNCH
WGT-CURRENT-PRAYER
WGT-NEXT-PRAYER
WGT-COUNTDOWN
WGT-TIMELINE-RELOAD
WGT-APPGROUP-UPDATE
WGT-TAP-DEEP-LINK
WGT-DEVICE-RESTART
WGT-TIMEZONE-CHANGE
WGT-LOCATION-CHANGE
WGT-LIGHT
WGT-DARK
WGT-FAMILY-SMALL
WGT-FAMILY-MEDIUM
WGT-FAMILY-LARGE
WGT-LOCK-INLINE
WGT-LOCK-CIRCULAR
WGT-LOCK-RECTANGULAR
```

## Live Activity cases

```text
LA-START
LA-UPDATE
LA-END
LA-DYNAMIC-ISLAND-COMPACT   (device-capable only; else NOT_APPLICABLE)
LA-DYNAMIC-ISLAND-EXPANDED  (device-capable only; else NOT_APPLICABLE)
LA-LOCK-SCREEN-PRESENTATION
```

## Build class

```text
Presence/smoke on TF_55           = CAN_TEST_ON_BUILD_55
Tip-aligned reload/AppGroup cert  = REQUIRES_FUTURE_BUILD_GE_56
```

## Evidence

Screenshot/video of Home Screen widget after app launch + data publish.  
Preview-only captures → `NOT_APPLICABLE` or `FAIL` with note `PREVIEW_ONLY_NOT_DEVICE_TIMELINE`.
