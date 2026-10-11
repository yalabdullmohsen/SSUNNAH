# احتياجات هدف SunnahApp (لـن4) — من ن3

## الحزم المحلية (SwiftPM)
`SunnahNative` (يسحب SunnahDataKit وSunnahPrayer)، `SunnahWidgetKit`. المنصة iOS 16.

## ملفات تُضاف للهدف بعضوية ملفات (كما هي، لم تُعدَّل)
- `artifacts/majalis/ios/App/App/Services/KeychainStore.swift`
- `artifacts/majalis/ios/App/Shared/OfflineAudioStore.swift` و`PlaybackSessionController.swift` (بلا Capacitor؛ تحتاج Background Modes: audio)
- `artifacts/majalis/ios/App/Shared/{SunnahSharedData,SunnahWidgetEnvelope,SunnahWidgetRefreshCoordinator,SunnahBrandColors,SunnahPrayerDeepLink}.swift` (نفسها لهدف الويدجت)
- `ios-native/SunnahApp/SunnahApp.swift` و`ios-native/SunnahApp/Platform/*.swift` (محوّلات المنافذ)
- لا يُضاف أي ملف `*Plugin.swift` (أغلفة Capacitor) ولا `import Capacitor`.

## البيانات
- مرجع مجلد `ios-native/Data` (غير مُلتزَم) + Run Script Phase قبل Copy Bundle Resources: `ios-native/scripts/prepare-data.sh` (يستدعي `scripts/native-export-data.sh` من ن1، #2921 مدموج).
- القوالب تقرأ `Bundle.main` تحت `Data/<مجموعة>/…`.

## الصلاحيات والـentitlements
- App Group: `group.com.yousef.majlisilm` (التطبيق والويدجت والنشاط الحي).
- Keychain: الخدمة `com.yousef.majlisilm.auth` (بلا keychain-access-groups إضافية حاليًا؛ مجموعة الوصول الافتراضية للتطبيق).
- Push Notifications (aps-environment) إن بقي الدفع عن بُعد؛ الإشعارات المحلية بلا entitlement.
- Background Modes: audio (التشغيل)، fetch/processing (تحديث المواقيت).
- Info.plist: `NSLocationWhenInUseUsageDescription` (المواقيت)، `NSMicrophoneUsageDescription` + `NSSpeechRecognitionUsageDescription` إن لزم (التسميع)، `NSSupportsLiveActivities = YES`، `UIBackgroundModes`، `CFBundleLocalizations`/اللغة الافتراضية ar، `UIAppFonts` (Almarai، Amiri، QPC لاحقًا).
- Capabilities: Live Activities، Time Sensitive Notifications إن استُعملت.
