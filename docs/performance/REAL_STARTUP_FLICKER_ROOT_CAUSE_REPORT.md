# REAL STARTUP FLICKER — Root Cause Report (Evidence)

| Field | Value |
|-------|-------|
| Measured at (UTC) | `2026-10-01T06:46:55.414Z` |
| Production host | `https://www.ssunnah.com` |
| `version.json` | **`d4445a6a`** (`ref=main`, `builtAt=2026-10-01T06:38:14.605Z`) |
| Tooling | Chrome headless + CDP/Puppeteer-core, viewport **390×844 @2x**, cache disabled |
| Evidence dir | `docs/performance/evidence/real-startup-flicker-d4445a6a/` |
| Code baseline | `artifacts/majalis/src/main.tsx` @ `d4445a6a`: **22 sync CSS** + **43 deferred CSS imports** |

> هذا التقرير مبني على قياسات حية فقط. لا يعتمد على انطباعات أو افتراضات غير مقاسة.

---

## 0) الحكم الواحد

### **C) ما زالت موجودة جذريًا**

**التصنيف:** `MULTIPLE_CAUSES` + `ROOT_CAUSE_FOUND`  
(المكوّنات: `DEFERRED_IDENTITY_SHIFT` · `CSS_GRAPH_SHIFT` · `FONT_SHIFT` · `STARTUP_LAYOUT_SHIFT` · route chrome / prayer surface)

**لماذا ليس A أو B**

| خيار | لماذا مرفوض |
|------|-------------|
| A مغلقة | كل المسارات المقاسة تُظهر تغيّرًا بصريًا بعد First Paint (لون/خلفية/حجم خط/هيكل)، وCLS > 0 على 4/5 مسارات |
| B جزئيًا | التخفيفات موجودة (`font-display:optional`، critical shell، mushaf CLS=0) لكن **آلية الجذر ما زالت تعمل**: حزمة CSS المتزامنة تصل بعد FCP، ثم سلسلة الهوية المؤجّلة (`design-system → final-release → editorial → card-system`) تعيد طلاء الهوية |

---

## 1) هل المشكلة ما زالت موجودة؟ — بيانات فعلية

| Route | FP (ms) | FCP (ms) | CLS | CLS entries | Theme attr mutations | Visual diffs (early→final) | Stylesheets early→final | CSS network |
|-------|--------:|---------:|----:|------------:|---------------------:|---------------------------:|------------------------:|------------:|
| `/` | 696 | 696 | **0.0200** | 4 | 3 | **12** | **3 → 111** | 108 |
| `/search` | 508 | 508 | **0.0223** | 2 | 5 | **12** | **3 → 73** | 71 |
| `/quran-hub` | 500 | 500 | **0.0044** | 1 | 5 | **11** | **3 → 77** | 75 |
| `/mushaf` | 528 | 528 | **0.0000** | 0 | 6 | **9** | **3 → 57** | 55 |
| `/prayer-times` | 428 | 428 | **0.0538** | 2 | 6 | **15** | **3 → 58** | 56 |

لقطات: `*-01-early.png` / `*-02-load.png` / `*-03-deferred.png` / `*-04-final.png` في مجلد الأدلة.

### إثبات التغيّر بعد أول Paint (مثال `/`)

| لحظة | t (ms) | sheets | body font-size | body bg | body color |
|------|-------:|-------:|---------------:|---------|------------|
| rAF≈FP | 691–701 | 3 | **16px** | `rgb(247,243,235)` `#F7F3EB` | `rgb(20,36,28)` `#14241c` |
| fonts-ready | 870 | 4 | 16px | `rgb(248,246,241)` `#F8F6F1` | `rgb(21,56,45)` `#15382d` |
| load | 1054 | 19 | 16px | `#F7F3EB` | `#15382d` |
| بعد deferred identity | ~1277 | ≥44 | **17px** | `#F8F6F1` | `#15382d` |
| final | 8378 | **111** | **17px** | `#F8F6F1` | `#15382d` |

---

## 2) RCA لكل مسار

### `/` (Home)

1. Critical HTML (`#mj-lcp-critical`) يرسم سطح `#F7F3EB` / حبر `#14241c` / بدون `body{font-size:17px}`.
2. FCP @696ms بينما حزمة CSS الرئيسية `index-*.css` تنتهي @**752ms** → **CSS late arrival بعد FCP**.
3. خطوط Amiri تنتهي ~697–999ms؛ مكدس الخط يتغيّر (Noto يظهر ثم يختفي من السلسلة المحسوبة).
4. بعد idle: `loadNonCriticalCss` يجلب `green-surface` / `design-system` / `final-release` / `editorial` / `card-system*` → **إعادة طلاء هوية** + `body` يصبح 17px.
5. CLS من: `home-start-here`, `bottom-nav`, `main#main-content`, `navbar-ticker-row`, `page-hero-mj`.

