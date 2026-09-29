# Critical CSS 60KiB — Closure Report

## STATUS

**COMPLETE** — `CRITICAL_CSS_CLOSED` (القياس الفعلي ≤ 61 440 بايت gzip)

وحدة القياس الرسمية للبوابة: **بايت gzip level 9**، والسقف **60 × 1024 = 61 440**.  
KiB أدناه = بايت ÷ **1024** فقط. لا تخلط مع kB العشري (÷1000).

## ROOT CAUSE

Critical `index-*.css` تجاوز السقف على `10389211` بسبب طبقات sync في `main.tsx` + `index.css`، منها:

1. `ssunnah-screen-patterns.css` داخل الحرج رغم كسل الشاشات.
2. بقايا محددات `.soft-card` بعد تقاعد المنتج.
3. (موجة الهامش #2362) تكرار ألوان calm، breadcrumbs/settings في الحرج، وقواعد fiqh ميتة.

## UNIT CLARITY (تصحيح التناقض الظاهر)

| Label مضلّل شائع | الحساب الخاطئ | الصحيح |
|---|---|---|
| «61.2 KiB» بعد #2361 | 61 216 ÷ **1000** ≈ 61.2 **kB** | 61 216 ÷ **1024** = **59.781250 KiB** |
| «61.8 KiB» قبل الإصلاح | 61 820 ÷ **1000** ≈ 61.8 **kB** | 61 820 ÷ **1024** = **60.371094 KiB** |

التقرير السابق خلط kB العشري مع تسمية KiB؛ البوابة كانت PASS لأن المقارنة بالبايت (`≤ 61440`) صحيحة.

## BEFORE (failing tip قبل #2361)

| | |
|---|---|
| Tip | `10389211` |
| CSS file | `index-Byoj7yxl.css` |
| Raw | 338 428 B |
| Gzip (level 9) | **61 820** B (= **60.371094 KiB**) |
| Budget | **61 440** B (60 KiB) |
| Overage | **+380** B |

## AFTER — PR #2361 (مدموج على main = `be9e05cce`)

قياس clean build من working tree نظيف (dist محذوف مسبقاً) على `be9e05cce`:

| | |
|---|---|
| CSS file | `index-Brfaq9bz.css` |
| Raw | **335 436** B |
| Gzip (level 9) | **61 216** B |
| Gzip KiB (÷1024) | **59.781250 KiB** |
| Budget | 61 440 B |
| Safety margin | **+224** B تحت السقف |
| Gate | PASS (`61216 ≤ 61440`) |

هامش #2361 ضيّق (224 B) — لذلك فُتحت موجة الهامش #2362.

## AFTER — PR #2362 (هامش أمان؛ tip `dad2a3dd5`)

قياس clean build (dist محذوف مسبقاً):

| | |
|---|---|
| CSS file | `index-BTVH112N.css` |
| Raw | **328 070** B |
| Gzip (level 9) | **60 026** B |
| Gzip KiB (÷1024) | **58.619141 KiB** |
| Budget | 61 440 B (**لم تُرفع**) |
| Safety margin | **+1 414** B تحت السقف |
| Cut vs #2361 tip | ≈ −1 190 B gzip إضافية |
| Cut vs قبل #2361 | ≈ −1 794 B gzip |

### تغييرات #2362

| File | Change | Reason | Risk |
|---|---|---|---|
| `sections-calm-polish.css` | حذف `:root` ألوان مكررة؛ إبقاء radius + `--surface-soft`/`--shadow` | DUPLICATED | Low |
| `interaction-states.css` + `index.css` | نقل breadcrumbs إلى `topic-page.css` | ROUTE_SPECIFIC | Low |
| `topic-page.css` | امتصاص chrome المسارات (بلا ملف CSS جديد) | سقف cssFiles=359 | Low |
| `index.css` | حذف settings المكررة + fiqh/platform الميتة | ROUTE / DEAD_PROVEN | Low |
| `PrivacyCenterPage.tsx` | استيراد `settings.css` | يستخدم settings-note/actions | Low |

## FOUC / THEME

| Surface | Result |
|---|---|
| Home | theme/shell sync؛ screen-patterns مع ScreenShell |
| Search / Quran Hub / Lessons / Hadith | CSS المسار مع الـchunk |
| Prayer / Mushaf | منطق/مقاييس غير ممسوسة |
| Dark / System | `dark-mode-recovery` يبقى sync |
| RTL | غير ممسوس |
| Settings / Privacy | `settings.css` مع المسار |

## TESTS AND GATES

| Command / gate | #2361 (`be9e05cce`) | #2362 (`dad2a3dd5`) |
|---|---|---|
| Clean `pnpm --filter @workspace/majalis run build` | PASS | PASS |
| `critical-css-gzip-gate` | **PASS** (61216) | **PASS** (60026) |
| `visual-system-debt-budget` | PASS (على tip الدمج) | PASS (cssFiles=359) |
| `verify:preflight` | PASS (CI merged) | (هذا التشغيل) |
| `verify:ci` | PASS (CI merged) | (هذا التشغيل) |
| `release:verify` | PASS على tip الإغلاق السابق | (هذا التشغيل) |
| Contrast / Mushaf / Prayer | ضمن verify:ci على الدمج | ضمن verify:ci |

`release:verify` يستهلك `dist` الناتج من البناء الحالي لنفس الـtip (لا يعيد استخدام artifact قديم عند حذف `dist` قبل البناء).

## PERFORMANCE

| Metric | #2361 | #2362 |
|---|---:|---:|
| Critical CSS gzip | 61 216 B | 60 026 B |
| Margin under 61 440 | 224 B | 1 414 B |
| Budget raised? | no | no |
| Measurement changed? | no (`gzipSync` L9) | no |

## REGRESSIONS

لا `!important` جديدة · لا hex/token family جديدة · لا تحديث snapshots لتغطية regression · سقف cssFiles غير مرفوع.

## PR

| | #2361 | #2362 |
|---|---|---|
| Branch | `cursor/critical-css-60k` | `cursor/critical-css-60k-margin` |
| Merge commit / tip | `be9e05cce` (squash → main) | `dad2a3dd5` |
| Status | **MERGED** 2026-09-29 | OPEN · auto-merge |

## PRODUCTION

| | |
|---|---|
| main @ verification | `be9e05cce` (#2361) |
| version.json / deploy | يُحدَّث بعد نشر #2361 ثم #2362 |
| Smoke | بعد استقرار Auto Deploy |

## FINAL STATE

- القياس الفعلي على #2361 تحت السقف → يصحّ `CRITICAL_CSS_CLOSED` بالبايت.
- تسمية «61.2 KiB» في الملخصات السابقة **غير صحيحة** كـKiB؛ الصحيح **59.781250 KiB**.
- #2362 يوفّر هامش أمان حقيقي (+1 414 B) ويُفضَّل دمجه قبل اعتبار الهامش مستقراً.
