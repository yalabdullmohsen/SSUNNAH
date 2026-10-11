# طلبات قسم الصوت دون اتصال (PR #2928)

الـPR يقتصر على `Sources/SunnahNative/Audio/**` و`Tests/`. ما يلي خارج نطاقه، ومكتوب جاهزًا في تاريخ الفرع
`claude/project-thread-dnfqq3` (commit `157425e` و`6a0c0a4`) لمن يملك الملف أن يأخذه كما هو.

## لـن2 — التسجيل في الموجّه
- `Special/SpecialScreens.swift`: `registry.register(OfflineAudioScreen.self)` (المعرّف `offline-audio`).

## لـن3 — هدف التطبيق والبيانات
1. **مشغّل AVPlayer** (`ios-native/SunnahApp/Platform/NativeAudioPlayer.swift` في `157425e`): يحقّق `AudioPlaybackEngine` فوق
   `PlaybackSessionAdapter` و`OfflineAudioAdapter`، ويُحقن في `SunnahApp`:
   `.environment(\.audioEngineFactory, NativeAudio.factory)` و`offlineAudio: NativeAudio.offline`.
   يستعمل من الحزمة `SurahReciter.bundled()` و`playableURL(for:reciters:)` (المحلي أولًا). بلا هذا يبقى `AudioPlayerTemplate` فارغًا.
2. **بيانات القرّاء** (`export-ios-data.mjs` في `157425e`): يصدّر `audio/surah-reciters.json`
   (`[{id, nameAr, surahBaseUrl}]`، 29 قارئًا) من `RECITERS` في `src/lib/quran-audio.ts` ويحترم `quran-audio-remote.json`.
   المعرّف = مجلد `MajlisOfflineAudio/<id>/` فتبقى تنزيلات النسخة الحالية صالحة. بلا الملف تعرض شاشة `offline-audio` خطأ التحميل.
3. **بوابات iOS حمراء على `native-app` منذ `a113bcf`** (ليست من هذا الـPR): `OfflineAudioStore.swift` و`PlaybackSessionController.swift`
   في `Shared/` غير مضافين إلى مصادر هدف App في `App.xcodeproj/project.pbxproj` (فلا يُبنى تطبيق Capacitor الحالي)،
   و`test-ios-capacitor-gates.mjs` + `ios-background-audio-2-5-4-gate.test.ts` + `native-offline-audio-gate.test.ts` تبحث عن السلوك
   في ملف الـplugin وحده (5 بوابات تفشل). الإصلاح كاملًا في `6a0c0a4`.
4. `docs/native/APP_TARGET_NEEDS.md`: إضافة `NativeAudioPlayer.swift` وملف `Data/audio/surah-reciters.json`.

## لم يُتحقق منه (لا بناء SwiftUI في الجلسة السحابية)
- بناء الحزمة واختبارات `OfflineRecitationTests` على iOS: يغطيها CI «iOS SunnahNative tests».
- `NativeAudioPlayer.swift` (هدف التطبيق) لم يُبنَ إطلاقًا.
