# طلب ن1 — 60 ملف Data مفقودًا (بمساره كما يتوقعه الكود)

المصدر: `node scripts/native-data-check.mjs` بعد تصدير كامل (2026-10-12). المسار مرجعيّ من `ios-native/` (يصدَّر عبر `scripts/native-export-data.sh`)؛ ملفات `Generated/*Screens.swift` تقرأ `ContentSource.bundled(name:)` من مجلد القسم. **ممنوع تخمين المحتوى**: كل ملف من مصدر الويب الموثَّق أو يُترك مفقودًا ويُكتب سببه هنا.

بعد كل دفعة: أعد `bash scripts/native-quick-check.sh <قسم>` وأبلغ الفرق في (مفقود/فارغ/مؤشَّر).

| # | الملف المتوقع | المرجع في الكود |
|---|---|---|
| 1 | `Data/audio/surah-reciters.json` | Audio/OfflineRecitation.swift |
| 2 | `Data/aqidah/discover-islam.json` | Generated/AqidahScreens.swift |
| 4 | `Data/fiqh/arkan.json` | Generated/FiqhScreens.swift |
| 5 | `Data/fiqh/arkan-iman.json` | Generated/FiqhScreens.swift |
| 6 | `Data/fiqh/fadail-aamal.json` | Generated/FiqhScreens.swift |
| 7 | `Data/fiqh/family.json` | Generated/FiqhScreens.swift |
| 8 | `Data/fiqh/fiqh.json` | Generated/FiqhScreens.swift |
| 9 | `Data/fiqh/fiqh-qawaid.json` | Generated/FiqhScreens.swift |
| 10 | `Data/fiqh/fiqh-usul.json` | Generated/FiqhScreens.swift |
| 11 | `Data/fiqh/hajj.json` | Generated/FiqhScreens.swift |
| 12 | `Data/fiqh/janaza.json` | Generated/FiqhScreens.swift |
| 13 | `Data/fiqh/mawarith.json` | Generated/FiqhScreens.swift |
| 14 | `Data/fiqh/mawarith-calculator.json` | Generated/FiqhScreens.swift |
| 15 | `Data/fiqh/prayer-times.json` | Generated/FiqhScreens.swift |
| 16 | `Data/fiqh/salah-guide.json` | Generated/FiqhScreens.swift |
| 17 | `Data/fiqh/sawm.json` | Generated/FiqhScreens.swift |
| 18 | `Data/fiqh/sujood-sahw.json` | Generated/FiqhScreens.swift |
| 19 | `Data/fiqh/tahara.json` | Generated/FiqhScreens.swift |
| 20 | `Data/fiqh/tawba.json` | Generated/FiqhScreens.swift |
| 21 | `Data/fiqh/worship.json` | Generated/FiqhScreens.swift |
| 22 | `Data/fiqh/zakat.json` | Generated/FiqhScreens.swift |
| 23 | `Data/fiqh/fiqh-books.json` | Generated/FiqhScreens.swift |
| 24 | `Data/fiqh/fiqh-topics.json` | Generated/FiqhScreens.swift |
| 25 | `Data/library/academic-research.json` | Generated/LibraryScreens.swift |
| 26 | `Data/library/academic-research-assistant.json` | Generated/LibraryScreens.swift |
| 27 | `Data/library/academic-research-submit.json` | Generated/LibraryScreens.swift |
| 28 | `Data/library/arabic-language.json` | Generated/LibraryScreens.swift |
| 29 | `Data/library/cards.json` | Generated/LibraryScreens.swift |
| 30 | `Data/library/islamic-directory.json` | Generated/LibraryScreens.swift |
| 31 | `Data/library/islamic-glossary.json` | Generated/LibraryScreens.swift |
| 32 | `Data/library/mawsuaat.json` | Generated/LibraryScreens.swift |
| 33 | `Data/library/methodology.json` | Generated/LibraryScreens.swift |
| 34 | `Data/library/mind-map.json` | Generated/LibraryScreens.swift |
| 35 | `Data/library/more.json` | Generated/LibraryScreens.swift |
| 36 | `Data/library/search.json` | Generated/LibraryScreens.swift |
| 37 | `Data/library/sections.json` | Generated/LibraryScreens.swift |
| 38 | `Data/library/sitemap.json` | Generated/LibraryScreens.swift |
| 39 | `Data/library/sources.json` | Generated/LibraryScreens.swift |
| 40 | `Data/library/terms.json` | Generated/LibraryScreens.swift |
| 41 | `Data/library/scientific-announcements.json` | Generated/LibraryScreens.swift |
| 42 | `Data/sirah/islamic-landmarks-map.json` | Generated/SirahScreens.swift |
| 43 | `Data/sirah/occasions.json` | Generated/SirahScreens.swift |
| 44 | `Data/sirah/occasions-lessons.json` | Generated/SirahScreens.swift |
| 45 | `Data/sirah/prophets.json` | Generated/SirahScreens.swift |
| 46 | `Data/sirah/prophets-tree.json` | Generated/SirahScreens.swift |
| 47 | `Data/sirah/seerah.json` | Generated/SirahScreens.swift |
| 48 | `Data/sirah/shamael.json` | Generated/SirahScreens.swift |
| 49 | `Data/sirah/tarikh-islami.json` | Generated/SirahScreens.swift |
| 50 | `Data/sirah/teachers.json` | Generated/SirahScreens.swift |
| 51 | `Data/lessons/chunk-000.json` | Sections/learn/LearnSupport.swift |
| 52 | `Data/learn/universities.json` | Sections/learn/LearnSupport.swift |
| 53 | `Data/learn/institutions.json` | Sections/learn/LearnSupport.swift |
| 54 | `Data/learn/competitions.json` | Sections/learn/LearnSupport.swift |
| 55 | `Data/learn/kuwait-sheikhs.json` | Sections/learn/LearnSupport.swift |
| 56 | `Data/learn/durus-imaniyya.json` | Sections/learn/LearnSupport.swift |
| 57 | `Data/learn/durus-mutanawwia.json` | Sections/learn/LearnSupport.swift |
| 58 | `Data/graph/links.json` | Sections/learn/LearnSupport.swift |
| 59 | `Data/learn/fawaid.json` | Sections/learn/LearnSupport.swift |
| 60 | `Data/learn/annual-courses.json` | Sections/learn/LearnSupport.swift |

