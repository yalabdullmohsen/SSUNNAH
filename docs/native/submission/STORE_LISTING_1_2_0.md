# نص صفحة المتجر — الإصدار 1.2.0 (عربي + إنجليزي)

> مُسوَّدة للمراجعة، لا تحلّ محل `docs/native/store/APPSTORE_METADATA.md` ولا `WHATS_NEW.md` (لم يُعدَّلا). رقم البناء: انظر `docs/native/release-state.json` (لا يُكتب هنا).
> الأعداد أدناه محسوبة بأمر فعلي (Python `len()` على النص نفسه) لا تقديرًا. كل ادعاء ميزة مربوط بدليل في جدول الأدلة.

## 1) ما ينقص أو يحتاج تحسينًا في النصوص الحالية

| # | الملاحظة | الإجراء |
|---|---|---|
| 1 | `APPSTORE_METADATA.md` يذكر رقم بناء قديمًا (100) بينما المشروع عند 105 وآخر رفع 104 (`release-state.json`) | استبدال الرقم بإحالة إلى `release-state.json` |
| 2 | ادعاء «المحتوى منقول كما هو من الموقع» و«أذكار مضمّنة» غير مُتحقَّق (بند 9 في `WHATS_NEW_VERIFICATION.md`)، و`ios-native/README.md` يذكر أن الأذكار فارغة حتى تُوثَّق في Supabase | حُذف الادعاءان من النص المقترح |
| 3 | ادعاءات «بلا إنترنت» جزئية: التلاوة تُبثّ ما لم تُنزَّل السورة | النص المقترح يحصر «دون اتصال» في السور المنزَّلة فقط |
| 4 | النصوص الحالية تُغفل ميزات موجودة في الكود: بحث المصحف، العلامات، التفسير، تنزيل التلاوة، الويدجت، المسبحة، المظهر، أيقونات التطبيق، تصدير الحساب وحذفه | أُضيفت مع الدليل |
| 5 | البنود 1–9 وA–F في `WHATS_NEW_VERIFICATION.md` ما زالت غير مُتحقَّقة بجهاز | لم أدّعِ نجاحها؛ انظر القسم 5 |

## 2) ما لا نقوله (من `WHATS_NEW.md`، ملتزم به)
لا «كل الميزات بلا إنترنت»، لا تسميع بالذكاء الاصطناعي، لا «أذان» (لا ملفات صوت مضمّنة في الهدف؛ التنبيهات بصوت النظام الافتراضي)، لا أعداد محتوى غير مُتحقَّقة، لا Live Activity (الهدف موجود في المصدر لكن لم أجد `NSSupportsLiveActivities` فلا أدّعيه).

## 3) النصوص

### العربية

**الاسم الفرعي (≤30):** `مصحف وأذكار وأحاديث ومواقيت` — 27 حرفًا

**النص الترويجي (≤170):** 144 حرفًا
```
المصحف بصفحاته الـ604 مع البحث والعلامات والتفسير، ومواقيت الصلاة والقبلة، والمسبحة وحاسبة المواريث، وويدجت للشاشة الرئيسية. تطبيق عربي بالكامل.
```

**الكلمات المفتاحية (≤100):** 88 حرفًا
```
قرآن,مصحف,أذكار,حديث,فقه,سيرة,صلاة,مواقيت,قبلة,تفسير,دعاء,مواريث,فرائض,مسبحة,تلاوة,ويدجت
```

**الوصف (≤4000):** 1085 حرفًا
```
سُنّة تطبيق عربي للمسلم يجمع القرآن والأذكار والحديث والفقه والسيرة ومواقيت الصلاة في مكان واحد، بتصميم هادئ يدعم الوضع الفاتح والداكن والكتابة من اليمين إلى اليسار.

المصحف
• المصحف بصفحاته الـ604 بتقليب سلس.
• بحث في الآيات، وعلامات مرجعية تعود إليها لاحقًا.
• تفسير للآيات مع بيان مصدره.
• تنزيل سور من التلاوة للاستماع إليها دون اتصال (السور غير المنزَّلة تُبثّ عبر الإنترنت).

الصلاة والقبلة
• مواقيت الصلاة بحسب موقعك.
• اتجاه القبلة.
• تذكيرات الصلاة (إشعارات محلية بصوت النظام)؛ لا يتضمن التطبيق صوت أذان.

الأذكار والتسبيح
• أذكار وأدعية مع مسبحة للعدّ.
• ويدجت للشاشة الرئيسية: مواقيت الصلاة، آية، وذكر يناسب الوقت.

الفقه والعلم
• حاسبة المواريث (الفرائض).
• أحاديث وسيرة وفقه ومكتبة وبحث ضمن أقسام منظّمة.

الحساب والخصوصية
• تصفّح التطبيق متاح دون حساب.
• يمكنك تصدير بيانات حسابك، وحذف حسابك من داخل التطبيق.
• بيانات الجلسة محفوظة في سلسلة المفاتيح (Keychain) بالجهاز.

التخصيص
• وضع فاتح وداكن، وأيقونات بديلة للتطبيق.

ملاحظات
• بعض الميزات تحتاج اتصالًا بالإنترنت، ومنها البثّ وتزامن الحساب.
• الأوقات والاتجاه تعتمد على دقة الموقع وإعدادات جهازك؛ تحقق من الجهات المحلية عند الحاجة.
• المحتوى الشرعي معروض بمصادره، والمحتوى التحريري منه موسوم بذلك داخل التطبيق.
```

