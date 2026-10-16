# قالب تحويل ردّ الشيخ إلى تعديلات (سُنّة 1.2.0)

> قالب فقط: لا يتضمن قرارًا ولا نصًا شرعيًا. يُنقل رد الشيخ إلى الجدول بنصّه، ثم تُوزَّع الصفوف على النوافذ.

## القاعدة
**أي نص شرعي (آية، حديث، ذكر، حكم، عقيدة، سيرة، صياغة عبادة) لا يُغيَّر إلا بمصدر موثَّق وبقرار صريح من الشيخ مكتوب في عمود «قرار الشيخ».** صف بلا قرار أو بلا مصدر لا ينفَّذ ولا يُعدَّل نصه؛ أقصى ما يُفعل فيه الإخفاء (لا الحذف) بقرار يوسف. حماية الاقتباس الحرفي: `QURAN_QUOTE_FIXES.md`، وانظر `.claude/rules/protected-content.md`.

## الجدول
القيم المسموحة في «قرار الشيخ»: اعتماد / تعديل (مع الصيغة والمصدر) / إخفاء / حذف / لا قرار بعد. كل الصفوف المعبّأة أدناه «لا قرار بعد».

| # | الباب | البند | قرار الشيخ | الملف المتأثر | النافذة المسؤولة | المصدر (أين وردت المراجعة) |
|---|---|---|---|---|---|---|
| 1 | ما الجديد | نص `WHATS_NEW` (ar/en) | لا قرار بعد | `docs/native/store/WHATS_NEW.md` | n5 (بتفويض يوسف) | `store/OWNER_CHECKLIST.md` (بند إرسال WHATS_NEW للشيخ) |
| 2 | بيانات المتجر | الاسم والوصف والكلمات المفتاحية | لا قرار بعد | `docs/native/store/APPSTORE_METADATA.md` | n5 | `store/OWNER_CHECKLIST.md` |
| 3 | ملاحظات المراجِع | `REVIEW_NOTES` | لا قرار بعد | `docs/native/store/REVIEW_NOTES.md` | n5 | `store/OWNER_CHECKLIST.md` |
| 4 | أحاديث | الأحاديث الثمانية مختلفة الدرجة (ب-1..ب-8: النسائي 2559، الترمذي 2317 و747 و1977 و614 و2509، ابن ماجه 425، أبو داود 1573): اعتماد / تعديل / إخفاء | لا قرار بعد | `docs/native/review/hadith8-conflicts.md` ثم بيانات الحديث المصدَّرة | n2 | `scholar-review/SCHOLAR_REVIEW.md` §ب |
| 5 | عقيدة وسيرة | بنود (ج): جزئي/مصحَّح مقترح/حذف مقترح/متعارض/بلا مصدر | لا قرار بعد | `docs/native/review/aqidah-verification.md`، `aqidah-sirah-conflicts.md`، `sirah-*.md` | n2 | `scholar-review/SCHOLAR_REVIEW.md` §ج |
| 6 | عقيدة (معلّق) | `usra-mujtama/muwat-4`: درجة غير موثّقة | لا قرار بعد | `docs/native/aqidah-pending-review.json` | n2 | `aqidah-pending-review.json` |
| 7 | عقيدة (معلّق) | `usra-mujtama/muwat-12`: درجة غير موثّقة | لا قرار بعد | `docs/native/aqidah-pending-review.json` | n2 | `aqidah-pending-review.json` |
| 8 | مخفي بلا مصدر | `adab-talab-ilm/marratib` و`adab-talab-ilm/kutub` | لا قرار بعد | `docs/native/aqidah-pending-review.json` | n2 | `aqidah-pending-review.json` (إخفاء بقرار يوسف 2026-10-16) |
| 9 | مخفي بلا مصدر | `raqaiq/zuhd` و`raqaiq/muhasaba` | لا قرار بعد | `docs/native/aqidah-pending-review.json` | n2 | `aqidah-pending-review.json` |
| 10 | مخفي بلا مصدر | `discover-islam-new-muslim/static-nm-6` | لا قرار بعد | `docs/native/aqidah-pending-review.json` | n2 | `aqidah-pending-review.json` |
| 11 | عيّنة الاعتماد | قرار واحد لكل فئة: حديث ضعيف، حديث موضوع، فرق قيد المراجعة، موقف تربوي (`seerah-14`) | لا قرار بعد | `docs/native/review/pending-approval-sample.md` | n2 | `scholar-review/SCHOLAR_REVIEW.md` §ج-عينة و«القرار المطلوب» |
| 12 | فقه العبادات | تغييرات صياغة الطهارة والصلاة والصيام والزكاة والحج (جداول قبل/بعد مقابل الإقناع) | لا قرار بعد | `docs/native/review/ibadat-changes-for-sheikh.md` | n2 | نفس الملف؛ يشمل «ما أُخفي بانتظار قرارك» وملاحظة أشهر الحج |
| 13 | اقتراحات الحذف | إجمالي مقترح 846 (فقه 8، مكتبة/دروس 104، فوائد 713، عقيدة 10، سيرة 11) | لا قرار بعد | `docs/native/review/deletion-proposals.md` | n2 | نفس الملف |
| 14 | مؤسسات التعلم | رفع مؤسسة من القائمة المخفية (44) بعد مراجعة بياناتها | لا قرار بعد | `artifacts/majalis/src/data/institutions-catalog.json` | n2 | `docs/native/LEARN_INSTITUTIONS_DECISION.md` |
| 15 | تنبيهات | نصوص مقاطع إشعارات الأذان المشكولة (المقاطع المثبتة في القالب) | لا قرار بعد | `docs/native/NOTIFICATION_VOICE_LICENSE.md` | n4 للإشعارات، وn2 للنص | `NOTIFICATION_VOICE_LICENSE.md`؛ الترخيص قالب فارغ للمالك |
| 16 | إثبات «ما الجديد» | البند 9 («المحتوى الشرعي منقول كما هو»): عينة 20 نصًا مقارنة حرفية | لا قرار بعد | `docs/native/store/WHATS_NEW_VERIFICATION.md` | n4 (الفحص) وn2 (التصحيح) | `store/WHATS_NEW_VERIFICATION.md` |
| 17 | (مثال فارغ) | | | | | |
| 18 | (مثال فارغ) | | | | | |

