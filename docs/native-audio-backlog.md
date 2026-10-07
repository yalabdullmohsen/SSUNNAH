# بنود الصوت المؤجلة إلى SwiftUI

الأولوية: P0 يحجب الإطلاق · P1 قريب · P2 لاحق. المسارات نسبةً إلى `artifacts/majalis/ios/App/`.

## 1) BGAppRefreshTask لإعادة الجدولة
- **الوصف:** مهمة تحديث خلفية تعيد جدولة إشعارات الأذان القادمة (تفادي سقف 64 إشعارًا محليًا وتغيّر الموقع/التوقيت).
- **الملفات:** `App/AppDelegate.swift` (تسجيل المهمة) · `App/Info.plist` (`BGTaskSchedulerPermittedIdentifiers`) · ملف Swift جديد للجدولة · `src/lib/adhan-downloads.ts`/محرّك الجدولة في JS للمصدر.
- **معيار القبول:** بعد 48 ساعة دون فتح التطبيق تبقى إشعارات الأيام التالية مجدولة؛ تُسجَّل آخر إعادة جدولة؛ لا انتهاك لحد المهمة (≤30ث).
- **الأولوية:** P0

## 2) التنزيل عند الطلب إلى Library/Sounds مع checksum
- **الوصف:** تنزيل ملفات CAF الاختيارية إلى `Library/Sounds` (المسار الذي يقرأه النظام للإشعارات) مع التحقق من SHA-256 قبل الاعتماد.
- **الملفات:** `App/MajlisOfflineAudioPlugin.swift` · `src/lib/adhan-offline-assets.ts` · `public/audio/adhan/bundle-manifest.json` (إضافة الحقل `sha256`).
- **معيار القبول:** ملف فاسد أو ناقص يُرفض ويُحذف؛ إعادة المحاولة بعد انقطاع الشبكة؛ الاسم وحده يُمرَّر للإشعار؛ لا تنزيل لملف غير موثّق في `docs/LICENSES.md`.
- **الأولوية:** P1

## 3) تطبيع الجهارة (loudness)
- **الوصف:** توحيد جهارة ملفات الأذان والنغمات (هدف مقترح −16 LUFS، ذروة ≤ −1 dBTP) كي لا يتفاوت الصوت بين الأنماط.
- **الملفات:** `App/Sounds/*.caf` · `scripts/verify-adhan-caf-durations.mjs` (إضافة فحص الجهارة) · سكربت التحويل المولِّد.
- **معيار القبول:** فرق الجهارة بين أي ملفين ≤ 1 LU؛ المدة ≤30ث؛ الفحص يمرّ في CI.
- **الأولوية:** P2

## 4) شاشة تشخيص الإشعارات المجدولة
- **الوصف:** شاشة SwiftUI تعرض الإشعارات المعلّقة (`getPendingNotificationRequests`) بوقتها وصوتها، وحالة الأذونات وآخر إعادة جدولة.
- **الملفات:** ملف SwiftUI جديد · `src/lib/adhan-diagnostics.ts` (المرجع الوظيفي) · `App/AppDelegate.swift`.
- **معيار القبول:** تطابق العدد المعروض مع النظام؛ تعمل دون اتصال؛ زر نسخ التشخيص؛ RTL صحيح.
- **الأولوية:** P1

## 5) شاشة الإذن المرفوض
- **الوصف:** عند رفض إذن الإشعارات تظهر شاشة تشرح الأثر على الأذان وتفتح إعدادات التطبيق مباشرة.
- **الملفات:** ملف SwiftUI جديد · `App/AppDelegate.swift` (فحص `authorizationStatus`).
- **معيار القبول:** تظهر فقط عند `.denied`؛ تختفي تلقائيًا بعد منح الإذن عند العودة؛ نص عربي RTL بلا وعود بالتشغيل مع الصامت/Focus.
- **الأولوية:** P0

