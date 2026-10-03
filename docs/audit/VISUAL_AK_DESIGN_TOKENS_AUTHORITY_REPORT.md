# Visual AK — سلطة توكنات التصميم الموحّدة

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave` · PR #2491

## الهدف

تحويل كل معايير التصميم المعتمدة إلى مصدر سلطة واحد قائم على التوكنات.
كل قرار بصري ينطلق من مسارات منطقية → طبقات `sf` / `mj` / `ss` فقط.

## Exit

`DESIGN_TOKENS_AUTHORITY_ACTIVE` · `TOKEN_COMPLIANCE_ENFORCED` · `VISUAL_SYSTEM_UNIFIED` · `DESIGN_GOVERNANCE_AUTOMATED`

## المخرجات

| Artifact | Path |
|---|---|
| وثيقة السلطة | `docs/design/DESIGN_TOKENS_AUTHORITY.md` |
| كتالوج آلي | `artifacts/majalis/src/lib/design-tokens-authority.ts` |
| تصدير JSON | `artifacts/majalis/reports/design-tokens-authority.json` |
| تقرير الامتثال | `docs/audit/TOKEN_COMPLIANCE_REPORT.md` |
| سكربت التدقيق | `artifacts/majalis/scripts/token-compliance-report.mjs` |
| بوابة CI | `test:design-tokens-authority` (ضمن `test:design-governance`) |

## مجموعات التوكنات (101 مسار)

ألوان · طباعة · تباعد · أحجام · زوايا · ارتفاع · حدود · نقاط كسر · مكوّنات (بطاقة/زر/نموذج/جدول/قائمة/مودال/تبويب/تنقل/بحث/فلتر/حالة).

## الإنفاذ

- لا ألوان/زوايا/ظلال/تباعد/طباعة جديدة خارج الكتالوج.
- إشارات الدين عبر `visual-system-inventory` (hex / boxShadow / borderRadius).
- الهجرة: أي عمل بصري لاحق يمر عبر `DESIGN_TOKENS_AUTHORITY`.

## القياس (وقت الدفع)

| Signal | Current | Ceiling |
|---|---:|---:|
| hexInCss | 7022 | 7022 |
| boxShadowDecls | 1026 | 1026 |
| borderRadiusPxDecls | 456 | 456 |
| DESIGN_CONSISTENCY_SCORE | 100 | — |

## Non-claims

لا UNIFIED_100 · لا عائلة توكن جديدة · لا إعادة كتابة كل hex في الصفحات · Mushaf/Prayer/Admin SPECIAL_CASE محفوظة.
