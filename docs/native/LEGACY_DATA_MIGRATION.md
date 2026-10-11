# ترحيل بيانات مستخدمي نسخة Capacitor إلى التطبيق الأصلي (SwiftUI)

> بحث فقط (2026-10-11)، بلا كود تطبيق. المقاطع أدناه توضيحية لم تُبنَ ولم تُختبر على جهاز.
> المرجع: `main` عند `d3fa768` و`native-app` عند `8391fbb`. نسخة أطول بكود Swift تجريبي كامل في `docs/audit/DATA_MIGRATION.md` على فرع `audit/data-migration`.

## الخلاصة

- النسخة المنشورة (`com.yousef.majlisilm`) تحمّل الموقع الحي: `capacitor.config.json` يضبط `server.url = https://www.ssunnah.com`. فكل بيانات الويب محفوظة تحت الأصل `https://www.ssunnah.com` في `WKWebsiteDataStore.default()` داخل حاوية التطبيق.
- هذه البيانات تملكها WebKit لا Capacitor، فتبقى على القرص بعد التحديث وبعد إزالة Capacitor، ويقرؤها أي `WKWebView` في التطبيق الجديد يستخدم المخزن الافتراضي.
- القراءة الموصى بها: `WKWebView` مخفي لمرة واحدة، يحمّل صفحة فارغة بـ`baseURL = https://www.ssunnah.com` دون شبكة، ويقرأ localStorage وIndexedDB بـJavaScript. WebKit يفك الترميز بنفسه، فلا نعتمد على تخطيط ملفات داخلي يتغير بين إصدارات iOS. قراءة SQLite المباشرة احتياط لـlocalStorage فقط.
- ينجو تلقائيًا دون ترحيل: جلسة الدخول (Keychain)، و16 مفتاح تقدّم مكرّرة في Capacitor Preferences (`UserDefaults.standard`)، ولقطات الويدجت (App Group)، والتلاوات المحمّلة (Application Support).
- يضيع إن لم نرحّل: كل ما عدا ذلك، وأخطره **إعدادات الصلاة** (الإحداثيات والطريقة والمذهب وتعديلات الدقائق)، ثم الحفظ والختمات والمسبحة والمفضلات والملاحظات والإعدادات.
- Supabase لا يغني عن الترحيل: الزائر ليس له فيه شيء، والمسجّل لا تُرفع تفضيلاته ولا ختمته ولا ورده (`src/lib/hybrid-sync-handlers.ts:92` يسقطها).

---

## 1) أين تُخزَّن البيانات اليوم

| المخزن | ماذا يحوي | المصدر |
|---|---|---|
| localStorage للأصل `https://www.ssunnah.com` | 245 مفتاحًا دائمًا، منها 156 بيانات مستخدم (140 تُرحَّل و16 اختيارية) (الملحق أ) | `artifacts/majalis/src/**` |
| IndexedDB لنفس الأصل | 4 قواعد (الملحق ب) | `lib/offline-engine.ts`، `core/quran/DatabaseManager.ts`، … |
| sessionStorage | 23 مفتاحًا مؤقتًا | تُمحى بإغلاق الويب؛ لا تُرحَّل |
| Cache Storage | أذان كامل محمّل `majalis-adhan-full-v1` | `lib/adhan-downloads.ts` |
| Keychain، الخدمة `com.yousef.majlisilm.auth` | جلسة Supabase تحت الحساب `cap.supabase.sb-<ref>-auth-token`، وجلسة قديمة `majlis.auth.session.v1` | `ios/App/App/SunnahAuthKeychainPlugin.swift`، `src/lib/supabase-auth-storage.ts` |
| Capacitor Preferences = `UserDefaults.standard` بالبادئة `CapacitorStorage.` | `NATIVE_PROGRESS_KEYS` (16 مفتاحًا) و`adhkar_progress_*` و`onboarding.completed.v1` | `src/lib/native-storage.ts`، `src/lib/feature-tour-state.ts` |
| App Group `group.com.yousef.majlisilm` | لقطات الويدجت: مواقيت اليوم واسم الموقع والمنطقة الزمنية ومعرّف الطريقة (**دون الإحداثيات والتعديلات**) | `ios/App/Shared/SunnahSharedData.swift` |
| Application Support | تلاوات محمّلة | `ios/App/Shared/OfflineAudioStore.swift` |
| UNUserNotificationCenter | إشعارات جدولتها نسخة الويب | `SunnahPrayer/LegacyWebNotifications.swift` (native-app) |
| Supabase | لمن سجّل الدخول: `bookmarks`، `user_notes`، `reading_resume`، `user_progress`، `flashcard_reviews`، `profiles`، … | `src/lib/hybrid-sync-handlers.ts` وغيره |

### مسار ملفات WebKit على الجهاز

داخل حاوية التطبيق (`NSHomeDirectory()`):

| iOS | localStorage | IndexedDB |
|---|---|---|
| 16 وما قبله | `Library/WebKit/WebsiteData/LocalStorage/https_www.ssunnah.com_0.localstorage` | `Library/WebKit/WebsiteData/IndexedDB/v1/https_www.ssunnah.com_0/<db>/IndexedDB.sqlite3` |
| 17 وما بعده | `Library/WebKit/WebsiteData/Default/<hash>/<hash>/LocalStorage/localstorage.sqlite3` (ملف `origin` بجواره يحمل الأصل) | `Library/WebKit/WebsiteData/Default/<hash>/<hash>/IndexedDB/<hash>/IndexedDB.sqlite3` |

- localStorage جدول `ItemTable(key TEXT, value BLOB)` والقيمة نص UTF-16LE.
- سجلات IndexedDB مرمّزة بصيغة WebKit الداخلية (`SerializedScriptValue`) غير الموثّقة، فلا تُقرأ عمليًا من Swift مباشرة.
- **هذه المسارات من معرفة عامة بـWebKit وليست مُتحقَّقًا منها على جهاز التطبيق.** لهذا لا يفترض القارئ الاحتياطي مسارًا ثابتًا، بل يبحث بالتكرار تحت `Library/WebKit`.

### الأصول المحتملة

`https://www.ssunnah.com` أساسًا. ثم `https://ssunnah.com` و`https://www.majlisilm.com` و`https://majlisilm.com`، لأنها في `allowNavigation`، والنسخ الأقدم باسم «مجلس العلم» قد تكون كتبت تحتها. يُكتشف الموجود منها فعلًا بـ`WKWebsiteDataStore.default().fetchDataRecords(ofTypes:)`.

---

## 2) هل تُقرأ بعد إزالة Capacitor؟

**نعم، بشروط:**