## قيم عيّنة لمسارات :param (تُضاف إلى خريطة اللقطات)

| المسار | القيمة | المصدر |
|---|---|---|
| `/discover-islam/articles/:slug` | `what-is-islam` | aqidah/discover-islam-articles.json |
| `/discover-islam/doubts/:slug` | `too-many-rules` | aqidah/discover-islam-doubts.json |
| `/discover-islam/questions/:slug` | `why-believe-in-god` | aqidah/discover-islam-questions.json |
| `/tawhid/:slug` | `tawhid-issues` | aqidah/tawhid.json |
| `/madhahib/:id` | `hanafi` | fiqh/madhahib.json |
| `/sins-and-rights/:slug` | `tark-salah` | fiqh/sins-and-rights.json |
| `/fiqh/books/:bookId` | `taharah` | fiqh/books.json |
| `/islamic-sects/:id`, `/nations/:slug`, `/islamic-landmarks/:id`, `/tarikh-islami/:id`, `/teachers/:slug`, `/fiqh/books/:bookId/{lessons,chapters}/…`, `/discover-islam/new-muslim/:day` | أول عنصر في الملف بعد تصديره (`islamic-sects.json` الحالي فارغ) | ن1 يذكر القيمة هنا بعد التصدير |

## مسارات محمية — needs-owner (لا تُلمس)

- `/prayer-times` (ملف `prayer-times`): حساب مواقيت الصلاة محمي في `.claude/rules/protected-content.md`؛ لا يُصدَّر/يُعدَّل إلا بقرار المالك.
- `/mushaf*`، نص القرآن وصفحاته وخطوطه: كذلك.

## قرارات DUP (فحص بصري 2026-10-12)
- `/seerah`, `/shamael`: شاشة «لا يوجد محتوى بعد» (ملفا البيانات مفقودان أعلاه) ← ليست محتوى مشتركًا؛ تُصنَّف الآن ERROR:لا يوجد محتوى ← ن1.
