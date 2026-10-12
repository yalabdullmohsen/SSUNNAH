# تدقيق تطابق الموقع/التطبيق

مُولَّد بـ `node scripts/native-parity-audit.mjs --md docs/native/PARITY_AUDIT.md`. الفرق = التطبيق − الموقع.

| القسم | عدد الموقع | عدد التطبيق | الفرق | السبب |
|---|---:|---:|---:|---|
| القرآن (آيات) | 6236 | 6236 | 0 |  |
| التفسير: muyassar | 6231 | 6231 | 0 | آيات 5 بلا تفسير في المصدر نفسه (يعرضها الموقع بلا تفسير) |
| التفسير: saadi | 6177 | 6177 | 0 | آيات 59 بلا تفسير في المصدر نفسه (يعرضها الموقع بلا تفسير) |
| الحديث: bukhari | 7580 | 7580 | 0 | محجوز/نص فارغ إن وُجد الفرق |
| الحديث: muslim | 7360 | 7360 | 0 | محجوز/نص فارغ إن وُجد الفرق |
| الحديث: المصحّح (صحيح) | 1161 | 1160 | -1 | فرق مقصود: صحيح محجوز في content-hold (1)؛ الضعيف والموضوع خارج المقارنة أصلًا (قاعدة العقد) |
| الأذكار (معتمد) | 207 | 207 | 0 |  |
| الأسئلة (غير demo) | 3545 | 3451 | -94 | منها 583 بلا مرجع تُعرض كما يعرضها الموقع؛ الفرق = المحجوز في content-hold لا يُحذف |
| القصص | 479 | 479 | 0 |  |
| aqidah/adab-talab-ilm | 80 | 80 | 0 |  |
| aqidah/akhlaq | 67 | 67 | 0 |  |
| aqidah/alamat-saah | 48 | 48 | 0 |  |
| aqidah/amrad-qalbiyya | 8 | 8 | 0 |  |
| aqidah/hikam-salaf | 159 | 159 | 0 |  |
| aqidah/janna-naar | 98 | 98 | 0 |  |
| aqidah/malaika | 77 | 77 | 0 |  |
| aqidah/raqaiq | 111 | 111 | 0 |  |
| aqidah/iman-topics | 78 | 78 | 0 |  |
| aqidah/tazkiya-topics | 66 | 66 | 0 |  |
| aqidah/usra-mujtama | 72 | 72 | 0 |  |
| aqidah/discover-islam-how-to-convert | 5 | 5 | 0 |  |
| aqidah/asma-husna | 99 | 91 | -8 | unsourced: 8 |
| aqidah/tawhid | 6 | 6 | 0 |  |
| aqidah/islamic-sects | 35 | 0 | -35 | حالة NEEDS_SOURCE: 13؛ حالة NEEDS_HISTORICAL_REVIEW: 15؛ حالة NEEDS_SHARIA_REVIEW: 6؛ حالة CONFLICTING_SOURCES: 1 |
| aqidah/discover-islam-questions | 15 | 15 | 0 |  |
| aqidah/discover-islam-doubts | 12 | 1 | -11 | بلا دليل متحقَّق/مصدر: 11 |
| aqidah/discover-islam-articles | 13 | 13 | 0 |  |
| aqidah/discover-islam-new-muslim | 30 | 30 | 0 |  |
| aqidah/discover-islam | 5 | 5 | 0 |  |
| aqidah/discover-islam-contact | 0 | 0 | 0 | فارغ عمدًا: نموذج تواصل (شبكة/حساب): 1 |
| aqidah/tazkiya | 4 | 4 | 0 |  |
| audio/surah-reciters | 29 | 29 | 0 |  |
| fiqh/sujood-sahw | 8 | 8 | 0 |  |
| fiqh/arkan | 5 | 5 | 0 |  |
| fiqh/arkan-iman | 6 | 6 | 0 |  |
| fiqh/fadail-aamal | 108 | 108 | 0 |  |
| fiqh/tawba | 51 | 51 | 0 |  |
| fiqh/fiqh-qawaid | 58 | 58 | 0 |  |
| fiqh/fiqh-books | 19 | 19 | 0 |  |
| fiqh/fiqh-topics | 28 | 28 | 0 |  |
| fiqh/fiqh | 28 | 28 | 0 |  |
| fiqh/fiqh-usul | 9 | 9 | 0 |  |
| fiqh/tahara | 15 | 15 | 0 |  |
| fiqh/salah-guide | 32 | 32 | 0 |  |
| fiqh/zakat | 18 | 18 | 0 |  |
| fiqh/sawm | 10 | 10 | 0 |  |
| fiqh/hajj | 14 | 14 | 0 |  |
| fiqh/janaza | 8 | 8 | 0 |  |
| fiqh/mawarith | 24 | 24 | 0 | فارغ عمدًا: حاسبة محلية: 1 |
| fiqh/family | 32 | 32 | 0 |  |
| fiqh/worship | 0 | 0 | 0 | فارغ عمدًا: شاشة مواقيت/تفضيلات لا محتوى: 1 |
| fiqh/mawarith-calculator | 0 | 0 | 0 | فارغ عمدًا: حاسبة محلية: 1 |
| fiqh/prayer-times | 0 | 0 | 0 | فارغ عمدًا: حساب المواقيت محمي — لا يُصدَّر: 1 |
| fiqh/books | 19 | 19 | 0 |  |
| fiqh/books-lessons | 1147 | 1146 | -1 | محجوز: 1 |
| fiqh/book-aliases | 46 | 46 | 0 |  |
| fiqh/guides-cards | 68 | 68 | 0 |  |
| fiqh/madhahib | 4 | 4 | 0 |  |
| fiqh/maqasid-sharia | 7 | 7 | 0 |  |
| fiqh/prayer-ranks | 5 | 5 | 0 |  |
| fiqh/usul-topics | 9 | 9 | 0 |  |
| fiqh/prophetic-medicine | 362 | 362 | 0 |  |
| fiqh/sins-and-rights | 32 | 32 | 0 |  |
| fiqh/amr-bil-maruf | 20 | 20 | 0 |  |
| learn/lessons/chunk-000.json | 82 | 82 | 0 |  |
| learn/learn/universities.json | 37 | 37 | 0 |  |
| learn/learn/kuwait-sheikhs.json | 6 | 6 | 0 |  |
| learn/graph/links.json | 5 | 5 | 0 |  |
| learn/learn/institutions.json | 44 | 44 | 0 |  |
| learn/learn/durus-imaniyya.json | 205 | 205 | 0 |  |
| learn/learn/durus-mutanawwia.json | 372 | 372 | 0 |  |
| learn/sirah/fikr-waqia.json | 105 | 105 | 0 |  |
| learn/learn/fawaid.json | 1128 | 1128 | 0 |  |
| learn/learn/annual-courses.json | 63 | 63 | 0 |  |
| learn/learn/competitions.json | 0 | 0 | 0 | فارغ عمدًا: المنشور في الإنتاج 0 والعيّنة demo: 1 |
| library/academic-research | 383 | 383 | 0 | فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1؛ فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1 |
| library/arabic-language | 8 | 8 | 0 |  |
| library/mawsuaat | 4 | 4 | 0 |  |
| library/islamic-glossary | 240 | 220 | -20 | بلا مصدر: 20 |
| library/mind-maps | 23 | 23 | 0 |  |
| library/scientific-announcements | 48 | 48 | 0 |  |
| library/search-index | 4558 | 4558 | 0 |  |
| library/terms | 9 | 9 | 0 |  |
| library/methodology | 10 | 10 | 0 |  |
| library/navigation | 25 | 25 | 0 |  |
| library/cards | 6 | 6 | 0 |  |
| library/more | 5 | 5 | 0 |  |
| library/sections | 25 | 25 | 0 |  |
| library/sitemap | 98 | 98 | 0 |  |
| library/search | 106 | 106 | 0 | فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1؛ فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1 |
| library/islamic-directory | 0 | 0 | 0 | فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1 |
| library/sources | 0 | 0 | 0 | فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1 |
| library/academic-research-assistant | 0 | 0 | 0 | فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1 |
| library/academic-research-submit | 0 | 0 | 0 | فارغ عمدًا: مصدره شبكة/حساب أو غير مراجَع: 1 |
| quran/tilawa-reciters | 13 | 13 | 0 |  |
| quran/circles | 27 | 27 | 0 |  |
| quran/ulum-quran | 79 | 79 | 0 |  |
| sirah/islamic-landmarks | 34 | 34 | 0 |  |
| sirah/nations | 21 | 21 | 0 |  |
| sirah/occasions-verified | 34 | 21 | -13 | بلا سجل موثّق: 13 |
| sirah/prophets-knowledge | 25 | 25 | 0 |  |
| sirah/stories | 479 | 479 | 0 |  |
| sirah/islamic-history | 217 | 217 | 0 |  |
| sirah/sahabah | 63 | 63 | 0 |  |
| sirah/seerah-phases | 0 | 0 | 0 | فارغ عمدًا: بلا مصدر/درجة (قرار المالك): 1 |
| sirah/shamail | 0 | 0 | 0 | فارغ عمدًا: بلا مصدر/درجة (قرار المالك): 1 |
