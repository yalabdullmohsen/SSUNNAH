# ZERO STARTUP FLICKER — Execution Report

| Field | Value |
|-------|-------|
| Baseline RCA | `docs/performance/REAL_STARTUP_FLICKER_ROOT_CAUSE_REPORT.md` |
| Baseline production | `version.json = d4445a6a` |
| Re-measure host | local Vite preview `http://127.0.0.1:24216` (built dist after fixes) |
| Tooling | Chrome headless + CDP/Puppeteer-core, viewport **390×844 @2x**, cache disabled |
| Evidence | `docs/performance/evidence/zero-startup-flicker-local-v6/` |
| Branch | `cursor/zero-startup-flicker` |

> لا تقرير RCA جديد. هذا تقرير تنفيذ + إعادة قياس فقط.

---

## 1) Original root causes (من RCA الملزم)

1. **Main CSS بعد FCP** → FOUC / identity shift.
2. **Font Authority مكسور:** `16px → 17px` (ثم عكسيًا عند تلوّث `--text-body`).
3. **Deferred identity chain:** `design-system → final-release → editorial → card-system*`.
4. **Canvas split:** `#F7F3EB` (splash/surface-app) ↔ `#F8F6F1` (--mj-bg).
5. **Theme / chrome repaint** بعد First Paint.
6. **Prayer CLS** الأعلى (0.0538) من `pts-immersive` / back-control / chrome.

---

## 2) Fix implemented

### Font Authority (17px مطلق)

- قرار الحجم النهائي: **17px / `1.0625rem`** من أول Paint.
- إزالة تصادم الرمز: `--text-body` كان يُعاد تعريفه كلون في `index.css` → أُزيل؛ اللون عبر `--color-text-body`.
- `--mj-fs-body: 1.0625rem` في `theme.css` + `theme-aliases.css` (كان `16px`).
- `body { font-size: 1.0625rem }` مطلق في critical / typography-scale / index / theme.

### Canvas Authority (`#F8F6F1`)

- Critical + sync + deferred foundation/final-release/nav/chrome: لوحة الصفحة = `--mj-bg` / `#F8F6F1`.
- إيقاف دهان `body`/`html` بـ `--surface-app` / `#F7F3EB`.
- **جذر JS:** `applyPageChromeDom` كان يضع `style.backgroundColor = statusBarColorHex` (`#F7F3EB`) على html/body بعد الطلاء → أُزيل.

### Theme / Prayer

- `applyThemePreference` + `boot-sequence` idempotent (لا إعادة class بلا تغيير).
- ختم `html.pts-immersive` لون/خلفية في critical + `index.css` + محاذاة `m2030/pages.css` مع `#2a4030`.

### Gates

- `zero-startup-flicker-gate.test.ts` + ربط في `test:boot-load-failure`.
- تحديث بوابات bottom-nav لتوقع `--mj-bg` بدل splash beige.

---

## 3) Files changed (أساسي)

| Area | Files |
|------|--------|
| Critical | `artifacts/majalis/index.html`, `src/styles/critical-first-paint.css` |
| Font/Canvas sync | `src/app/styles/theme.css`, `src/index.css`, `src/styles/typography-scale.css`, `src/styles/theme-aliases.css`, `src/styles/visual-identity-unify.css` |
| Deferred seal | `src/styles/design-system.css`, `src/styles/final-release.css`, `src/styles/m2030/foundation.css`, `src/styles/m2030/navigation.css`, `src/styles/m2030/pages.css`, `src/styles/pages/prayer-times.css`, `src/styles/components/app-chrome-scroll.css`, `src/styles/quran.css` |
| Theme JS | `src/lib/apply-page-chrome.ts`, `src/lib/theme-preference.ts`, `src/lib/boot-sequence.ts` |
| Gates | `zero-startup-flicker-gate.test.ts`, `startup-surface-unify-gate`, `bottom-nav-safe-area-green`, `lessons-prayer-mobile-ui`, `visual-harmonization-w2-nav-safe-area` |
| Docs | هذا الملف + evidence v6 |

