# ترحيل بيانات المستخدمين من نسخة Capacitor إلى التطبيق الأصلي (SwiftUI)

> تقرير بحثي فقط (2026-10-11). لم يُعدَّل أي ملف موجود. الكود أدناه **تجريبي** للتصميم، لم يُبنَ ولم يُختبر على جهاز.
> المرجع: `main` عند `d3fa768` وفرع `native-app` عند `8391fbb`.

## الخلاصة

1. النسخة المنشورة **لا تحمل واجهة محلية**: `capacitor.config.json` يضبط `server.url = https://www.ssunnah.com`، فكل بيانات الويب محفوظة تحت أصل (origin) `https://www.ssunnah.com` في مخزن `WKWebsiteDataStore.default()` داخل حاوية التطبيق.
2. ثلاثة مخازن **تنجو تلقائيًا** عند التحديث بنفس Bundle ID (`com.yousef.majlisilm`) لأنها أصلية أصلًا: جلسة الدخول في Keychain، ومفاتيح Capacitor Preferences في `UserDefaults.standard`، ولقطات App Group للويدجت. إضافة إلى ملفات التلاوات المحمّلة في Application Support والإشعارات المجدولة.
3. **كل ما عداها** (قرابة 270 مفتاح localStorage وأربع قواعد IndexedDB) لا يراه التطبيق الأصلي، وسيضيع عمليًا إن لم نرحّله: إعدادات الصلاة وموقعها، الحفظ والمراجعة، الختمات، المسبحة، المفضلات، الملاحظات، الإبرازات، البطاقات، الإعدادات العامة.
4. **السحابة (Supabase) لا تغطي إلا جزءًا**، ولمن سجّل الدخول فقط. الزائر (غير المسجّل) ليس له في السحابة شيء. والتفضيلات والختمة والورد تُرسَل للطابور ثم **تُسقَط** دون رفع (`hybrid-sync-handlers.ts` سطر 92: «تفضيلات أخرى تُعكس محليًا»).
5. فرع `native-app` لا يحوي حتى الآن عميل Supabase ولا أي منطق ترحيل؛ فقط `KeychainAuthStore` يقرأ نفس مساحة أسماء الجلسة القديمة (جيد).
6. **الطريقة الموصى بها**: عند أول تشغيل للنسخة الأصلية نُنشئ `WKWebView` مخفيًا (بلا واجهة) على نفس المخزن الافتراضي، نحمّل صفحة فارغة بـ`baseURL = https://www.ssunnah.com`، ونقرأ localStorage وIndexedDB بـJavaScript فيعيدها WebKit نفسه مفكوكة الترميز، ثم نحفظ لقطة خام كاملة (JSON) في Application Support قبل أي تحويل. والقراءة المباشرة لملفات SQLite احتياط فقط. هذا لا يحتاج أي تعديل على الموقع المجمّد.

---

## 1) كل بيانات المستخدم وأين تُخزَّن

### 1.1 خريطة المخازن

| المخزن | المكان الفعلي على iOS | ماذا يحوي | المصدر في الكود |
|---|---|---|---|
| **localStorage** (أصل `https://www.ssunnah.com`) | `Library/WebKit/WebsiteData/…` (ملف SQLite تديره WebKit) | الغالبية العظمى من بيانات المستخدم (الجدول 1.2) | مئات الملفات في `src/lib` |
| **IndexedDB** (نفس الأصل) | `Library/WebKit/WebsiteData/…/IndexedDB` | مرايا للعلامات والبطاقات وتقدّم المصحف وكاش محتوى | `offline-engine.ts`، `core/quran/DatabaseManager.ts`، `quran-audio-resume.ts` |
| **Cache Storage** | داخل بيانات WebKit | أذان كامل محمّل (`majalis-adhan-full-v1`) | `adhan-downloads.ts` |
| **Keychain** خدمة `com.yousef.majlisilm.auth` | Keychain النظام | جلسة Supabase (الحساب `cap.supabase.sb-<ref>-auth-token`) + جلسة قديمة `majlis.auth.session.v1` | `SunnahAuthKeychainPlugin.swift`، `supabase-auth-storage.ts` |
| **Capacitor Preferences** | `UserDefaults.standard` بمفاتيح `CapacitorStorage.<key>` | نسخة احتياطية لـ16 مفتاح تقدّم + `adhkar_progress_*` + جولة المزايا | `native-storage.ts` (`NATIVE_PROGRESS_KEYS`)، `feature-tour-state.ts` |
| **App Group** `group.com.yousef.majlisilm` | UserDefaults المشتركة | لقطات الويدجت: مواقيت اليوم، التقدّم، الإعدادات المعروضة | `Shared/SunnahSharedData.swift`، `SunnahSharedDataPlugin.swift` |
| **Application Support** | ملفات | تلاوات محمّلة دون اتصال (على iOS عبر `MajlisOfflineAudio`) | `quran-audio-downloads.ts`، `Shared/OfflineAudioStore.swift` |
| **UNUserNotificationCenter** | النظام | إشعارات محلية جدولتها نسخة الويب (معرّفات رقمية) | `LegacyWebNotifications.swift` (native-app) |
| **Supabase** | الخادم | بيانات الحساب لمن سجّل الدخول (القسم 1.3) | `hybrid-sync-handlers.ts`، `guest-cloud-merge.ts`، … |

### 1.2 مفاتيح localStorage حسب الفئة

استُخرجت آليًا من `src` (ثوابت `*_KEY` واستدعاءات `getItem/setItem`)، فقد تفوت مفاتيح ديناميكية مثل `adhkar_progress_*` و`majalis-tasbeeh-item-*` و`majalis-resume-toast-dismiss:*`. لهذا يقرأ الترحيل **كل** المفاتيح دون قائمة بيضاء، ثم يحوّل المعروف منها.