**ما الجديد في 1.2.0:** 240 حرفًا
```
• المصحف: بحث وعلامات مرجعية وتفسير.
• تنزيل سور من التلاوة للاستماع دون اتصال.
• ويدجت للشاشة الرئيسية: المواقيت وآية وذكر.
• المسبحة وحاسبة المواريث.
• تصدير بيانات الحساب وحذفه من داخل التطبيق.
• أيقونات بديلة للتطبيق وتحسينات في المظهر.
```

### English

**Subtitle (≤30):** `Quran, Adhkar, Hadith, Prayer` — 29 chars

**Promotional text (≤170):** 161 chars
```
The 604-page Mushaf with search, bookmarks and tafsir, prayer times and qibla, a tasbih counter, an inheritance calculator and home screen widgets. Fully Arabic.
```

**Keywords (≤100):** 100 chars
```
quran,mushaf,adhkar,hadith,fiqh,seerah,prayer times,qibla,islam,dua,tasbih,inheritance,tafsir,widget
```

**Description (≤4000):** 1334 chars
```
Sunnah is an Arabic app for Muslims that brings the Quran, adhkar, hadith, fiqh, seerah and prayer times together in one calm, right-to-left design with light and dark appearance.

Mushaf
- The 604-page Mushaf with smooth page turning.
- Search verses and keep bookmarks to return to.
- Tafsir for verses, with its source shown.
- Download surahs of recitation to listen without a connection (surahs you have not downloaded stream online).

Prayer and qibla
- Prayer times for your location.
- Qibla direction.
- Prayer reminders use a spoken phrase; the app does not include an adhan recording.

Adhkar and tasbih
- Adhkar and supplications, with a counter for tasbih.
- Home screen widgets: prayer times, a verse, and a time-appropriate dhikr.

Fiqh and learning
- An inheritance (fara'id) calculator.
- Hadith, seerah, fiqh, a library and search in organized sections.

Account and privacy
- You can browse the app without an account.
- Export your account data and delete your account from within the app.
- Your session is stored in the device Keychain.

Personalization
- Light and dark appearance, and alternate app icons.

Notes
- Some features need an internet connection, including streaming and account sync.
- Times and direction depend on location accuracy and your device settings; consult local authorities when needed.
- Religious content is shown with its sources, and editorial content is labelled as such in the app.
```

**What's New in 1.2.0:** 301 chars
```
- Mushaf: search, bookmarks and tafsir.
- Download recitation surahs to listen offline.
- Home screen widgets: prayer times, a verse, a dhikr.
- Tasbih counter and inheritance calculator.
- Export your account data and delete your account in the app.
- Alternate app icons and appearance improvements.
```

## 4) جدول الأدلة (مسار نسبي إلى `artifacts/majalis/ios/App`)