### `/search`

- Hero/header/bottom يتحوّلون من هيكل critical/placeholder إلى كروم التطبيق (ارتفاع header 27→65، bottom Y يقفز).
- `bodySize` 16→17 متزامن مع وصول سلسلة deferred.
- CLS على `main#main-content` (0.0179 + 0.0044).

### `/quran-hub`

- CLS أقل (0.0044) لكن نفس قفزات الكروم + 16→17 + bg `#F8F6F1`↔`#F7F3EB`.
- hero color ينتقل إلى لون ليلي/كريمي بعد اكتمال الطبقات.

### `/mushaf`

- **CLS = 0** (لا layout-shift مسجّل) — تخفيف ناجح جزئيًا.
- ما زال: bg early `#F8F6F1` → mid `#FBF4E8` (ورق المصحف) → final يعود/`#F8F6F1`؛ header metrics تتغيّر؛ `chrome-immersive` يُضاف بعد الإقلاع؛ sheets 3→57؛ font-size 16→17.

### `/prayer-times`

- **أسوأ CLS: 0.0538** — المصدر الأكبر `div.global-back-control-host` @1211ms.
- سطح الإقلاع فاتح `#F8F6F1` ثم يتحوّل إلى سطح الصلاة الغامق `rgb(42,64,48)` بعد `pts-immersive` (`route-surface.ts`).
- bottom-nav من شفاف/صغير إلى `rgb(10,69,48)` بارتفاع 64 وموضع Y=780.
- هذا **Route chrome / immersive surface shift** وليس فقط deferred identity.

---

## 3) Timeline دقيق (مرجع `/` — الأرقام من القياس)

```
HTML response          → ~0–responseStart (navigation)
#mj-lcp-critical apply → قبل أي JS (inline)
First Paint            → 696ms
First Contentful Paint → 696ms
Amiri 700/400 AR       → responseEnd 697 / 748ms
Main CSS index-*.css   → responseEnd 752ms   ⟵ بعد FCP
fonts.ready            → ~870ms
Theme class settle     → ~936ms (light theme-light)
Route/lazy CSS         → ~998–1050ms (NavBar, HomePage, …)
load event             → ~1054ms
requestIdleCallback(loadNonCriticalCss) fires (timeout=2500, غالبًا فور الخمول)
  green-surface / section-cards-theme / … → ~1166–1173ms
  design-system                            → ~1178ms
  final-release / brand-v4-components      → ~1288–1302ms
  modern-islamic-editorial*                → ~1399–1402ms
  card-system → card-system-v2             → ~1502–1605ms
body font-size 16→17                       → ~1277ms (متزامن مع final-release/design-system)
Final visual (111 sheets)                  → مستقر بحلول ~5–8s
fonts-ui-bold (Aref)                       → مجدول +20s (خارج نافذة القياس القصيرة)
```

`scheduleOnIdle(loadNonCriticalCss, 2500)` في `main.tsx` = `requestIdleCallback(..., { timeout: 2500 })` — على جهاز هادئ يعمل **قبل** 2500ms فور الخمول بعد `load`.

---

## 4) مصادر تغيّر الواجهة بعد First Paint

### جدول المصادر