| الفئة | المفاتيح | الأهمية |
|---|---|---|
| **المصحف: الموضع والعلامات** | `lastPage`، `myBookmarks` (+`:ayah-migrated-v1`، `:cloud-dirty`، `:cloud-synced-at`، `:last-used-id`)، `mj-quran-bookmarks-v1`، `mj-quran-pos-v3`، `mj-quran-page-pos-v1`، `majalis-continue-reading-v1`، `majalis-local-bookmarks-v1`، `ssunnah-mushaf-ayah-marks-v1`، `majlisilm.mushaf.ayah-marks`، `msk_recent_pages`، `majlisilm-last-surah-v1`، `majlisilm-last-verse-index-v1` | حرجة |
| **ملاحظات وإبرازات** | `mj-quran-notes-v1`، `userNotes`، `majalis-text-highlights-v1`، `majalis-knowledge-vault-index-v1`، `majalis-knowledge-vault-body-v1` | حرجة |
| **الختمة والورد** | `mj-quran-khatmah-v1`، `ssunnah-quran-khatma-v1`، `majalis-khatmah-tracker-v1`، `mj-quran-wird-v3`، `mj-quran-reading-v1`، `majalis-daily-progress-v1`، `majalis-daily-wird-done-v1` | حرجة |
| **الحفظ والتسميع** | `mj-quran-hifz-v1`، `ssunnah-hifz-path-progress-v1`، `msk-quran-mem-v1`، `majalis-quran-memorization-plan-v1`، `ssunnah-tasmee-v2-alerts`، `ssunnah-tasmee-strictness-v1`، `recitation-pace-stats`، `majalis-recitation-pace-v1`، `ssunnah-quran-journey-store-v1` | حرجة |
| **السلاسل والإنجاز** | `mj-quran-streak-v1`، `majalis-user-streak-v1`، `majalis-local-milestones-v1`، `majalis_notified_badges`، `majalis-daily-challenge-*`، `majalis_used_quiz_v1`، `majlis-knowledge-progress-v1`، `majlisilm-course-progress-v1` | متوسطة |
| **الأذكار والمسبحة** | `majalis-tasbih-v3`، `tasbeeh_state`، `majalis-tasbeeh-item-*`، `majlisilm-daily-adhkar-v1`، `adhkar_progress_*`، `sunan_checked`، `an_read` | متوسطة |
| **المفضلات** | `ah-favs`، `hikam_fav`، `majalis:hadith-saved`، `prophet-bookmarks`، `majalis-surah-favorites-v1`، `majalis-qa-favorites-v1`، `nations:favorites`، `majlis:researches:saved:v1`، `sunnah.fawaid.list.v1`، `majalis-mawarith-cases-v1` | حرجة |
| **إعدادات الصلاة والأذان** | `majalis-prayer-location-v1` (إحداثيات + منطقة زمنية)، `majalis-prayer-calc-method-v1`، `majalis-prayer-madhab-v1`، `majalis-prayer-highlat-v1`، `majalis-prayer-adjustments-v1`، `majalis-governorate-v1`، `majalis-last-geo-v1`، `majalis-adhan-prefs-v1`، `majalis_settings_adhan_sound_id`، `selected_muezzin_id`، `majalis-prayer-alert-prefs-v1`، `majalis-prayer-notification-prefs-v1` | **حرجة**: خطأ فيها يعني مواقيت خاطئة |
| **الإشعارات** | `majalis_notif_prefs_v1`، `majalis_adhkar_reminders_v1`، `sunnah.notifications.prefs.v1`، `sunnah.notifications.follows.v1`، `majalis_notif_sched_v1` | متوسطة |
| **إعدادات القراءة والعرض** | `majalis-theme`، `userFontSize`، `majalis-font-preference-v2`، `majalis-user-settings-v1`، `majalis-lang`، `ssunnah-mushaf-appearance-v1`، `ssunnah-mushaf-reader-v2`، `majlisilm.mushaf.theme`، `mj-quran-prefs-v4`، `mj-quran-reciter-v3`، `mj-quran-playback-rate-v1`، `majalis-mushaf-tafsir-*`، `majalis-mushaf-translation-*`، `quranReader*`، `selectedMushafPreset`، `majalis-oled-eye-care-v1`، `majalis-power-saver-v1` | متوسطة |
| **الويدجت** | `sunnah-widget-preferences-v1`، `sunnah-widget-selections-v1`، `sunnah-widget-event-overrides-v1` | متوسطة |
| **البطاقات (تكرار متباعد)** | `majalis-flashcard-reviews-v1` (+ مرآة Dexie) | متوسطة |
| **سجلات وتخصيص** | `majalis-search-history`، `majalis-kp-*`، `majalis.assistant.chat.v1`، `majlis:researches:*`، `majalis-guest-merge-*` | منخفضة |
| **أعلام تشغيل وتشخيص** (لا تُرحَّل) | `mj.*`، `majalis-chunk-*`، `majalis-cdn-health-v1`، `majalis-safe-*`، `majalis-error-reports-v2`، `__majalis_smart_notif_timers__`، `ssunnah-refreshing-version`، `majalis_update_*`، `mj-pwa-install-dismissed-v1` | تُهمَل |
| **المصادقة** | `sb-<ref>-auth-token` (فقط في وضع الاحتياط `ssunnah-auth-storage-mode-v1 = localStorage_fallback`)، `ssunnah-auth-storage-key-v1`، `ssunnah-auth-keychain-migrated-v1` | حرجة لمن هو في وضع الاحتياط |

### 1.3 قواعد IndexedDB

