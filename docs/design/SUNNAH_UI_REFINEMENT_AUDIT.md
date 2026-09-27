# سُنّة — تدقيق صقل الواجهة (UI Design System Overhaul)

**تاريخ:** 2026-09-27  
**موجة:** Foundation Wave (PR واحد) — ليست هجرة كل الشاشات  
**فرع:** `cursor/ui-design-system-overhaul`

## 1) ملخص التدقيق

المنصة تملك طبقات تصميم متعددة (Foundation · V2 · soft-cards · card-system · brand-v4/m2030 legacy). النتيجة الظاهرة: بطاقات كبيرة، فراغ زائد، أنصاف أقطار متعارضة (١٨/٢٤/٢٨)، ظلال أثقل من المطلوب، بحث قوي البنية لكن نطاقات ناقصة، وحالات فارغة ضعيفة الصياغة.

## 2) مشاكل الاتساق البصري

| مشكلة | دليل | إصلاح هذه الموجة |
|---|---|---|
| أنصاف أقطار عشوائية | `theme` 24/28 · `soft-cards` 24 · Foundation قديم sm=12 | سلم مغلق XS=12 SM=16 MD=20 LG=24 |
| فراغ زائد في البطاقات | `--cs-pad` / `--soft-card-pad` كبيرة | خفض كثافة STANDARD + cs tokens |
| ظلال/لمعان | soft-cards ظل عميق | ظل Foundation خفيف / مطفي |
| هرمية ضعيفة لأقسام التفاصيل | RSC بلا تمييز كافٍ | شريط جانبي لتعريف/تحذير/دليل/مصادر |
| بحث مجزّأ بالنطاقات | scopes بلا معجم/معرفة/تعرّف/مراجع | توسيع `search-scopes` + شرائح SearchView |
| Empty ضعيف | «عنصر غير موجود» | EmptyStateV2 (شرح + خطوة + مسار) |
| أزرار دائرية عائمة | ظل قوي على scroll-to-top | تقليل الاعتماد البصري؛ الرجوع داخل الصفحة أولًا |

## 3) جرد المكوّنات (Component inventory)

| مكوّن | مسار | دور |
|---|---|---|
| Foundation tokens | `styles/sunnah-foundation-tokens.css` + `lib/sunnah-foundation-tokens.ts` | مصدر حقيقة الألوان/المسافات/الحواف |
| Card system | `styles/card-system.css` + `card-system-tokens.css` | توحيد أسطح البطاقات |
| soft-cards | `styles/soft-cards.css` | طبقة قديمة → جسر Foundation |
| SectionEntryCard | `components/ui/HubCard.tsx` | دخول قسم: أيقونة/عنوان/وصف/عدّاد |
| EmptyStateV2 | `components/design-system/EmptyStateV2.tsx` | حالة فارغة ذات معنى |
| ReadingSectionCard | `components/content/ReadingSectionCard.tsx` | كتل تفصيل (تعريف/تحذير/مصادر…) |
| Search | `features/search/*` + `pages/account/ui/SearchView.tsx` | بحث موحّد `/search` |
| AppBackButton | `components/common/AppBackButton.tsx` | رجوع داخل الصفحة (بديل العائم) |

## 4) رموز محدّثة (tokens)

- **Radius:** `--sf-radius-xs|sm|md|lg` = 12|16|20|24  
- **Card radius:** `--sf-radius-card` → MD (20)  
- **Spacing density:** خفض `--sf-pad-card` / gaps  
- **Shadow:** `--sf-shadow-card` / elevated خفيفة بلا glow  
- **Icon:** `--sf-icon-size: 1.65rem`

## 5) نظام المسافات

سلم 4px ثابت (`--sf-space-1…12`) مع كثافة STANDARD أضيق. COMPACT للتنقل/الفلاتر، READING للنصوص الطويلة.

## 6) نظام البطاقات

- حشو أصغر، أيقونة أصغر، ظل خفيف، حدّ hairline، نصف قطر MD.  
- `SectionEntryCard` للنقاط الدخول.  
- RSC: إيقاع أوضح لكتل التعريف/التحذير/الأدلة/المصادر.

## 7) معمارية البحث الموحّد

انظر `docs/design/UNIFIED_SEARCH_ARCHITECTURE.md`.

نقطة الدخول: `/search` فقط (`runAppSearch`). النطاقات تشمل القرآن، التفسير، الحديث، الفقه، الأذكار/الأدعية، الدروس، الفوائد، السيرة، التاريخ، الأنبياء، تعرّف على الإسلام، المعرفة، المعجم، المراجع — مع ترتيب صلة + سجل حديث + اقتراحات موجودة أصلًا.

## 8) المكوّنات المتأثرة مباشرة

- `sunnah-foundation-tokens.css` / `.ts`
- `card-system-tokens.css`
- `soft-cards.css`
- `visual-identity-unify.css`
- `theme.css` (رموز الحواف)
- `visual-redesign-v2-tokens.css`
- `reading-section-card.css`
- `section-entry-card.css` (جديد)
- `SectionEntryCard.tsx` (جديد)
- `EmptyStateV2.tsx` · `ui-common Empty`
- `TarikhIslamiDetailPage.tsx`
- `search-scopes.ts` · `SearchView.tsx`
- `app-shell-v2.css` (أساليب empty)
- بوابات: soft-cards · visual-identity-unify · ui-refinement (جديد)

## 9) خارج هذه الموجة (follow-up)

- هجرة كل صفحات hub إلى `SectionEntryCard`
- حذف brand-v4 / m2030 كتشغيل (PR-13)
- إزالة أزرار العائم تمامًا من كل المسارات
- إثراء فهرس البحث بوثائق المعجم/المراجع إن نقصت في `index.json`
- #2299 Widgets (مراجعة يدوية iOS) · #2300 content-visibility (مسار منفصل)

## 10) قبول الجودة

- WCAG AA محفوظ (حبر غني على أبيض/عاجي)  
- لا تعديل نص شرعي  
- لا تخفيف بوابات بلا عقد محدّث  
- `verify:preflight` + `verify:ci`
