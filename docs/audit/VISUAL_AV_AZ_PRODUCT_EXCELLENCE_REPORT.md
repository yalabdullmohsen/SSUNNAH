# Visual AV–AZ — صقل نضج المنتج (Product Excellence)

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave` · PR #2491

## الأولويات المنفَّذة

| Phase | Goal | Output |
|---|---|---|
| **AV** | Product cohesion audit | `PRODUCT_COHESION_SCORE` **57** |
| **AW** | Token enforcement migration | `TOKEN_MIGRATION_QUEUE` · **365** ملفًا |
| **AX** | Component rationalization | consolidate: cards/buttons/dialogs/badges/search/status |
| **AY** | Journey compression | Prayer/Continue = 1 · Mushaf/Search = 2→هدف 1 |
| **AZ** | Product polish pass | `POLISH_BACKLOG` · **277** إشارة |

## أكثر التجارب تفتتًا

1. Mushaf (48) · 2. Library (53) · 3. Home (54) · 4. Quran Hub (55) · 5. Hadith (55)

الأعلى تماسكًا نسبيًا: Search (68) · Admin (67) · Settings (62)

## طابور هجرة التوكنات (أعلى أثر)

| Kind | Count |
|---|---:|
| color | 6549 |
| shadow | 1005 |
| radii | 204 |
| spacing | 177 |
| typography | 94 |

أعلى ملفات: `mushaf-madinah.css` · `quran.css` · `admin.css` · `lessons.css`  
(المصحف SPECIAL_CASE — لا امتصاص أعمى)

## صقل سريع (Quick wins)

1. أحجام أيقونات حرفية → `size.icon.*` (**226**)
2. disabled بـ opacity فقط (**14**)
3. truncation بلا `title` (**13**)
4. مسافات inline (**10**)
5. حركة ad-hoc (**10**)

## البوابة

`test:product-excellence` ضمن `test:design-governance`

## Non-claims

لا UNIFIED_100 · شهادة المنتج تبقى PARTIAL · DEVICE_REQUIRED لقياس النقرات الحي.
