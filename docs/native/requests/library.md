# طلبات قسم «اللغة والمكتبة والبحث» (library) — لـن2

الشاشات الأصلية في `Sources/SunnahNative/Sections/library/`. لم يُعدَّل أي ملف مشترك؛ ما يلي يحتاجه القسم من خارج مجلده.

## 1) الربط (ملف مشترك)
القوالب المولَّدة تفكّ `[ContentItem]` مباشرة، ومصادر القسم لا تطابقه. `LibrarySection` يسجّل الشاشات بالمعرّفات نفسها فوق المولَّدة:
- بعد `GeneratedScreens.registerAll(in:)`: `LibrarySection.register(in: registry)`.
- قبل `GeneratedScreens.resolve(path:)`: `if let v = LibrarySection.resolve(path: path) { return v }`.

يحلّ أيضًا `/mind-map/:id` و`/arabic-language/:id` و`/mawsuaat/:id` و`/islamic-glossary/:id` (غير مدرجة في الجرد، تفتحها القوائم).

## 2) التصدير (`scripts/native/export-ios-data.mjs`) — لا شيء من القسم يُصدَّر الآن
كل الملفات تحت `Data/library/`. غياب الملف يُظهر «المحتوى قيد التوثيق» لا خطأ.

| الملف | المصدر | الشكل | ملاحظة |
|---|---|---|---|
| `academic-research.json` | `src/lib/researches/` `RESEARCH_PUBLISHED_SEED` + `RESEARCH_CATEGORIES` | `{records: ResearchRecord[], categories: [{id,label,sortOrder}]}` | المحوّل: `reviewStatus=published` وليس `isDemo` (383 الآن) |
| `arabic-language.json` | `src/lib/arabic-language-data.ts` `ARABIC_LANGUAGE` | `DarsSection[]` | بلا مصادر: قرار المالك |
| `mawsuaat.json` | `src/lib/mawsuaat-data.ts` `MAWSUAAT` | `DarsSection[]` | بلا مصادر: قرار المالك |
| `islamic-glossary.json` | `src/pages/account/ui/IslamicGlossaryView.tsx` `TERMS` (مضمَّن في الصفحة) | `GlossaryTerm[]` | المحوّل: ذو `source` فقط (220 من 240) |
| `mind-maps.json` | `src/lib/mind-maps-data.ts` `MIND_MAPS` | `MindMap[]` | عناوين تنظيمية |
| `scientific-announcements.json` | `src/lib/scientific-announcements-seed.ts` | `ScientificAnnouncement[]` | إعلانات (لا محتوى شرعي) |
| `navigation.json` | `src/config/sections.registry.ts` + `SiteMapView.tsx` `SECTIONS` + `MorePage.tsx` `SETTINGS_ROWS` (بعناوين `S.more_*` محلولة) | `{groups:[{id,label,subtitle,order}], sections:[SectionDef بلا icon/accent], settingsRows:[{id,title,description?,href}], sitemap:[{title,links:[{href,label,desc}]}]}` | المحوّل: `status=live` وليس `comingSoon`؛ مجموعة `account` خارج «المزيد» |
| `search-index.json` | `public/data/search/index.json` بعد `isBlockedPublicSearchHref` | `{docs:[{id,kind,titleAr,href,norm}]}` | الحجب يُطبَّق في التصدير لأنه يعتمد على السجل |
| `terms.json` | `src/views/TermsPage.tsx` (حرفيًا) | `{title,updatedAt,sections:[{title,paragraphs:[]}]}` | نص قانوني يُنقل حرفيًا؛ `CONTACT_EMAIL` من `lib/site-config` محلولًا |
| `methodology.json` | `src/views/MethodologyPage.tsx` (`SOURCES`/`STEPS`/`LIMITS`/`TRUST_GRADES` والنثر) حرفيًا | نفس شكل الوثيقة | يُنقل حرفيًا |

من الشبكة (DATA_CONTRACT §2، تشغيلي): `/data/sources/accounts.json` (المفعّل فقط) و`/data/lessons/feed.json` (آخر ما نُشر لكل مصدر).

## 3) قرارات وقوالب
- `/academic-research/submit`: الويب يحفظ الإرسال في `localStorage` فقط بلا خادم؛ الأصلي يعرض «استقبال الأبحاث غير متاح في التطبيق بعد» حتى تُقرَّر نقطة استقبال.
- `/academic-research/assistant`: حساب محلي من المنشور (تغطية التصنيفات الأقل أولًا، وأكثر الكلمات المفتاحية)، لا ذكاء اصطناعي ولا شبكة، كما في الويب.
- `/academic-research/:id`: الخريطة تجعله «بحث» فيعرض القائمة؛ الأصلي يعرض تفاصيل البحث (مطابقة بالمعرّف أو الـslug).
- `/cards`: مولّد بطاقات صورة (ShareLink + ImageRenderer)، بلا نص افتراضي (الويب يبدأ بحديث؛ لا محتوى شرعي من الكود).
- `/mind-map`: لا قالب شجرة؛ التفاصيل مخطّط بالإزاحة داخل قالب التفاصيل.
- `/more` و`/sitemap`: قائمة مجمّعة بعناوين (`LibraryGroupedLinksView`) لأن `SectionsListTemplate` بلا مجموعات.
