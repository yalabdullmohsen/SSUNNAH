# Widget Physical Certification Packet

TASK_CLASSIFICATION: IOS_ONLY

WEB_IMPACT: none

IOS_APPLICATION_IMPACT: evidence capture only until devices are connected

APP_STORE_PRODUCT_IMPACT: blocks Store claim until DEVICE_REQUIRED rows are filled

SHARED_PLATFORM_IMPACT: none

Status: WIDGET_PHYSICAL_CERTIFICATION_PACKET_READY  
Physical execution classification: DEVICE_REQUIRED  
No pass claimed without evidence.

## Devices

- current supported iPhone
- older/smaller supported iPhone
- iPad
- iPad Split View where applicable

## Contexts

Home Screen · Lock Screen · StandBy · Light · Dark · tinted rendering where supported ·
large text · Arabic RTL · offline · stale data · no data · first app open · app terminated ·
app background · account switch · logout · permission revoked · timezone change · day rollover

## Capture fields (per retained kind × declared family)

- screenshot path
- kind
- family
- device
- OS
- data state
- tap destination
- clipping result
- VoiceOver result
- refresh result
- pass/fail
- defect link

## Kind inventory under test

32 registered kinds from `WIDGET_CENTER_CATALOG` / `SunnahWidgetKind.allUnique`.
Custom AppIntent twin remains DEFER_FROM_V1 (OPTION C).
Build 55 compatibility kind `PrayerTimesWidget` retained.

## Evidence log

| Row ID | Kind | Family | Device | OS | Context | Result | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| (empty until owner connects devices) | — | — | — | — | — | DEVICE_REQUIRED | — |

Do not mark any row PASS without screenshot + metadata.