1. **نفس Bundle ID ونفس فريق التوقيع.** التحديث عبر المتجر يُبقي الحاوية كاملة: `Library/` وKeychain وApp Group. مشروع `ios-native/` على `native-app` يستخدم `com.yousef.majlisilm` وApp Group نفسه، فالشرط متحقق.
2. **WebKit إطار نظام لا علاقة له بـCapacitor.** إزالة Capacitor تزيل الجسر فقط، أما بيانات `WKWebsiteDataStore.default()` فتبقى. وأي `WKWebView` جديد على `.default()` يرى البيانات نفسها لنفس الأصل.
3. **ألا يمسحها التطبيق الجديد.** الكود الحالي (`AppDelegate.purgeWebCachesOncePerAppBuild`) يمسح الكاش فقط. يجب ألا يُنقل إلى التطبيق الأصلي أي `removeData(ofTypes: allWebsiteDataTypes())`، ولا يُستخدم `.nonPersistent()`، قبل اكتمال الترحيل.
4. **أن تكون البيانات ما زالت موجودة.** WebKit قد يحذف تخزين السكربت لموقع لم يُفتح مدة طويلة (حد ITP). هذا استنتاج لم يُتحقَّق منه في سياق تطبيق WKWebView، وهو على الأرجح سبب إضافة مرآة Preferences. النتيجة: «لا بيانات» حالة طبيعية لا خطأ.
5. **الجهاز مفتوح القفل مرة على الأقل منذ الإقلاع.** حماية الملفات قد تمنع القراءة في إقلاع خلفي (إشعار أو `BGTask`)، فيجري الترحيل في الواجهة فقط.

استخدام WebKit مخفيًا لمرة واحدة لا يخالف هدف «بلا WebView» في الواجهة: لا يرى المستخدم أي صفحة ويب، ويُحذف الكود بعد إصدارين.

---

## 3) طريقة القراءة عند أول تشغيل

الترتيب: (أ) Preferences، ثم (ب) WebKit المخفي، ثم (ج) SQLite إن لم يُرجع (ب) شيئًا. بعدها تُكتب **لقطة خام كاملة** قبل أي تحويل.

### (أ) Capacitor Preferences

```swift
let prefix = "CapacitorStorage."
let prefs = UserDefaults.standard.dictionaryRepresentation()
    .compactMapValues { $0 as? String }
    .filter { $0.key.hasPrefix(prefix) }
// المفتاح الأصلي = String(key.dropFirst(prefix.count))
```

### (ب) WKWebView مخفي (الطريقة الأساسية)

```swift
let config = WKWebViewConfiguration()
config.websiteDataStore = .default()                 // نفس مخزن Capacitor
let webView = WKWebView(frame: .zero, configuration: config)
// انتظر didFinish من WKNavigationDelegate، ثم:
webView.loadHTMLString("<!doctype html><title>m</title>",
                       baseURL: URL(string: "https://www.ssunnah.com/")!)   // الأصل فقط، بلا شبكة
let json = try await webView.callAsyncJavaScript(dumpScript, arguments: [:],
                                                 in: nil, contentWorld: .page) as? String
```

`dumpScript` يقرأ كل `localStorage`، ثم من IndexedDB المخازن الشخصية فقط. يفحص `indexedDB.databases()` أولًا حتى لا يُنشئ قاعدة غير موجودة، ويُلغي أي `onupgradeneeded`، ويُرجع `JSON.stringify(...)`.

### (ج) SQLite مباشرة (احتياط لـlocalStorage)

ابحث تحت `Library/WebKit` عن `*.localstorage` (حتى iOS 16) و`localstorage.sqlite3` (من iOS 17). أبقِ ما يدل اسمه أو ملف `origin` بجواره على `ssunnah` أو `majlisilm`. انسخ الملف مع `-wal` و`-shm` إلى مجلد مؤقت، واقرأ `SELECT key, value FROM ItemTable`، وفك القيمة UTF-16LE. لا تفتح ملفات WebKit الأصلية للكتابة أبدًا.

### اللقطة الخام

`Application Support/LegacyWeb/snapshot-v1.json` يحوي: Preferences، وlocalStorage لكل أصل، وسجلات IndexedDB المختارة، ورقم البناء والتاريخ. **تُحذف منه** مفاتيح `sb-*-auth-token` قبل الكتابة، وتُمرَّر الجلسة في الذاكرة فقط إلى خطوة Keychain. الهدف أن الشاشات الأصلية التي لم تُبنَ بعد تستورد من اللقطة حين تُبنى، فلا نربط الترحيل بجاهزية كل قسم.

---

## 4) خطة الترحيل

### 4.1 الوجهة حسب نوع البيانات

| النوع | الوجهة | السبب |
|---|---|---|
| جلسة الدخول | **Keychain** (الخدمة والحساب نفسيهما، `KeychainAuthStore` على `native-app` يقرؤهما أصلًا) | سرّي |
| إعدادات صغيرة (مظهر، خط، قارئ، تلاوة، إشعارات، مسبحة) | **UserDefaults.standard** | قيم صغيرة متكررة القراءة |
| ما يحتاجه الويدجت أو النشاط الحي (إعدادات الصلاة، الموقع، آخر صفحة، تقدّم الورد، تفضيلات الويدجت) | **App Group** `group.com.yousef.majlisilm`، مع نسخة في UserDefaults للتطبيق | الويدجت لا يرى UserDefaults التطبيق |
| قوائم ونصوص (العلامات، الملاحظات، الإبرازات، الحفظ، الختمات، المفضلات، البطاقات) | **ملف JSON في Application Support** (أو SwiftData لاحقًا) | UserDefaults ليس للبيانات الكبيرة أو المتنامية؛ وهذا لا يمنع نسخ مؤشرات صغيرة منها إلى App Group |
| أعلام تشغيل وتشخيص وكاش | لا تُرحَّل | يُعاد بناؤها |

عمود «يُرحَّل إلى» في الملحق أ يطبّق هذا الجدول على كل مفتاح.

### 4.2 الترتيب عند أول تشغيل