| القاعدة | المخازن | ما يهم المستخدم |
|---|---|---|
| `majalis-offline-engine-v2` (Dexie) | `records` بحقل `store` ∈ meta/bookmarks/flashcards/quran/adhkar/articles | `bookmarks` و`flashcards` و`meta` (هدف الختمة `khatmah-goal-v1`، إحصاء وتيرة التلاوة). البقية كاش محتوى يُعاد تنزيله |
| `majalis-quran-app-db` (Dexie) | settings، progress، bookmarks، tafseer_cache | الثلاثة الأولى؛ `tafseer_cache` كاش |
| `majalis-quran-audio-resume` | موضع استئناف الصوت | منخفض |
| `majalis-quran-audio` / `majalis-tafsir-audio` | ملفات صوت (Blob) | على iOS الأصلي تذهب التلاوات إلى Application Support؛ ما في IndexedDB يُعاد تنزيله |

### 1.4 ما في Supabase (لمن سجّل الدخول فقط)

جداول يكتبها العميل باسم المستخدم: `profiles`، `bookmarks` (العلامات والمفضلات عبر `favorite_toggle`)، `user_notes` (ملاحظات الآيات)، `reading_resume` (موضع المصحف والدروس)، `user_progress` (الدروس والدورات عبر `upsert_user_progress`)، `flashcard_reviews`، `sr_reviews`، `user_homepage_prefs`، `user_saved_citations`، `new_muslim_progress`، `path_enrollments`، `quiz_attempts`، `achievements`، `certificates`، `lesson_registrations`، `scholar_follows`، `item_completion_events`، `study_sessions`، `content_ratings`. واشتراك الدفع عبر `POST /api/push/subscribe` (مسار نسبي على الموقع).

**ليس في السحابة حتى لمن سجّل الدخول**: إعدادات الصلاة وموقعها، الختمة والورد والتفضيلات (يمرّرها `sync-engine/engine.ts` كـ`preference_patch` فيسقطها المعالج)، الحفظ والتسميع، المسبحة، السلاسل، الإبرازات (النوع `highlight` غير مربوط)، أغلب المفضلات الخاصة بالأقسام (`ah-favs`، `hikam_fav`، …)، إعدادات الويدجت.

---

## 2) ما الذي سيضيع؟

| الفئة | زائر غير مسجّل | مستخدم مسجّل |
|---|---|---|
| تسجيل الدخول | لا ينطبق | **ينجو** في Keychain، بشرط أن يقرأه العميل الأصلي (القسم 3.5). يضيع لمن هو في وضع `localStorage_fallback` إن لم نقرأ localStorage |
| موضع المصحف (`lastPage`)، العلامات، هدف الختمة | **ينجو** عبر Capacitor Preferences إن كُتب بعد إضافة المرآة (`NATIVE_PROGRESS_KEYS`)؛ غير ذلك يضيع | ينجو أيضًا في `reading_resume` و`bookmarks` بعد بناء المزامنة الأصلية |
| ملاحظات الآيات | **يضيع** | في `user_notes` |
| إعدادات الصلاة (الطريقة، المذهب، الموقع بالإحداثيات، التعديلات بالدقائق، العروض العليا) | **يضيع**؛ لقطة App Group تحفظ اسم الموقع والمنطقة الزمنية والطريقة فقط دون الإحداثيات والتعديلات | **يضيع** |
| الحفظ، المراجعة، التسميع، الختمات، الورد، السلاسل | **يضيع** | **يضيع** |
| المسبحة والأذكار المقروءة | يضيع، عدا `adhkar_progress_*` في Preferences | كذلك |
| المفضلات بأنواعها والإبرازات | **يضيع** | المحفوظ عبر `favorite_toggle` فقط ينجو في `bookmarks` |
| البطاقات | يضيع | في `flashcard_reviews` |
| الدروس والدورات | يضيع | في `user_progress` |
| المظهر والخط وإعدادات القارئ والتلاوة | **يضيع** | **يضيع** |
| تفضيلات الإشعارات | يضيع؛ الإشعارات المجدولة نفسها تبقى في النظام حتى يعيد الأصلي جدولتها | كذلك |
| تلاوات محمّلة | **تنجو** (Application Support) إن بقي مسار `OfflineAudioStore` نفسه | كذلك |
| أذان كامل محمّل (Cache Storage) | يضيع ويُعاد تنزيله | كذلك |
| رمز APNs والاشتراك | النظام يعطي رمزًا للتطبيق نفسه؛ يجب أن يعيد الأصلي التسجيل والإرسال إلى `/api/push/subscribe` بعنوان مطلق | كذلك |

**ملاحظة استنتاجية (غير مُتحقَّق منها على جهاز)**: سياسة WebKit لتقييد تخزين السكربت (حد الأيام السبعة في ITP) قد تكون محت بالفعل بيانات بعض من لم يفتحوا التطبيق مدة طويلة، وهذا على الأرجح سبب إضافة مرآة Preferences. لا يغيّر الخطة لكنه يعني أن «لا شيء للترحيل» حالة طبيعية يجب ألا تُعامل كخطأ.

**أخطر نقطة**: إعدادات الصلاة. المستخدم الذي ضبط موقعه أو طريقة الحساب أو تعديلات الدقائق سيرى بعد التحديث مواقيت الكويت الافتراضية دون أن يعرف، وستُجدوَل أذاناته عليها.

---

## 3) كيف نقرأ بيانات WKWebView القديمة من SwiftUI

### 3.1 لماذا هذا ممكن

- التحديث بنفس Bundle ID وفريق التوقيع يحافظ على حاوية التطبيق كاملة: `Library/` و`Application Support/` وKeychain وApp Group.
- WKWebView في Capacitor يستخدم `WKWebsiteDataStore.default()` (لا يوجد `websiteDataStore` مخصّص ولا `WKAppBoundDomains`). وأي WKWebView جديد في التطبيق الأصلي على `.default()` يرى نفس البيانات.
- `purgeWebCachesOncePerAppBuild` في `AppDelegate.swift` يمسح الكاش فقط ولا يمس localStorage ولا IndexedDB. **يجب ألا ينقل التطبيق الأصلي أي مسح شامل لـ`WKWebsiteDataStore` قبل اكتمال الترحيل.**

