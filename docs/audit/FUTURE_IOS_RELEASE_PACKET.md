# Future iOS Release Packet

TASK_CLASSIFICATION: APP_STORE_ONLY

Do not create a Build in this program.

FUTURE_IOS_UPDATE_REQUIRED = true  
OWNER_REQUIRED for Archive / IPA / TestFlight / App Store

## Exact future Build recommendation

- Recommend Build **56** (or next owner-approved increment) after physical-device matrix PASS for retained kinds.
- Source SHA: fill at release cut with the then-current `origin/main` tip that contains Widget PRs #2557 and W1–W5.
- Current repository Build remains **55** (unchanged by this closure program).

## Merged PR inventory (Widget platform track)

- #2557 Widget platform source merge (`a99d2fe5b`)
- #2568 W1 catalog product justification
- #2569 W2 Custom Widget OPTION C
- #2570 W3 data truth hardening
- #2571 W4 Widget Center Form Authority
- W5 governance completeness (this packet accompanies)

## Widget kind inventory

- 32 unique registered kinds
- Build 55 compatibility: `PrayerTimesWidget`
- Custom kind owner: `CustomContentStaticWidget` (`sunnah.widget.custom`)
- Deferred: `CustomContentWidget` AppIntent twin (same kind forbidden)

## Family matrix

Home Screen small/medium/large · Lock Screen circular/rectangular/inline where declared · StandBy where supported

## Configuration matrix

App Intent configuration where declared · Static V1 custom selection via Widget Center · Preferences in App Group envelope

## App Group verification

- Identifier: `group.com.yousef.majlisilm`
- Envelope: `sunnah.shared.envelope.v1`
- Legacy prayer: `sunnah.shared.prayer.v1`
- Forbidden: tokens, secrets, email, phone, precise coordinates, account-private JSON

## Entitlements checklist

- [ ] Main App App Group
- [ ] PrayerWidgetExtension App Group
- [ ] PrayerLiveActivityExtension App Group
- [ ] No revived `*.widgets` App Group from PR #2299

## Signing checklist

- [ ] Owner signing identity
- [ ] Provisioning profiles current
- [ ] No repository action to change signing in this program

## Physical-device evidence checklist

- [ ] Packet rows filled for retained kinds × families
- [ ] Lock Screen / StandBy evidence
- [ ] Account switch / logout evidence
- [ ] Permission revocation evidence
- [ ] VoiceOver sampling

## TestFlight validation plan

1. Archive Build ≥56 from release SHA
2. Upload TestFlight (OWNER)
3. Install on matrix devices
4. Execute physical packet
5. Confirm no private data in App Group after logout
6. Confirm gallery ≠ live data confusion resolved on device

## Privacy notes

Widgets show public-safe snapshots and local progress counters only.
No account tokens in App Group.
Web Widget Center does not render WidgetKit.

## Release notes draft (Arabic)

- ويدجت سُنّة لمواقيت الصلاة والتاريخ والأذكار والقرآن والمحتوى اليومي
- مركز ويدجت داخل التطبيق لإعداد اللقطات
- يتطلب تحديث التطبيق لظهور الويدجت على الشاشة الرئيسية وشاشة القفل

## Rollback plan

- Keep Build 55 live until Build ≥56 physical PASS
- If regression: halt phased release; retain App Group schema v1 readers; do not delete Build 55 compatibility kind

## Build 55 compatibility plan

- Retain `PrayerTimesWidget` kind
- Additive envelope fields only
- No forced migration of installed widgets

## App Store screenshot updates

OWNER_REQUIRED if Widget gallery marketing assets change.

## Review-note explanation

New WidgetKit surfaces read App Group snapshots published by the main app; prayer/Hijri/Quran engines remain in-app only; previews use isolated fixtures.

## Required outputs

FUTURE_IOS_RELEASE_PACKET_COMPLETE  
FUTURE_IOS_UPDATE_REQUIRED = true
