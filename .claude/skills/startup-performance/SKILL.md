---
name: startup-performance
description: الأداء وسرعة الإقلاع ومنع الوميض (flicker) وسقوف الحزمة. استخدمها عند أي تغيير يمس الإقلاع أو الخطوط أو CSS الحرج أو حجم الحزمة أو شاشة الإطلاق.
---

# الأداء

- القاعدة والخطوط الأساسية: `docs/performance/PERFORMANCE_BASELINE.md`، `ROUTE_STARTUP_MATRIX.md`، `REAL_STARTUP_FLICKER_ROOT_CAUSE_REPORT.md`، `STARTUP_AND_DARK_MODE_ROOT_CAUSE.md`، `IOS_NATIVE_SPLASH_CONTRACT.md`، و`docs/PERFORMANCE_GUIDELINES.md`.
- بوابة الحزمة: `pnpm --filter @workspace/majalis run test:bundle-budget` (لا seeds ضخمة في نقطة الدخول). السقوف تُخفَّض ولا تُرفع.
- الخطوط: خط واحد للواجهة (Almarai) وخطوط المصحف تُحمَّل عند الحاجة (`FONT_LOADING_STRATEGY_REPORT.md`)؛ تجنب الوميض بتحميل مسبق وfallback متقارب القياسات.
- قِس قبل وبعد (LHCI/إقلاع بارد) وسجّل الرقم؛ لا تدّعِ تحسنًا بلا قياس.
- فاتح/داكن وSystem وتحديث وتشغيل بارد في كل تغيير يمس الهوية أو الإقلاع.