### 3.2 الطرق الثلاث ومقارنتها

| الطريقة | localStorage | IndexedDB | الاعتمادية | ملاحظات |
|---|---|---|---|---|
| **أ. WKWebView مخفي + JavaScript** (موصى بها) | ✓ | ✓ | عالية: WebKit يفك ترميزه بنفسه عبر كل إصدارات iOS | تحتاج `import WebKit` لمرة واحدة؛ لا واجهة ويب ظاهرة؛ تُحذف بعد بضعة إصدارات |
| ب. قراءة SQLite مباشرة | ✓ | ✗ عمليًا (ترميز `SerializedScriptValue` داخلي غير موثّق) | متوسطة: المسار والتخطيط تغيّرا في iOS 17 | احتياط لـlocalStorage فقط |
| ج. Capacitor Preferences من UserDefaults | جزئي (16 مفتاحًا) | ✗ | عالية جدًا | تُقرأ دائمًا وتُدمج |

### 3.3 مسارات الملفات (للطريقة ب)

- iOS 16 وما قبله: `Library/WebKit/WebsiteData/LocalStorage/https_www.ssunnah.com_0.localstorage`
- iOS 17 وما بعده: `Library/WebKit/WebsiteData/Default/<hash>/<hash>/LocalStorage/localstorage.sqlite3` مع ملف `origin` بجواره يحمل الأصل.
- الجدول: `ItemTable(key TEXT, value BLOB)`، والقيمة نص UTF-16LE.

هذه المسارات من معرفة عامة بـWebKit وليست مُتحقَّقًا منها على جهاز التطبيق؛ لذلك القارئ يبحث بالتكرار تحت `Library/WebKit` ولا يفترض مسارًا ثابتًا.

### 3.4 الأصول (origins) التي يجب قراءتها

`https://www.ssunnah.com` أساسًا، ثم `https://ssunnah.com` و`https://www.majlisilm.com` و`https://majlisilm.com` (كلها في `allowNavigation`، والاسم القديم للتطبيق كان «مجلس العلم» فالنسخ الأقدم قد تكون كتبت تحت `majlisilm.com`). يُكتشف الموجود منها فعلًا بـ`fetchDataRecords`.

### 3.5 تسجيل الدخول

- الجلسة في Keychain تحت الخدمة `com.yousef.majlisilm.auth` والحساب `cap.supabase.sb-<ref>-auth-token`، والقيمة JSON جلسة supabase-js (`access_token`، `refresh_token`، `expires_at`، `user`).
- `KeychainAuthStore` في `native-app` يقرأ هذه المساحة نفسها، **لكن لا يوجد عميل Supabase أصلي بعد**. عند بنائه: نقرأ `refresh_token` من الجلسة القديمة ونستبدله فورًا بجلسة جديدة (`POST /auth/v1/token?grant_type=refresh_token`) ثم نخزّنها. رموز التحديث في Supabase تُدوَّر وتُستعمل مرة واحدة، ولا تنافس هنا لأن الويب لن يعمل بعد التحديث.
- إن لم توجد في Keychain نبحث عن `sb-*-auth-token` في لقطة localStorage (وضع الاحتياط).
- لا تُكتب الجلسة أبدًا في لقطة JSON على القرص: يُحذف أي مفتاح `sb-*-auth-token` من اللقطة قبل الحفظ.

---

## 4) خطة الترحيل

### 4.1 المبادئ

1. **الخام أولًا ثم التحويل**: نحفظ لقطة كاملة لكل المفاتيح والسجلات في `Application Support/LegacyWeb/snapshot-v1.json` قبل أي تحويل. الشاشات الأصلية التي لم تُبنَ بعد (الحفظ، المسبحة، …) تستورد من اللقطة حين تُبنى، فلا نربط الترحيل بجاهزية كل شاشة.
2. **لا حذف**: لا نمسح بيانات WebKit ولا مفاتيح Preferences في أول إصدارين أصليين. الحذف في إصدار لاحق بعد قياس.
3. **Idempotent**: كل خطوة تحويل تُسجَّل في `UserDefaults` بعلم مستقل (`legacy.import.<domain>.v1`)، وتفضّل القيمة الأصلية إن وُجدت.
4. **قبل أول واجهة تعتمد على البيانات**: الترحيل يعمل في شاشة الإقلاع، بمهلة قصوى (مثلًا 4 ثوانٍ)، ولا يجمّد التطبيق إن فشل؛ يُعاد في التشغيل التالي ما لم يكتمل.
5. **الصلاة أولًا**: إعدادات الموقع والطريقة والتعديلات تُحوَّل قبل أول جدولة للأذان، وإلا جُدولت على الافتراضي.
6. **دمج المصادر**: لكل مفتاح، الأولوية لقيمة localStorage الأحدث، ثم Capacitor Preferences (نفس منطق `hydrateNativeStorage`: المصحف يفضّل Preferences عند التعارض، الباقي يملأ الفارغ فقط).

### 4.2 المراحل

| المرحلة | العمل | معيار النجاح |
|---|---|---|
| 0. إثبات على جهاز | بناء صغير يحوي `WebStorageExtractor` فقط، يُثبَّت فوق نسخة App Store الحالية | اللقطة تحوي مفاتيح معروفة مضبوطة يدويًا على iOS 16 و17 و18 |
| 1. اللقطة الخام | `LegacyWebDataMigration.runIfNeeded()` في الإقلاع | ملف اللقطة موجود، بلا رموز جلسة |
| 2. المصادقة | محوّل الجلسة عند بناء عميل Supabase الأصلي | مستخدم مسجّل يبقى مسجّلًا بعد التحديث |
| 3. الحرجة | الصلاة، موضع المصحف، العلامات، الملاحظات، الختمة | مقارنة عرض قبل/بعد على نفس الجهاز |
| 4. الباقي | الحفظ، المسبحة، المفضلات، الإعدادات، الويدجت | كل شاشة أصلية تستورد من اللقطة عند بنائها |
| 5. التنظيف | بعد إصدارين: حذف كود WebKit والمسح الاختياري لبيانات الويب | — |

