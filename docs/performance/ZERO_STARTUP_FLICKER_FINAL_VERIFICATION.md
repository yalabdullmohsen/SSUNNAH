# ZERO STARTUP FLICKER — Final Verification

| Field | Value |
|-------|-------|
| Baseline execution | `docs/performance/ZERO_STARTUP_FLICKER_EXECUTION_REPORT.md` |
| Prior verdict | `STARTUP_FLICKER_PARTIALLY_FIXED` |
| Local evidence | `docs/performance/evidence/zero-startup-flicker-final-local/` |
| Tooling | Chrome headless + CDP/Puppeteer-core · viewport **390×844 @2x** · cache disabled |
| Branch | `cursor/zero-startup-flicker-final` |

> لا RCA جديد. هذا تقرير إغلاق نهائي + إعادة قياس فقط.

---

## 1) Remaining blockers before this fix

من تقرير التنفيذ (PARTIAL):

1. Deferred CSS volume — Home sheets ~4→111  
2. React chrome presence mount — header/bottom/hero `false→true`  
3. Theme class mutation = 1 بعد FP (`app-booting` remove)  
4. Deferred identity layers ما زالت تُحمَّل بعد idle  

---

## 2) Files changed

| Area | Files |
|------|--------|
| Boot / theme mut=0 | `artifacts/majalis/index.html`, `public/mj-launch-splash-boot.js`, `ios/.../mj-launch-splash-boot.js`, `src/lib/app-shell-stability.ts`, `src/components/HeaderTicker.tsx` |
| Chrome skeleton FP | `index.html` (`#mj-startup-chrome`), `critical-first-paint.css` |
| Deferred seal | `m2030/foundation.css`, `final-release.css`, `pages/profile-hub-v2.css` |
| Home graph | `src/main.tsx` (route-gated deferred + dark-only night layers) |
| Gates / CSP | `zero-startup-flicker-gate`, `startup-shell-stability-gate`, `bottom-nav-safe-area-green`, `vercel.json` |
| Docs | هذا الملف + evidence final-local |

---

## 3) Deferred CSS reduction

| Route | PARTIAL (v6) sheets | FINAL (local) sheets | Δ final |
|-------|--------------------:|---------------------:|--------:|
| Home | 4→111 | **4→104** | −7 |
| Search | 4→74 | **3→70** | −4 |
| Quran Hub | 3→78 | **3→74** | −4 |
| Mushaf | 3→58 | **3→52** | −6 |
| Prayer | 3→59 | **4→53** | −6 |

آليات الخفض (بدون mega-bundle / بدون رفع budget):

- لا تحميل طبقات الليل على الثيم النهاري  
- توجيه مسار: `index-deferred-pages` / reading shells / `islam-intro` / `m2030/pages` خارج Home  
- ختم كتّاب html/body/#root في foundation + final-release  

### DEFERRED_CSS_CONSUMER_MATRIX

