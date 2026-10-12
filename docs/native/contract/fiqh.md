### fiqh (18 ملفًا في `Data/fiqh/`)
- `books` `{version,generatedAt,madhhab,books:[…]}` و`book-aliases` `{aliases:[…]}` من `content/fiqh/*.json`؛ الدرس/الباب/الكتاب المحجوز يُحذف (الآن `hajj-arkan-arafa`، فيزول تكرار `needsReview`)، والمرادفات تُرشَّح لتبقى أهدافها موجودة.
- `guides/<slug>.json` (jumuah, nikah, riba, ruqya, sadaqa, talaq, udhiya, waqf): كائن `FiqhGuideSection` كما هو، بعد حذف البطاقات المحجوزة.
- مصفوفات: `madhahib`, `maqasid-sharia`, `prayer-ranks`, `usul-topics`, `prophetic-medicine`.
- `sins-and-rights` `{topics,categories}` و`amr-bil-maruf` `{levels,conditions,munkaraat,maaruf}`.
- تمرير حرفي من مصدر الويب؛ لا إعادة صياغة ولا حقول جديدة. المسارات الـ17 المكتوبة داخل JSX (`/tahara` `/sawm`…) خارج هذا الـPR (تحتاج نقل نص إلى وحدة بيانات أولًا).


- ملفات `ContentItem[]` المتبقية (21): مشتقة من `books.json` المنشور وبطاقات البوابة/الأصول — `fiqh-books` (الكتب)، `fiqh-topics`+`fiqh` (بطاقات البوابة)، `fiqh-usul`، وأبواب كتاب لكل من `tahara`(taharah) `salah-guide`(salah) `zakat` `sawm` `hajj` `janaza` `mawarith`(wasaya-faraid) `family`(nikah) — الربط تقدير في `sections/fiqh-rest.mjs` يغيّره المالك إن شاء. **فارغة عمدًا بالشكل نفسه `[]`**: `arkan` `arkan-iman` `fadail-aamal` `sujood-sahw` `tawba` (JSX مضمَّن بلا مصدر مراجَع)، `fiqh-qawaid` `worship` `mawarith-calculator` (حاسبة/شاشة)، `prayer-times` (محمي، لا يُصدَّر).
