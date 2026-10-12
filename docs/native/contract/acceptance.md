## 5) قواعد القبول (يفرضها السكربت)
1. المحجوز: أي `id` في `content/content-hold.json` يُستبعد من كل مجموعة.
2. الحديث: لا يدخل `daif`/`mawdu`/بلا درجة؛ نص ومصدر ودرجة إلزامية.
3. الأسئلة: ليس demo، لها `question`+`answer`+`explanation`+`reference` و`documentation_status≠unsourced`.
4. الأذكار: `verification_status=verified` ودرجة ومصدر وغير محذوف.
5. القرآن: 114 سورة، 6236 آية، أرقام متسلسلة، لا نص فارغ؛ نسخ بايتي.
6. المنافيست يسجّل العدّادات والمرفوض وsha256؛ `--check` يحسب دون كتابة.