| Source | Trigger | Time (home) | Visual impact | Root cause |
|--------|---------|-------------|---------------|------------|
| `#mj-lcp-critical` (`index.html`) | HTML parse | <FP | سطح `#F7F3EB` / حبر `#14241c` / بدون 17px body | Critical shell ≠ الهوية النهائية |
| Sync CSS bundle `index-*.css` (22 imports) | JS chunk + CSS | **752ms > FCP 696** | لون الحبر → `#15382d`؛ tokens/`--bg` | **CSS late arrival** للحزمة المتزامنة |
| `fonts-ui.css` + Amiri woff2 | @font-face + network | 697–999ms | مكدس خط / metrics | Font load بعد/حول FCP؛ `optional` يقلل swap لكنه لا يمنع تغيّر المكدس المحسوب |
| `size-adjust:97%` (critical MajlisAmiriFallback) + `105%` في `fonts-ui.css` | @font-face metrics | مع تحميل الخط | احتمال metric mismatch fallback↔Amiri | Font metric shift محتمل |
| Theme boot (`index.html` + `theme-preference` + `boot-sequence`) | inline + JS | ~740–936ms | class `light theme-light` / إزالة `app-booting` | Theme resolution بعد أول طلاء |
| Lazy route CSS (HomePage/NavBar/…) | dynamic import | ~998–1050ms | كروم/هيرو يظهران | Hydration + route CSS |
| `green-surface-system.css` | deferred idle | ~1167ms | أسطح خضراء/بطاقات | Deferred identity |
| `design-system.css` `body{font-size:var(--ds-text-base)}` + `--ds-text-base:1.0625rem` | deferred chain | ~1178ms | **16px→17px** | Deferred identity / typography override |
| `final-release.css` | after design-system | ~1288ms | عناوين/نافبار/هوية | Deferred identity |
| `visual-identity-unify.css` (re-import) | after final-release | بعد 1288ms | إعادة توحيد أزرار/بانر | Deferred identity re-apply |
| `dark-mode-recovery.css` (re-import) | after final-release | بعد 1288ms | فوز قواعد ليلي | Dark layer ordering |
| `modern-islamic-editorial*.css` | after unify | ~1400ms | ورق/زيتون | Deferred identity |
| `card-system.css` + `card-system-v2.css` | after editorial | ~1502–1605ms | بطاقات/ظلال/نصف قطر | Deferred identity |
| `m2030/*` (foundation/navigation/…) | deferred | مع دفعة idle | bands / bottom-nav m2030 | Deferred + chrome |
| `brand-v4*` contrast/components | deferred | ~1169 / 1302 | تباين/مكوّنات | Deferred |
| `ssunnah-theme-api` / aliases (sync, داخل bundle المتأخر) | sync bundle | مع index-*.css | `--ss-*` / bridges | جزء من CSS_GRAPH_SHIFT |
| `route-surface.ts` → `pts-immersive` | React layout | ~582ms+ (prayer) | خلفية صلاة غامقة تحت `data-theme=light` | Route chrome shift |
| `global-back-control-host` | mount late | ~1211ms (prayer) | **CLS 0.0538** | Startup layout shift |
| `fonts-ui-bold.css` | `setTimeout(20000)` | +20s | أوزان زخرفية | خارج النافذة الحرجة عادة |

---

## 5) إثبات أنواع القفزات

| Phenomenon | Proven? | Evidence |
|------------|---------|----------|
| Font swap | **جزئي / مخفَّف** | `font-display:optional` في critical + `fonts-ui.css` — لا يوجد swap كلاسيكي؛ لكن المكدس المحسوب يتغيّر |
| Font metric shift | **نعم (محتمل→مُلاحظ)** | `size-adjust:97%` (critical) vs `105%` (`fonts-ui.css` fallback)؛ تغيّر `bodyFont` early→final |
| Theme repaint | **نعم (classes)** | mutations `app-booting` / `js-ready` / `pts-immersive` / `chrome-immersive`؛ لون/خلفية يتغيّران. قياس dark preference لم يثبت `data-theme=dark` في هذه الجولة (مفاتيح التخزين) — prayer immersive يغطي مسار سطح غامق |
| CSS late arrival | **نعم** | `index-*.css` @752ms بعد FCP@696ms؛ + عشرات ملفات بعد load |
| Deferred identity repaint | **نعم** | design-system→final-release→editorial→card-system بعد FCP؛ sheets 3→111 |
| Layout shift | **نعم** | CLS 0.004–0.054 على 4 مسارات |
| Hydration shift | **نعم** | header/bottom/hero `presence` أو أبعاد تتغيّر بعد mount |
| Route chrome shift | **نعم** | prayer `pts-immersive`؛ mushaf `chrome-immersive` |
| Header shift | **نعم** | search/quran/prayer: ارتفاع/خلفية header |
| Bottom nav shift | **نعم** | home CLS يشمل `bottom-nav`؛ أبعاد/لون يتغيّران |
| Hero shift | **نعم** | hero fontSize/weight/rect/color |
| Scrollbar shift | **لا في هذه الجولة** | `scrollbarGutter` early=final=0 على العيّنات |

---

## 6) مقارنة: إنتاج main vs أول Paint vs الحالة النهائية

