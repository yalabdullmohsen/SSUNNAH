# iOS Native Architecture Certification — سُنّة

| Field | Value |
|-------|-------|
| Certified (UTC) | `2026-10-01T17:16:00Z` |
| Status | **`IOS_NATIVE_ARCHITECTURE_CERTIFIED`** (repo identity + entitlements) |
| Bundle ID (canonical) | `com.yousef.majlisilm` |
| Team | `5D8TX37HTS` |
| Deployment target | `16.2` (all targets) |
| Device family | `1,2` (iPhone + iPad) |
| AASA production | `5D8TX37HTS.com.yousef.majlisilm` @ `https://www.ssunnah.com` HTTP 200 |

## Identity matrix (verified in tree)

| Surface | Value | Match |
|---------|-------|-------|
| `capacitor.config.ts` `appId` | `com.yousef.majlisilm` | ✓ |
| `capacitor.config.json` `appId` | `com.yousef.majlisilm` | ✓ |
| `ios/App/App/capacitor.config.json` | `com.yousef.majlisilm` | ✓ |
| Xcode App Debug/Release `PRODUCT_BUNDLE_IDENTIFIER` | `com.yousef.majlisilm` | ✓ |
| PrayerLiveActivity extension | `com.yousef.majlisilm.PrayerLiveActivity` | ✓ |
| Info.plist URL scheme name | `com.yousef.majlisilm` / scheme `majlisilm` | ✓ |
| Keychain service | `com.yousef.majlisilm.auth` | ✓ |
| Production AASA `appIDs` | `5D8TX37HTS.com.yousef.majlisilm` | ✓ |
| Watch app target | — | **NOT PRESENT** |
| Home Screen Widget target (non-LA) | `com.yousef.majlisilm.PrayerWidget` | **PRESENT** — `IOS_WIDGETS_PRAYER_CERTIFIED` (T-029) |
| App Groups | `group.com.yousef.majlisilm` | **Prepared** — App · LA · PrayerWidget; portal registration OWNER_ACTION |

**Decision:** Do **not** rename Bundle ID. No evidence of a different App Store Connect identifier in-repo. If ASC differs → OWNER_ACTION Decision Record before any rename.

## Capabilities (repo)

| Capability | Evidence | Notes |
|------------|----------|-------|
| Associated Domains | debug + release entitlements | `www.ssunnah.com`, `ssunnah.com`, `majlisilm.com`, `www.majlisilm.com` |
| Push (`aps-environment`) | debug=`development` · release=`production` | Signing/provision = OWNER |
| Background modes | `audio`, `remote-notification` | Info.plist |
| Live Activities | `NSSupportsLiveActivities=true` + LA target | Prayer countdown only |
| Location When-In-Use | Usage string present | Qibla; coarse in PrivacyInfo |
| Motion | Usage string present | Qibla compass |
| Microphone / Speech | **Absent** from Info.plist | AI recitation removed |
| Tracking | PrivacyInfo `NSPrivacyTracking=false` | No ATT |
| Required Reason APIs | UserDefaults `CA92.1` only | No DiskSpace/BootTime |
| Export compliance | `ITSAppUsesNonExemptEncryption=false` | Info.plist |
| Orientations | iPhone portrait+landscape · iPad all | TARGETED_DEVICE_FAMILY 1,2 |
| ATS | `NSAllowsArbitraryLoads=false` | ✓ |
| Keychain tokens | `KeychainStore` / NetworkService | Not UserDefaults |
| Android Capacitor block | Removed from all config sources | iOS-only |

## PrivacyInfo.xcprivacy

| Check | Result |
|-------|--------|
| File present + App Resources membership | ✓ (gate) |
| Tracking false | ✓ |
| UserDefaults reason | ✓ |
| AudioData declaration | **Removed** (aligned with mic removal) |
| ASC Privacy answers sync | **OWNER_ACTION** — confirm console matches manifest |

## Signing / ASC (not claimable from repo)

| Item | Class |
|------|-------|
| Distribution certificate / profiles | OWNER_ACTION / BLOCKED_CREDENTIAL |
| App Store Connect app record | OWNER_ACTION |
| Automatic signing in Xcode with team `5D8TX37HTS` | Present in pbxproj; device proof OWNER |
| TestFlight upload | OWNER_ACTION + archive |

## Exit

```text
IOS_NATIVE_ARCHITECTURE_CERTIFIED
BUNDLE_ID_LOCKED=com.yousef.majlisilm
IOS_SHARED_DATA_FOUNDATION_READY
IOS_WIDGETS_PRAYER_CERTIFIED
APP_GROUP=group.com.yousef.majlisilm
WIDGET_BUNDLE_ID=com.yousef.majlisilm.PrayerWidget
WATCH_TARGET=NOT_STARTED
SIGNING_ASC=OWNER_ACTION
PORTAL_APP_GROUP_REGISTRATION=OWNER_ACTION
```