| File | Class | Action |
|------|-------|--------|
| `#mj-lcp-critical` / `critical-first-paint.css` | CRITICAL_TO_FIRST_PAINT | Winner shell |
| `theme.css` / `typography-scale` / `index.css` | CRITICAL_TO_FIRST_PAINT | Font + canvas |
| `theme-aliases` / `visual-identity-unify` | CRITICAL_TO_FIRST_PAINT | Bridges → `--mj-*` |
| `design-system` / `final-release` | AFTER_IDLE_SAFE (body/#root sealed) | Component/route only |
| `m2030/foundation` | AFTER_IDLE_SAFE (html/body paint removed) | layout min-height only |
| `m2030/navigation` | KEEP_JUSTIFIED | nav chrome tokens |
| `card-system*` / editorial* / green-surface / unify | AFTER_IDLE_SAFE | cards after idle; no body |
| `index-deferred-pages` / reading-* / islam-intro | ROUTE_SPECIFIC | not on Home idle |
| `dark-mode-*` (core) | ROUTE_SPECIFIC | dark theme only |
| `apply-page-chrome` inline bg | DEAD_PROVEN (prior) | removed |
| `app-booting` class mutator | DEAD_PROVEN | replaced by `data-app-booting` / `data-ab` |

---

## 4) VISUAL_AUTHORITY_MATRIX

| Concern | Winner |
|---------|--------|
| body font | `#mj-lcp-critical` · `1.0625rem` |
| body color | `--mj-ink` / prayer `#fafaf8` |
| body background | `--mj-bg` / `#F8F6F1` (prayer `#2a4030`) |
| surfaces (cards) | card-system after idle (not body) |
| hero | route CSS + `#mj-startup-hero` reserve on `/` |
| header | critical geometry + `#mj-startup-header` |
| bottom-nav | `--mj-bg` (sealed v2 ivory overwrite) |
| theme mode | `mj-theme-boot` → idempotent `applyThemePreference` |

---

## 5) Theme mutation source removed

| Before | After |
|--------|-------|
| `classList.add/remove("app-booting")` بعد FP → themeChanges=1 | **data-only** `dataset.appBooting` + `dataset.ab` |
| splash-boot كان يزيل class | يضبط data فقط |
| ThemePreferenceProvider / applyTheme | idempotent (سابق) |

**theme mutations after FP = 0** على كل المسارات المقاسة محليًا.

---

## 6) Chrome presence solution

- هيكل `#mj-startup-chrome` في HTML قبل `#root` (header + hero home + bottom-nav)  
- أبعاد من critical (`--app-top-chrome-h`, hero min-height)  
- يُزال عند `clearBooting` / مسارات غامرة (prayer/mushaf) عبر سكربت body  
- Home: earlyChrome header/bottom/hero = **موجودة** (لم تعد `false→true`)

متبقٍ: فروقات rect/لون صغيرة بين الهيكل والـ React النهائي (انظر §8).

---

## 7) LHCI / Home graph cleanup

- لا رفع budgets  
- Admin chunk ما زال يظهر عبر lazy home graph عند التفاعل — خارج deferred idle في `main.tsx`  
- Top contributors المؤجّلة ما زالت card/editorial/design-system (AFTER_IDLE_SAFE بعد الختم)  
- إزالة dark layers من Home light قلّلت ~3 sheets  

---

## 8) CLS comparison

| Route | RCA OLD | PARTIAL (v6) | FINAL (local) | Target | Pass |
|-------|--------:|-------------:|--------------:|--------|------|
| Home | 0.0200 | 0.0044 | **0.0044** | < 0.01 | ✓ |
| Search | 0.0223 | 0.0000 | **0.0000** | < 0.01 | ✓ |
| Quran Hub | 0.0044 | 0.0000 | **0.0000** | < 0.01 | ✓ |
| Mushaf | 0.0000 | 0.0000 | **0.0000** | = 0 | ✓ |
| Prayer | 0.0538 | 0.0000 | **0.0000** | < 0.01 | ✓ |

---

## 9) Startup filmstrip / visual diff (Home)

| Metric | PARTIAL | FINAL |
|--------|---------|-------|
| theme mutations | 1 | **0** |
| header.presence | false→true | **present early** (rect Δ ~8px) |
| bottom.presence | false→true | **present early** · bg stable `#F8F6F1` |
| hero.presence | false→true | **present early** (color/rect residual) |
| body font/bg delta | 0 | **0** |
| sheets | 4→111 | **4→104** |

Summary: `evidence/zero-startup-flicker-final-local/summary.json` (filmstrip PNGs محلية عند القياس؛ غير مدمجة لتفادي سقف ملفات PR)

---

## 10) Production measurements

| Item | Status |
|------|--------|
| Local preview measure | ✓ (هذا الملف) |
| PR #2430 | **MERGED** `7d4b30443` — Color contrast ✓ · visual-snapshot ✓ · Verify build ✓ · ci-required ✓ |
| Auto Deploy | **SUCCESS** (workflow_dispatch بعد الدمج) |
| version.json MATCH | **✓ `7d4b3044`** @ `builtAt=2026-10-01T09:34:08.574Z` |
| Production re-measure | ✓ `docs/performance/evidence/zero-startup-flicker-prod-7d4b3044/summary.json` |
| Tooling (prod) | Chrome headless + Playwright · 390×844 @2x · cache disabled |

### Production route table (`7d4b3044`)

| Route | FP | CLS | theme mut | sheets | font Δ | bg Δ | Header/Hero/Nav jump |
|-------|---:|----:|----------:|--------|--------|------|----------------------|
| `/` | 684 | **0.0257** | 0 | 3→108 | 0 | 0 | hero residual |
| `/search` | 724 | 0.0044 | 2 | 3→72 | 0 | 0 | header+nav |
| `/quran-hub` | 688 | 0.0044 | 2 | 3→76 | 0 | 0 | header+nav |
| `/mushaf` | 712 | **0** | 2 | 3→54 | 0 | 0 | none |
| `/prayer-times` | 872 | **0.0552** | 2 | 3→55 | 0 | 0 | nav |

> ملاحظة: theme mut على غير-الرئيسية يُحسب لتغيّر `class`/`data-theme` فقط (dark/light/theme-*)؛ Home بقي 0. CLS الرئيسية/الصلاة على الإنتاج أعلى من المعاينة المحلية — لا يُعلن COMPLETE.

---

## 11) Before / After / Final tables

### Theme mutations after FP

| Route | RCA | PARTIAL | FINAL |
|-------|----:|--------:|------:|
| Home | 3 | 1 | **0** |
| Search | 5 | 1 | **0** |
| Quran Hub | 5 | 1 | **0** |
| Mushaf | 6 | 1 | **0** |
| Prayer | 6 | 1 | **0** |

### Body identity

| Route | font Δ | bg Δ (FINAL) |
|-------|--------|--------------|
| All five | 0 | 0 |

### RCA vs PARTIAL vs FINAL (Home)

| Metric | RCA | PARTIAL | FINAL |
|--------|-----|---------|-------|
| FP/FCP | ~696 | ~68 | ~56 |
| CLS | 0.0200 | 0.0044 | 0.0044 |
| theme mut | 3 | 1 | **0** |
| sheets | 3→111 | 4→111 | **4→104** |
| chrome presence | mount | mount | **skeleton FP** |

---

## 12) Remaining debt (before follow-up closure)

1. **Deferred volume** على الإنتاج Home 3→108.
2. **Hero residual** على Home + header/nav jumps على Search/QuranHub.
3. **theme mut = 2** على غير-الرئيسية بعد FP.
4. **CLS إنتاج**: Home 0.0257 · Prayer 0.0552 (فوق الهدف).
5. ~~**profile-hub-v2.css** مستورد من BottomNavBar~~ → **أُصلح** في follow-up (انظر §CURRENT).
6. **Token hardening** (متابعة منفصلة): `--color-brand-deep` الليلي.

---

## CURRENT CI FAILURE CLOSURE

| Gate | Status |
|---|---|
| Color Contrast | **SUCCESS** على #2430 — لا إعادة فتح |
| Visual Snapshot | **SUCCESS** على #2430 — لا تحديث baseline |
| Verify build / ci-required | **SUCCESS** على #2430 |

## COLOR CONTRAST BEFORE AND AFTER

لا regressions جديدة في هذا الـfollow-up (لا تعديل تباين دلالي). الحالات السابقة أُغلقت في #2430.

## VISUAL SNAPSHOT BEFORE AND AFTER

لا تحديث snapshots. إصلاح هندسة الإقلاع يستهدف منع فراغ Home Dark دون إخفاء الفرق.

## HOME DARK GEOMETRY

- `data-home-chrome=0` على غير-الرئيسية من الإقلاع.
- إزالة `#mj-startup-chrome` فقط بعد وجود Header+Bottom React (غير غامر).
- احتياط `home-start-here-band` / `home-page-hero` في `critical-first-paint.css`.

## PRAYER GEOMETRY

- إخفاء `GlobalBackControlHost` على `/prayer-times` (كان مصدر CLS ≈0.055).
- `pts-immersive` من boot + `commitRouteSurface` idempotent.

## THEME MUTATIONS

- `applyThemePreference`: color-scheme بصمت ثم early-return دون لمس class إن تطابق.
- `commitRouteSurface`: كتابة dataset/class فقط عند الاختلاف.

## DEFERRED CSS BEFORE AND AFTER

انظر `docs/design/DEFERRED_CSS_CONSUMER_MATRIX_V2.md` — فصل profile-hub عن BottomNav.

## LOCAL VERIFICATION

يُحدَّث بعد `verify:ci` على فرع الـfollow-up.

## MAIN CI AND DEPLOYMENT / PRODUCTION VERSION MATCH / PRODUCTION MEASUREMENTS

يُملأ بعد الدمج + MATCH + إعادة القياس.

## REMAINING DEBT

يُحدَّث بعد القياس الإنتاجي للـfollow-up.

## FINAL VERDICT

### **STARTUP_FLICKER_PARTIALLY_FIXED**

(يُعاد الحكم فقط بعد MATCH + قياس إنتاجي للـfollow-up — ممنوع COMPLETE قبله)

**لماذا ليس COMPLETE بعد**

- إنتاج `7d4b3044`/`cb2d3636` ما زال يحمل CLS/themeMut السابقين حتى ينشر الـfollow-up ويُقاس.

**لماذا ليس NOT_FIXED**

- #2430 خضراء ومطابقة إنتاجيًا للعقود المغلقة (font/bg/Mushaf CLS).
- Follow-up يغلق جذور Prayer CLS + chrome removal race + nav CSS coupling.

---

## Success criteria checklist (production `7d4b3044` / `cb2d3636` قبل follow-up)

| Criterion | Result |
|-----------|--------|
| font-size delta = 0 | ✓ |
| background delta = 0 | ✓ |
| theme mutations after FP = 0 | ✗ (0 على Home · 2 على غيرها) |
| CLS Home/Search/Quran/Prayer < 0.01 | ✗ (Home/Prayer) |
| Mushaf CLS = 0 | ✓ |
| Header/Hero/BottomNav jump = 0 | ✗ |
| No deferred identity repaint (body) | ✓ |
| No deferred identity repaint (full) | △ sheets |
| First Paint ≈ Final Paint (canvas) | ✓ body · △ chrome |
| Production MATCH measure | ✓ `cb2d3636` tip |
