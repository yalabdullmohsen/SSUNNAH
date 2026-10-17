# قواعد الواجهة (iOS الأصلي)

## لا آية بخط النظام
- أي نص قرآني (آية، مدى آيات، ﴿…﴾) يُعرض عبر `QuranAyahText` (أو `MushafAyahText` داخل المصحف) فقط: خط المصحف QPC نفسه وترتيب العلامات نفسه.
- المصدر مرجع `(surah, from, to)` لا نص ملصوق؛ الصيغة الموحدة للمدى «6–7» (`QuranAyahRange.parse`)، والجلب `MushafSearch.ayahs(surah:from:to:)`.
- ممنوع `Text(...)` لنص قرآني خارج المكوّن؛ يفشل `QuranTextOnlyViaComponentGuardTests` (سقف ratchet يُخفَّض ولا يُرفع).
- المكوّن يعرض الآية كاملة افتراضيًا؛ القصّ (`collapseAbove`) للقوائم فقط.
