---
name: rtl-a11y-contrast
description: RTL والتباين وإمكانية الوصول. استخدمها عند أي تغيير واجهة أو لون أو نص لتتحقق منه فاتحًا وداكنًا وRTL.
---

# RTL والتباين وa11y
- التباين ≥ 4.5:1 للنص و3:1 للكبير، فاتحًا وداكنًا: `test:color-contrast-gate` (`scripts/verify-color-contrast-gate.mjs`)، `test:on-brand-contrast`، `test:design-token-contrast-aa`، `audit:color-contrast`. خط الأساس: `docs/CONTRAST_BASELINE.md`.
- axe: `.github/workflows/a11y-axe.yml`؛ الواجهة داخل منطقة آمنة وRTL، والمصحف بنص عثماني في aria-label (`docs/KNOWN_PITFALLS.md` البند 6، والبند 12: البوابات على 390×844 فقط).
- كل تغيير هوية يُتحقق منه: فاتح، داكن، System، RTL، تحديث، تشغيل بارد، وجوال (iPhone SE 375×667 لا تغطيه البوابات).
- الأرقام لاتينية؛ لا ألوان/px بصرية حرفية (انظر design-system-tokens).
