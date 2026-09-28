# ADHAN PIPELINE MAP — Early-Stop RCA

Date: 2026-09-28  
Branch: `cursor/adhan-early-stop-rca`  
Symptom: adhan begins, stops after ~5s, full adhan never completes.

## Dependency graph

```
Event (prayer epoch)
  ↓
Dual schedulers (JS timers + native)
  ├─ adhan-scheduler.ts          → scheduleIosFullAdhan / scheduleAndroidFullAdhan + JS fire
  └─ prayer-alert-scheduler.ts   → enter/pre/post LocalNotifications + enter-time reschedule
  ↓
Notification layer
  ├─ iOS: LocalNotifications + CAF sounds (adhan-ios-segments, ids 710000+)
  └─ Android: AlarmManager → AdhanAlarmReceiver → AdhanPlaybackService (MediaPlayer)
  ↓
Audio launcher
  ├─ Locked / killed: OS notification sound OR Android FGS player
  └─ Foreground: playPrayerAthanSync → adhan-playback.playAdhanUrl (maxMs=null)
  ↓
Segment chain (iOS full + makkah-style only)
  segment0 @ T+0 → segment1 @ T+29s → segment2 @ T+58s → segment3 @ T+87s
  ↓
Completion
  ├─ iOS chain: last CAF ends (or smart-cancel → in-app full resume)
  └─ Android / in-app: MediaPlayer / HTMLAudio onended
```

## Component inventory

| Layer | File | Role |
|---|---|---|
| Prefs | `adhan-preferences.ts` | mode full/short/takbir/silent, per-prayer enable |
| Scheduler A | `adhan-scheduler.ts` | JS timers + iOS segment schedule + Android alarm |
| Scheduler B | `prayer-alert-scheduler.ts` | banner/Live Activity + native prayer notifs; **enter → reschedule** |
| iOS segments | `adhan-ios-segments.ts` | ≤4 CAF ≤28s, gap 29s, `extra.adhanSegment=true` |
| Android alarm | `adhan-android-alarm.ts` + `AdhanPlaybackService.kt` | exact alarm + FGS MediaPlayer |
| Cancel / resume | `adhan-smart-cancel.ts` | cancel chain on tap/open + optional in-app resume |
| Native cancel | `prayer-local-notifications.ts` | `cancelExcept` / `cancelAll` |
| In-app player | `athan-playback-manager.ts` → `adhan-playback.ts` | prayer session, `maxMs: null` |
| Bus | `exclusive-audio-bus.ts` | stop other sources on claim |
| Boot wiring | `App.tsx` | AdhanScheduler + PrayerAlertScheduler + appStateChange |

## CAF durations (measured via `afinfo`)

| File | Duration |
|---|---|
| `adhan-seq-makkah-0{1..4}.caf` | **28.73s** each |
| `adhan-short-makkah.caf` / egypt / takbeerat | **11.23s** |
| `adhan-short-field*.caf` | **10.00s** |
| `adhan-short-aqsa.caf` | **22.47s** |
| `adhan-short-makkah-fajr.caf` | **23.51s** |

No bundled CAF is ~5s. File length alone cannot explain a ~5s stop.

## Early termination paths (inventory)

| # | File | Function | Condition | Can stop adhan? | Evidence |
|---|---|---|---|---|---|
| 1 | `prayer-local-notifications.ts` | `cancelPrayerNativeNotificationsExcept` | pending has `adhanSegment` and id ∉ keepIds | **YES — kills future (and racing current) segments** | keepIds built only from `hashPrayerNotificationId(pre/enter/post/iqamah)`; never 710k+ segment ids |
| 2 | `prayer-alert-scheduler.ts` | enter `setTimeout` → `startPrayerAlertScheduler` | prayer enter; `_lastScheduleSig=null` | **YES — triggers #1 at T≈0** | lines: null sig then `fetchPrayerTimes` → `startPrayerAlertScheduler` → `rescheduleAllNativePrayers` |
| 3 | `App.tsx` | `appStateChange` isActive | every foreground | **YES — cancel without resume** | `cancelAdhanNotificationChain({ resumeInternal: Boolean(getAdhanResumeContext()) })`; when ctx null → `cancelAdhanIosSegmentChain()` cancels **all** chains, no in-app resume |
| 4 | `adhan-smart-cancel.ts` | `cancelAdhanNotificationChain` | tap / open with ctx | YES by design (then resume) | OK if `resumeInternal` |
| 5 | `adhan-scheduler.ts` | foreground full path | `visibilityState===visible` | Cancels segments then `playPrayerAthanSync` | Intended; should complete in-app |
| 6 | `adhan-playback.ts` | `stopAdhan` / maxMs timer | maxMs set | YES if maxMs | Prayer path uses `maxMs: null` |
| 7 | `exclusive-audio-bus.ts` | claim other source | another audio claims | YES | Would log bus claim; not auto at 5s |
| 8 | `AdhanPlaybackService.kt` | `stopPlayback` / ACTION_STOP | completion, error, user Stop | YES | No 5s timeout in code; wakeLock 10min |
| 9 | iOS OS | notification sound | Focus/silent / system | Possible truncate ≤30s | Documented; not ~5s for CAF length |
| 10 | Android OS | notification channel sound | if alarm path unavailable | Possible ~5s channel truncate | DEVICE_REQUIRED if fallback path used |

## Root cause (code-proven)

**Classification: `DUPLICATE_SCHEDULER_INTERFERENCE`**

At prayer enter, Scheduler B force-reschedules prayer notifications and, via path #1, cancels all pending `adhanSegment` notifications that Scheduler A scheduled. Simultaneously, path #3 can wipe the entire iOS chain on any app activation without a resume context.

That is the exact termination point for the iOS multi-segment (and short CAF) notification pipeline. In-app full playback is a separate path; device logs (`ADHAN_*`) confirm which path fired.

### Why ~5s (not 28s)

CAF lengths are 10–28.7s — not 5s. The ~5s user report is consistent with a **race**: enter-time `cancelExcept` (or foreground cancel without resume) killing the just-delivered/playing notification sound mid-play, or only a brief fragment being heard before pending siblings are wiped. Wall-clock confirmation remains DEVICE_REQUIRED via `ADHAN_DIAG` logs.

## Reproduction matrix (expected after fix)

| State | Expected duration (full/makkah) | Actual (pre-fix theory) | Last event (pre-fix) | Termination |
|---|---|---|---|---|
| unlocked, app foreground | full file via HTMLAudio | may complete or race with cancel | ADHAN_START / APP_FOREGROUND | bus/cancel race or in-app OK |
| locked, app background | ~4×28.7s segments | segment1 only / cut early | SEGMENT_START 0 then cancel | path #1/#2 |
| app killed | same as locked | same if segments survive schedule | SEGMENT_* | path #1 only if JS was alive at enter |
| Android FGS alarm | full MediaPlayer | DEVICE_REQUIRED | ADHAN_START…COMPLETE | N/A if alarm granted |

DEVICE_REQUIRED for wall-clock durations on hardware.

## Fix (smallest safe)

1. `cancelPrayerNativeNotificationsExcept`: **do not cancel** `extra.adhanSegment === true` (owned by `adhan-ios-segments` / smart-cancel / `cancelAll`).
2. `App.tsx` appStateChange: call `cancelAdhanNotificationChain` **only when** resume context exists.
3. Diagnostics only otherwise — no redesign of notifications, prayer calc, logicalId, or dedupe.
