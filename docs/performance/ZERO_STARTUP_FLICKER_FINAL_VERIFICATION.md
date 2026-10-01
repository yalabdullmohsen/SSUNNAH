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

PNGs: `evidence/zero-startup-flicker-final-local/*-{01..04}-*.png`

---

## 10) Production measurements

| Item | Status |
|------|--------|
| Local preview measure | ✓ (هذا الملف) |
| Production `www.ssunnah.com` re-measure | **بعد الدمج + version.json MATCH** |
| version.json MATCH | معلّق على نشر main |

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

## 12) Remaining debt

1. **Deferred volume** ما زال مرتفعًا (Home ~104) — يحتاج Consumer-map phase أعمق / code-splitting أضيق دون mega CSS.  
2. **Hero/header residual geometry** على Home (rect/لون الهيكل vs React النهائي).  
3. **Non-home presence** (search/quran/mushaf/prayer): skeleton مُزال أو بلا hero مسار — presence mount يبقى.  
4. **profile-hub-v2.css** ما زال يُستورد من `BottomNavBar` (محكم اللون الآن؛ يفضّل تفريغ الاستيراد لاحقًا).  
5. **Production MATCH re-measure** بعد الدمج.  

---

## 13) Final verdict

### **STARTUP_FLICKER_PARTIALLY_FIXED**

**لماذا ليس COMPLETE**

- ما زال deferred sheet volume عاليًا (4→104).  
- ما زال hero/header rect/color residual على Home.  
- مسارات غير الرئيسية ما زالت presence-mount للـ hero/chrome.  
- لم يكتمل بعد قياس إنتاج MATCH في هذه الجولة (يُعاد بعد الدمج).  

**لماذا ليس NOT_FIXED**

- `theme mutations after FP = 0` ✓  
- `font-size delta = 0` · `background delta = 0` ✓  
- CLS كل المسارات ضمن الهدف · Mushaf = 0 ✓  
- Chrome skeleton من FP على Home (presence) ✓  
- ختم كتّاب html/body/#root المؤجّلين + ختم عاجي bottom-nav ✓  
- خفض ملموس لـ sheets دون رفع أي budget ✓  

---

## Success criteria checklist

| Criterion | Result |
|-----------|--------|
| font-size delta = 0 | ✓ |
| background delta = 0 | ✓ |
| theme mutations after FP = 0 | ✓ |
| CLS Home/Search/Quran/Prayer < 0.01 | ✓ |
| Mushaf CLS = 0 | ✓ |
| Header/Hero/BottomNav jump = 0 | △ (presence ✓ · residual geometry) |
| No deferred identity repaint (body) | ✓ |
| No deferred identity repaint (full) | △ sheets/cards |
| First Paint ≈ Final Paint (canvas) | ✓ |
| Production MATCH measure | ⏳ after merge |
