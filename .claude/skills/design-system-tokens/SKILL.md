---
name: design-system-tokens
description: نظام التصميم الموحّد --sn-* ومكوّناته. استخدمها عند بناء أو تعديل أي شاشة أو مكوّن أو لون.
---

# نظام التصميم
- المصدر الوحيد للقيم البصرية: `artifacts/majalis/src/design-system/` (`design-system.css` والمكوّنات `primitives.tsx` و`surfaces.tsx` و`Icon.tsx`... والتوكنات `--sn-*` في `src/styles/tokens.css`). التفاصيل في `.claude/rules/design-system.md`.
- لا hex/rgb/px بصري خارجها في الشاشات الجديدة؛ الخطوط من `styles/font-system.css` فقط (`--font-ui`، `--font-text`، `--font-quran`)؛ الذهبي `--sn-accent` ثانويًا نادرًا.
- حذف CSS (SAFE_REMOVE): مستهلكون = 0 ولا صنف ديناميكي ولا اختبار يفرض القديم ثم visual-snapshot + contrast + build.
- البوابات: `test:ui-ratchet`، `test:visual-system-debt-budget`، `test:visual-system-authority`.