1. **اللقطة الخام** (القسم 3)، بمهلة قصوى نحو 4 ثوانٍ في شاشة الإقلاع. إن فشلت أو انتهت المهلة تُعاد في التشغيل التالي، ولا يُكتب علم الاكتمال.
2. **الصلاة أولًا**، قبل أول جدولة أذان: `majalis-prayer-location-v1` (lat/lon/timeZone)، `-calc-method-v1`، `-madhab-v1`، `-highlat-v1`، `-adjustments-v1`، `majalis-governorate-v1`، وأصوات الأذان. تُمرَّر مدخلاتٍ للمحرك كما هو ولا يُغيَّر الحساب (قاعدة `protected-content`).
3. **الجلسة**: إن وُجدت في Keychain تبقى. إن كانت في localStorage فقط (`ssunnah-auth-storage-mode-v1 = localStorage_fallback`) تُنقل إلى Keychain. عند بناء عميل Supabase الأصلي يُستبدل `refresh_token` القديم بجلسة جديدة فورًا.
4. **المصحف**: `lastPage` و`myBookmarks` و`ssunnah-mushaf-ayah-marks-v1` و`majalis-khatmah-tracker-v1`. عند التعارض تُفضَّل Preferences، وهي نفس سياسة `hydrateNativeStorage` اليوم.
5. **البقية بالأقسام**: كل قسم أصلي (`quran`، `adhkar`، `account`، `learn`، …) يستورد مفاتيحه من اللقطة عند بنائه، بعلم مستقل `legacy.import.<قسم>.v1`.
6. **التنظيف**: لا حذف لبيانات WebKit ولا لمفاتيح Preferences في أول إصدارين أصليين. بعدها يُحذف كود WebKit، ويُمسح المخزن اختياريًا.

### 4.3 قواعد الدمج

- لكل مفتاح: الأصل `www.ssunnah.com` أولًا، ثم بقية الأصول، ثم Preferences. الاستثناء مفاتيح المصحف الخمسة في `MUSHAF_PREFER_NATIVE_KEYS`، فتُفضَّل فيها Preferences.
- لا تُكتب قيمة قديمة فوق قيمة أصلية أنشأها المستخدم.
- القيم تُتحقَّق كما يتحقق الويب نفسه: الصفحة ضمن 1…604، وطريقة الحساب ضمن `PRAYER_CALC_METHODS`. ما يفشل التحقق يُترك في اللقطة ولا يُستورد.

### 4.4 الاختبار قبل أي إصدار

- **المحاكي**: ثبّت `.app` نسخة Capacitor بـ`xcrun simctl install`، واضبط بيانات، ثم ثبّت `.app` الأصلي فوقها بنفس Bundle ID.
- **الجهاز**: TestFlight فوق نسخة المتجر الحالية، على iOS 16 و17 و18 على الأقل (يختلف تخطيط التخزين). الرفع يحتاج إذن المالك.
- **الحالات**: زائر فارغ، زائر ببيانات كثيرة، مسجّل، مسجّل في وضع `localStorage_fallback`، مستخدم قديم كتب تحت `majlisilm.com`.

---

## 5) حالات الفشل وما يضيع

| الحالة | الأثر | المعالجة |
|---|---|---|
| لا بيانات ويب (تثبيت جديد، أو حذف WebKit لبيانات قديمة) | لا شيء للترحيل | تشغيل عادي؛ يُكتب علم الاكتمال |
| WebKit لا يكمل التحميل أو `callAsyncJavaScript` يفشل أو يتجاوز المهلة | لا لقطة من (ب) | احتياط (ج) لـlocalStorage، وIndexedDB يضيع في هذا التشغيل؛ يُعاد في التالي |
| تخطيط SQLite مختلف عن المتوقع | (ج) يفشل | يُسجَّل ولا يُكتب العلم؛ (ب) هو الأساس أصلًا |
| قيمة JSON تالفة لمفتاح | يضيع ذلك المفتاح فقط | تبقى في اللقطة الخام للتشخيص |
| التطبيق يُغلق أثناء الترحيل | ترحيل جزئي | كل قسم بعلم مستقل؛ يُستأنف |
| التطبيق الأصلي يكتب افتراضيات قبل الترحيل (الصلاة خصوصًا) | مواقيت خاطئة وأذان مجدول عليها | الترحيل يسبق أول جدولة؛ وإن تعذّر تُعرض شاشة تأكيد الموقع والطريقة بدل الافتراضي الصامت |
| الويدجت يقرأ App Group قبل الترحيل | عرض قديم مؤقتًا | إعادة نشر اللقطة بعد استيراد الصلاة |
| تعارض بين أصلين أو بين localStorage وPreferences | قيمة قديمة | قواعد الدمج 4.3 |
| جلسة في وضع `localStorage_fallback` ولم تُقرأ | تسجيل خروج | قراءة `sb-*-auth-token` من اللقطة قبل التنقيح |
| `refresh_token` منتهٍ أو ملغى | تسجيل خروج | يُطلب الدخول بلطف؛ بيانات السحابة تعود بعده |
| استعادة نسخة احتياطية على جهاز جديد | Keychain `ThisDeviceOnly` لا يُستعاد، فيُسجَّل الخروج | سلوك قائم اليوم أصلًا |
| إشعارات الويب المجدولة تبقى في النظام | تكرار الأذكار أو الورد | `LegacyWebNotifications` يزيل المعرّفات المقابلة عند تفعيل الأصلي |
| رمز APNs | لا يُرحَّل | التطبيق الأصلي يسجّل من جديد ويرسل إلى `https://www.ssunnah.com/api/push/subscribe` بعنوان مطلق |

### ما يضيع حتمًا أو مقبولًا

- محتوى IndexedDB المؤقت (`quran`، `adhkar`، `articles`، `tafseer_cache`) وصوت `majalis-quran-audio` / `majalis-tafsir-audio` المخزن في الويب، والأذان الكامل في Cache Storage: كلها تُعاد تنزيلها.
- كل sessionStorage.
- أعلام التشغيل والتشخيص والكاش وأعلام الميزات (وجهتها «لا» في الملحق أ).
- بيانات من حذف WebKit تخزينه قبل التحديث.

### ما يضيع إن لم يُنفَّذ الترحيل

كل المفاتيح التي عمودها «يُرحَّل إلى» غير «لا» في الملحق أ، عدا الـ16 المكرّرة في Preferences. بالنسبة للمسجّل، يبقى في Supabase العلامات والملاحظات وموضع القراءة والدروس والبطاقات فقط، ويتطلب ذلك عميل Supabase أصليًا غير موجود بعد على `native-app`.

---

## 6) ما لم يُتحقَّق منه

- مسارات WebKit وترميز القيم على iOS 17 و18.
- أن `loadHTMLString(_:baseURL:)` بأصل https يتيح localStorage وIndexedDB المحفوظين لذلك الأصل في تطبيق لم يعد فيه Capacitor. هذا هو أساس الطريقة (ب)، ولذا فاختبار المحاكي في 4.4 شرط قبل أي بناء.
- أثر حد ITP على WKWebView داخل التطبيق.
- الفهرس في الملحق أ مستخرج آليًا من الثوابت واستدعاءات التخزين، وتصنيفه بقواعد نصية ثم تصحيح يدوي. قد يفوته مفتاح يُبنى ديناميكيًا؛ لذلك تقرأ اللقطة **كل** المفاتيح بلا قائمة بيضاء.

