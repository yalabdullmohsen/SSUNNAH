# تقرير نطاق التغييرات

**التاريخ:** 2026-10-11T14:39:31.064Z
**عدد الملفات:** 204
**النطاقات:** ios/capacitor، ci/config، docs، other، ui/layout
**docs-only:** لا

## البوابات المقترحة

| البوابة | مطلوب |
|---------|-------|
| ui | ✓ |
| api | — |
| seo | ✓ |
| pwa | — |
| content | — |
| ios | ✓ |
| full | ✓ |
| mushaf | — |
| build | ✓ |
| visual | ✓ |
| lighthouse | ✓ |
| color_contrast | ✓ |
| data_audit | — |

## الملفات المتغيرة (أول 40)

- `.github/workflows/ios-capacitor-gates.yml` → ios_capacitor
- `.github/workflows/ios-native-macos.yml` → ci_config
- `.github/workflows/ios-sunnah-native.yml` → ci_config
- `.github/workflows/ios-testflight-deploy.yml` → ci_config
- `artifacts/majalis/docs/handover/n3.md` → docs
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_circ_dark_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_circ_light_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_large_dark_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_large_light_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_medium_dark_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_medium_light_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_rect_dark_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_rect_light_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_small_dark_data.png` → other
- `artifacts/majalis/docs/handover/widgets-shots/1-prayer-next_small_light_data.png` → other
- `artifacts/majalis/ios/App/App/MajlisOfflineAudioPlugin.swift` → ios_capacitor
- `artifacts/majalis/ios/App/App/MajlisPlaybackAudioPlugin.swift` → ios_capacitor
- `artifacts/majalis/ios/App/App/PrayerLiveActivityController.swift` → ios_capacitor
- `artifacts/majalis/ios/App/App/PrayerLiveActivityPlugin.swift` → ios_capacitor
- `artifacts/majalis/ios/App/PrayerLiveActivity/PrayerLiveActivityLiveActivity.swift` → ios_capacitor
- `artifacts/majalis/ios/App/PrayerWidget/PrayerWidgetEntry.swift` → ios_capacitor
- `artifacts/majalis/ios/App/PrayerWidget/PrayerWidgetViews.swift` → ios_capacitor
- `artifacts/majalis/ios/App/Shared/OfflineAudioStore.swift` → ios_capacitor
- `artifacts/majalis/ios/App/Shared/PlaybackSessionController.swift` → ios_capacitor
- `artifacts/majalis/ios/App/Shared/SunnahBrandColors.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Package.resolved` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Package.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Audio/OfflineAudioScreen.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Audio/OfflineRecitation.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/StateViews.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/SunnahButton.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/SunnahCard.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/SunnahChip.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Components/SunnahListRow.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Data/ContentModels.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Data/ContentSource.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Design/Sunnah.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Generated/AqidahScreens.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Generated/FiqhScreens.swift` → ios_capacitor
- `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Generated/GeneratedScreens.swift` → ios_capacitor

… +164 ملفًا

## سياسات

- لا مخالفات (Majlisilm، مراجعة داخلية، خط المصحف).

## أوامر محلية

- PR صغير / docs: `pnpm run verify:changed`
- PR سريع: `pnpm run verify:ci-fast`
- main/release: `pnpm run verify:ci-full`