| Axis | Production intent (main @ d4445a6a) | First Paint (measured) | Final after imports (measured) |
|------|------------------------------------|------------------------|--------------------------------|
| Background | لوحة محتوى `#F8F6F1` / splash `#F7F3EB` | `#F7F3EB` (critical) | غالبًا `#F8F6F1` (أو صلاة `#2A4030`) |
| Ink | `#15382D` / tokens | `#14241c` | `#15382d` |
| Body size | `--ds-text-base` / `--text-body` = **1.0625rem (17px)** | **16px** (متصفح/critical) | **17px** |
| Stylesheets | هوية كاملة | **3** (critical + قليل) | **57–111** |
| Cards/editorial | card-system + editorial | غير محمّلة | محمّلة بعد idle chain |
| Bottom nav | 64px positioned | placeholder/صغير أو غائب | 64px @ y=780 |
| Prayer surface | immersive dark | light parchment | dark green surface |

**الخلاصة:** أول Paint ≠ الحالة النهائية ≠ «نية» الهوية في الطبقات المؤجّلة. المستخدم يرى الانتقال.

---

## 7) التصنيف

```
ROOT_CAUSE_FOUND
MULTIPLE_CAUSES
  ├─ CSS_GRAPH_SHIFT          (sync bundle بعد FCP + 22 طبقة داخلها)
  ├─ DEFERRED_IDENTITY_SHIFT  (43 deferred: design-system…card-system)
  ├─ FONT_SHIFT               (metrics/stack؛ optional يخفف swap)
  ├─ STARTUP_LAYOUT_SHIFT     (chrome/hero/back-control/ticker)
  └─ (route) immersive surface shift على prayer/mushaf
DARK_REPAINT                  — recovery/surfaces ما زالت في الرسم؛ قياس prefers-dark لم يُثبت data-theme=dark هذه الجولة
```

---

## 8) لكل سبب — ملف · لماذا · كيف بعد Paint · إصلاح جذري · البرنامج

### A) CSS الحرج يصل بعد FCP

| | |
|--|--|
| **الملف** | Vite bundle من 22 sync import في `main.tsx` L35–L84 → `index-*.css` |
| **لماذا** | الحزمة كبيرة؛ تصل بعد رسم critical |
| **بعد Paint** | responseEnd 752ms > FCP 696ms |
| **الإصلاح** | تقليص sync إلى tokens+typography النهائية فقط؛ أو inline القيم النهائية في `#mj-lcp-critical` لتطابق final (17px، `#F8F6F1`، `#15382d`) |
| **البرنامج** | **Startup/FOUC Hardening** |

### B) Deferred identity chain

| | |
|--|--|
| **الملف** | `main.tsx` `loadNonCriticalCss` L120–L198؛ خاصة L142–L165 |
| **لماذا** | ميزانية critical ≤60KiB نقلت الهوية البصرية إلى idle |
| **بعد Paint** | design-system@1178 → final-release@1288 → editorial@1400 → card-system@1502 |
| **الإصلاح** | امتصاص الرموز/الأسطح النهائية إلى critical أو sync وحيد قبل paint؛ إزالة إعادة استيراد `visual-identity-unify` + `dark-mode-recovery` بعد final-release؛ منع `body{font-size}` في deferred |
| **البرنامج** | **Deferred Identity Absorption** (+ Startup Hardening) |

### C) قفزة 16px → 17px

| | |
|--|--|
| **الملف** | Critical: لا يضبط body على 17px. Sync: `typography-scale.css` L26–28 (`var(--text-body)`). Deferred override: `design-system.css` L1162 + L1191–L1195 (`body{font-size:var(--ds-text-base)}` = 1.0625rem) |
| **لماذا** | أول طلاء بـ16px الافتراضي؛ الهوية النهائية تفرض 17px بعد وصول design-system |
| **بعد Paint** | flip @ ~1277ms على كل المسارات المقاسة |
| **الإصلاح** | ضبط `#mj-lcp-critical` و`body` sync على **نفس** `1.0625rem` النهائي؛ حذف/منع أي `body{font-size}` في deferred |
| **البرنامج** | **Startup/FOUC Hardening** + **Deferred Identity Absorption** |

### D) قفزة الخلفية `#F7F3EB` → `#F8F6F1`

| | |
|--|--|
| **الملف** | Critical/splash: `#F7F3EB` (`index.html` L7/L173). Content: `theme.css` `--mj-bg`/`#F8F6F1`؛ طبقات لاحقة |
| **لماذا** | intentional split splash vs content — يظهر كـFOUC |
| **بعد Paint** | bgFlip ~775ms على `/` |
| **الإصلاح** | توحيد سطح الإقلاع مع سطح المحتوى، أو رسم المحتوى فوق splash بدون تغيير لون الصفحة الكاملة |
| **البرنامج** | **Startup/FOUC Hardening** |

