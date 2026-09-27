# إصلاح وميض صفحة الصلاة (White Flash)

## Root cause

تسلسل التنقّل إلى `/prayer-times`:

1. **Navigation** — تبويب الصلاة / رابط
2. **Route mount** — `Suspense` يعرض `LazyRouteFallback` بهيكل كريمي عام (`--mj-bg` / `#F7F3EB`)
3. **Class late** — `pts-immersive` كان يُضاف في `useEffect` **بعد** أول طلاء
4. **CSS late** — `prayer-times.css` (التدرّج الزيتوني الكامل) يصل مع حزمة الصفحة الكسولة فقط
5. **First paint** — إطار كريمي/أبيض → ثم قفزة إلى السطح الزيتوني + المحتوى

**مصدر الوميض:** أول إطار بلا `html.pts-immersive` وبلا صدفة زيتونية متزامنة، مع هيكل Suspense بلون الرئيسية.

**المكوّنات المتأثرة:** `App.tsx` (توقيت الصنف)، `LazyRouteFallback`، غياب CSS صدفة مبكر، `PrayerTimesView` (`pts-hint--skeleton` الكريمي أثناء التحميل).

## Fix (lifecycle — بلا تأخير اصطناعي ولا spinners)

| طبقة | تغيير |
|---|---|
| صدفة متزامنة | `styles/prayer-route-shell.css` مستورد من `App.tsx` |
| قبل الطلاء | `useLayoutEffect` لـ `pts-immersive` / `chrome-immersive` |
| نية تنقّل | إضافة `pts-immersive` + prefetch CSS من BottomNav / TopSectionBar |
| Suspense | هيكل `lrf-skel--prayer` شفاف فوق السطح الزيتوني |
| بيانات | `pts-screen--boot` + صفوف محجوزة بدل hint كريمي |
| تسخين | `prefetch-route` يحمّل `prayer-times.css` مع الحزمة |

## Verify

- بوابة: `src/lib/__tests__/prayer-page-flash-gate.test.ts`
- `page-transitions-gate` يفرض shell + `useLayoutEffect` + `lrf-skel--prayer`

## Expected UX

من أول إطار بعد نية التنقّل: سطح زيتوني مستمر → هيكل صلاة بنفس الشكل → محتوى/كاش بدون قفزة لون أو إطار أبيض.
