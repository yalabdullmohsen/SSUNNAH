# حقل `sources` في بيانات iOS (للذيل الموحّد عند ن1)

**الاسم:** `sources` — مصفوفة داخل السجل (مثال: كل معلم في `sirah/islamic-landmarks.json`).

**البنيات الموجودة فعليًا ونص العرض لكل منها** (القاعدة في `scripts/native-sources-display.mjs` وتُنقل حرفيًا إلى `SourceRef` في Swift):

| البنية | نص العرض | `url` |
|---|---|---|
| `{ref, url?, type?, quote?, fetched?, verified?}` (معيارية؛ المعالم كلها منها) | `ref` | رابط يُفتح إن وُجد |
| `{author, book, locator}` | «المؤلف، الكتاب، الموضع» | غير موجود (مرجع ورقي) |
| `{author, book, ref}` | «المؤلف، الكتاب، ref» | غير موجود |
| `{title, author?}` | «title، author» | غير موجود |
| `{id, name_ar, platform, url, post_url}` (مصادر المقاطع/الحسابات) | «name_ar، platform» | `post_url` ثم `url` |

- `url` اختياري للمراجع الورقية؛ الذيل يعرض النص دائمًا، ورابطًا فقط إن وُجد.
- الحقل المطلوب في كل بنية هو ما يُركّب منه نص العرض (لا يقل عن 2 حرفين)؛ عنصر بلا نص عرض خطأ.
- المعالم (`sirah/islamic-landmarks.json`): الأصل في الملف الجانبي `docs/native/sirah-sources/islamic-landmarks.json` (معرّف السجل ← قائمة عناصر معيارية).
- لا تُوحَّد البيانات الآن (آلاف السجلات ومفكّكات Swift)؛ التوحيد في طبقة العرض فقط.

**الاختبار:** `node --test scripts/native-sources-display.test.mjs` يفشل عند أي سجل في `ios-native/Data` مصدره فارغ أو غير مفهوم.

**الحارس:** `node scripts/native-sources-shape-guard.mjs` — يفشل إن زاد غير المعياري في قسم عن سقفه، أو إن وُجد عنصر غير معياري في المعالم (`sirah/islamic-landmarks.json` معياري 100%).
