# جرد المحتوى — ن7 (2026-10-10)

الأرقام الآلية للملفات: `AUDIT_REPORT.md` (يُولَّد بـ `scripts/content-audit/run.mts`). أرقام القاعدة لقطة قراءة فقط من الإنتاج بتاريخ الجرد.

## ملفات (public/data + seeds)
| النوع | المكان | العدد | بمصدر | الحالة |
|---|---|---:|---|---|
| قرآن | public/data/quran/surah-*.json | 114 سورة | مصحف محمي | محمي، لا يُمسّ |
| تفسير السعدي/الميسر | public/data/tafsir | 114+114 | نعم (مؤلف) | لا إعادة صياغة |
| الصحيحان (مدوّنة) | public/data/hadith | 7580 + 7360 | مصدر المجموعة fawazahmed0@1 | يلزم تحقق تراخيص/مطابقة |
| حديث موثّق | public/data/hadith-verified | 1740 (364 ضعيف/موضوع في ملفات daif/mawdu) | 100% | يُعرض بحكمه فقط |
| أذكار | src/lib/adhkar-seed.ts | 325 (15 ضعيفة الدرجة تُستبعد) | 100% حقل مصدر/مرجع | adh-import-% في importBundle (ن1) |
| فوائد | src/lib/fawaid-seed.ts | 641 | 100% | pending تحقق فعلي |
| أسئلة وأجوبة | public/data/qa | 2295 | 99.9% | 3 بلا مرجع |
| قصص | public/data/stories | 479 | 100% | — |
| اختبارات | public/data/quiz | 8491 | 77.5% (1914 بلا مرجع) | يلزم إكمال |
| دروس (chunks) | public/data/lessons | 82 | 0% | بلا مصدر |
| فقه | content/fiqh + src/lib/fiqh | راجع AUDIT | — | طابور FIQH_CONTENT_QUEUE |
| إيقاف عرض | content/content-hold.json | 8 | — | ن1 لم يضف 51 ذكرًا/325 درسًا بعد |

## قاعدة البيانات (الإنتاج ngmvm…، قراءة فقط)
| الجدول | الصفوف | بمصدر | الحالة |
|---|---:|---|---|
| sharia_rulings | 690 | 653 | 223 approved/approved؛ 467 verification pending (37 بلا مصدر) |
| lessons | 325 | 8 | كلها approved + needs_review؛ 317 بلا مصدر |
| qa_questions | 370 | 370 | 365 verified، 5 needs_review |
| quiz_questions | 958 | 34 | كلها منشورة وverified=false؛ 924 بلا مصدر |
| verified_hadith_items | 342 | 342 | 333 verified، 9 duplicate |
| dawah_questions | 85 | 0 | منشورة، 38 غير معتمدة، كلها بلا مصادر |
| fiqh_council_issues | 64 | غير معروف | منشورة (ن1: شارة «غير موثّق بعد») |
| islamic_stories | 62 | 62 | معتمدة |

## أولويات الخطر (للمراجعة الأولى)
1. dawah_questions: 85 منشورة بلا مصدر (38 غير معتمدة) — ن1 مكلّف بالتعليق؛ تحقق بعد الدمج.
2. quiz_questions DB: 924 بلا مصدر وغير موثّقة.
3. sharia_rulings: 430 pending لها مصدر + 37 بلا مصدر وهي approved.
4. lessons: 317 بلا مصدر (ن1: needs_review).
