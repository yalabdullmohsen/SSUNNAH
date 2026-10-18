# نظام التصميم الموحَّد — تطبيق «سُنّة» iOS (توثيقٌ فقط)

> المالك: ن1. مصدرُ الحقيقة البصريّ: `design-system/tokens.css` للويب، ويقابله ملفُّ Tokens واحد في Swift (`DesignTokens.swift`). لا قيمةَ بصريّة حرفيّة خارجه.

## 1) الألوان
- الأساس: أبيض/بيج + أخضر. الذهبيّ (`accent`) للتمييز الثانويّ النادر فقط.
- أدوارٌ لا قيم: `bg`، `surface`، `surfaceRaised`، `textPrimary`، `textSecondary`، `brand`، `accent`، `separator`، `danger`.
- تباينٌ ≥ 4.5:1 للنصّ العاديّ و3:1 للكبير، **فاتحًا وداكنًا لكلّ شاشة** (Asset Catalog بنسختين).
- ممنوع `Color(red:…)`/hex في الشاشات؛ الألوان من الـTokens فقط.

## 2) الخطوط
- `ui`: IBM Plex Sans Arabic · `text`: Amiri (أحاديث/أذكار) · `quran`: Amiri Quran (آيات) — والمصحف نفسُه بخطوط QPC (محميّ لا يُمسّ).
- أنماطٌ مسمّاة: title، headline، body، caption، footnote؛ كلّها تدعم Dynamic Type (`relativeTo:`) حتى AX5.
- لا اسمَ خطٍّ حرفيّ داخل العروض.

## 3) المسافات والزوايا والظلال
- شبكة 4: ‏4/8/12/16/20/24/32/40. هامشُ الصفحة 16.
- زوايا: 12/16/20/pill. ثلاثة مستوياتِ ظلٍّ (e1..e3) بدل الحدود الرماديّة.
- أيقونةٌ واحدة: SF Symbols بوزن ثابت، حجما 20/24.

## 4) المكوّنات
| المكوّن | الوصف |
|---|---|
| `AppCard` | سطحٌ بزاوية 16 وظلّ e1، حشوة 16؛ حالتان: عاديّة/مرفوعة |
| `Chip` | شريحةٌ pill؛ محدَّدة/غير محدَّدة؛ ارتفاعٌ ≥ 44pt للمس؛ تتبع RTL |
| `GeometricHeader` | ترويسةٌ بنقشٍ هندسيّ إسلاميّ مولَّد برمجيًّا (Shapes) — لا صورةَ نقطيّة |
| `ListRow` | صفٌّ مخصَّص بدل صفّ List الافتراضيّ |
| `SectionHeader` | عنوانُ قسمٍ بـ`accessibilityHeading` |
| `ExplainerTemplate` | قالبُ الشرح المصوَّر: ترويسة هندسيّة ← عنوان ← مقدّمة ← بطاقاتُ خطوات (رسمٌ أصليّ + نصٌّ + مصدر) ← «المصادر» ← تذييل |

### ExplainerTemplate — العقد
- يستقبل بياناتٍ مُهيكلة (عنوان، خطواتٌ كلٌّ بـ`title/body/sources/illustration`)، لا نصًّا حرًّا.
- **كلُّ خطوةٍ بلا مصدرٍ لا تُرسَم** (الإخفاء لا العناصر النائبة).
- الرسمُ يأتي من سجلّ ASSETS_LICENSES فقط؛ غيابُ سطرٍ في السجلّ = فشلُ اختبار.
- لا عباراتٍ داخليّةً تظهر للمستخدم («كما في العرض المعتمد»، «ملاحظة منهجية»).

## 5) القاعدة: لا List/Form/DisclosureGroup افتراضيّة
- لا `List` ولا `Form` ولا `DisclosureGroup` بنمطها الافتراضيّ في شاشات المحتوى؛ بدائلها `ScrollView + LazyVStack` مع `AppCard`/`ListRow`، وطيٌّ مخصَّص (`ExpandableSection`) بحركةٍ تحترم «تقليل الحركة».
- **الاستثناءات المنصوصة** (تُسجَّل في الوثيقة وتُراجَع): نماذجُ الإعدادات النظاميّة (Account/حذف الحساب) حيث تفرض Apple سلوكًا أصيلًا؛ تُلفّ بـ`.scrollContentBackground(.hidden)` وتُلوَّن من الـTokens.
- بوّابة: فحصُ مصدريٍّ في CI يعدّ `List(`/`Form(`/`DisclosureGroup(` خارج الاستثناءات (سقفٌ يُخفَّض ولا يُرفع).

## 6) الاعتماد
RTL، فاتح/داكن/System، Dynamic Type، VoiceOver، تقليل الحركة، تحديث وتشغيل بارد — يُتحقَّق منها لكلّ تغيير هويّة.

### قائمة الهجرة المتبقية (ن1، 2026-10-18)
السقف الآلي: `scripts/native-default-containers-guard.sh` + `docs/native/default-containers-budget.txt` (=62؛ يُخفَّض ولا يُرفع). الملفات التي ما زالت تحوي حاويات افتراضية (عدد الاستعمالات):
- `Sections/quran/PublishedScreens+Native.swift` — 8
- `Sections/quran/QuranLocalScreens+Native.swift` — 6
- `Sections/library/LibraryScreens+Native.swift` — 4
- `Mushaf/MushafReaderView.swift` — 4
- `Special/HadithScreens.swift` — 3
- `Sections/quran/TilawaCirclesScreens.swift` — 3
- `Sections/learn/LearnPersonalScreens.swift` — 3
- `Templates/SearchTemplate.swift` — 2
- `Special/SettingsScreens.swift` — 2
- `Sections/quran/TafsirScreens+Native.swift` — 2
- `Sections/learn/LearnReadingPlans.swift` — 2
- `Sections/fiqh/Mawarith/MawarithCalculatorScreen.swift` — 2
- `Templates/TreeTemplate.swift` — 1
- `Templates/MapTemplate.swift` — 1
- `Templates/ListTemplate.swift` — 1
- `Templates/GroupedListTemplate.swift` — 1
- `Special/WeakHadithScreens.swift` — 1
- `Special/SiteContentScreens.swift` — 1
- `Special/AdhkarScreen.swift` — 1
- `Sections/sirah/SirahScreens+Native.swift` — 1
- `Sections/quran/UlumQuranScreens.swift` — 1
- `Sections/quran/QuranSearchScreen.swift` — 1
- `Sections/quran/QuranScreens+Native.swift` — 1
- `Sections/quran/PeopleScreens+Native.swift` — 1
- `Sections/quran/MutashabihatScreens.swift` — 1
- `Sections/learn/LearnSupport.swift` — 1
- `Sections/learn/LearnKnowledgeScreens.swift` — 1
- `Sections/learn/LearnDirectoryScreens.swift` — 1
- `Sections/aqidah/NewMuslimAndContactScreens.swift` — 1
- `Sections/account/AccountSubmissionsScreens.swift` — 1
- `Sections/account/AccountContactScreen.swift` — 1
- `Mushaf/MushafTafsirView.swift` — 1
- `Audio/OfflineAudioScreen.swift` — 1
المطبَّق: بقية الشاشات تستعمل ScrollView/LazyVStack وبطاقات النظام؛ لا ألوان/خطوط حرفية في Sections/Special/Templates (0).