### 4.3 الاختبار

- **المحاكي** (رخيص وسريع): تثبيت `.app` لنسخة Capacitor بـ`xcrun simctl install`، فتحها وضبط بيانات، ثم تثبيت `.app` الأصلي فوقها بنفس Bundle ID؛ الحاوية تبقى.
- **الجهاز**: TestFlight فوق نسخة App Store (التحديث الحقيقي)، على iOS 16 و17 و18 على الأقل لاختلاف تخطيط التخزين.
- حالات: زائر بلا بيانات، زائر ببيانات كثيرة، مسجّل، مسجّل في وضع `localStorage_fallback`، مستخدم قديم كتب تحت `majlisilm.com`.
- اختبارات وحدة على المحوّلات بلقطات JSON نموذجية (بلا WebKit).

---

## 5) كود Swift تجريبي

> تصميم أولي. الأسماء والأنواع المستهدفة في التطبيق الأصلي (`MushafStore`، `PrayerSettingsStore`) افتراضية لتوضيح الشكل، ويجب ربطها بالأنواع الفعلية حين تُبنى.

### 5.1 المنسّق

```swift
import Foundation

/// ترحيل بيانات نسخة Capacitor (WKWebView) إلى التخزين الأصلي — مرة واحدة، بلا حذف.
@MainActor
public enum LegacyWebDataMigration {
    static let snapshotDoneKey = "legacy.web.snapshot.v1.done"
    static let knownOrigins = [
        "https://www.ssunnah.com", "https://ssunnah.com",
        "https://www.majlisilm.com", "https://majlisilm.com",
    ]

    public static var snapshotURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent("LegacyWeb/snapshot-v1.json")
    }

    /// يُستدعى من شاشة الإقلاع قبل أول جدولة للأذان.
    public static func runIfNeeded(timeout: TimeInterval = 4) async {
        let defaults = UserDefaults.standard
        if !defaults.bool(forKey: snapshotDoneKey) {
            if let snapshot = await buildSnapshot(timeout: timeout) {
                do {
                    try snapshot.write(to: snapshotURL)
                    defaults.set(true, forKey: snapshotDoneKey)
                } catch {
                    // يُعاد في التشغيل التالي؛ لا نحذف شيئًا.
                }
            }
        }
        guard let snapshot = try? LegacySnapshot.read(from: snapshotURL) else { return }
        LegacyImporter(snapshot: snapshot).importPending()
    }

    private static func buildSnapshot(timeout: TimeInterval) async -> LegacySnapshot? {
        var snapshot = LegacySnapshot()
        snapshot.capacitorPreferences = CapacitorPreferencesReader.readAll()

        // أ) WebKit يقرأ بياناته بنفسه.
        let origins = await LegacyOrigins.present(among: knownOrigins)
        for origin in origins {
            let dump = try? await withTimeout(timeout, {
                try await WebStorageExtractor.extract(origin: origin)
            })
            if let dump { snapshot.origins[origin.absoluteString] = dump }
        }

        // ب) احتياط: SQLite مباشرة إن لم تُرجع WebKit شيئًا.
        if snapshot.origins.values.allSatisfy({ $0.localStorage.isEmpty }) {
            for (origin, items) in SQLiteLocalStorageReader.readAll() where !items.isEmpty {
                snapshot.origins[origin, default: OriginDump()].localStorage = items
            }
        }

        snapshot.redactAuthTokens()
        return snapshot
    }
}

func withTimeout<T: Sendable>(_ seconds: TimeInterval,
                              _ work: @escaping @Sendable () async throws -> T) async throws -> T {
    try await withThrowingTaskGroup(of: T.self) { group in
        group.addTask { try await work() }
        group.addTask {
            try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            throw CancellationError()
        }
        let result = try await group.next()!
        group.cancelAll()
        return result
    }
}
```

### 5.2 نموذج اللقطة

```swift
import Foundation

public struct OriginDump: Codable, Sendable {
    public var localStorage: [String: String] = [:]
    /// اسم القاعدة → اسم المخزن → السجلات بصيغة JSON خام.
    public var indexedDB: [String: [String: [JSONValue]]] = [:]
}

public struct LegacySnapshot: Codable, Sendable {
    public var schema = 1
    public var createdAt = Date()
    public var appBuild = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? ""
    public var capacitorPreferences: [String: String] = [:]
    public var origins: [String: OriginDump] = [:]

    /// قيمة مفتاح بعد دمج المصادر: الأصل الأساسي أولًا ثم بقية الأصول ثم Preferences.
    public func value(_ key: String, preferPreferences: Bool = false) -> String? {
        let order = LegacyWebDataMigration.knownOrigins
        let fromWeb = order.lazy.compactMap { self.origins[$0]?.localStorage[key] }.first { !$0.isEmpty }
        let fromPrefs = capacitorPreferences[key].flatMap { $0.isEmpty ? nil : $0 }
        return preferPreferences ? (fromPrefs ?? fromWeb) : (fromWeb ?? fromPrefs)
    }

    public func decode<T: Decodable>(_ type: T.Type, _ key: String, preferPreferences: Bool = false) -> T? {
        guard let raw = value(key, preferPreferences: preferPreferences) else { return nil }
        return try? JSONDecoder().decode(T.self, from: Data(raw.utf8))
    }

    /// الجلسة لا تُكتب على القرص أبدًا؛ تُقرأ من Keychain أو تُنقل فورًا (LegacyAuthBridge).
    mutating func redactAuthTokens() {
        for key in origins.keys {
            origins[key]?.localStorage = origins[key]!.localStorage.filter {
                !($0.key.hasPrefix("sb-") && $0.key.hasSuffix("-auth-token"))
            }
        }
    }

    func write(to url: URL) throws {
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(),
                                                withIntermediateDirectories: true)
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        try encoder.encode(self).write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    static func read(from url: URL) throws -> LegacySnapshot {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(LegacySnapshot.self, from: Data(contentsOf: url))
    }
}

/// قيمة JSON عامة لسجلات IndexedDB (بنيتها تختلف من مخزن لآخر).
public indirect enum JSONValue: Codable, Sendable {
    case string(String), number(Double), bool(Bool), null
    case array([JSONValue]), object([String: JSONValue])

    public init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() { self = .null }
        else if let v = try? c.decode(Bool.self) { self = .bool(v) }
        else if let v = try? c.decode(Double.self) { self = .number(v) }
        else if let v = try? c.decode(String.self) { self = .string(v) }
        else if let v = try? c.decode([JSONValue].self) { self = .array(v) }
        else { self = .object(try c.decode([String: JSONValue].self)) }
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .string(let v): try c.encode(v)
        case .number(let v): try c.encode(v)
        case .bool(let v): try c.encode(v)
        case .null: try c.encodeNil()
        case .array(let v): try c.encode(v)
        case .object(let v): try c.encode(v)
        }
    }
}
```