---

## 4) Before metrics (production `d4445a6a`)

| Route | FP | FCP | CLS | Theme mut | Sheets | bodySize | body bg |
|-------|---:|----:|----:|----------:|--------|----------|---------|
| `/` | 696 | 696 | **0.0200** | 3 | 3→111 | 16→17 | F7F3EB↔F8F6F1 |
| `/search` | 508 | 508 | **0.0223** | 5 | 3→73 | 16→17 | shift |
| `/quran-hub` | 500 | 500 | **0.0044** | 5 | 3→77 | 16→17 | shift |
| `/mushaf` | 528 | 528 | **0.0000** | 6 | 3→57 | 16→17 | shift |
| `/prayer-times` | 428 | 428 | **0.0538** | 6 | 3→58 | 16→17 | shift |

---

## 5) After metrics (local preview, evidence v6)

| Route | FP | FCP | CLS | Theme mut | Sheets | bodySize | body bg early→final | midflight bg/color |
|-------|---:|----:|----:|----------:|--------|----------|---------------------|--------------------|
| `/` | 68 | 68 | **0.0044** | 1 | 4→111 | **17→17** | **F8F6F1→F8F6F1** | **NONE** |
| `/search` | 60 | 60 | **0.0000** | 1 | 4→74 | **17→17** | **F8F6F1→F8F6F1** | **NONE** |
| `/quran-hub` | 60 | 60 | **0.0000** | 1 | 3→78 | **17→17** | **F8F6F1→F8F6F1** | **NONE** |
| `/mushaf` | 60 | 60 | **0.0000** | 1 | 3→58 | **17→17** | **F8F6F1→F8F6F1** | **NONE** |
| `/prayer-times` | 60 | 60 | **0.0000** | 1 | 3→59 | **17→17** | **#2a4030→#2a4030** | **NONE** |

---

## 6) CLS comparison

| Route | OLD | NEW | Target | Pass |
|-------|----:|----:|--------|------|
| Home | 0.0200 | **0.0044** | < 0.01 | ✓ |
| Search | 0.0223 | **0.0000** | < 0.01 | ✓ |
| Quran Hub | 0.0044 | **0.0000** | < 0.01 | ✓ |
| Mushaf | 0.0000 | **0.0000** | = 0 | ✓ |
| Prayer | 0.0538 | **0.0000** | < 0.01 | ✓ |

---

## 7) Theme comparison

| Metric | OLD | NEW |
|--------|-----|-----|
| Theme attr mutations | 3–6 | **1** |
| theme.bg early→final | غالباً F7↔F8 | **ثابت** (home/search/quran/mushaf/prayer) |
| Inline html/body paint `#F7F3EB` | نعم (`applyPageChromeDom`) | **مُزال** |

الطفرة المتبقية (1): إعادة تأكيد class خفيفة بعد الإقلاع — لا تغيّر `data-theme` ولا لون اللوحة المقاس.

---

## 8) Startup filmstrip comparison

Evidence PNGs في `evidence/zero-startup-flicker-local-v6/`:

- `*-01-early.png` → `*-04-final.png`
- OLD (prod): قفزة لون/حجم خط واضحة بين early و deferred.
- NEW: نفس لوحة `#F8F6F1` (أو زيتون الصلاة) عبر اللقطات؛ لا midflight bg/color في snapshots.

---

## 9) Deferred identity comparison

| Item | OLD | NEW |
|------|-----|-----|
| body font after deferred | 16→17 | **17 ثابت** |
| body bg after deferred | F7↔F8 | **ثابت** |
| design-system body font/bg override | كان يعيد الطلاء | **مُفرَّغ** |
| Sheets early→final | 3→111 (home) | ما زال ~4→111 |
| card-system / editorial مؤجّل | نعم | **ما زال مؤجّلًا** (لا mega-bundle) |

تم كسر **إعادة طلاء الهوية على html/body/chrome canvas**.  
لم يُنهِ سلسلة تحميل CSS المؤجّلة بالكامل (عمدًا: ممنوع رفع budget / ممنوع CSS mega file).

