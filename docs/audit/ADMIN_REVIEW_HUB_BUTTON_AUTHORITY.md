# سلطة الأزرار — مركز المراجعة (Admin Review Hub)

**التاريخ:** 2026-10-05
**النطاق:** `artifacts/majalis/src/components/admin/review-hub/`

## الخلاصة
استُبدلت كل أزرار `<button>` الخام (21 زرًا في 7 ملفات) بالمكوّن الرسمي `Button` من `@/components/ui/button` دون تغيير أي منطق أو معالج أو خاصية وصول.

| الملف | الأزرار | المتغيرات |
|---|---|---|
| RecitationReviewCard.tsx | 5 | ghost / outline / primary / destructive / secondary |
| ReviewHubWorkspace.tsx | 4 | outline·small (تبويبات `role="tab"`) / primary |
| ContentModerationCard.tsx | 3 | outline / primary / destructive |
| WaveformAudioPlayer.tsx | 3 | ghost·icon / ghost / outline·small |
| LinearAudioReviewPlayer.tsx | 2 | ghost·icon / ghost |
| ReviewHubHeaderBar.tsx | 2 | outline·icon / ghost·icon |
| ReviewHubSidebar.tsx | 2 | ghost (صفوف تنقّل) |

## قرارات الحفاظ على التخطيط
- أصناف `rh-*` غير المطبّقة في طبقة تبقى حاكمة للألوان والحشو؛ المتغيّر يُختار دلاليًا (رفض ← `destructive`، اعتماد/نشر ← `primary`).
- الأزرار الأيقونية: `size="icon"` مع بقاء `aria-label`، وحجم الأيقونة الأصلي عبر `[&_svg]:size-*` بدل الافتراضي 16px.
- صفوف الشريط الجانبي: `h-auto justify-start whitespace-normal text-start` و`[&>span]:contents` كي تبقى الأيقونة والعنوان (`flex:1`) والشارة عناصر flex مباشرة.
- شريط التقدّم الخطي: `min-h-0` ليحافظ على ارتفاعه 6px.
- زر الموافقة الجماعية وشريط الموجة: `[&>span]:contents` للحفاظ على `gap` وارتفاعات الأعمدة.

## التحقق
- `node --import tsx src/lib/__tests__/admin-review-hub-button-authority-gate.test.ts` ✓ (يشمل `interaction-system-inventory.mjs --check`)
- `src/tests/admin-review-hub.test.ts` ✓ (22/22)، `scripts/test-no-more-library-brand.mjs` ✓
- `tsc --noEmit` ✓، `eslint --max-warnings 0` ✓