### 5.3 الطريقة (أ): WKWebView مخفي

```swift
import WebKit

enum LegacyOrigins {
    /// الأصول التي لها فعلًا بيانات localStorage أو IndexedDB في المخزن الافتراضي.
    @MainActor
    static func present(among candidates: [String]) async -> [URL] {
        let types: Set<String> = [WKWebsiteDataTypeLocalStorage, WKWebsiteDataTypeIndexedDBDatabases]
        let records: [WKWebsiteDataRecord] = await withCheckedContinuation { cont in
            WKWebsiteDataStore.default().fetchDataRecords(ofTypes: types) { cont.resume(returning: $0) }
        }
        // displayName هو النطاق القابل للتسجيل، مثل "ssunnah.com".
        let domains = Set(records.map(\.displayName))
        return candidates.compactMap(URL.init(string:)).filter { url in
            guard let host = url.host else { return false }
            return domains.contains { host == $0 || host.hasSuffix("." + $0) }
        }
    }
}

/// يحمّل صفحة فارغة تحت أصل الموقع القديم (دون شبكة) ويقرأ تخزينه بـJavaScript.
@MainActor
final class WebStorageExtractor: NSObject, WKNavigationDelegate {
    private var loaded: CheckedContinuation<Void, Error>?

    static func extract(origin: URL) async throws -> OriginDump {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()          // نفس مخزن Capacitor
        let webView = WKWebView(frame: .zero, configuration: config)
        let loader = WebStorageExtractor()
        webView.navigationDelegate = loader

        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            loader.loaded = cont
            // baseURL يحدد الأصل؛ المحتوى محلي فلا طلب شبكة.
            webView.loadHTMLString("<!doctype html><meta charset=utf-8><title>m</title>",
                                   baseURL: origin.appendingPathComponent("/"))
        }

        let result = try await webView.callAsyncJavaScript(
            dumpScript, arguments: [:], in: nil, contentWorld: .page)
        guard let json = result as? String else { throw CocoaError(.coderReadCorrupt) }
        _ = webView // يبقى حيًا حتى انتهاء القراءة
        return try JSONDecoder().decode(OriginDump.self, from: Data(json.utf8))
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loaded?.resume(); loaded = nil
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        loaded?.resume(throwing: error); loaded = nil
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        loaded?.resume(throwing: error); loaded = nil
    }

    /// يقرأ كل localStorage، ومن IndexedDB المخازن الشخصية فقط (يتخطى كاش المحتوى والصوت).
    /// لا يُنشئ قاعدة غير موجودة: يفحص indexedDB.databases() أولًا.
    static let dumpScript = #"""
    const out = { localStorage: {}, indexedDB: {} };
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      out.localStorage[k] = localStorage.getItem(k);
    }
    const wanted = {
      "majalis-offline-engine-v2": ["records"],
      "majalis-quran-app-db": ["settings", "progress", "bookmarks"],
      "majalis-quran-audio-resume": null,
    };
    const skipRecordStores = new Set(["quran", "adhkar", "articles"]);
    const existing = new Set((await indexedDB.databases()).map(d => d.name));
    const open = (name) => new Promise((res, rej) => {
      const r = indexedDB.open(name);
      r.onupgradeneeded = () => r.transaction.abort();   // لا ننشئ ولا نرقّي
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    for (const [name, stores] of Object.entries(wanted)) {
      if (!existing.has(name)) continue;
      let db;
      try { db = await open(name); } catch { continue; }
      out.indexedDB[name] = {};
      for (const s of (stores ?? Array.from(db.objectStoreNames))) {
        if (!db.objectStoreNames.contains(s)) continue;
        out.indexedDB[name][s] = await new Promise((res, rej) => {
          const rows = [];
          const req = db.transaction(s, "readonly").objectStore(s).openCursor();
          req.onsuccess = () => {
            const c = req.result;
            if (!c) return res(rows);
            const v = c.value;
            const isCache = name === "majalis-offline-engine-v2" && skipRecordStores.has(v && v.store);
            if (!isCache) rows.push(v);
            c.continue();
          };
          req.onerror = () => rej(req.error);
        });
      }
      db.close();
    }
    return JSON.stringify(out);
    """#
}
```

### 5.4 الطريقة (ب): SQLite مباشرة (احتياط لـlocalStorage)

