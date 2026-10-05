# Startup Update Loop — Root Cause (PR-0)

**Program:** Sunnah Startup Freeze / Update Display Hang  
**Stage:** PR-0 inventory + proven root cause (code path)  
**Base tip:** `origin/main` @ `253484fa7` (جلسة 2026-09-26)  
**Environment:** static code + prior hang inventory — **device/TestFlight = NOT MEASURED in this doc**

Companion: `docs/performance/UPDATE_DISPLAY_HANG_ROOT_CAUSE_PR0.md`

---

## 1) مطابقة العرض المؤكد (الصورة)

| عنصر | مصدر مثبت |
|---|---|
| خلفية عاجية + عنوان «تحديث العرض» | `ErrorBoundary.render` عند `recovering` — `artifacts/majalis/src/components/ErrorBoundary.tsx` |
| «تم تحديث المنصة. يُحدَّث العرض…» | نفس الملف (نص الصفحة) |
| «تم تحديث المنصة، جاري تحسين العرض…» (Toast) | `chunk-recovery.ts` → `announceRecovering` → `ChunkRecoveryToast` |
| لا Header / Home | ErrorBoundary يستبدل **كل** الشجرة تحت الجذر |
| رسالتان مكرّرتان | صفحة `recovering` + Toast من نفس `tryRecoverFromStaleChunk` |
| لا زر أثناء التعليق | واجهة `recovering` بلا أزرار |

لا يوجد Route `/update-display` — الشاشة حالة `ErrorBoundary.state.recovering`.

---

## 2) التسلسل الفعلي

```
Native launch / HTML shell
→ main.tsx createRoot
→ ChunkRecoveryToast + ErrorBoundary + App
→ (اختياري) SW register بعد 5s
→ ChunkLoadError (lazy import لأصل hashed قديم بعد نشر)
→ lazyWithRetry.catch → tryRecoverFromStaleChunk
   و/أو ErrorBoundary.getDerivedStateFromError(recovering=true)
→ announceRecovering → Toast
→ ErrorBoundary يعرض صفحة «تحديث العرض» (يحجب Home)
→ requestSwShellPurge + setTimeout(80) → safeLocationReload({ force: true })
→ ★ التعليق: بين الشاشة الحاجبة واكتمال reload / أو فشل reload في WebView
→ lazyWithRetry قد ينتظر حتى PAGE_LOAD_TIMEOUT_MS (20s) ثم يعيد رمي الخطأ
```

**Service Worker ليس الجذر الوحيد:** `controllerchange` على المسار الحالي يُصدر `mj:sw-updated-quiet` بلا reload قسري. المحفّز الظاهر = **استعادة chunk** مغلّفة برسائل «تحديث المنصة» + شاشة حاجبة + reload تلقائي.

---

## 3) السبب الجذري (مثبت بالكود)

1. **محفّز:** جلسة مفتوحة تحتفظ بـ module graph يشير إلى `/assets/*` بـhash قديم بعد نشر → `ChunkLoadError`.
2. **سلوك حاجب:** `recovering` UI كاملة + Toast مكرر + `window.location.reload` تلقائي بعد 80ms.
3. **لا مهلة خروج** من `recovering` إن تأخّر/فشل الـreload.
4. **خارج AppStartupController** — لا توجد حالة UPDATE_DISPLAY في آلة الإقلاع؛ الشاشة تتجاوز MINIMUM_READY/INTERACTIVE.

---

## 4) ما يجب أن يفعله الإصلاح (PR مركّز)

| بند | إجراء |
|---|---|
| شاشة «تحديث العرض» | حذف من Production UI |
| Toast التقني | حذف / لا-op |
| `tryRecoverFromStaleChunk` | purge هادئ فقط · **بلا** announce · **بلا** auto-reload |
| ErrorBoundary | خطأ قابل للاسترداد عام · إعادة محاولة / رئيسية · بلا رسائل تحديث |
| `lazyWithRetry` | بلا انتظار 20s على reload لن يحدث |
| `controllerchange` | يبقى هادئًا (بلا reload) |
| Gate | فشل إن ظهرت النصوص المحظورة في مكوّنات Production |

---

## 5) قبول PR-0

- [x] نصوص ومكوّنات محددة بأسطر/ملفات  
- [x] تسلسل ونقطة التعليق موثّقة من الكود  
- [x] SW غير مفترض كجذر وحيد قبل الدليل  
- [ ] إثبات جهاز/TestFlight — مؤجّل Release verification  

**الحالة:** PARTIAL (جذر مثبت بالكود؛ جهاز غير مقيس هنا)

---

## 6) تحديث 2026-10-05 — إعادة تحميل تلقائية صامتة واحدة (MJL-20261005-203837-YZ77CE)

**المشكلة:** بعد كل نشر، تبويب مفتوح على نسخة قديمة يطلب chunk لم يعد موجودًا ⇒ الاستعادة الهادئة (purge القشرة) لا تكفي وحدها ⇒ يصل الخطأ إلى ErrorBoundary فتظهر «حدث خلل مؤقت في العرض».

**السياسة الجديدة (بطلب المالك):**

| المسار | السلوك |
|---|---|
| `lazyWithRetry` → `loadWithChunkRecovery` | chunk قديم ⇒ `reloadOnceForStaleChunk` (purge قشرة + `location.reload()` على نفس المسار)؛ الوعد يبقى معلّقًا ⇒ Suspense fallback بلا شاشة خطأ |
| `ErrorBoundary` / `SectionErrorBoundary` | chunk قديم يصل للحدود والمحاولة متاحة ⇒ `return null` + إعادة تحميل صامتة؛ غير متاحة ⇒ الشاشة الحالية كما هي |
| منع الحلقة | حارس مستقل `majalis-chunk-auto-reload` = `buildId|at` للبناء الذي فشل: مرة واحدة لكل بناء · **لا يُمسح** عند استقرار القشرة (بخلاف `majalis-chunk-reload`) · فاصل أدنى 30 ثانية · تعذّر حفظ الحارس ⇒ بلا reload |
| انقطاع الشبكة | بلا reload وبلا استهلاك المحاولة — رسالة الانقطاع الصادقة |

ما يبقى ممنوعًا: reload متكرر · `safeLocationReload` · `setTimeout` يعيد التحميل · نصوص «تحديث العرض». بوابة: `src/lib/__tests__/chunk-auto-reload.test.ts` (ضمن `test:chunk-recovery`).
