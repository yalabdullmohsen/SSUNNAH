### aqidah (20 ملفًا في `Data/aqidah/`)
- الشكل: عناصر `{id,title,summary?,body?,reference?,...}` بحقول اختيارية تُحذف إن خلت؛ الملفات المجمَّعة (adab-talab-ilm, akhlaq, hikam-salaf, janna-naar, malaika, raqaiq, alamat-saah) مجموعات `{id,title,items:[...]}`.
- المحجوز (`content-hold.json`) مستبعد من كل ملف، وتُسجَّل الرفوض في المنافيست.
- `asma-husna`: تُرفض العناصر `documentation_status=unsourced` (91 من 99).
- `islamic-sects`: `[]` **فارغ عمدًا** — لا سجل منشور (كلها NEEDS_SOURCE/NEEDS_HISTORICAL_REVIEW/NEEDS_SHARIA_REVIEW/CONFLICTING_SOURCES).
- الشبهات وأدلة الدعوة (`discover-islam-questions/doubts`): كل آية قرآنية تُطابَق حرفيًا مع Tanzil (اسم السورة+الرقم+النص، والاقتباس المقطّع بـ`...` قطعةً قطعة)؛ ما لا يتحقق يُرفض (doubts: 1 من 12).
- `discover-islam-articles/new-muslim`: تُمرَّر كما هي دون أدلة.
