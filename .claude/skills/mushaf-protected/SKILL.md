---
name: mushaf-protected
description: المصحف: الصفحات الـ604 وخطوط QPC وقواعد عدم المساس. استخدمها قبل أي تعديل في عرض المصحف أو بياناته.
---

# المصحف (محمي)
- لا يُمسّ: نص القرآن وتشكيله وترقيمه، الصفحات الـ604 وسطورها الـ15، page mapping، خطوط QPC (`.claude/rules/protected-content.md`). القفل: `verify:protected-quran-byte-lock`، و`verify:quran-data`، و`verify:quran-pages`.
- اقرأ قبل أي تعديل: `docs/KNOWN_PITFALLS.md` (لا SVG بديل للمجسم، لا overflow:hidden رأسي، بوابات على `[data-page-state="active"]`)، `docs/MUSHAF_SPEC.md`، `docs/mushaf/MUSHAF_PROTECTED_ASSET_MANIFEST.md`.
- بوابات السطور: `test:mushaf-line-grid` و`test:mushaf-line-integrity` و`test:mushaf-visual-snapshot` (سكربتات `scripts/mushaf-madinah/`). عدة بوابات واجهة المصحف معطّلة بنصّ skipped في package.json؛ لا تفترض أنها تعمل.
- الآيات تُعرض من بيانات المصحف فقط؛ المحتوى الشرعي الجديد عبر مهارة sharia-content.
