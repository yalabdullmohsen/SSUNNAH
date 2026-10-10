---
name: performance-budgets
description: الأداء وسقوف الحزمة وLighthouse. استخدمها عند إضافة اعتماد أو شاشة أو تغيير يمس حجم الحزمة أو زمن الإقلاع.
---

# الأداء
- السقوف: `check:performance-budget` (`scripts/check-performance-budget.mjs`)، `test:bundle-budget`، `test:lhci-budget`، `test:performance-excellence`؛ LHCI في `.github/workflows/lhci-key-pages.yml` و`lighthouserc.cjs` (`lighthouse:ci`).
- المراجع: `docs/PERFORMANCE_GUIDELINES.md` و`docs/PERFORMANCE_BASELINE.md` و`docs/performance/` (إقلاع، CSS حرج، LHCI). لا مكتبات جديدة بلا مبرر قوي.
- فشل LHCI على key pages قد يكون ضجيجًا: اقرأ سجل الفشل الفعلي قبل الإصلاح ولا rerun أعمى؛ السقوف لا تُرفع.
