# الشروح التفاعلية (ExplainerTemplate)

الملفات: `artifacts/majalis/public/data/explainers/*.json` → تُصدَّر إلى `ios-native/Data/sirah/explainers.json` (لا يُصدَّر إلا `review_status:"verified"`).

الجذر: `id`, `title`, `kind:"stages"`, `review_status`, `updated_at`, `scope_note`, `stages[]`.

كل مرحلة (مرتّبة بـ`order` من 1):

| الحقل | المعنى |
|---|---|
| `id` | فريد عبر كل الشروح |
| `title` | عنوان قصير |
| `body` | شرح من جملتين أو ثلاث، بلا مصطلح علمي حديث إلا بنص مصدر |
| `ayahRef` | مراجع فقط `[{surah,from,to}]` (من ≤ إلى)، والنص يُجلب من بيانات المصحف؛ ممنوع ﴿ ﴾ |
| `sources` | غير فارغ؛ كل عنصر له نص عرض بقواعد `SOURCES_FIELD.md` ({author,book,locator} أو {ref} أو {title}) |
| `illustrationBrief` | جملة وصف تعليمي للرسم |
| `views` (اختياري) | قولان `[{text,source}]` عند الخلاف، بلا ترجيح |

الاختبار: `node --test scripts/native-explainers.test.mjs` — يفشل عند نقص حقل أو مصدر، أو ayahRef غير صالح، أو ﴿﴾، أو تكرار نص بين المراحل/الشروح.
