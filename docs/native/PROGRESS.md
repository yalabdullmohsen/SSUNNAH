# تقدم التطبيق الأصلي (SunnahApp) — يُحدَّث مع كل دفعة (ن4)

## حارس «بلا ويب» (2026-10-12)
`scripts/native-webview-guard.sh` يُشغَّل أول `native-quick-check.sh` ويفشل إن ظهر في `ios-native/*.swift` (خارج التعليقات): WKWebView أو SFSafariViewController أو WebView أو Capacitor أو فتح رابط الموقع (ssunnah.com/majlisilm.com) لعرض صفحة. النتيجة الحالية: ✓ نظيف (الإشارات الوحيدة تعليقات «بلا WebView/Capacitor»)؛ جُرّب سلبيًا بملف WKWebView فرُفض.

## فحص WKWebView / Capacitor / WebView (2026-10-12)
- **هدف SunnahApp الأصلي نظيف:** `ios-native/` و`SunnahNative/` بلا أي استخدام فعلي لـWKWebView أو Capacitor أو WebView (تعليقات «بلا WebView/Capacitor» فقط في SunnahApp.swift وPlatform/*). الهدف لا يربط حزمة SunnahWeb.
- **متبقٍّ للإزالة النهائية:** `artifacts/majalis/ios/App/SunnahWeb` (WebScreen.swift = WKWebView فعلي، لا يربطه SunnahApp)، `artifacts/majalis/capacitor.config.ts` (`server.url`=https://www.ssunnah.com)، مجلد `ios/App/App` + `CapApp-SPM`، وإشارات Capacitor في 89 ملفًا من `src/` و10 من `scripts/` وبوابات `verify-ci`/`release-verify`.
- الحارس النهائي (فشل عند WKWebView أو `server.url` في هدف SunnahApp) ينتظر مرحلة الإزالة؛ لم يُنفَّذ بعد.


| الدفعة | التاريخ | الإنجاز من الجرد | PRs مدموجة | PRs مرفوضة | أخطاء بناء |
|---|---|---|---|---|---|
| 1 | 2026-10-11 | 0/212 (0.0%) | #2926، #2927 | #2928 (ملفات مشتركة/Capacitor) | 3 جولات (أعضاء الهدف المفقودة في المولّد) — أُصلحت في `generate-xcodeproj.rb` |

## الدفعة 1
- بناء SunnahApp على iPhone 17 Pro: ✅؛ `swift test` للحزمة: ✅ بلا فشل.
- الإصلاح: المولّد لم يضف `SunnahApp/Platform/*.swift` ولا ملفات Shared/KeychainStore المذكورة في APP_TARGET_NEEDS.
- لا بند من الجرد يُؤشَّر `[x]`: الرئيسية تعرض هيكل التبويبات فقط (المحتوى `/` مؤقت) ولم تُفحص شاشة قسم بعد.
- لقطتا فاتح/داكن متطابقتان بالحجم؛ يلزم التحقق من تبديل المظهر داخل التطبيق قبل اعتماد أي شاشة.

## المتبقي
212 بندًا؛ بانتظار PRs أقسام `native-section/*` من الجلسات السحابية.
| auto-20261011-1626 | 2026-10-11 | الإنجاز: 76/212 = 35.8% | #2941,2936,2933,2931,2926 | — | 1 |
| auto-20261011-1639 | 2026-10-11 | الإنجاز: 76/212 = 35.8% | #2945 | — | 0 |

## الأرقام الرسمية للإصدار 1.2.0 (بناء 100) — 2026-10-13 (ن4، RC)
- مدموج ومبني: **212/212 (100%)** · مُتحقَّق بلقطة: **212/212 (100%)** — من `native-release-check.sh --release` (نجح كاملًا؛ بناء Release موقَّع شكليًا ويُشغَّل على n4-sim).
- لقطات المتجر: `docs/native/store/screenshots/{6.9,6.5}-ar-light` (6 لكل مقاس). `native_release` dry-run نجح.

## تصحيح 2026-10-11 (ن4) — رقمان منفصلان
- مدموج ومبني: **116/212**
- مُتحقَّق بلقطة فاتح/داكن (بصمة مختلفة + OCR بلا خطأ/placeholder/قيد التوثيق، شريط الحالة ثابت 9:41): **43/212**
- الرقم السابق 76 كان بنجاح البناء فقط (الجذر: SunnahApp لم يسجّل الأقسام ولا يحلّ المسارات → كل مسار يعرض النص الخام؛ أُصلح).
- السبب الرئيسي لتعذّر التحقق: بيانات الأقسام لا تُجمَّع في التطبيق (`Data/aqidah|fiqh|sirah|library|learn` غير مصدَّرة → «تعذّر تحميل المحتوى»)، والباقي «المحتوى قيد التوثيق».

## مسارات قيد الإعداد / غير صالحة (آخر تشغيل، بلا تأشير) — 169 مسارًا
- **account** · DUP_SCREEN (1): `/contact`
- **account** · EMPTY (1): `/updates/auto/:slug`
- **account** · ERROR:تعذّر (2): `/calendar`، `/updates`
- **account** · PLACEHOLDER (2): `/auth/callback`، `/auth/update-password`
- **aqidah** · DUP_SCREEN (6): `/discover-islam/articles/:slug`، `/discover-islam/doubts/:slug`، `/discover-islam/new-muslim/:day`، `/discover-islam/questions/:slug`، `/islamic-sects/:id`، `/tawhid/:slug`
- **aqidah** · EMPTY (2): `/discover-islam/how-to-convert`، `/discover-islam/new-muslim`
- **aqidah** · ERROR:تعذّر (16): `/adab-talab-ilm`، `/akhlaq`، `/alamat-saah`، `/amrad-qalbiyya`، `/asma-husna`، `/discover-islam`، `/hikam-salaf`، `/iman-topics`، `/islamic-sects`، `/janna-naar`، `/malaika`، `/raqaiq`، `/tawhid`، `/tazkiya`، `/tazkiya-topics`، `/usra-mujtama`
- **aqidah** · PLACEHOLDER (2): `/discover-islam/doubts`، `/discover-islam/questions`
- **fiqh** · DUP_SCREEN (22): `/amr-bil-maruf`، `/fiqh`، `/fiqh/books/:bookId`، `/fiqh/books/:bookId/chapters/:chapterId`، `/fiqh/books/:bookId/lessons/:lessonId`، `/fiqh/topics/:topicId`، `/fiqh/usul`، `/jumuah`، `/madhahib`، `/madhahib/:id`، `/maqasid-sharia`، `/nikah`، `/prayer-ranks`، `/prophetic-medicine`، `/riba`، `/ruqya`، `/sadaqa`، `/sins-and-rights`، `/sins-and-rights/:slug`، `/talaq`، `/udhiya`، `/waqf`
- **fiqh** · EMPTY (1): `/mawarith/calculator`
- **fiqh** · ERROR:تعذّر (16): `/arkan`، `/arkan-iman`، `/fadail-aamal`، `/family`، `/fiqh-qawaid`، `/hajj`، `/janaza`، `/mawarith`، `/prayer-times`، `/salah-guide`، `/sawm`، `/sujood-sahw`، `/tahara`، `/tawba`، `/worship`، `/zakat`
- **hadith** · DUP_SCREEN (4): `/dalail-nubuwwah`، `/hadith-science`، `/sunnah-studies`، `/wasaya-nabawiyya`
- **hadith** · EMPTY (3): `/arbaeen-nawawi`، `/hadith/books`، `/hadith/mawdu`
- **hadith** · PLACEHOLDER (5): `/arbaeen-nawawi/:id`، `/hadith/arbaeen-love-of-allah`، `/hadith/books-and-rulings`، `/hadith/daif`، `/hadith/sahih`
- **learn** · DUP_SCREEN (2): `/competitions/:id`، `/universities/:slug`
- **learn** · EMPTY (1): `/annual-courses/:id`
- **learn** · ERROR:تعذّر (11): `/competitions`، `/durus-imaniyya`، `/durus-mutanawwia`، `/institutions`، `/knowledge-graph`، `/kuwait-lessons`، `/lessons`، `/lessons/:id`، `/lessons/archive`، `/universities`، `/universities/compare`
- **learn** · PLACEHOLDER (1): `/knowledge/:section`
- **library** · DUP_SCREEN (14): `/academic-research/:id`، `/academic-research/assistant`، `/academic-research/submit`، `/arabic-language`، `/islamic-glossary`، `/mawsuaat`، `/methodology`، `/mind-map`، `/more`، `/scientific-announcements/:id`، `/search`، `/sitemap`، `/sources/:id`، `/terms`
- **library** · ERROR:تعذّر (1): `/sources`
- **quran** · EMPTY (4): `/hifz-path/p/:slug/u/:unitId`، `/mushaf/bookmarks`، `/mutashabihat`، `/tafsir`
- **quran** · ERROR:قيد التوثيق (2): `/quran-hub/terms`، `/quran/search`
- **quran** · PLACEHOLDER (31): `/c/:slug`، `/hifz-path`، `/hifz-path/c/:category`، `/hifz-path/my`، `/hifz-path/p/:slug`، `/memorization`، `/miracles`، `/mushaf`، `/quran-circles`، `/quran-engine`، `/quran-hub`، `/quran-hub/numbers`، `/quran-hub/qiraat`، `/quran-hub/seven-ahruf`، `/quran-hub/tajweed`، `/quran-hub/tajweed/:chapter`، `/quran-hub/tilawa`، `/quran-knowledge`، `/quran-memorization`، `/quran/hifz-loop`، `/quran/makki-madani`، `/quran/memorization-plans`، `/quran/offline-player`، `/quran/people`، `/quran/people/:slug`، `/quran/revelation-order`، `/quran/surah-stories`، `/quran/surah-stories/:number`، `/quran/surahs`، `/quran/worship-hub`، `/ulum-quran`
- **sections** · قيد التوثيق (3): `/fikr-waqia`، `/academic-research`، `/sections`
- **sirah** · DUP_SCREEN (12): `/islamic-landmarks`، `/islamic-landmarks/map`، `/nations`، `/nations/:slug`، `/occasions`، `/prophets`، `/sahabah`، `/seerah`، `/shamael`، `/stories`، `/tarikh-islami`، `/tarikh-islami/:id`
- **sirah** · EMPTY (1): `/islamic-landmarks/:id`
- **sirah** · ERROR:تعذّر (2): `/teachers`، `/teachers/:slug`
- **sirah** · PLACEHOLDER (1): `/prophets/tree`

## بوابة البيانات (ن4، 2026-10-11)
- `node scripts/native-data-check.mjs`: 106 مرجع `ContentSource.bundled`، **102 مفقود** (0 تالف) — الأقسام aqidah/fiqh/sirah/library/learn.
- سبب `Data/aqidah/malaika`: `export-ios-data.mjs` يصدّر 6 مجلدات فقط (adhkar/hadith/prayer/quiz/quran/tafsir)؛ لا مُصدِّر لـaqidah أصلًا (ليس رفضًا بسبب content-hold ولا اختلاف اسم). المطلوب: مُصدِّر لكل قسم (ن1) وفق `docs/native/requests/<section>.md`.
- أُضيفت البوابة إلى native-loop (تعليق على PR صاحب الملف المرجِع)، مع MUSHAF_DATA/MUSHAF_SRC وفشل الدورة عند تخطي MushafGateTests.

## دورة 2026-10-11 (ن4)
- الرقمان بعد إعادة اللقطات على native-app الحالي: مبني 116/212 · مُتحقَّق 43/212 (لم يتغيّر: ملفات البيانات الـ102 ما زالت مفقودة).
- أول archive Release محلي: .app = 197MB غير مضغوط، **IPA = 124MB** (<150MB، لا حاجة لضغط الخطوط).
- مصفوفة الأجهزة (6 شاشات: quran/prayer/adhkar/hadith/quiz/settings × SE3 وiPad A16 وAX3) في `~/ssunnah-board/snapshots/device-matrix/` (18 لقطة).
- الأذكار فارغة: `verified-adhkar.json = []` (انظر requests/n1-exporters.md).
| auto-20261011-2043 | 2026-10-11 | مدموج ومبني: 116/212 مُتحقَّق بلقطة: 43/212  | #2973 | — | 0 |
| full-20261011-2342 | 2026-10-11 | مدموج ومبني: 134/212 مُتحقَّق بلقطة: 84/212  | دورة كاملة | — | 0 |
| full-20261012-0120 | 2026-10-12 | مدموج ومبني: 140/212 مُتحقَّق بلقطة: 102/212  | دورة كاملة | الفرق: مبني 6 · مُتحقَّق 18 · مفقود 60 فارغ 2 | 0 |
| full-20261012-0144 | 2026-10-12 | مدموج ومبني: 144/212 مُتحقَّق بلقطة: 106/212  | دورة كاملة | الفرق: مبني 4 · مُتحقَّق 4 · مفقود 104 فارغ 0 | 0 |
| full-20261012-0237 | 2026-10-12 | مدموج ومبني: 149/212 مُتحقَّق بلقطة: 113/212  | دورة كاملة | الفرق: مبني 5 · مُتحقَّق 7 · مفقود 60 فارغ 2 | 0 |
| full-20261012-0458 | 2026-10-12 | مدموج ومبني: 149/212 مُتحقَّق بلقطة: 113/212  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 60 فارغ 2 | 0 |
| auto-20261012-0616 | 2026-10-12 | مدموج ومبني: 149/212 مُتحقَّق بلقطة: 113/212  | #2987 | — | 0 |
| full-20261012-0819 | 2026-10-12 | مدموج ومبني: 150/212 مُتحقَّق بلقطة: 114/212  | دورة كاملة | الفرق: مبني 1 · مُتحقَّق 1 · مفقود 60 فارغ 2 | 0 |
| full-20261012-1020 | 2026-10-12 | مدموج ومبني: 150/212 مُتحقَّق بلقطة: 114/212  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 60 فارغ 2 | 0 |
| full-20261012-1056 | 2026-10-12 | مدموج ومبني: 152/212 مُتحقَّق بلقطة: 117/212  | دورة كاملة | الفرق: مبني 2 · مُتحقَّق 3 · مفقود 60 فارغ 2 | 0 |
| full-20261012-1219 | 2026-10-12 | مدموج ومبني: 181/212 مُتحقَّق بلقطة: 148/212  | دورة كاملة | الفرق: مبني 29 · مُتحقَّق 31 · مفقود 41 فارغ 8 | 0 |
| full-20261012-1807 | 2026-10-12 | مدموج ومبني: 192/212 (90.6%) مُتحقَّق بلقطة: 165/212 (77.8%)  | دورة كاملة | الفرق: مبني 11 · مُتحقَّق 17 · مفقود 9 فارغ 10 | 0 |
| full-20261012-1825 | 2026-10-12 | مدموج ومبني: 198/212 (93.4%) مُتحقَّق بلقطة: 171/212 (80.7%)  | دورة كاملة | الفرق: مبني 6 · مُتحقَّق 6 · مفقود 9 فارغ 10 | 0 |

- **#3044 (2026-10-12)**: تصدير navigation بشكل LibraryNavigation → /more و/sections و/sitemap تمرّ لقطات فاتحة/داكنة؛ آخر قياس دورة: 198/212 (93.4%) مبني، 171/212 (80.7%) مُتحقَّق.
| n4-20261012-2255 | 2026-10-12 | مدموج ومبني: 203/212 (95.8%) مُتحقَّق بلقطة: 173/212 (81.6%) | بناء مقفول + n4-sim | لقطات: widget-center/adhan-settings/settings/القرآنية الثلاث سليمة؛ مرفوضة (عند ن2): /c/:slug أبيض، /arbaeen-nawawi/:id، /wasaya-nabawiyya، /daily-wird، /duas «قيد التوثيق»؛ خط أساس axe يحتاج مراجعة لاحقًا (color-contrast جديدة في /quran الداكنة: 105 عنصرًا)، شأن الموقع لا التطبيق | 0 |
| n4-20261013-0030 | 2026-10-13 | مدموج ومبني: 205/212 (96.7%) مُتحقَّق بلقطة: 175/212 (82.5%) | بناء مقفول + n4-sim (فاتح/داكن) | #3081: arbaeen-nawawi/:id وwasaya-nabawiyya وduas وdaily-wird وc/:slug سليمة؛ Widget target + توقيع سحابي ناجح + native_release dry-run (#3090) |
| n4-20261013-0640 | 2026-10-13 | مدموج ومبني: 205/212 (96.7%) مُتحقَّق بلقطة: 178/212 (84.0%) | بناء مقفول + n4-sim (فاتح/داكن) | /seerah و/shamael و/prophets/tree: generationsGap→Int، id أبواب الشمائل→Int، عرض المصدر؛ PrayerWidgetPublisher ينشر المواقيت إلى App Group؛ إصلاح counts.adhkar في المُصدِّر؛ native-gnu-guard |
| auto-20261013-0619 | 2026-10-13 | مدموج ومبني: 209/212 (98.6%) مُتحقَّق بلقطة: 182/212 (85.8%)  | #3098 | — | 0 |
| full-20261013-0658 | 2026-10-13 | مدموج ومبني: 209/212 (98.6%) مُتحقَّق بلقطة: 185/212 (87.3%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 3 · مفقود 0 فارغ 0 | 0 |
| full-20261013-1101 | 2026-10-13 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 3 · مُتحقَّق 27 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 88 دقيقة (آخر دمج 2026-10-13T10:17:53Z)

| full-20261013-1446 | 2026-10-13 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |
| full-20261013-1627 | 2026-10-13 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |
| full-20261013-1844 | 2026-10-13 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 123 دقيقة (آخر دمج 2026-10-13T15:28:55Z)

| full-20261013-2031 | 2026-10-13 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 117 دقيقة (آخر دمج 2026-10-13T17:42:33Z)

| full-20261013-2239 | 2026-10-13 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 185 دقيقة (آخر دمج 2026-10-13T22:35:30Z)

| full-20261014-0441 | 2026-10-14 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 279 دقيقة (آخر دمج 2026-10-13T22:35:30Z)

| full-20261014-0615 | 2026-10-14 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 373 دقيقة (آخر دمج 2026-10-13T22:35:30Z)

| full-20261014-0749 | 2026-10-14 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |

> تنبيه: لا حركة منذ 468 دقيقة (آخر دمج 2026-10-13T22:35:30Z)

| full-20261014-0923 | 2026-10-14 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | دورة كاملة | الفرق: مبني 0 · مُتحقَّق 0 · مفقود 0 فارغ 0 | 0 |
| auto-20261014-1752 | 2026-10-14 | مدموج ومبني: 212/212 (100.0%) مُتحقَّق بلقطة: 212/212 (100.0%)  | #3173,3172 | — | 0 |