```swift
import Foundation
import SQLite3

enum SQLiteLocalStorageReader {
    private static let markers = ["ssunnah", "majlisilm"]

    /// يبحث تحت Library/WebKit عن تخطيطَي iOS ≤16 و17+ معًا.
    static func readAll() -> [String: [String: String]] {
        let fm = FileManager.default
        let root = fm.urls(for: .libraryDirectory, in: .userDomainMask)[0].appendingPathComponent("WebKit")
        var result: [String: [String: String]] = [:]
        guard let walker = fm.enumerator(at: root, includingPropertiesForKeys: nil) else { return result }
        for case let url as URL in walker {
            let name = url.lastPathComponent
            if name.hasSuffix(".localstorage") {
                // https_www.ssunnah.com_0.localstorage
                guard markers.contains(where: name.contains) else { continue }
                result[originFromLegacyName(name)] = readItemTable(at: url)
            } else if name == "localstorage.sqlite3" {
                // Default/<hash>/<hash>/LocalStorage/localstorage.sqlite3 ، والأصل في ../origin
                let originFile = url.deletingLastPathComponent().deletingLastPathComponent()
                    .appendingPathComponent("origin")
                let tag = (try? Data(contentsOf: originFile)).map { String(decoding: $0, as: UTF8.self) } ?? ""
                guard let marker = markers.first(where: tag.contains) else { continue }
                let origin = tag.contains("www.") ? "https://www.\(marker).com" : "https://\(marker).com"
                result[origin, default: [:]].merge(readItemTable(at: url)) { a, _ in a }
            }
        }
        return result
    }

    private static func originFromLegacyName(_ name: String) -> String {
        // https_www.ssunnah.com_0.localstorage → https://www.ssunnah.com
        var s = String(name.dropLast(".localstorage".count))
        if let r = s.range(of: "_", options: .backwards) { s = String(s[..<r.lowerBound]) }
        return s.replacingOccurrences(of: "https_", with: "https://")
    }

    /// ينسخ القاعدة وملفات WAL إلى مجلد مؤقت ثم يقرأ النسخة، فلا يلمس ملفات WebKit.
    static func readItemTable(at source: URL) -> [String: String] {
        let fm = FileManager.default
        let tmp = fm.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try? fm.createDirectory(at: tmp, withIntermediateDirectories: true)
        defer { try? fm.removeItem(at: tmp) }
        let copy = tmp.appendingPathComponent("ls.sqlite3")
        for suffix in ["", "-wal", "-shm"] {
            let src = URL(fileURLWithPath: source.path + suffix)
            if fm.fileExists(atPath: src.path) {
                try? fm.copyItem(at: src, to: URL(fileURLWithPath: copy.path + suffix))
            }
        }

        var db: OpaquePointer?
        guard sqlite3_open_v2(copy.path, &db, SQLITE_OPEN_READWRITE, nil) == SQLITE_OK else { return [:] }
        defer { sqlite3_close(db) }
        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, "SELECT key, value FROM ItemTable", -1, &stmt, nil) == SQLITE_OK else { return [:] }
        defer { sqlite3_finalize(stmt) }

        var out: [String: String] = [:]
        while sqlite3_step(stmt) == SQLITE_ROW {
            guard let k = sqlite3_column_text(stmt, 0) else { continue }
            let key = String(cString: k)
            let count = Int(sqlite3_column_bytes(stmt, 1))
            guard count > 0, let bytes = sqlite3_column_blob(stmt, 1) else { out[key] = ""; continue }
            let data = Data(bytes: bytes, count: count)
            // WebKit يخزن القيمة UTF-16LE؛ يُتحقَّق من ذلك على كل إصدار iOS في المرحلة 0.
            out[key] = String(data: data, encoding: .utf16LittleEndian) ?? String(decoding: data, as: UTF8.self)
        }
        return out
    }
}
```

### 5.5 Capacitor Preferences

```swift
import Foundation

/// @capacitor/preferences على iOS يكتب في UserDefaults.standard بالبادئة "CapacitorStorage.".
enum CapacitorPreferencesReader {
    static let prefix = "CapacitorStorage."

    static func readAll(_ defaults: UserDefaults = .standard) -> [String: String] {
        defaults.dictionaryRepresentation().reduce(into: [:]) { acc, item in
            guard item.key.hasPrefix(prefix), let value = item.value as? String else { return }
            acc[String(item.key.dropFirst(prefix.count))] = value
        }
    }
}
```

### 5.6 جسر الجلسة

```swift
import Foundation
import SunnahNative   // AuthSessionStoring

/// جلسة supabase-js كما حفظتها نسخة Capacitor.
struct LegacySupabaseSession: Decodable {
    let access_token: String
    let refresh_token: String
    let expires_at: Double?
    let user: User?
    struct User: Decodable { let id: String; let email: String? }
}

enum LegacyAuthBridge {
    /// projectRef = الجزء الأول من مضيف SUPABASE_URL (abcd في abcd.supabase.co).
    /// rawLocalStorage: قيم localStorage قبل التنقيح، لمن كان في وضع localStorage_fallback.
    static func legacySession(projectRef: String,
                              auth: AuthSessionStoring,
                              rawLocalStorage: [String: String]) -> LegacySupabaseSession? {
        let key = "sb-\(projectRef)-auth-token"
        let raw = (try? auth.value(forKey: key)) ?? rawLocalStorage[key]
        guard let raw, let data = raw.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(LegacySupabaseSession.self, from: data)
    }

    /// يستبدل رمز التحديث القديم بجلسة جديدة فورًا ثم يخزنها بنفس المفتاح في Keychain.
    static func exchange(_ legacy: LegacySupabaseSession, supabaseURL: URL, anonKey: String,
                         projectRef: String, auth: AuthSessionStoring) async throws {
        var comps = URLComponents(url: supabaseURL.appendingPathComponent("auth/v1/token"),
                                  resolvingAgainstBaseURL: false)!
        comps.queryItems = [URLQueryItem(name: "grant_type", value: "refresh_token")]
        var req = URLRequest(url: comps.url!)
        req.httpMethod = "POST"
        req.setValue(anonKey, forHTTPHeaderField: "apikey")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(["refresh_token": legacy.refresh_token])
        let (data, response) = try await URLSession.shared.data(for: req)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw URLError(.userAuthenticationRequired)   // يُطلب تسجيل الدخول من جديد بلطف
        }
        try auth.setValue(String(decoding: data, as: UTF8.self), forKey: "sb-\(projectRef)-auth-token")
    }
}
```

