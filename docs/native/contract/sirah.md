### sirah (10 ملفات في `Data/sirah/`)
- مصفوفات بالشكل الحرفي للمصدر، بعد حذف المحجوز: `islamic-landmarks`, `nations`, `sahabah` (مضمَّنة في الصفحة؛ `quote` لا يُعرض).
- بمرشحات القبول: `occasions-verified` (سجل موثّق مطابق لبذرة بـ`reviewStatus=approved` ومصدر)، `prophets-knowledge` (`review_status=verified` + مصادر)، `stories` (is_approved + مصادر كما يعرضها الموقع؛ الـ471 غير `reviewed` تحريريًا تُصدَّر الآن بقرار المالك 2026-10-12 — الموقع لا يعرض هذه الحالة)، `islamic-history` (لا `needs-review` ولا بلا مصادر).
- فارغة عمدًا (`[]`) لغياب مصدر/درجة في الويب وقرار المالك: `fikr-waqia`.
- `seerah-phases` (12 مرحلة: `id,num,title,year,desc,topics[],keyEvents[]`) و`seerah-sources` (10 نصوص) من صفحة `/seerah`، و`shamail` (4 تبويبات `id,label,abwab[]`: khalq/khuluq/sira أبوابها `{id,title,icon,hadiths[{text,rawi,source}]}`، وmahabbah أبوابها `{title,text,source,rawi?}`) و`shamail-facts` (10 `{label,value}`) من صفحة `/shamael`: محتوى ثابت في كود الموقع يُمرَّر حرفيًا كما تعرضه الصفحة، بلا درجة ولا مصدر مضاف (حقل `source` لكل حديث/باب هو ما في الموقع).
- `prophets-lineage` لا يُكتب (جذر واحد لا قائمة، ولا عقدة فارغة صالحة): غيابه = «قيد التوثيق».