## 6) شاشة «المصادر والشكر»
- **الوصف:** عرض مصادر الأصوات والنصوص وتراخيصها وشكر أصحاب الحقوق داخل التطبيق الأصلي.
- **الملفات:** ملف SwiftUI جديد · `docs/LICENSES.md` و`CREDITS.md` (مصدر البيانات) · `src/lib/prayer-audio-rights-registry.ts`.
- **معيار القبول:** تعكس كل أصل حالته الحالية في `docs/LICENSES.md`؛ لا تنسب تسجيلًا لشخص دون إذن؛ روابط تعمل.
- **الأولوية:** P1

## 7) ترحيل مستخدمي field / field-full قبل أي حذف لهما
- **الوصف:** شرط مسبق لحذف الملفين (غير مقرَّر حاليًا؛ الملفان موثّقان CC0). يُرحَّل تلقائيًا كل من اختار `field` أو `field-full` إلى الأذان الافتراضي (`DEFAULT_MUEZZIN_ID`) ثم تُعاد الجدولة، وبعدها فقط يُحذف الملفان.
- **مواضع الإشارة (الحالة المحفوظة):** `selected_muezzin_id` في `localStorage` (`src/lib/adhan-preferences.ts:20`) · `defaultMuezzinId` و`prayers[*].muezzinId` في تفضيلات الأذان (`adhan-preferences.ts:132-141, 258-262` — ينظّف أصلًا المعرّفات غير المسموحة) · `src/lib/prayer-notifications/preferences.ts` (`migrateFromLegacyPreferences`).
- **مواضع الإشارة (الكتالوج والجدولة):** `src/lib/adhan-settings-sound-catalog.ts:36-107` · `src/lib/adhan-offline-assets.ts:159-188` · `src/lib/adhan-audio.ts:45-46, 528-573` · `src/lib/adhan-featured-styles.ts:8-21` · `src/lib/prayer-notification-sounds.ts:41-42` · `src/lib/adhan-scheduler.ts` و`prayer-local-notifications.ts` (تقرأ الاسم المحفوظ).
- **مواضع الإشارة (الشحن والتوثيق):** `scripts/store-strip-unresolved-assets.mjs:32-36` · `scripts/build-store-asset-inventory.mjs` · `scripts/verify-store-assets.mjs:82-138` (تفشل إن غاب التوثيق) · `docs/store-release/*` · `docs/audit/*allowlist*` · `artifacts/majalis/docs/audio-rights/approved-sources-registry.json`.
- **الملفات المتأثرة:** كل ما سبق + `App/Sounds/adhan-short-field*.caf` و`public/audio/adhan/adhan-field*.m4a`.
- **معيار القبول:** مستخدم محفوظ له `field` أو `field-full` (عامًّا أو لصلاة بعينها) يُرحَّل عند أول تشغيل بعد التحديث دون رسالة خطأ؛ تُلغى الإشعارات المعلّقة القديمة وتُعاد جدولتها بالصوت الافتراضي؛ لا مرجع متبقٍّ للملفين في الكتالوج؛ اختبار ترحيل ناجح؛ بوابات `verify-store-assets` محدَّثة.
- **الأولوية:** P1 (يصير P0 إن تقرّر الحذف)

## 8) كشف الانتقال إلى آية متشابهة
- **الوصف:** كشف الانتقال إلى آية متشابهة («انتقلتَ إلى آية كذا»)، وإعادة جملة «أو انتقال إلى آية أخرى» إلى TASMEE_SCOPE_NOTE في الـPR الذي يبنيه. المرحلة: المصحف والتسميع.
- **الملفات:** `src/lib/tasmee/matcher.ts` (فهرس آيات متشابهة ومطابقة خارج النافذة الحالية) · `src/lib/tasmee/copy.ts` (`TASMEE_SCOPE_NOTE`) · `src/lib/__tests__/tasmee-matcher.test.ts`.
- **معيار القبول:** تنبيه هادئ يذكر اسم الآية/السورة حين تطابق الكلمات المسموعة موضعًا متشابهًا آخر بدل الموضع المتوقع، دون إيقاف التسميع ولا كشف خاطئ؛ اختبارات على أزواج متشابهة حقيقية من المصحف؛ وتحديث `TASMEE_SCOPE_NOTE` واختباره في الـPR نفسه.
- **الأولوية:** P1