---

## 10) Consumer Map (مختصر) + VISUAL_AUTHORITY_MATRIX

### Consumer Map

| File | Class | Action |
|------|-------|--------|
| `#mj-lcp-critical` / `critical-first-paint.css` | CRITICAL_TO_FIRST_PAINT | Winner shell |
| `theme.css` / `typography-scale` / `index.css` | CRITICAL_TO_FIRST_PAINT | Font + canvas sync |
| `theme-aliases` / `visual-identity-unify` | CRITICAL_TO_FIRST_PAINT | Bridges → `--mj-*` |
| `design-system` / `final-release` | AFTER_IDLE_SAFE (body sealed) | لا تعيد body font/bg |
| `m2030/foundation|navigation|pages` | AFTER_IDLE_SAFE (aligned to mj-bg) | محاذاة لا تعارض |
| `card-system*` / `modern-islamic-editorial*` | AFTER_IDLE_SAFE | بطاقات بعد idle؛ لا تلمس body |
| `green-surface` / `ssunnah-card-unify` / `card-matte-unify` | AFTER_IDLE_SAFE | كما هي تحت الميزانية |
| `apply-page-chrome` inline bg | DEAD_PROVEN (removed) | كان كاتب `#F7F3EB` |

### VISUAL_AUTHORITY_MATRIX (Winner واحد)

| Concern | Winner |
|---------|--------|
| font (body) | `#mj-lcp-critical` + absolute `1.0625rem` |
| background (html/body/#root) | `--mj-bg` / `#F8F6F1` (prayer: `#2a4030`) |
| foreground (body ink) | `--mj-ink` / prayer `#fafaf8` |
| surface (cards) | card-system بعد idle (غير body) |
| hero | route CSS / page components |
| navigation chrome | `--mj-bg` (theme-aliases + m2030/nav) |
| theme mode | boot script `index.html` → idempotent apply |

---

## 11) Remaining blockers

1. **Chrome presence:** header/bottom/hero `false→true` عند تركيب React (CLS ضمن الهدف، لكن ليس «وجود من frame 0»).
2. **Deferred stylesheet volume:** ما زال ~3→111 على الرئيسية — طبقات بطاقات/تحرير مؤجّلة.
3. **Theme class mutation = 1** بعد FP (غير مرئية على اللوحة).
4. **Font stack string:** اختلاف تطبيع `"Noto…"` vs `MajlisFallback` بلا قفزة حجم.
5. **قياس محلي vs إنتاج:** بعد الدمج يجب إعادة القياس على `www.ssunnah.com` + `version.json` الجديد (MATCH).

---

## 12) Verdict

### **STARTUP_FLICKER_PARTIALLY_FIXED**

**لماذا ليس COMPLETE**

- ما زال: deferred CSS volume + chrome presence mount + theme mutation=1.
- معايير COMPLETE تتطلب أيضًا «لا deferred identity repaint» بالمعنى الشامل و«لا header/hero/bottom jump» بما يشمل حضور الكروم من أول إطار.

**لماذا ليس NOT_FIXED**

- `font-size delta = 0` مقاس.
- `background delta = 0` مقاس + midflight NONE.
- CLS: Home/Search/QuranHub/Prayer كلها &lt; 0.01؛ Mushaf = 0.
- Prayer CLS 0.0538 → 0.
- إزالة كاتب inline `#F7F3EB` المثبت.

---

## Success criteria checklist

| Criterion | Result |
|-----------|--------|
| font-size delta = 0 | ✓ |
| background delta = 0 | ✓ |
| theme mutations after FP = 0 أو غير مرئية | △ (1 · غير مرئية على اللوحة) |
| CLS Home/Search/Quran/Prayer &lt; 0.01 | ✓ |
| Mushaf CLS = 0 | ✓ |
| لا deferred identity repaint على body | ✓ (body) / △ (sheets/cards) |
| لا header/hero/bottom jump | △ (presence mount؛ CLS OK) |
| First Paint ≈ Final Paint (لوحة) | ✓ |
