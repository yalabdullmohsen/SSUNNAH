# Visual AL–AP — صقل قابل للقياس (Polish Consistency)

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave` · PR #2491

## الأولويات المنفَّذة

| Phase | Goal | Exit |
|---|---|---|
| **AL** | توحيد حالات التفاعل | `INTERACTION_SYSTEM_UNIFIED` |
| **AM** | قياس تبنّي مكوّنات السلطة | `AUTHORITY_ADOPTION_PERCENTAGE` |
| **AN** | درجة اتساق قابلة للقياس على كل PR | `DESIGN_CONSISTENCY_SCORING` |
| **AO** | توحيد تجربة الأدمن | `ADMIN_UI_STANDARDIZED` |
| **AP** | خطة تبسيط الرحلات | `USER_JOURNEY_SIMPLIFICATION` (plan) |
| + | معيار الحالات الفارغة | `EMPTY_STATE_EXCELLENCE` |

## المخرجات

| Artifact | Path |
|---|---|
| Interaction map | `docs/design/INTERACTION_AUTHORITY_MAP.md` |
| State tokens | `src/lib/interaction/tokens.ts` → `INTERACTION_STATE_AUTHORITY` |
| Coverage script | `scripts/authority-coverage-report.mjs` |
| Coverage report | `docs/audit/AUTHORITY_COVERAGE_REPORT.md` |
| Consistency score | `reports/DESIGN_CONSISTENCY_SCORE.json` + `docs/audit/DESIGN_CONSISTENCY_SCORE.md` |
| Admin map | `docs/design/ADMIN_UI_AUTHORITY_MAP.md` |
| Empty standard | `docs/design/EMPTY_STATE_STANDARD.md` |
| Journey plan | `docs/audit/USER_JOURNEY_OPTIMIZATION_PLAN.md` |
| Gate | `test:polish-consistency` |

## ما الذي أصبح قابلاً للقياس؟

- **consistencyScore** (0–100) = خرائط + دين + صحة توكن + adoption
- **driftScore** = 100 − consistency
- **authorityAdoptionRatio** من تغطية المكوّنات
- **topDivergenceSources** + **easiestWins** في كل تشغيل حوكمة

### قياس وقت الدفع

| Metric | Value |
|---|---:|
| consistencyScore | **88** |
| driftScore | **12** |
| AUTHORITY_ADOPTION_PERCENTAGE | **41%** |

أكبر مصادر التشتت: cards (9%) · forms (5%) · tabs (3%) · lists (10%).  
أسهل مكاسب: tables (14 ملف) · navigation/modals (1 لكل).

## المؤجَّل (موصى به لاحقًا)

- MOBILE_FIRST_REVIEW (أدلة جهاز)
- VISUAL_CERTIFICATION scorecard النهائي بعد امتصاص easiest wins
- قياس نقرات الرحلات (DEVICE_REQUIRED)

## Non-claims

لا UNIFIED_100 · لا خفض أسقف دين إلا بامتصاص حقيقي · SPECIAL_CASE محفوظ.
