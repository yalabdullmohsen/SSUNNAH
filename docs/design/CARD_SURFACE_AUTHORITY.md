# Card + Surface Authority — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY (Interaction PR-5)** |
| Base surface | `AppCard` (`design-system/AppCard.tsx`) |
| Content | `ContentCard` / `ContentCardV2` |
| Navigation entry | `SectionEntryCard` / `NavigationCardV2` / `CompactNavigationCard` |
| Typed system | `CardSystem` + `CardSystemV2` |
| Thin surfaces | `InsetSurface` · `ElevatedSurface` · `StatusCard` · `InteractiveCard` |
| Mushaf | **MUSHAF_SPECIAL** — لا ترحيل عام |
| Store | HOLD · Web `WEB_RELEASED_NATIVE_HOLD` |

## Hierarchy (use in this order)

1. **AppCard** — سطح المنتج الافتراضي (soft-card + tokens).
2. **ContentCard / ContentCardV2** — عنصر محتوى بعنوان/مقتطف.
3. **SectionEntryCard / NavigationCardV2** — دخول قسم (البطاقة كلها Link).
4. **InteractiveCard** — غلاف تفاعلي عام فوق AppCard عند الحاجة.
5. **StatusCard / EmptyStateV2 / ErrorStateV2** — حالات، ليست تنقّلًا.
6. **InsetSurface / ElevatedSurface** — تجميع بصري بلا تفاعل.
7. **shadcn `ui/card`** — توافق داخلي فقط؛ لا توسّع المنتج عليه.

## Forbidden

- Card داخل Card بلا ضرورة.
- بطاقة ثابتة تبدو قابلة للنقر (بدون `href`/`onClick` واضح).
- Interactive card تحتوي عناصر تفاعلية متداخلة بلا فصل.
- شريط أخضر جانبي خارج الأنماط المعتمدة.
- hex / shadow / radius / z-index خام داخل primitives الرسمية.
- تحويل Link إلى Button للتنقل.

## Migration rules

1. أضف `data-ss-surface` / `data-cs2-card` عند الترحيل.
2. احفظ `className` التخطيطي للصفحة عند الحاجة.
3. لا تحذف CSS soft-card قبل إثبات عدم الاستخدام.
4. الدين البصري/التفاعلي يبقى تحت ceilings تناقصية.
