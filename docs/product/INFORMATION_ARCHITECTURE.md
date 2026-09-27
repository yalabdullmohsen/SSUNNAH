# Information Architecture — سُنّة (Product Intent Groups)

**Code:** `artifacts/majalis/src/lib/product/section-product-catalog.ts` → `SECTION_IA_GROUPS`  
**Wave:** PLATFORM_SECTION_REGISTRY_W1  
**Note:** Drawer groups in `sidebar-nav.ts` remain the **implemented** chrome IA. These product intent groups are the target alignment for homepage, all-sections directory, search facets, breadcrumbs, sitemap, SEO, and assistant scope in later waves.

## Groups

| # | id | Title | Sections |
|---|---|---|---|
| 1 | `quran-ulum` | القرآن وعلومه | القرآن/المصحف · التجويد · علوم القرآن · أسباب النزول · الأمم السابقة · الإعجاز العلمي |
| 2 | `sunnah-hadith` | السنة والحديث | الحديث · السنن اليومية · فضائل الأعمال · دلائل النبوة |
| 3 | `aqidah-seerah-history` | العقيدة والسيرة والتاريخ | العقيدة · السيرة · قصص الأنبياء · التاريخ · الفرق (قريبًا) · مكارم الأخلاق · آداب طالب العلم |
| 4 | `fiqh-usul-maqasid` | الفقه وأصوله | الفقه · أصول الفقه · مقاصد · سين جيم · الوصايا |
| 5 | `language-talib` | اللغة وأدوات طالب العلم | النحو والبلاغة · الأبحاث · المساعد العلمي |
| 6 | `dawah-intro` | التعريف والدعوة | التعريف بالإسلام · تفنيد الشبهات |
| 7 | `lessons-institutions` | الدروس والمؤسسات | دروس الكويت · المؤسسات · المساجد التاريخية · الجامعات · تنبيهات الدروس |
| 8 | `daily-worship` | العبادة اليومية | مواقيت · تنبيهات الأذان · القبلة · الأذكار · الأدعية · التسبيح · الفوائد |

## Alignment rules (later waves)

1. Do not invent a second bottom-nav order — keep locked five tabs.
2. Map drawer labels to these intent groups when regrouping (single PR).
3. Homepage section rails use the same group titles.
4. Search facets use `iaGroup` ids.
5. Assistant retrieval scope uses the same groups + provenance filters.
6. Empty / COMING_SOON / BLOCKED destinations must not appear as “complete” cards.

## Explicit non-goals this wave

- No UI regrouping shipped yet.
- No sitemap rewrite.
- No search index rebuild.
