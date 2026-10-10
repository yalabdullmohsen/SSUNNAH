---
name: ci-local-gates
description: بوابات CI المحلية وسقوف الدين ومنع تكرار الأخطاء. استخدمها قبل أي push أو عند فشل بوابة (ratchet/budget/--check) أو عند إضافة اختبار.
---

# بوابات CI المحلية
- `pnpm run ci:local` (من `artifacts/majalis`): يشغّل بوابات السقوف المأخوذة من `repo-gates` في `.github/workflows/ci.yml` + الاختبارات المتأثرة بملفاتك؛ `-- --full` = مطابق لـCI، `-- --plan` يطبع الخطة. المصدر: `scripts/ci-local.mjs` و`scripts/ci-local-plan.mjs`.
- تثبيت الـhook مرة واحدة: `bash scripts/install-ci-local-hook.sh`. الفشل يوقف الدفع؛ لا `--no-verify` ولا تعطيل أي بوابة.
- سقوف الدين: `artifacts/majalis/reports/visual-system-debt-budget.json` و`interaction-system-debt-budget.json` (`test:visual-system-debt-budget`، `test:interaction-system-debt-budget`)، و`scripts/ui-ratchet.mjs` + `ui-ratchet-baseline.json`. تُخفَّض بعد قياس حي ولا تُرفع.
- اختبار جديد يمرّ بسجل البوابات (`test:registered-gates`، `test:lib-orphans` داخل `test:ci-unit`). لا اختبار مصدري يثبّت اسم مكوّن (`scripts/ui-legacy-list.mjs`).
- فشل متكرر: أصلح السبب الجذري وأضف بوابة تمنع عودته، وسجّل الفخ في `docs/KNOWN_PITFALLS.md`.
