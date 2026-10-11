# طلب إلى ن1 — مُصدِّرات بيانات الأقسام الناقصة (من ن4، 2026-10-11)

**الأولوية الأولى للدورات القادمة** (قرار المالك). `node scripts/native-data-check.mjs` يعدّ 102 ملف bundled مفقودًا؛ الشاشات تعرض «تعذّر تحميل المحتوى».
- المطلوب: مُصدِّر لكل قسم (أو توسيع `artifacts/majalis/scripts/native/export-ios-data.mjs`) يكتب `ios-native/Data/<القسم>/<name>.json` (JSON صالح) وفق DATA_CONTRACT §5 (رفض الضعيف/المحجوز، لا اختراع محتوى).
- المسار الذي يتوقعه الكود: `Data/<القسم>/<name>.json` داخل الحزمة (القسم = المجلد الفرعي المذكور في المصدر؛ aqidah ← Data/aqidah، fiqh ← Data/fiqh؛ للبقية تحقق من `subdirectory:` في الملف المرجِع).
- البوابة: أي ملف مفقود يمس PR = فشل بناء (native-loop). بعد كل دفعة تُدمج: أعيد اللقطات والرقمين.
- الأقسام quran/adhkar/hadith/account: 0 مفقود (مُغطّاة بالمُصدِّر الحالي).

## audio — 1 ملفًا
- `Data/audio/surah-reciters.json` ← Audio/OfflineRecitation.swift

## aqidah — 22 ملفًا
- `Data/aqidah/adab-talab-ilm.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/akhlaq.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/alamat-saah.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/amrad-qalbiyya.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/asma-husna.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam-articles.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam-contact.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam-doubts.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam-how-to-convert.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam-new-muslim.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/discover-islam-questions.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/hikam-salaf.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/iman-topics.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/islamic-sects.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/janna-naar.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/malaika.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/raqaiq.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/tawhid.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/tazkiya.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/tazkiya-topics.json` ← Generated/AqidahScreens.swift
- `Data/aqidah/usra-mujtama.json` ← Generated/AqidahScreens.swift

## fiqh — 38 ملفًا
- `Data/fiqh/amr-bil-maruf.json` ← Generated/FiqhScreens.swift, Sections/fiqh/FiqhSection.swift
- `Data/fiqh/arkan.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/arkan-iman.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/book-aliases.json` ← Sections/fiqh/FiqhSection.swift
- `Data/fiqh/books.json` ← Sections/fiqh/FiqhSection.swift
- `Data/fiqh/fadail-aamal.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/family.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/fiqh.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/fiqh-books.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/fiqh-qawaid.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/fiqh-topics.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/fiqh-usul.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/hajj.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/janaza.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/jumuah.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/madhahib.json` ← Generated/FiqhScreens.swift, Sections/fiqh/FiqhSection.swift
- `Data/fiqh/maqasid-sharia.json` ← Generated/FiqhScreens.swift, Sections/fiqh/FiqhSection.swift
- `Data/fiqh/mawarith.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/mawarith-calculator.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/nikah.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/prayer-ranks.json` ← Generated/FiqhScreens.swift, Sections/fiqh/FiqhSection.swift
- `Data/fiqh/prayer-times.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/prophetic-medicine.json` ← Generated/FiqhScreens.swift, Sections/fiqh/FiqhSection.swift
- `Data/fiqh/riba.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/ruqya.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/sadaqa.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/salah-guide.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/sawm.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/sins-and-rights.json` ← Generated/FiqhScreens.swift, Sections/fiqh/FiqhSection.swift
- `Data/fiqh/sujood-sahw.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/tahara.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/talaq.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/tawba.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/udhiya.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/usul-topics.json` ← Sections/fiqh/FiqhSection.swift
- `Data/fiqh/waqf.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/worship.json` ← Generated/FiqhScreens.swift
- `Data/fiqh/zakat.json` ← Generated/FiqhScreens.swift

