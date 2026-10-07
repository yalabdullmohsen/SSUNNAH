# المؤجَّل والمعروف

## 1) فروع rescue/* (لا تُدمج تلقائيًا؛ كلها «wip — حفظ احتياطي»)
| الفرع | المحتوى | الإجراء المحدد | المالك |
|---|---|---|---|
| `rescue/fix-arabic-search-migrations-v2-v5` | يعدّل 4 هجرات **موجودة** على main (`supabase/migrations/20261003100000…130000_arabic_search_*_v2..v5.sql`) + ملفات rollback | rebase على main ← مقارنة الهجرات الأربع بسجل الإنتاج (`list_migrations`) ← إن كانت مطبّقة: يُنقل التعديل إلى **هجرة جديدة** بتاريخ جديد وتبقى القديمة كما هي ← PR بوسم «يحتاج قرارًا» دون دمج تلقائي | 3 (التحضير) · يوسف (القرار) |
| `rescue/feat-settings-notifications-unified` | توحيد الإعدادات/الإشعارات (31 ملفًا، متأخر 117) | مقارنة بما دُمج في `3fa75b8c4` و`9565ebc6e` (مركز الإشعارات الجديد)؛ ما لم يُغطَّ يُنقل في PR جديد صغير، ثم يُحذف الفرع | 3 |
| `rescue/fix-device-compat-matrix` | مصفوفة توافق الأجهزة (40 ملفًا) | استخراج البوابة والاختبارات فقط إلى PR جديد من main؛ الباقي يُهمل | 3 |
| `rescue/ui-component-layer-consolidation-cards` | توحيد طبقة البطاقات CSS | يُعاد تطبيقه على نظام `sn-` بعد ratchet (#2736) أو يُهمل | 2 |
| `rescue/ui-component-layer-consolidation-w1` | بوابة توحيد طبقة المكونات (ملفان) | يُقارن بـ`artifacts/majalis/scripts/ui-ratchet.mjs`؛ إن كان مكررًا يُحذف الفرع | 2 |

حذف أي فرع rescue لا يتم إلا بعد تأكيد يوسف (لا رجعة فيه).

## 2) مشكلات معروفة
### qibla-compass.test
- `src/lib/__tests__/qibla-compass.test.ts` يتوقع v1 والكود v2. **لا يُربط بـCI قبل إصلاحه**؛ يُحدَّث الاختبار ليتوقع v2 (أو يُستخدم مرجعًا لمعيار القبلة في اليوم 3-4).

### الاختبارات اليتيمة: 151 من 915
- القائمة الكاملة: [orphan-tests.txt](orphan-tests.txt) (اختبارات لا يشغّلها أي سكربت في CI).
- خطة الربط التدريجية — PR لكل دفعة، ولا يُربط اختبار فاشل قبل إصلاح سببه:
  1. الدفعة الأولى (الصلاة): `adhan-early-stop-rca-gate`، `prayer-day-rollover-gate`، `offline-universal-prayer`.
  2. الدفعة الثانية (الدخول والمحتوى): `ios-auth-certification-gate`، `instant-back-auth-gate`، `hadith-access`، `quran-audio-source`.
  3. بعدها: 10 اختبارات لكل PR بحسب المجال (search، quran، prayer…) حتى نفاد القائمة.

### TestFlight
- كل تشغيلات `ios-testflight-deploy.yml` فاشلة منذ 2026-08-28: `OpenSSL::PKey::ECError: invalid curve name` عند قراءة مفتاح ASC. السبب: خطوة الفك تفترض Base64 دائمًا. الإصلاح في PR النافذة 3 (اليوم 1).

## 3) أمنيًا
- ✅ `*.p8` موجود في `.gitignore` (السطر 49).
- ✅ `git log --all -- '*.p8'` فارغ، و`git ls-files '*.p8'` فارغ.
- ⚠️ يوجد محليًا `.playwright-mcp/AuthKey-*.p8` خارج git (متجاهَل). **إجراء يدوي:** حذفه من القرص وإلغاء المفتاح في App Store Connect إن كان غير المستخدم في أسرار CI.

## 4) حماية main — اقتراح (لا يُفعَّل قبل موافقة يوسف)
الوضع الحالي: الدمج التلقائي لا ينتظر الفحوص بقاعدة إلزامية؛ يعتمد على `cancel-on-ci-failure` بعد الحدث.

ruleset مقترح على `main`:
| القاعدة | القيمة |
|---|---|
| Require status checks | `Verify build`، `ci-required` (strict: لا) |
| Require pull request | نعم، 0 مراجعات (يبقى الدمج التلقائي ممكنًا) |
| Block force pushes / deletions | نعم |
| Bypass | لا أحد (ولا `--admin`) |

الأثر: الدمج التلقائي ينتظر الفحصين فعليًا بدل الإلغاء اللاحق؛ الأتمتة التي تدفع مباشرة إلى main تتوقف وتحتاج PR.

## 5) يدويًا من يوسف فقط
- متغيرات Vercel وGroq ZDR.
- بطاقة الخصوصية (App Privacy) وملاحظات المراجعة في App Store Connect (الميكروفون: تسميع على الجهاز).
- دمج #2742 إن لم يندمج تلقائيًا.
- قرار هجرات البحث العربي وتفعيل ruleset.
