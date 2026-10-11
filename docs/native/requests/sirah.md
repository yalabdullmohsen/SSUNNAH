# طلبات قسم «السيرة والتاريخ والأعلام» (sirah) — لـن2

الشاشات الأصلية في `Sources/SunnahNative/Sections/sirah/`. لم يُعدَّل أي ملف مشترك؛ ما يلي يحتاجه القسم من خارج مجلده.

## 1) الربط (ملف مشترك)
القوالب المولَّدة تفكّ `[ContentItem]` من `<اسم>.json` مباشرة، وبيانات القسم لا تطابق هذا الشكل (اسم بدل عنوان، فصول، أدلة بدرجات...). لذلك `SirahSection` يسجّل الشاشات نفسها بالمعرّفات نفسها فوق المولَّدة:
- في نقطة الدخول بعد `GeneratedScreens.registerAll(in:)`: `SirahSection.register(in: registry)`.
- في حلّ المسارات قبل `GeneratedScreens.resolve(path:)`: `if let v = SirahSection.resolve(path: path) { return v }`.

بديل أنظف إن رأيتموه: أن يقبل المولّد `source`/`adapter` لكل مسار في `ROUTE_TEMPLATE_MAP.json` (الحقل `source` موجود في المولّد لكنه يُسقَط عند بناء `bySec`).

## 2) التصدير (`scripts/native/export-ios-data.mjs`) — لا شيء من القسم يُصدَّر الآن
كل الملفات تحت `Data/sirah/`، بالشكل الحرفي للمصدر (المحوّلات تطبّق قواعد القبول، والتصدير يطبّق المحجوز في `content-hold.json`). غياب الملف يُظهر «المحتوى قيد التوثيق» لا خطأ.

| الملف | المصدر | الشكل | ملاحظة قبول |
|---|---|---|---|
| `fikr-waqia.json` | `src/lib/fikr-waqia-data.ts` `FIKR_WAQIA` | `DarsSection[]` | بلا حقل مصدر/مراجعة: يحتاج قرار المالك قبل التصدير |
| `islamic-landmarks.json` | `src/lib/islamic-landmarks-data.ts` `ISLAMIC_LANDMARKS` | `IslamicLandmark[]` | معلومات عامة بلا مصدر |
| `nations.json` | `src/lib/nations-seed.ts` `NATIONS` | `Nation[]` | المحوّل يُسقط الحديث بلا درجة و`unverified`/`disputed` |
| `occasions-verified.json` | `verified-calendar.ts` `VERIFIED_OCCASION_RECORDS` المطابقة لبذور `ISLAMIC_OCCASIONS` (كما يفعل `enrichOccasionForPublish`) | `VerifiedReligiousRecord[]` | المحوّل: `reviewStatus=approved` وله `sourceName` |
| `prophets-knowledge.json` | `public/data/knowledge/prophets/*.json` مجمّعة في مصفوفة | `KnowledgeItem[]` | المحوّل: `review_status=verified` وله مصادر |
| `prophets-lineage.json` | `src/lib/prophets-lineage.ts` `PROPHETS_LINEAGE` | `LineageNode` (جذر واحد) | أسماء وأنساب بلا مصدر: قرار المالك |
| `sahabah.json` | `src/views/SahabahPage.tsx` `SAHABAH` (مضمَّن في الصفحة) | `Sahabi[]` | المحوّل لا يعرض `quote` (قول منسوب بلا مصدر) |
| `seerah-phases.json` | `src/views/SeerahPage.tsx` `PHASES` بلا `Icon`/`color` | `{id,num,title,year,desc,topics,keyEvents}[]` | بلا مصادر: قرار المالك |
| `shamail.json` | `src/views/ShimaelPage.tsx`: `ABWAB_KHALQ`/`KHULUQ`/`SIRA` و`MAHABBAH_ABWAB` | `{id:"<tab>-<n>",tab,title,hadiths:[{text,rawi?,source?,grade?}]}[]` | **الأحاديث في الويب بلا درجة**: المحوّل لا يعرض حديثًا بلا درجة ومصدر، فالشاشة فارغة حتى تُخرَّج |
| `stories.json` | `public/data/stories/*.json` مجمّعة | قصة `{id,slug,title,…,sources,is_approved,editorial_review_status}` | المحوّل: معتمدة و`reviewed` ولها مصادر (8 من 479 الآن) |
| `islamic-history.json` | `src/data/islamic-history/*.json` (عبر `ISLAMIC_HISTORY_ITEMS`) | `IslamicHistoryItem[]` | المحوّل: لا `needs-review`، ولا عنصر بلا مصادر؛ الوسم يبيّن ثابت/راجح/مختلف فيه |

المشايخ (`/teachers`) تُبنى من صفوف الدروس بالشبكة (`/data/lessons/chunk-000.json`) — المعتمد `status=approved` فقط، تجميعًا بـ`speaker_name`. مصدر الدروس لقسم التعلّم؛ إن تغيّر مساره يُحدَّث `SirahSection.File.lessons`.

## 3) قوالب
- `/prophets` و`/stories` قالبهما في الخريطة «مقال» لعنصر واحد، والبيانات قوائم: عُرضتا قائمةً تفتح مقالًا عبر `/prophets/:slug` و`/stories/:slug` (مساران غير مدرجين في الجرد).
- `/islamic-landmarks/map`: لا خريطة في القوالب؛ عُرضت شبكة بطاقات. خريطة MapKit تحتاج قالبًا جديدًا إن أُريدت.
- `/prophets/tree`: لا قالب شجرة؛ عُرضت قائمة مسطّحة بالعمق («من ذرية…»، «الجيل n»).

## نطاق المسارات (قرار المالك 2026-10-11)
- المرجع الوحيد `ROUTE_TEMPLATE_MAP.json`: مسارات `:id` المبنية هي المبقاة فقط (`/islamic-landmarks/:id`، `/nations/:slug`، `/tarikh-islami/:id`، `/teachers/:slug`).
- `/prophets` و`/stories` قالبهما «مقال»: صفحة واحدة تجمع العناصر المصدَّقة؛ `/prophets/:slug` و`/stories/:slug` غير مبنيين (مكرران في الخريطة).
- `/fikr-waqia` و`/occasions` و`/sahabah` و`/seerah` و`/shamael` و`/prophets/tree`: العنصر يُقرأ في ورقة داخل الشاشة، بلا مسار تفاصيل.
- فجوة قالب: `ListTemplate` يفتح دائمًا `base/id`؛ خيار «عرض داخل الشاشة» في القالب يغني عن `SirahInlineItemsView`، وعناوين فرعية في `ArticleTemplate` تحسّن صفحات «مقال» المجمّعة.