## library — 17 ملفًا
- `Data/library/academic-research.json` ← Generated/LibraryScreens.swift
- `Data/library/academic-research-assistant.json` ← Generated/LibraryScreens.swift
- `Data/library/academic-research-submit.json` ← Generated/LibraryScreens.swift
- `Data/library/arabic-language.json` ← Generated/LibraryScreens.swift
- `Data/library/cards.json` ← Generated/LibraryScreens.swift
- `Data/library/islamic-directory.json` ← Generated/LibraryScreens.swift
- `Data/library/islamic-glossary.json` ← Generated/LibraryScreens.swift
- `Data/library/mawsuaat.json` ← Generated/LibraryScreens.swift
- `Data/library/methodology.json` ← Generated/LibraryScreens.swift
- `Data/library/mind-map.json` ← Generated/LibraryScreens.swift
- `Data/library/more.json` ← Generated/LibraryScreens.swift
- `Data/library/scientific-announcements.json` ← Generated/LibraryScreens.swift
- `Data/library/search.json` ← Generated/LibraryScreens.swift
- `Data/library/sections.json` ← Generated/LibraryScreens.swift
- `Data/library/sitemap.json` ← Generated/LibraryScreens.swift
- `Data/library/sources.json` ← Generated/LibraryScreens.swift
- `Data/library/terms.json` ← Generated/LibraryScreens.swift

## sirah — 14 ملفًا
- `Data/sirah/fikr-waqia.json` ← Generated/SirahScreens.swift
- `Data/sirah/islamic-landmarks.json` ← Generated/SirahScreens.swift
- `Data/sirah/islamic-landmarks-map.json` ← Generated/SirahScreens.swift
- `Data/sirah/nations.json` ← Generated/SirahScreens.swift
- `Data/sirah/occasions.json` ← Generated/SirahScreens.swift
- `Data/sirah/occasions-lessons.json` ← Generated/SirahScreens.swift
- `Data/sirah/prophets.json` ← Generated/SirahScreens.swift
- `Data/sirah/prophets-tree.json` ← Generated/SirahScreens.swift
- `Data/sirah/sahabah.json` ← Generated/SirahScreens.swift
- `Data/sirah/seerah.json` ← Generated/SirahScreens.swift
- `Data/sirah/shamael.json` ← Generated/SirahScreens.swift
- `Data/sirah/stories.json` ← Generated/SirahScreens.swift
- `Data/sirah/tarikh-islami.json` ← Generated/SirahScreens.swift
- `Data/sirah/teachers.json` ← Generated/SirahScreens.swift

## learn — 10 ملفًا
- `Data/learn/links.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/annual-courses.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/competitions.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/durus-imaniyya.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/durus-mutanawwia.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/fawaid.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/institutions.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/kuwait-sheikhs.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/universities.json` ← Sections/learn/LearnSupport.swift
- `Data/learn/chunk-000.json` ← Sections/learn/LearnSupport.swift


## إسناد مجموعات «قيد الإعداد» (2026-10-11)
القائمة الكاملة بالمسارات في `docs/native/PROGRESS.md`. الإسناد حسب نوع السبب:
- **ERROR:تعذّر** (aqidah 33 · fiqh 19 · learn 22 · library 1 · account 2) ← **ن1**: مُصدِّرات الملفات الـ102 أعلاه؛ تزول بوصول الملف المطابق.
- **DUP_SCREEN** (fiqh 58 · quran 34 · library 28 · sirah 26 · aqidah 14 · learn 5 · hadith 4) ← **ن2**: قالب شاشة مستقل لكل مسار بدل لقطة مكررة (أو تسجيل صريح أنها نفس الشاشة فتُستثنى من العدّ).
- **PLACEHOLDER** (quran 31 · hadith 5) ← **ن3** (القرآن/الحديث): ربط الشاشة الحقيقية بالمسار.
- **EMPTY** (quran 4 · hadith 3 · aqidah 2 · fiqh 1 · learn 1 · account 1) ← **ن1** للبيانات، ثم **ن2** لحالة الفراغ إن بقيت.

## ملاحظة جديدة: الأذكار فارغة رغم عدم فقد ملف
`Data/adhkar/verified-adhkar.json` = `[]`؛ `export-ios-data.mjs` لا يملأه إلا بالوسيط `--adhkar-json <لقطة صفوف Supabase>` ولم يُمرَّر. المطلوب (ن1): تمرير اللقطة المعتمدة في الدورة أو تضمين ملف مصدر. لقطة الأذكار الحالية: «لا أذكار موثّقة بعد».
بوابة native-data-check يجب أن تفشل أيضًا على ملف bundled مصفوفته فارغة `[]` (تحسين لاحق).

## تنبيه إلى ن3
ن2 عدّل ملفين مشتركين: `RootTabView.swift` و`ScreenTemplate.swift` — أعد القاعدة (rebase على native-app) قبل أي تعديل عليهما.
