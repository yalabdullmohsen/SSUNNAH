# خريطة التنقل (IA) — تطبيق مجالس العلم الأصلي

مصدر الجرد: `docs/native/ROUTE_TEMPLATE_MAP.json` (212 مسارًا، كل مسار في مجموعة واحدة). لا شريط تبويب: الجذر `NavigationStack` واحد والرئيسية أولى شاشاته.

## الرئيسية (بالأهمية)
1. الصلاة القادمة (بطاقة) ← `/native/prayer`
2. الورد اليومي ← `/native/daily-wird`
3. آية اليوم ← `/mushaf` · حديث اليوم ← `/hadith`
4. متابعة القراءة (عند وجود موضع محفوظ) ← `/mushaf`
5. شبكة الأقسام: القرآن، الحديث، الدروس، الفقه، العقيدة، السيرة، الأذكار، القبلة، التقويم، الصلاة، الإحصاءات، كل الأقسام

## الشريط العلوي
البحث `/search` · قائمة الحساب: مساهماتي `/my-submissions`، تسجيل الدخول `/login`، الإعدادات `/settings`.

## كل الأقسام (`/sections`)
مجمّعة بعناوين المجموعات المصدَّرة من الموقع (navigation.json: groups)، ويكمّلها «خريطة الموقع» `/sitemap` و«المزيد» `/more`.

## توزيع المسارات الـ212 على المجموعات

### الأذكار والأدعية (8)
`/adhan-help`، `/adhan-settings`، `/adhkar`، `/daily-wird`، `/duas`، `/duas-quran`، `/sunan-yawmiyya`، `/tasbih`

### الحديث والسنة (13)
`/arbaeen-nawawi`، `/arbaeen-nawawi/:id`، `/dalail-nubuwwah`، `/hadith`، `/hadith-science`، `/hadith/arbaeen-love-of-allah`، `/hadith/books`، `/hadith/books-and-rulings`، `/hadith/daif`، `/hadith/mawdu`، `/hadith/sahih`، `/sunnah-studies`، `/wasaya-nabawiyya`

### الحساب والإعدادات (28)
`/about`، `/account-deletion`، `/auth/callback`، `/auth/update-password`، `/calendar`، `/car-mode`، `/contact`، `/data-licenses`، `/fatwa-policy`، `/feature-tour`، `/islam-stats`، `/login`، `/mosque-mode`، `/my-submissions`، `/notification-settings`، `/offline`، `/privacy`، `/privacy-center`، `/qibla`، `/register`، `/settings`، `/stats`، `/submit`، `/updates`، `/updates/auto/:slug`، `/upload`، `/vault`، `/widget-center`

### الدروس والتعلم (23)
`/annual-courses/:id`، `/competitions`، `/competitions/:id`، `/durus-imaniyya`، `/durus-mutanawwia`، `/fawaid`، `/flashcards`، `/institutions`، `/knowledge-graph`، `/knowledge/:section`، `/kuwait-lessons`، `/lessons`، `/lessons/:id`، `/lessons/archive`، `/my-learning`، `/progress`، `/quiz`، `/reading-plans`، `/researcher`، `/study-room`، `/universities`، `/universities/:slug`، `/universities/compare`

### السيرة والتاريخ والأعلام (18)
`/fikr-waqia`، `/islamic-landmarks`، `/islamic-landmarks/:id`، `/islamic-landmarks/map`، `/nations`، `/nations/:slug`، `/occasions`، `/occasions-lessons`، `/prophets`، `/prophets/tree`، `/sahabah`، `/seerah`، `/shamael`، `/stories`، `/tarikh-islami`، `/tarikh-islami/:id`، `/teachers`، `/teachers/:slug`

### العقيدة والتزكية (27)

### الفقه والعبادات (39)
`/amr-bil-maruf`، `/arkan`، `/arkan-iman`، `/fadail-aamal`، `/family`، `/fiqh`، `/fiqh-qawaid`، `/fiqh/books/:bookId`، `/fiqh/books/:bookId/chapters/:chapterId`، `/fiqh/books/:bookId/lessons/:lessonId`، `/fiqh/topics/:topicId`، `/fiqh/usul`، `/hajj`، `/janaza`، `/jumuah`، `/madhahib`، `/madhahib/:id`، `/maqasid-sharia`، `/mawarith`، `/mawarith/calculator`، `/nikah`، `/prayer-ranks`، `/prayer-times`، `/prophetic-medicine`، `/riba`، `/ruqya`، `/sadaqa`، `/salah-guide`، `/sawm`، `/sins-and-rights`، `/sins-and-rights/:slug`، `/sujood-sahw`، `/tahara`، `/talaq`، `/tawba`، `/udhiya`، `/waqf`، `/worship`، `/zakat`

### القرآن (37)
`/c/:slug`، `/hifz-path`، `/hifz-path/c/:category`، `/hifz-path/my`، `/hifz-path/p/:slug`، `/hifz-path/p/:slug/u/:unitId`، `/memorization`، `/miracles`، `/mushaf`، `/mushaf/bookmarks`، `/mutashabihat`، `/quran-circles`، `/quran-engine`، `/quran-hub`، `/quran-hub/numbers`، `/quran-hub/qiraat`، `/quran-hub/seven-ahruf`، `/quran-hub/tajweed`، `/quran-hub/tajweed/:chapter`، `/quran-hub/terms`، `/quran-hub/tilawa`، `/quran-knowledge`، `/quran-memorization`، `/quran/hifz-loop`، `/quran/makki-madani`، `/quran/memorization-plans`، `/quran/offline-player`، `/quran/people`، `/quran/people/:slug`، `/quran/revelation-order`، `/quran/search`، `/quran/surah-stories`، `/quran/surah-stories/:number`، `/quran/surahs`، `/quran/worship-hub`، `/tafsir`، `/ulum-quran`

### اللغة والمكتبة والبحث (19)
`/academic-research`، `/academic-research/:id`، `/academic-research/assistant`، `/academic-research/submit`، `/arabic-language`، `/cards`، `/islamic-directory`، `/islamic-glossary`، `/mawsuaat`، `/methodology`، `/mind-map`، `/more`، `/scientific-announcements/:id`، `/search`، `/sections`، `/sitemap`، `/sources`، `/sources/:id`، `/terms`

## الوصول
كل مسار يُفتح بالنقر من الرئيسية أو «كل الأقسام» أو البحث، وبالروابط العميقة (`AppRouter.open(url:)`، `-snapshotRoute`، الويدجت، إشعارات الصلاة) عبر مكدّس واحد. اختبار `HomeNavigationUITests` ينقر كل بلاطة وبطاقة.