### E) Font metrics / stack

| | |
|--|--|
| **الملف** | `index.html` critical `@font-face` (`size-adjust:97%`)؛ `fonts-ui.css` (optional + ascent overrides + `size-adjust:105%` للـfallback) |
| **لماذا** | اختلاف مقاييس fallback vs Amiri؛ تحميل woff2 حول FCP |
| **بعد Paint** | تغيّر `bodyFont` / tokens |
| **الإصلاح** | توحيد `size-adjust` بين critical و`fonts-ui`؛ ضمان preload + تطابق metrics؛ الإبقاء على `optional` |
| **البرنامج** | **Startup/FOUC Hardening** (Patch مستقل إن لزم لمصحف QPC منفصل) |

### F) Prayer immersive + back-control CLS

| | |
|--|--|
| **الملف** | `lib/route-surface.ts` L16–L27؛ صفحة الصلاة + `global-back-control-host` |
| **لماذا** | السطح الغامق يُطبَّق بعد commit المسار؛ زر الرجوع يظهر متأخرًا |
| **بعد Paint** | bg → `rgb(42,64,48)`؛ CLS 0.0538 |
| **الإصلاح** | تطبيق `pts-immersive` + ألوان الصلاة من critical/boot حسب المسار قبل paint؛ حجز هندسي ثابت لـ back-control |
| **البرنامج** | **Startup/FOUC Hardening** + Patch مستقل لمسار الصلاة إن لزم |

### G) Dark layers

| | |
|--|--|
| **الملف** | sync `dark-mode-recovery.css`؛ conditional/deferred `dark-mode-surfaces` / `dark-design-system` / `premium-dark-refine` / `luxury-night-v2`؛ إعادة استيراد recovery بعد final-release |
| **لماذا** | ترتيب فوز ليلي متأخر |
| **بعد Paint** | إعادة تطبيق recovery في سلسلة deferred |
| **الإصلاح** | طبقة ليلي واحدة قبل paint عند boot dark؛ لا إعادة استيراد بعد final-release |
| **البرنامج** | **Dark Content Absorption** |

### H) Chrome / hero / bottom-nav

| | |
|--|--|
| **الملف** | critical geometry في `index.html`؛ مكوّنات NavBar/BottomNav + `m2030/navigation.css` مؤجّل |
| **لماذا** | placeholders ثم hydrate + CSS مسار |
| **بعد Paint** | CLS + rect deltas |
| **الإصلاح** | هيكل كروم نهائي في critical/SSR-shell بأبعاد نهائية؛ تحميل CSS الكروم قبل paint |
| **البرنامج** | **Startup/FOUC Hardening** |

---

## 9) خارطة امتصاص (لا ترقيع)

| برنامج | ماذا يمتص |
|--------|-----------|
| **Deferred Identity Absorption** | design-system body/type · final-release · editorial · card-system* · green-surface · brand-v4-components · إعادة unify/recovery |
| **Dark Content Absorption** | surfaces / premium / luxury / recovery ordering |
| **Startup/FOUC Hardening** | critical=final tokens (bg/ink/17px) · sync CSS before FCP · smoke-test CLS · prayer/mushaf boot surface · back-control space |
| **Patch مستقل** | فقط إن بقي QPC/mushaf page-font أو adhan-specific بعد الامتصاص أعلاه |

---

## 10) ملخص الأدلة السريعة (نسخ)

```
prod = d4445a6a MATCH version.json
home:   FCP=696 CLS=0.020 sheets 3→111 body 16→17 bg F7F3EB→F8F6F1
search: FCP=508 CLS=0.022 sheets 3→73  body 16→17 header/bottom/hero shift
quran:  FCP=500 CLS=0.004 sheets 3→77  body 16→17
mushaf: FCP=528 CLS=0.000 sheets 3→57  body 16→17 surface paper shift (no CLS)
prayer: FCP=428 CLS=0.054 sheets 3→58  body 16→17 bg→prayer-dark + back-control CLS
deferred identity CSS after FCP: design-system, final-release, editorial, card-system*
main CSS index-*.css responseEnd 752 > FCP 696  => CSS late arrival
```

---

## 11) الحكم النهائي (مرة واحدة)

# **C) ما زالت موجودة جذريًا**

الأدلة: تغيّر لون/خلفية/حجم خط بعد First Paint على كل المسارات المقاسة، وCLS غير صفري على أربعة مسارات، وسلسلة هوية مؤجّلة ما زالت تصل بعد الرسم على إنتاج `d4445a6a`.
