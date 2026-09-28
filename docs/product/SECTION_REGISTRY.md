# Section Product Registry — سُنّة

**Code:** `artifacts/majalis/src/lib/product/section-product-catalog.ts`  
**Navigation SSOT (unchanged):** `artifacts/majalis/src/config/sections.registry.ts`  
**Wave:** PLATFORM_SECTION_REGISTRY_W1 · **Date:** 2026-09-28

This catalog is the **product completeness / IA** registry for the 39 owner-required sections.  
It does **not** replace bottom-nav / drawer generation from `sections.registry.ts`.

## Relationship to navigation registry

| Concern | Source of truth |
|---|---|
| Bottom nav · drawer · home cards · search surfaces | `sections.registry.ts` |
| Completeness · source honesty · IA groups · offline/search flags | `lib/product/*` (this document) |
| Coming soon for الفرق | `comingSoon: true` on `islamic-sects` **and** product `COMING_SOON` |

## Availability legend

COMPLETE · PARTIAL · CURATED · LIVE_DATA · OFFLINE_AVAILABLE · NETWORK_REQUIRED · COMING_SOON · BLOCKED_SOURCE · BLOCKED_LICENSE · BLOCKED_INCOMPLETE · UNKNOWN

## Catalog (39/39)

| id | Arabic | Route | Availability | Publication | Registry id | Search | Offline |
|---|---|---|---|---|---|---|---|
| `kuwait-lessons` | الدروس والدورات العلمية (الكويت) | `/lessons` | LIVE_DATA | PUBLISHED | lessons | PARTIAL | NETWORK_REQUIRED |
| `sin-jeem` | سين جيم | `/qa` | CURATED | CURATED_PUBLIC | qa | PARTIAL | PARTIAL |
| `aqidah` | العقيدة الإسلامية | `/tawhid` | PARTIAL | PUBLISHED | aqidah | PARTIAL | PARTIAL |
| `seerah` | السيرة النبوية | `/seerah` | PARTIAL | PUBLISHED | seerah | PARTIAL | PARTIAL |
| `qasas-anbiya` | قصص الأنبياء | `/prophets` | PARTIAL | PUBLISHED | prophets | PARTIAL | PARTIAL |
| `hadith-ulum` | الحديث وعلومه | `/hadith` | CURATED | CURATED_PUBLIC | hadith | PARTIAL | PARTIAL |
| `tajweed` | التجويد | `/quran-tajweed` | PARTIAL | PUBLISHED | quran-tajweed | PARTIAL | UNKNOWN |
| `ulum-quran` | علوم القرآن | `/ulum-quran` | PARTIAL | PUBLISHED | ulum-quran | PARTIAL | PARTIAL |
| `quran-karim` | القرآن الكريم / المصحف | `/mushaf` | OFFLINE_AVAILABLE | PUBLISHED | quran | INDEXED | OFFLINE_READY |
| `asbab-nuzul` | أسباب النزول | `/quran-asbab` | PARTIAL | PUBLISHED | quran-asbab | PARTIAL | UNKNOWN |
| `umam-sabiqa` | الأمم السابقة | `/nations` | PARTIAL | PUBLISHED | nations | PARTIAL | PARTIAL |
| `ijaz-ilmi` | الإعجاز العلمي | `/miracles` | CURATED | CURATED_PUBLIC | miracles | PARTIAL | PARTIAL |
| `fiqh` | الفقه الإسلامي | `/fiqh` | PARTIAL | PUBLISHED | fiqh | PARTIAL | PARTIAL |
| `tarikh-islami` | التاريخ الإسلامي | `/tarikh-islami` | PARTIAL | PUBLISHED | islamic-history | INDEXED | PARTIAL |
| `firaq` | الفرق الإسلامية | `/islamic-sects` | COMING_SOON | COMING_SOON | islamic-sects | EXCLUDED | UNKNOWN |
| `maqasid` | مقاصد الشريعة | `/maqasid-sharia` | PARTIAL | PUBLISHED | maqasid-sharia | PARTIAL | PARTIAL |
| `usul-fiqh` | أصول الفقه | `/fiqh/usul` | PARTIAL | PUBLISHED | usul-fiqh | PARTIAL | PARTIAL |
| `makarim-akhlaq` | مكارم الأخلاق | `/akhlaq` | PARTIAL | PUBLISHED | akhlaq | PARTIAL | PARTIAL |
| `dalail-nubuwwah` | دلائل النبوة | `/dalail-nubuwwah` | PARTIAL | PUBLISHED | dalail-nubuwwah | PARTIAL | PARTIAL |
| `taarif-islam` | التعريف بالإسلام (متعدد اللغات) | `/discover-islam` | PARTIAL | PUBLISHED | discover-islam | PARTIAL | PARTIAL |
| `tafnid-shubuhat` | تفنيد الشبهات | `/discover-islam/doubts` | PARTIAL | CURATED_PUBLIC | shubuhat | EXCLUDED | PARTIAL |
| `nahw-balagha` | النحو والبلاغة | `/arabic-language` | BLOCKED_INCOMPLETE | CURATED_PUBLIC | arabic-language | EXCLUDED | PARTIAL |
| `institutions` | دليل المؤسسات الإسلامية | `/islamic-directory` | PARTIAL | PUBLISHED | islam-guide | PARTIAL | NETWORK_REQUIRED |
| `historic-mosques` | دليل المساجد التاريخية | `/islamic-directory` | PARTIAL | PUBLISHED | islam-guide | PARTIAL | NETWORK_REQUIRED |
| `research` | الأبحاث العلمية | `/research` | PARTIAL | PUBLISHED | research | PARTIAL | NETWORK_REQUIRED |
| `universities` | دليل الجامعات والكليات الشرعية | `/universities` | PARTIAL | PUBLISHED | universities | PARTIAL | NETWORK_REQUIRED |
| `adhkar` | الأذكار | `/adhkar` | CURATED | PUBLISHED | adhkar | INDEXED | OFFLINE_READY |
| `wasaya` | الوصايا | `/wasaya-nabawiyya` | PARTIAL | PUBLISHED | wasaya-nabawiyya | PARTIAL | PARTIAL |
| `fadail-aamal` | فضائل الأعمال | `/fadail-aamal` | PARTIAL | PUBLISHED | fadail-aamal | PARTIAL | PARTIAL |
| `sunan-yawmiyya` | السنن النبوية اليومية | `/sunan-yawmiyya` | PARTIAL | PUBLISHED | sunan-yawmiyya | PARTIAL | PARTIAL |
| `adab-talab-ilm` | آداب طالب العلم | `/adab-talab-ilm` | PARTIAL | PUBLISHED | adab-talab-ilm | PARTIAL | PARTIAL |
| `fawaid` | الفوائد المنتقاة | `/fawaid` | CURATED | PUBLISHED | fawaid | PARTIAL | PARTIAL |
| `duas` | الأدعية | `/duas` | CURATED | PUBLISHED | duas | PARTIAL | OFFLINE_READY |
| `tasbih` | التسبيح | `/tasbih` | COMPLETE | PUBLISHED | tasbih | PARTIAL | OFFLINE_READY |
| `qibla` | القبلة | `/qibla` | COMPLETE | PUBLISHED | qibla | PARTIAL | PARTIAL |
| `prayer-times` | مواقيت الصلاة | `/prayer-times` | LIVE_DATA | PUBLISHED | prayer | PARTIAL | PARTIAL |
| `lesson-reminders` | تنبيهات الدروس | `/notifications` | PARTIAL | PUBLISHED | notifications | EXCLUDED | NETWORK_REQUIRED |
| `adhan-reminders` | تنبيهات الأذان | `/athan-settings` | PARTIAL | PUBLISHED | athan-settings | EXCLUDED | PARTIAL |
| `assistant` | المساعد العلمي | `/assistant` | PARTIAL | PUBLISHED | assistant | EXCLUDED | NETWORK_REQUIRED |

## Registry gaps

**REGISTRY_GAP closed (Wave PLATFORM_REGISTRY_GAPS_W1).** `listRegistryGaps()` = **zero REGISTRY_GAP**.

- `institutions` / `historic-mosques` → nav SSOT `islam-guide` → `/islamic-directory` (child routes stay HIDDEN_FROM_NAV; no parallel seeds)
- `adab-talab-ilm` → seed in `sections.registry` → `/adab-talab-ilm` (BookUser icon)

## Validation

`validateSectionProductCatalog()` issues: **0**  
`listRegistryGaps()` length: **0**
_green_

## Non-claims

- This registry does **not** claim the app is “number one”.
- COMPLETE is reserved for tools/proven surfaces — not curriculum hubs with SUMMARY_ONLY lessons.
- الفرق الإسلامية remain **قريبًا** until source policy completes.