---

## الملحق أ: فهرس مفاتيح التخزين المستخدمة في كود الويب

المصدر: `artifacts/majalis/src` دون الاختبارات. عمود المخزن: `LS` = localStorage، `SS` = sessionStorage، `PREF` = مكرّر في Capacitor Preferences. `LS+SS` يعني أن الملف يستعمل الاثنين، والمفتاح الدائم هو ما في localStorage. البادئات المنتهية بـ`:` أو `-v` تُلحق بها لاحقة ديناميكية.

| المفتاح | المخزن | الفئة | يُرحَّل إلى | الملف (src/) |
|---|---|---|---|---|
| `__majalis_smart_notif_timers__` | LS | تشغيل/تشخيص/كاش | لا | `lib/smart-local-notifications.ts` |
| `adhkar_haptics_enabled` | LS | الأذكار والمسبحة | UserDefaults | `lib/haptics.ts` |
| `adhkar_progress_<cat>` | LS+PREF | الأذكار والمسبحة | UserDefaults | `pages/worship/ui/AdhkarView.tsx` |
| `ah-favs` | LS | المفضلات والمحفوظات | ملف JSON | `views/AsmaaHusnaPage.tsx` |
| `an_cat_v2` | LS+SS | تشغيل/تشخيص/كاش | لا | `pages/hadith/ui/ArbaeenNawawiView.tsx` |
| `an_query_v2` | LS+SS | تشغيل/تشخيص/كاش | لا | `pages/hadith/ui/ArbaeenNawawiView.tsx` |
| `an_read` | LS+SS | المفضلات والمحفوظات | ملف JSON | `pages/hadith/ui/ArbaeenNawawiView.tsx` |
| `auto-scroll-pace-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/adaptive-auto-scroll.ts` |
| `cache-lru-access-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/smart-cache-eviction.ts` |
| `chunk-progress-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/text-chunking-service.ts` |
| `devotional-balance-v1` | LS | سجلات وتخصيص | اختياري | `lib/devotional-balance-engine.ts` |
| `gsm-initial-filter` | SS | جلسة فقط | لا | `components/GlobalSearchModal.tsx` |
| `hikam_fav` | LS | المفضلات والمحفوظات | ملف JSON | `views/HikamSalafPage.tsx` |
| `kx-list-state:` | SS | جلسة فقط | لا | `lib/knowledge-list-scroll.ts` |
| `lastPage` | LS+PREF | المصحف: الموضع والعلامات | UserDefaults + App Group | `lib/quran-last-page.ts` |
| `majalis_adhkar_reminders_v1` | LS | الأذكار والمسبحة | UserDefaults | `lib/adhkar-reminders/index.ts` |
| `majalis_apns_device_token_v1` | LS | تشغيل/تشخيص/كاش | لا (يُعاد التسجيل) | `lib/pushNotifications.ts` |
| `majalis_app_version` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/runtime-cache-purge.ts` |
| `majalis_car_last_v1` | LS | إعدادات العرض والقراءة | UserDefaults | `views/CarModePage.tsx` |
| `majalis_force_cache_purge` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/runtime-cache-purge.ts` |
| `majalis_khatmah_behind_warn_day` | LS | تشغيل/تشخيص/كاش | لا | `lib/quran-khatmah-tracker.ts` |
| `majalis_last_streak_warn_day` | LS | تشغيل/تشخيص/كاش | لا | `lib/smart-local-notifications.ts` |
| `majalis_notif_history_v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/notification-history.ts` |
| `majalis_notif_prefs_v1` | LS+PREF | الإشعارات | UserDefaults | `lib/local-notifications.ts` |
| `majalis_notif_sched_v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/local-notifications.ts` |
| `majalis_notified_badges` | LS | الختمة والورد والإنجاز | ملف JSON | `hooks/useAchievementCheck.ts` |
| `majalis_settings_adhan_sound_id` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/adhan-settings-sound-catalog.ts` |
| `majalis_settings_tone_sound_id` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/adhan-settings-sound-catalog.ts` |
| `majalis_update_dismissed_version` | LS | تشغيل/تشخيص/كاش | لا | `lib/version-check.ts` |
| `majalis_update_last_check_time` | LS | تشغيل/تشخيص/كاش | لا | `lib/version-check.ts` |
| `majalis_used_quiz_v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/supabase.ts` |
| `majalis-adhan-full-meta-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/adhan-downloads.ts` |
| `majalis-adhan-ios-chain-v2` | SS | جلسة فقط | لا | `lib/adhan-ios-segments.ts` |
| `majalis-adhan-prefs-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/adhan-preferences.ts` |
| `majalis-adhan-resume-v1` | SS | جلسة فقط | لا | `lib/adhan-smart-cancel.ts` |
| `majalis-adhkar-admin` | LS | تشغيل/تشخيص/كاش | لا | `lib/adhkar-admin.ts` |
| `majalis-assistant-disabled` | LS | تشغيل/تشخيص/كاش | لا | `lib/assistant-feature-flag.ts` |
| `majalis-assistant-enabled` | LS | تشغيل/تشخيص/كاش | لا | `lib/assistant-feature-flag.ts` |
| `majalis-auto-scroll-pace-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/adaptive-auto-scroll.ts` |
| `majalis-bg-playback-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/restore-default-settings.ts` |
| `majalis-cache-lru-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/smart-cache-eviction.ts` |
| `majalis-cdn-health-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sovereign/cdn-failover-router.ts` |
| `majalis-chunk-auto-reload` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/lazy-with-retry.ts` |
| `majalis-chunk-failure-meta` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/lazy-with-retry.ts` |
| `majalis-chunk-progress-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/text-chunking-service.ts` |
| `majalis-chunk-reload` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/lazy-with-retry.ts` |
| `majalis-continue-reading-v1` | LS+PREF | الختمة والورد والإنجاز | UserDefaults + App Group | `lib/continue-reading.ts` |
| `majalis-cookie-consent-v1` | LS+SS | إعدادات العرض والقراءة | UserDefaults | `lib/cookie-consent.ts` |
| `majalis-cross-tab-beacon-v1` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/cross-tab-sync.ts` |
| `majalis-daily-challenge-answered-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `components/quiz-game/DailyChallengeQuiz.tsx` |
| `majalis-daily-challenge-best-v1` | LS+PREF | الختمة والورد والإنجاز | ملف JSON | `components/quiz-game/DailyChallengeQuiz.tsx` |
| `majalis-daily-challenge-score-v1` | LS+PREF | الختمة والورد والإنجاز | ملف JSON | `components/quiz-game/DailyChallengeQuiz.tsx` |
| `majalis-daily-progress-v1` | LS+PREF | الختمة والورد والإنجاز | ملف JSON | `components/home/HomeWeekStreak.tsx` |
| `majalis-daily-wird-done-v1` | LS+PREF | الختمة والورد والإنجاز | ملف JSON | `lib/native-storage.ts` |
| `majalis-delta-sync-state-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/delta-content-sync.ts` |
| `majalis-device-handoff-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sovereign/device-handoff-sync.ts` |
| `majalis-devotional-balance-v1` | LS | سجلات وتخصيص | اختياري | `lib/devotional-balance-engine.ts` |
| `majalis-devotional-prompts-dismissed-v1` | LS | سجلات وتخصيص | اختياري | `lib/devotional-balance-engine.ts` |
| `majalis-error-reports-v2` | LS | تشغيل/تشخيص/كاش | لا | `lib/error-report.ts` |
| `majalis-flashcard-reviews-v1` | LS | البطاقات | ملف JSON | `lib/flashcard-local-store.ts` |
| `majalis-font-preference-v2` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/font-preference.ts` |
| `majalis-friday-banner-dismissed-v1` | SS | جلسة فقط | لا | `lib/friday-prayer.ts` |
| `majalis-governorate-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-kuwait-geo.ts` |
| `majalis-guest-merge-done-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/guest-cloud-merge.ts` |
| `majalis-guest-merge-pending-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sync-engine/account-scope.ts` |
| `majalis-khatmah-tracker-v1` | LS+PREF | الختمة والورد والإنجاز | ملف JSON | `lib/quran-khatmah-tracker.ts` |
| `majalis-knowledge-vault-body-v1` | LS | الملاحظات والإبرازات | ملف JSON | `lib/personal-knowledge-vault.ts` |
| `majalis-knowledge-vault-index-v1` | LS | الملاحظات والإبرازات | ملف JSON | `lib/personal-knowledge-vault.ts` |
| `majalis-kp-activity-v1` | LS | سجلات وتخصيص | اختياري | `lib/knowledge-platform/privacy.ts` |
| `majalis-kp-personalization-v1` | LS | سجلات وتخصيص | اختياري | `lib/knowledge-platform/privacy.ts` |
| `majalis-kp-search-history-v1` | LS | سجلات وتخصيص | اختياري | `lib/knowledge-platform/privacy.ts` |
| `majalis-lang` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/language-preference.ts` |
| `majalis-last-geo-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/qibla-location.ts` |
| `majalis-lesson-audio-resume-index-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/lesson-audio-resume.ts` |
| `majalis-lesson-audio-resume:` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/lesson-audio-resume.ts` |
| `majalis-lesson-nav:` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/lessons-service.ts` |
| `majalis-lessons-unified-v1` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/lessons-service.ts` |
| `majalis-local-bookmarks-v1` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/local-bookmarks.ts` |
| `majalis-local-milestones-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/local-milestones.ts` |
| `majalis-mawarith-cases-v1` | LS | المفضلات والمحفوظات | ملف JSON | `lib/inheritance/case-storage.ts` |
| `majalis-mushaf-tafsir-edition-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/reader-prefs.ts` |
| `majalis-mushaf-tafsir-font-scale-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/reader-prefs.ts` |
| `majalis-mushaf-translation-edition-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/reader-prefs.ts` |
| `majalis-mushaf-translation-on-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/reader-prefs.ts` |
| `majalis-native-cache-purged:` | LS | تشغيل/تشخيص/كاش | لا | `lib/native-cache-freshness.ts` |
| `majalis-notif-permission-asked-v1` | LS+PREF | الإشعارات | UserDefaults | `lib/native-storage.ts` |
| `majalis-offline-reading-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/offline-reading-pack.ts` |
| `majalis-offline-tafsir-pack-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/quran-data/offline-tafsir-pack.ts` |
| `majalis-oled-eye-care-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/oled-eye-care.ts` |
| `majalis-power-saver-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/power-saver-engine.ts` |
| `majalis-prayer-adjustments-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-calc-prefs.ts` |
| `majalis-prayer-alert-dismissed-v1` | LS+SS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-alert-preferences.ts` |
| `majalis-prayer-alert-permission-asked-v1` | LS+SS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-alert-preferences.ts` |
| `majalis-prayer-alert-prefs-v1` | LS+SS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-alert-preferences.ts` |
| `majalis-prayer-cache-v2` | LS | تشغيل/تشخيص/كاش | لا | `lib/prayer-times.ts` |
| `majalis-prayer-calc-method-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-calc-prefs.ts` |
| `majalis-prayer-guard-log-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/prayer-notification-guard.ts` |
| `majalis-prayer-highlat-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-calc-prefs.ts` |
| `majalis-prayer-location-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-location-prefs.ts` |
| `majalis-prayer-madhab-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-calc-prefs.ts` |
| `majalis-prayer-notification-prefs-v1` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-notifications/preferences.ts` |
| `majalis-prayer-respect-dismissed-v1` | LS+SS | الصلاة والأذان | UserDefaults + App Group | `lib/prayer-alert-preferences.ts` |
| `majalis-prayer-schedule-status-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/prayer-schedule-status.ts` |
| `majalis-prayer-settings-migration-v` | LS | تشغيل/تشخيص/كاش | لا | `lib/prayer-settings-upgrade.ts` |
| `majalis-qa-favorites-v1` | LS | المفضلات والمحفوظات | ملف JSON | `lib/qa-utils.ts` |
| `majalis-qa-seen-v1` | LS | سجلات وتخصيص | اختياري | `lib/qa-utils.ts` |
| `majalis-quran-audio-resume-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-audio-resume.ts` |
| `majalis-quran-download-resume-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/quran-audio-downloads.ts` |
| `majalis-quran-loop-v1` | LS | الحفظ والتسميع | UserDefaults | `lib/recitation-hifz-prefs.ts` |
| `majalis-quran-memorization-plan-v1` | LS | الحفظ والتسميع | ملف JSON | `pages/quran/QuranMemorizationPlansPage.tsx` |
| `majalis-reading-progress-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/reading-progress.ts` |
| `majalis-recitation-pace-v1` | LS | الحفظ والتسميع | ملف JSON | `lib/recitation-pace-tracker.ts` |
| `majalis-religious-calendar-review-v1` | LS | تشغيل/تشخيص/كاش | لا | `views/admin/ReligiousCalendarReviewSection.tsx` |
| `majalis-safe-area-debug` | LS | تشغيل/تشخيص/كاش | لا | `components/SafeAreaDebugOverlay.tsx` |
| `majalis-safe-reload-ts` | SS | جلسة فقط | لا | `lib/chunk-recovery.ts` |
| `majalis-search-analytics` | LS | سجلات وتخصيص | اختياري | `lib/search-history.ts` |
| `majalis-search-history` | LS | سجلات وتخصيص | اختياري | `lib/search-history.ts` |
| `majalis-search-ux-metrics` | LS | تشغيل/تشخيص/كاش | لا | `features/search/search-ux-analytics.ts` |
| `majalis-site-settings` | LS | تشغيل/تشخيص/كاش | لا | `lib/site-settings.ts` |
| `majalis-sovereign-habits-v1` | LS | سجلات وتخصيص | اختياري | `lib/sovereign/predictive-analytics.ts` |
| `majalis-sovereign-wal-v1` | LS | سجلات وتخصيص | اختياري | `lib/sovereign/optimistic-wal.ts` |
| `majalis-storage-reconcile-meta-v1` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/storage-reconciler.ts` |
| `majalis-surah-favorites-v1` | LS | المفضلات والمحفوظات | ملف JSON | `lib/surah-index.ts` |
| `majalis-sync-clock:` | LS | تشغيل/تشخيص/كاش | لا | `lib/sync-engine/local-store.ts` |
| `majalis-sync-last-flush` | LS | تشغيل/تشخيص/كاش | لا | `lib/sync-engine/local-store.ts` |
| `majalis-sync-queue:` | LS | تشغيل/تشخيص/كاش | لا | `lib/sync-engine/local-store.ts` |
| `majalis-sync-schema-v` | LS | تشغيل/تشخيص/كاش | لا | `lib/sync-engine/local-store.ts` |
| `majalis-tab-id-v1` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/cross-tab-sync.ts` |
| `majalis-tafsir-audio-resume-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/tafsir-audio.ts` |
| `majalis-tasbeeh-item-<id>` | LS | الأذكار والمسبحة | UserDefaults | `lib/tasbeeh-storage.ts` |
| `majalis-tasbih-v3` | LS | الأذكار والمسبحة | UserDefaults | `lib/tasbeeh-storage.ts` |
| `majalis-text-highlights-v1` | LS | الملاحظات والإبرازات | ملف JSON | `lib/text-highlights.ts` |
| `majalis-theme` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/theme-preference.ts` |
| `majalis-unseen-discovery-last-v1` | LS | سجلات وتخصيص | اختياري | `lib/unseen-benefit-discovery.ts` |
| `majalis-unseen-discovery-seen-v1` | LS | سجلات وتخصيص | اختياري | `lib/unseen-benefit-discovery.ts` |
| `majalis-user-settings-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/haptics.ts` |
| `majalis-user-streak-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/user-streak.ts` |
| `majalis-view:` | SS | جلسة فقط | لا | `lib/content-analytics.ts` |
| `majalis:hadith-saved` | LS | المفضلات والمحفوظات | ملف JSON | `components/hadith/HadithCard.tsx` |
| `majalis:nav-spa-pushes:v1` | SS | جلسة فقط | لا | `lib/navigation-back.ts` |
| `majalis:navigation-stack:v1` | SS | جلسة فقط | لا | `lib/navigation-back.ts` |
| `majalis:srp:history` | LS | سجلات وتخصيص | اختياري | `pages/library/ui/ScholarlyResearchView.tsx` |
| `majalis.assistant.chat.v1` | SS | جلسة فقط | لا | `hooks/useAssistantChat.ts` |
| `majalis.onboarding.` | LS+SS | إعدادات العرض والقراءة | UserDefaults | `lib/onboarding-state.ts` |
| `majlis_intro_seen` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/first-visit-intro-state.ts` |
| `majlis-home-welcomed-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `components/home/HomeHeroLcp.tsx` |
| `majlis-knowledge-progress-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/knowledge-loader.ts` |
| `majlis:researches:import-lock:v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/researches/service.ts` |
| `majlis:researches:import-log:v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/researches/service.ts` |
| `majlis:researches:owner-key` | LS | تشغيل/تشخيص/كاش | لا | `lib/researches/service.ts` |
| `majlis:researches:saved:v1` | LS | المفضلات والمحفوظات | ملف JSON | `lib/researches/service.ts` |
| `majlis:researches:search-history:v1` | LS | سجلات وتخصيص | اختياري | `lib/researches/service.ts` |
| `majlis:researches:submissions:v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/researches/service.ts` |
| `majlis:researches:views:v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/researches/service.ts` |
| `majlis:ticker:recent:v1` | LS | سجلات وتخصيص | اختياري | `lib/ticker-content.ts` |
| `majlisilm-admin-review-hub-ui-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/admin-review-hub/store.ts` |
| `majlisilm-admin-review-hub-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/admin-review-hub/store.ts` |
| `majlisilm-course-progress-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/majlis-local-storage-service.ts` |
| `majlisilm-daily-adhkar-v1` | LS | الأذكار والمسبحة | UserDefaults | `lib/majlis-local-storage-service.ts` |
| `majlisilm-last-surah-v1` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/majlis-local-storage-service.ts` |
| `majlisilm-last-verse-index-v1` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/majlis-local-storage-service.ts` |
| `majlisilm-quran-dark-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/majlis-local-storage-service.ts` |
| `majlisilm-quran-font-size-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/majlis-local-storage-service.ts` |
| `majlisilm.mushaf.ayah-marks` | LS | المصحف: الموضع والعلامات | ملف JSON | `features/mushaf-madinah/VerifiedMushafReader.tsx` |
| `majlisilm.mushaf.hide-level` | LS | إعدادات العرض والقراءة | UserDefaults | `features/mushaf-madinah/VerifiedMushafReader.tsx` |
| `majlisilm.mushaf.tafsir-edition` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/tafsir-editions.ts` |
| `majlisilm.mushaf.theme` | LS | إعدادات العرض والقراءة | UserDefaults | `features/mushaf-madinah/VerifiedMushafReader.tsx` |
| `majlisilm.mushaf.theme-choice` | LS | إعدادات العرض والقراءة | UserDefaults | `features/mushaf-madinah/VerifiedMushafReader.tsx` |
| `mj_mount_watchdog_reload` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/mount-watchdog.ts` |
| `mj-chunk-reload-attempted` | LS+SS | تشغيل/تشخيص/كاش | لا | `lib/lazy-with-retry.ts` |
| `mj-homepage-ad-dismissed-at-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/homepage-ad-dismiss.ts` |
| `mj-mushaf-tafsir-sess:` | SS | جلسة فقط | لا | `lib/quran-data/fetch-ayah-content.ts` |
| `mj-push-sub-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/push-notifications.ts` |
| `mj-pwa-install-dismissed-v1` | LS | تشغيل/تشخيص/كاش | لا | `components/PwaInstallBanner.tsx` |
| `mj-quran-bookmarks-v1` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/quran-personal.ts` |
| `mj-quran-hifz-v1` | LS | الحفظ والتسميع | ملف JSON | `lib/quran-personal.ts` |
| `mj-quran-khatmah-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/quran-personal.ts` |
| `mj-quran-notes-v1` | LS | الملاحظات والإبرازات | ملف JSON | `lib/quran-personal.ts` |
| `mj-quran-page-pos-v1` | LS | المصحف: الموضع والعلامات | ملف JSON | `components/onboarding/FirstVisitIntro.tsx` |
| `mj-quran-playback-rate-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-audio.ts` |
| `mj-quran-pos-v3` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/quran-api.ts` |
| `mj-quran-prefs-v3` | LS | إعدادات العرض والقراءة | UserDefaults | `hooks/useQuranPreferences.ts` |
| `mj-quran-prefs-v4` | LS | إعدادات العرض والقراءة | UserDefaults | `hooks/useQuranPreferences.ts` |
| `mj-quran-qiraat-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-api.ts` |
| `mj-quran-reading-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/quran-personal.ts` |
| `mj-quran-reciter-v3` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-audio.ts` |
| `mj-quran-streak-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/quran-personal.ts` |
| `mj-quran-v3-` | LS | تشغيل/تشخيص/كاش | لا | `lib/quran-api.ts` |
| `mj-quran-wird-v3` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/quran-api.ts` |
| `mj-tafsir-playback-rate-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-data/tafsir-audio.ts` |
| `mj.last-path` | SS | جلسة فقط | لا | `App.tsx` |
| `mj.load-fail-log` | LS | تشغيل/تشخيص/كاش | لا | `lib/load-fail-log.ts` |
| `mj.native-load-retry` | SS | جلسة فقط | لا | `main.tsx` |
| `mj.ops-telemetry.v1` | SS | جلسة فقط | لا | `lib/ops-telemetry.ts` |
| `mj.startup-fail-count` | SS | جلسة فقط | لا | `lib/startup-safe-mode.ts` |
| `mj.startup-safe-mode` | SS | جلسة فقط | لا | `lib/startup-safe-mode.ts` |
| `mj.startup-safe-reason` | SS | جلسة فقط | لا | `lib/startup-safe-mode.ts` |
| `mj.sw-reload-once.v1` | SS | جلسة فقط | لا | `lib/chunk-recovery.ts` |
| `mosque_silence_shown` | SS | جلسة فقط | لا | `views/MosqueModePage.tsx` |
| `msk_recent_pages` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/recent-pages.ts` |
| `msk-quran-mem-v1` | LS | الحفظ والتسميع | ملف JSON | `lib/quran-memorization.ts` |
| `mushaf-experience-perf` | LS | تشغيل/تشخيص/كاش | لا | `features/mushaf-reader/mushaf-experience-perf.ts` |
| `mushaf-fitPageFontSize-v3` | LS | تشغيل/تشخيص/كاش | لا | `features/mushaf-madinah/fitPageFontSize.ts` |
| `mushaf-reading-coach-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `features/mushaf-reader/MushafReadingCoach.tsx` |
| `mushaf-turn-telemetry` | LS | تشغيل/تشخيص/كاش | لا | `features/mushaf-reader/mushaf-turn-telemetry.ts` |
| `myBookmarks` | LS+PREF | المصحف: الموضع والعلامات | ملف JSON | `lib/quran-my-bookmarks.ts` |
| `myBookmarks:analytics-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/mushaf-bookmark-analytics.ts` |
| `myBookmarks:ayah-migrated-v1` | LS+PREF | المصحف: الموضع والعلامات | ملف JSON | `lib/quran-my-bookmarks.ts` |
| `myBookmarks:cloud-dirty` | LS | تشغيل/تشخيص/كاش | لا | `lib/mushaf-bookmark-cloud-sync.ts` |
| `myBookmarks:cloud-synced-at` | LS | تشغيل/تشخيص/كاش | لا | `lib/mushaf-bookmark-cloud-sync.ts` |
| `myBookmarks:last-used-id` | LS | المصحف: الموضع والعلامات | ملف JSON | `lib/quran-my-bookmarks-ops.ts` |
| `nations:favorites` | LS | المفضلات والمحفوظات | ملف JSON | `views/NationDetailPage.tsx` |
| `nations:last-chapter` | LS | المفضلات والمحفوظات | ملف JSON | `views/NationDetailPage.tsx` |
| `onboarding.completed.v1` | LS+PREF | إعدادات العرض والقراءة | UserDefaults | `lib/feature-tour-state.ts` |
| `published:no-daif` | LS | تشغيل/تشخيص/كاش | لا | `lib/adhkar-service.ts` |
| `quranReaderDarkMode` | LS | إعدادات العرض والقراءة | UserDefaults | `context/QuranContext.tsx` |
| `quranReaderShowTafsir` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-tafsir-database.ts` |
| `quranReaderShowTranslation` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-translation.ts` |
| `quranReaderTranslationEdition` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-translation.ts` |
| `recitation_ai_consent_v1` | LS | الحفظ والتسميع | UserDefaults | `lib/recitation-test/consent.ts` |
| `recitation-pace-stats` | LS | الحفظ والتسميع | ملف JSON | `lib/recitation-pace-tracker.ts` |
| `sb-<ref>-auth-token` | LS (احتياط) / Keychain | مصادقة | Keychain | `lib/supabase-auth-storage.ts` |
| `selected_muezzin_id` | LS | الصلاة والأذان | UserDefaults + App Group | `lib/adhan-preferences.ts` |
| `site_edit:` | LS | تشغيل/تشخيص/كاش | لا | `components/AdminSiteEditBar.tsx` |
| `ssunnah-app-store-review-session-v1` | LS | مصادقة (أعلام) | لا (يُقرأ فقط لتحديد مكان الجلسة) | `lib/app-store-review-auth.ts` |
| `ssunnah-auth-keychain-migrated-v1` | LS | مصادقة (أعلام) | لا (يُقرأ فقط لتحديد مكان الجلسة) | `lib/supabase-auth-storage.ts` |
| `ssunnah-auth-storage-key-v1` | LS | مصادقة (أعلام) | لا (يُقرأ فقط لتحديد مكان الجلسة) | `lib/supabase-auth-storage.ts` |
| `ssunnah-auth-storage-mode-v1` | LS | مصادقة (أعلام) | لا (يُقرأ فقط لتحديد مكان الجلسة) | `lib/supabase-auth-storage.ts` |
| `ssunnah-hifz-path-progress-v1` | LS | الحفظ والتسميع | ملف JSON | `lib/memorization-path/progress-store.ts` |
| `ssunnah-lessons-guide-flags-v1` | LS | أعلام ميزات (ويب) | لا | `lib/lessons-guide/flags.ts` |
| `ssunnah-memorization-research-flags-v1` | LS | أعلام ميزات (ويب) | لا | `lib/memorization-path/flags.ts` |
| `ssunnah-mushaf-appearance-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/mushaf-v2/appearance-prefs.ts` |
| `ssunnah-mushaf-reader-v2` | LS | أعلام ميزات (ويب) | لا | `lib/mushaf-v2/flags.ts` |
| `ssunnah-mushaf-user-data-migration-v` | LS | تشغيل/تشخيص/كاش | لا | `lib/mushaf-v2/migrate-user-data.ts` |
| `ssunnah-notif-locale-idx-v1` | LS | الإشعارات | UserDefaults | `lib/notifications/localization.ts` |
| `ssunnah-notif-section-last-msg-v1` | LS | الإشعارات | UserDefaults | `lib/notifications/sections-config.ts` |
| `ssunnah-quran-journey-flags-v1` | LS | أعلام ميزات (ويب) | لا | `lib/quran-journey/flags.ts` |
| `ssunnah-quran-journey-owner-v1` | LS | الحفظ والتسميع | ملف JSON | `lib/quran-journey/local-repository.ts` |
| `ssunnah-quran-journey-store-v1` | LS | الحفظ والتسميع | ملف JSON | `lib/quran-journey/local-repository.ts` |
| `ssunnah-quran-khatma-v1` | LS | الختمة والورد والإنجاز | ملف JSON | `lib/mushaf-v2/QuranKhatmaRepository.ts` |
| `ssunnah-refreshing-version` | SS | جلسة فقط | لا | `lib/chunk-recovery.ts` |
| `ssunnah-tasmee-v2` | LS | أعلام ميزات (ويب) | لا | `lib/tasmee-v2/flags.ts` |
| `ssunnah-tasmee-v2-alerts` | LS | الحفظ والتسميع | UserDefaults | `features/tasmee-v2/TasmeeV2Layer.tsx` |
| `ssunnah:audio-prompt-prefs-v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/audio/audio-prompt-preferences.ts` |
| `ssunnah:quran-nav-pending-v1` | SS | جلسة فقط | لا | `lib/quran-navigation/service.ts` |
| `ssunnah:quran-nav-return-v1` | SS | جلسة فقط | لا | `lib/quran-navigation/service.ts` |
| `sunan_checked` | LS | المفضلات والمحفوظات | ملف JSON | `views/SunanYawmiyyaPage.tsx` |
| `sunnah-homepage-prefs-v2-home-simplify` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/homepage-layout.ts` |
| `sunnah-widget-event-overrides-v1` | LS | الويدجت | App Group | `lib/widget-data/islamic-events.ts` |
| `sunnah-widget-last-publish-v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/widget-data/repository.ts` |
| `sunnah-widget-preferences-v1` | LS | الويدجت | App Group | `lib/widget-data/preferences.ts` |
| `sunnah-widget-selections-v1` | LS | الويدجت | App Group | `lib/widget-data/selections.ts` |
| `sunnah.audio.platform.prefs.v1` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/sunnah-audio-platform/preferences.ts` |
| `sunnah.fawaid.list.v1` | SS | جلسة فقط | لا | `pages/account/ui/FawaidView.tsx` |
| `sunnah.mushaf.focusReadingModePreference` | LS | إعدادات العرض والقراءة | UserDefaults | `features/mushaf-reader/mushaf-page-arrows-prefs.ts` |
| `sunnah.mushaf.pageArrowsEnabled` | LS | إعدادات العرض والقراءة | UserDefaults | `features/mushaf-reader/mushaf-page-arrows-prefs.ts` |
| `sunnah.neuralTts` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/ai-narration/neural-tts-client.ts` |
| `sunnah.notifications.dedupe.v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sunnah-notifications/deduplicator.ts` |
| `sunnah.notifications.follows.v1` | LS | الإشعارات | UserDefaults | `lib/sunnah-notifications/new-content.ts` |
| `sunnah.notifications.killSwitch.v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sunnah-notifications/kill-switch.ts` |
| `sunnah.notifications.learning.active.v1` | LS | الإشعارات | UserDefaults | `lib/sunnah-notifications/learning.ts` |
| `sunnah.notifications.prefs.v1` | LS | الإشعارات | UserDefaults | `lib/sunnah-notifications/preferences.ts` |
| `sunnah.notifications.rate.v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sunnah-notifications/rate-limit.ts` |
| `sunnah.notifications.telemetry.v1` | LS | تشغيل/تشخيص/كاش | لا | `lib/sunnah-notifications/telemetry.ts` |
| `tasbeeh_state` | LS | الأذكار والمسبحة | UserDefaults | `lib/tasbeeh-storage.ts` |
| `univ-notice-dismissed` | LS | تشغيل/تشخيص/كاش | لا | `views/UniversitiesPage.tsx` |
| `userFontSize` | LS | إعدادات العرض والقراءة | UserDefaults | `lib/quran-font-size.ts` |
| `userNotes` | LS | الملاحظات والإبرازات | ملف JSON | `lib/quran-user-notes.ts` |

## الملحق ب: قواعد IndexedDB

| القاعدة | المخازن | يُرحَّل؟ |
|---|---|---|
| `majalis-offline-engine-v2` (Dexie، `lib/offline-engine.ts`) | `records`، وحقل `store` فيه أحد: `meta`، `bookmarks`، `flashcards`، `quran`، `adhkar`، `articles` | `bookmarks` و`flashcards` و`meta` (هدف الختمة `khatmah-goal-v1`، وإحصاء وتيرة التلاوة) نعم. البقية كاش |
| `majalis-quran-app-db` (Dexie، `core/quran/DatabaseManager.ts`) | `settings`، `progress`، `bookmarks`، `tafseer_cache` | الثلاثة الأولى نعم؛ `tafseer_cache` كاش |
| `majalis-quran-audio-resume` (`lib/quran-audio-resume.ts`) | موضع استئناف الصوت | اختياري |
| `majalis-quran-audio`، `majalis-tafsir-audio` | ملفات صوت (Blob) | لا؛ على iOS تذهب التلاوات إلى Application Support أصلًا |