> مصادر البنود 4-5 و11: ملف `scholar-review/SCHOLAR_REVIEW.md` (والنسخة `SCHOLAR_REVIEW.docx`) هو ما يُسلَّم للشيخ؛ أرقام الأقسام فيه تتبع ملف المراجعة لا هذا القالب. لم أتحقق هنا من عدّ بنود كل قسم؛ الأعداد مأخوذة من رأس الملفين المذكورين.

## خانات النوافذ
تتبع `docs/native/OWNERSHIP.md`: عدّل صف الملكية هناك إن اختلف. n5 لا يملك بيانات ولا Swift.

| النافذة | نطاقها في هذا القالب | تعبئة بعد رد الشيخ |
|---|---|---|
| n1 | التصميم، `Sections/**` و`Components/**`، و`docs/native/store/**` (ملكية الإصدار) | الصفوف: ____ |
| n2 | البيانات والمحتوى: `Data/**`، `review/**`، `aqidah-*.json`، كتالوج المؤسسات | الصفوف: ____ |
| n3 | المصحف والتسميع والصوت (`Mushaf/**`، `Tasmee/**`، `Audio/**`)، `QURAN_QUOTE_FIXES.md`؛ لا يُغيَّر نص آية | الصفوف: ____ |
| n4 | المنصة والإشعارات والويدجت و`ios-native/SunnahApp/**` وفحص الأجهزة | الصفوف: ____ |
| n5 | وثائق التقديم `docs/native/submission/**` وتحديث نصوص المتجر بتفويض يوسف | الصفوف: ____ |

## خطوات التحويل
1. انسخ رد الشيخ حرفيًا في عمود «قرار الشيخ» لكل صف، ولا تُلخّصه.
2. صف «تعديل» بلا نص مصدر موثَّق (كتاب/صفحة/رقم) يعاد للشيخ ولا ينفَّذ.
3. وزّع الصفوف على النوافذ حسب العمود، وتقدّم كل نافذة بـPR مستقل ضمن حدود الملفات والأسطر المحذوفة المعتمدة للمستودع.
4. بعد التنفيذ: حدّث `aqidah-pending-review.json` أو الكتالوج بحسب الصف، ثم أعد تصدير البيانات (n2) ولا تعدّل ملف مصدَّر باليد.
5. أي سطر في `WHATS_NEW.md` يمسّه قرار «حذف/إخفاء» يُحذف قبل الإرسال (`WHATS_NEW_VERIFICATION.md`).
6. لا يُعدّ البند منجزًا إلا بدليل (ملف:سطر أو رقم PR)، ولا يُدّعى اعتماد الشيخ بلا ردّه المكتوب.
