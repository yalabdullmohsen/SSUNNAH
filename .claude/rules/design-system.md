# نظام التصميم والهوية

- Tailwind غير مستورد: التنسيق CSS يدوي بتوكنات `--mj-*`/`--sf-*`. لا عائلة توكن جديدة، ولا نظام أزرار أو بطاقات جديد («بطاقات v3» ممنوع).
- لا hex/rgb/hsl/`!important`/style مضمّن **جديد**، ولا إخفاء عيب بـ `overflow:hidden` أو `!important`. العدّادات تحسب النص حرفيًا حتى داخل التعليقات.
- سقوف الدين (`reports/*-debt-budget.json`) تُخفَّض فقط بعد قياس حي، ولا تُرفع أبدًا. لا تعطيل visual-snapshot أو must-not-skip أو بوابات التباين.
- الأزرار: السلطة `components/ui/button.tsx` + IconButton + ActionButton. لا Link↔Button، ولا div/span قابل للنقر إن وُجد عنصر دلالي.
- كل تغيير هوية يُتحقق منه فاتحًا وداكنًا وSystem وRTL وتحديثًا وتشغيلًا باردًا.
- حذف CSS (SAFE_REMOVE): مستهلكون = 0، ولا صنف ديناميكي، ولا اختبار يفرض القديم، ثم visual-snapshot + contrast + build ناجحة.