> ملاحظة: `redactAuthTokens()` يحذف الجلسة من اللقطة، فيجب استدعاء `legacySession` بقيم localStorage **قبل** التنقيح (داخل `buildSnapshot`) وتمريرها للجسر في الذاكرة فقط.

### 5.7 المحوّل (أمثلة)

```swift
import Foundation

/// كل نطاق يُستورد مرة واحدة ويُعلَّم؛ الفشل لا يمنع غيره ويُعاد في التشغيل التالي.
@MainActor
struct LegacyImporter {
    let snapshot: LegacySnapshot

    func importPending() {
        run("prayer", importPrayerSettings)     // أولًا: قبل أي جدولة أذان
        run("mushaf.position", importMushafPosition)
        run("mushaf.bookmarks", importBookmarks)
        // run("hifz", …), run("tasbih", …), run("favorites", …) — حين تُبنى الشاشات
    }

    private func run(_ domain: String, _ work: () throws -> Void) {
        let flag = "legacy.import.\(domain).v1"
        guard !UserDefaults.standard.bool(forKey: flag) else { return }
        do { try work(); UserDefaults.standard.set(true, forKey: flag) } catch { /* يعاد لاحقًا */ }
    }

    // MARK: الصلاة — src/lib/prayer-calc-prefs.ts و prayer-location-prefs.ts

    struct LegacyPrayerLocation: Decodable {
        let source: String          // gps | city | kuwait
        let label: String
        let lat: Double
        let lon: Double
        let timeZone: String
        let countryCode: String?
        let kuwaitGovId: String?
    }
    struct LegacyAdjustments: Decodable {
        let fajr, sunrise, dhuhr, asr, maghrib, isha: Int
    }

    private func importPrayerSettings() throws {
        let store = PrayerSettingsStore.shared               // افتراضي: نوع SunnahPrayer الفعلي
        guard !store.hasUserValues else { return }           // لا نكتب فوق اختيار أصلي
        if let loc = snapshot.decode(LegacyPrayerLocation.self, "majalis-prayer-location-v1") {
            store.location = .init(label: loc.label, latitude: loc.lat, longitude: loc.lon,
                                   timeZone: TimeZone(identifier: loc.timeZone) ?? .current)
        }
        if let method = snapshot.value("majalis-prayer-calc-method-v1") { store.methodID = method } // "Kuwait"…
        if let madhab = snapshot.value("majalis-prayer-madhab-v1") { store.madhabID = madhab }
        if let high = snapshot.value("majalis-prayer-highlat-v1") { store.highLatitudeRuleID = high }
        if let adj = snapshot.decode(LegacyAdjustments.self, "majalis-prayer-adjustments-v1") {
            store.minuteAdjustments = ["fajr": adj.fajr, "sunrise": adj.sunrise, "dhuhr": adj.dhuhr,
                                       "asr": adj.asr, "maghrib": adj.maghrib, "isha": adj.isha]
        }
        // المحرك يُستهلك كما هو؛ نمرّر له المدخلات فقط (قاعدة protected-content).
    }

    // MARK: المصحف — src/lib/quran-last-page.ts و quran-my-bookmarks.ts

    private func importMushafPosition() throws {
        // نفس سياسة hydrateNativeStorage: مفاتيح المصحف تفضّل Preferences عند التعارض.
        guard let raw = snapshot.value("lastPage", preferPreferences: true),
              let page = Int(raw), (1...604).contains(page) else { return }
        MushafStore.shared.setLastPageIfUnset(page)
    }

    struct LegacyBookmark: Decodable {
        let id: Int
        let ayahKey: String          // "2:255"
        let page: Int
        let label: String
        let date: String
        let kind: String
        let note: String?
        let customColor: String?
        let customName: String?
        let archived: Bool?
        let favorite: Bool?
        let createdAt: String?
        let updatedAt: String?
    }

    private func importBookmarks() throws {
        guard let items = snapshot.decode([LegacyBookmark].self, "myBookmarks", preferPreferences: true) else { return }
        let valid = items.filter { (1...604).contains($0.page) }
        MushafStore.shared.mergeLegacyBookmarks(valid)       // دمج بالـayahKey+kind، لا استبدال
    }
}
```

---

## 6) مخاطر وقرارات مطلوبة

| البند | التوصية |
|---|---|
| استيراد WebKit في تطبيق «بلا ويب» | مقبول كخطوة ترحيل مخفية لمرة واحدة بلا أي واجهة ويب؛ يُحذف بعد إصدارين. البديل (SQLite) لا يقرأ IndexedDB |
| إعدادات الصلاة | تُرحَّل قبل أول جدولة؛ إن تعذّر، نعرض للمستخدم شاشة تأكيد الموقع والطريقة بدل الافتراضي الصامت |
| الزوار | لا سحابة لهم؛ الترحيل المحلي هو الطريق الوحيد |
| مزامنة سحابية للتفضيلات والختمة والحفظ | خارج نطاق هذا التقرير؛ الترحيل المحلي لا يعتمد عليها |
| اختبار على أجهزة حقيقية | المرحلة 0 شرط قبل أي إصدار؛ مسارات iOS 17+ وترميز القيم استنتاج غير مُتحقَّق منه |
| رفع TestFlight | يحتاج إذن المالك حسب قواعد المستودع |
