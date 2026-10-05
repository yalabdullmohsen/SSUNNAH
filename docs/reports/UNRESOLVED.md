# بنود مفتوحة

آخر مراجعة: 2026-10-05 على `main` @ `a6038f36` — typecheck وlint وbuild و`pnpm run test` كلها ناجحة، ولا PRs ولا issues مفتوحة.

| بند | الحالة | ملاحظة |
|---|---|---|
| Lighthouse جوال ≥90/95 قياس حي | مفتوح | قياس على الإنتاج يدويًا خارج CI |
| اهتزاز على الويب iOS | خارج النطاق | Vibration غير مدعوم في Safari؛ Capacitor haptics فقط |

## أُغلق

- تنقّل iPad ≥880px: شريط الأقسام العلوي بديل الشريط السفلي (`src/lib/nav-breakpoint.ts`).
- لقطات مصفوفة الأجهزة: `tests/mushaf-display-mode.spec.ts` (iPhone/iPad).
- مصحف أفقي صفحتان: مُستبعَد بقرار — صفحة واحدة مثبَّتة ببوابة `mushaf-single-page-viewport-gate`.