| الادعاء | الدليل |
|---|---|
| مصحف 604 صفحة وتقليب | `SunnahNative/Sources/SunnahNative/Mushaf/MushafPager.swift:56` (هندسة التقليب على 604 صفحة)؛ `Special/DailyWirdScreen.swift:5` |
| بحث الآيات | `Sections/quran/QuranSearchScreen.swift:4` |
| علامات مرجعية | `Sections/quran/QuranLocalScreens+Native.swift:212` |
| التفسير مع المصدر | `Sections/quran/TafsirScreens+Native.swift:4` و`:62` (TafsirAttributionView) |
| تنزيل التلاوة | `Platform/PlatformPorts.swift:33` (downloadedSurahs) — واجهة المنفذ فقط؛ التنفيذ الفعلي غير مُتحقَّق (القسم 5) |
| مواقيت الصلاة | `Special/PrayerScreen.swift:5` |
| القبلة | `Sections/account/AccountQiblaScreen.swift:124` |
| تذكيرات الصلاة | `Sections/account/AccountNotificationSettingsScreen.swift:55` (طلب إذن UNUserNotificationCenter)؛ لا صوت مخصص: `SunnahPrayer/.../NotificationSoundPack.swift:22-27` يرجع إلى `.default` عند غياب .caf، و`ios-native/Sounds/README.txt` (لا ملفات صوت قبل موافقة المالك)، و0 مرجع `.caf` في `ios-native/SunnahApp.xcodeproj/project.pbxproj` |
| الويدجت | `PrayerWidget/PrayerTimesWidget.swift:5`، `PrayerWidget/SunnahContentExperienceCatalog.swift:162` (آية)، `PrayerWidget/SunnahAdhkarWidgetCatalog.swift:5` (ذكر حسب الوقت) |
| المسبحة | `Special/AdhkarExtraScreens.swift:4` |
| حاسبة المواريث | `Sections/fiqh/Mawarith/MawarithCalculatorScreen.swift:40` |
| أيقونات بديلة | `Special/AppIconPickerView.swift:42` |
| تصدير الحساب | `Sections/account/AccountNetwork.swift:167` (RPC export_my_account) |
| حذف الحساب | `Platform/AccountDeletion.swift:12` (RPC delete_my_account) |
| وضع فاتح/داكن وRTL | `Design/Sunnah.swift:132`؛ بقية المظهر والـRTL في `docs/native/FEATURE_PARITY.md` (قسم الحساب والإعدادات، سطر 33) |
| تصفح بلا حساب، Keychain | غير مؤكَّدين بسطر محدد في هذه الجولة (grep لـKeychain بنمط SecItemAdd لم يُرجع نتيجة) — انظر القسم 5 |

حالة الإنتاج: دالة `delete_my_account` مطبَّقة وتعريفها مقروء، واختبارا الحذف والتصدير نجحا من جهاز المالك — هذا **إفادة المالك** وليست مُتحقَّقة مني، وأدلتها: `Platform/AccountDeletion.swift:12` و`Sections/account/AccountNetwork.swift:167`.

## 5) غير مُتحقَّق / للمراجعة قبل الرفع
- «تصفح بلا حساب» و«الجلسة في Keychain»: لم أثبتهما بسطر؛ احذفهما من الوصف إن لم يؤكدهما المراجع (بند 8 في `WHATS_NEW_VERIFICATION.md`).
- «تنزيل السور للاستماع دون اتصال»: وجدت واجهة المنفذ فقط؛ تأكد من التنفيذ على جهاز قبل الإبقاء عليه.
- «تذكيرات بعبارة صوتية»: **حُذف** من الوصف — لا دليل للهدف المرفوع (انظر الصف أعلاه).
- الوضع الداكن وRTL، وأيقونات التطبيق، والويدجت: وجودها في الكود فقط، لا اختبار على جهاز.
- لم أختبر شيئًا على جهاز أو محاكٍ؛ لا STORE_GO ولا UNIFIED_100.
- طول الحقول محسوب بأمر؛ حدود المتجر قد تُحتسب مختلفًا للأحرف المركّبة (أتحقق في ASC عند اللصق).

## 6) تصحيحات النصوص (طلب يوسف، ن5)

- **الاسم:** «سُنّة» (Sunnah) في الاسم الفرعي والوصف وما الجديد، مطابق لـ`CFBundleDisplayName`. لا يوجد في المستودع نص TestFlight؛ وصفه يُكتب في App Store Connect فقط، وفيه: «سُنّة — نسخة تجريبية». ممنوع «تطبيق المجلس العلمي».
- **الإطلاق في الوصف:** لا «الموثوق» ولا «الموثّق» (Guideline 2.3). الصياغة المعتمدة: «محتوى شرعي بمصادره، والتحريري منه موسوم».
- **وسم «هذه نسخة تجريبية»:** TestFlight فقط (Beta App Description/What to Test)، ولا يدخل وصف المتجر ولا ما الجديد.
- **سطر الساعة:** غير مضاف؛ ينتظر تأكيد ن4 جاهزيتها. عند التأكيد يُضاف تحت «الأذكار والتسبيح»، ويُراجَع ما يقابله في الإنجليزية.
