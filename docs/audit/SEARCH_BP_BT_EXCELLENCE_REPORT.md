# Search BP–BT — تميّز البحث (Search Excellence)

Date: 2026-10-03 · Branch: `cursor/search-excellence-wave`

## الصحة الكلية

**SEARCH_HEALTH: 87 · EXCELLENT**

| البعد | درجة | تقييم |
|---|---:|---|
| arabic_normalization | 100 | EXCELLENT |
| relevance | 100 | EXCELLENT |
| query_performance_proxy | 90 | EXCELLENT |
| ux | 77 | GOOD |
| index_coverage | 69 | PARTIAL |

لا اختراع لـ wall-clock؛ الأداء بروكسي ساكن (حجم الفهرس / worker / yield).

## BP — تطبيع عربي

أزواج معيارية **12/12** متكافئة بعد التطبيع:

| زوج | حالة |
|---|---|
| قرآن / قران | ✅ |
| إسلام / اسلام | ✅ |
| مسئول / مسؤول | ✅ (قاعدة `ئو→وو`) |
| Quran / quran | ✅ (`toLowerCase`) |

سلطة: `src/shared/arabic-normalize.ts`

## BQ — صلة النتائج

15/15 مجسّات top-K على الفهرس الحي (4650 وثيقة).

## BR — أداء الاستعلام (بروكسي)

| مقياس | قيمة |
|---|---:|
| docs | 4650 |
| index KiB | ~1813 |
| shards | 30 |
| worker | ✅ |
| yieldToMain | ✅ |
| gin/trgm SQL mentions | موجودة |

Latency حي: **NOT_MEASURED** (DEVICE_REQUIRED).

## BS — تغطية الفهرس

| Kind | Count | Min | Status |
|---|---:|---:|---|
| surah | 114 | 114 | OK |
| tafsir | 1177 | 100 | OK |
| lesson | 83 | 50 | OK |
| qa | 2295 | 100 | OK |
| adhkar | 303 | 100 | OK |
| hadith | 6 | 20 | **THIN** |
| scholar | 10 | 20 | **THIN** |
| fiqh | 1 | 10 | **THIN** |
| seerah | 1 | 5 | **THIN** |

## BT — تجربة البحث

| سطح | box | recent | highlight | empty | analytics |
|---|---|---|---|---|---|
| SearchView | ✅ | ✅ | ✅ | ✅ | ✅ |
| GlobalSearchModal | ✅ | ✅ | ✅ | ✅ | ❌ |
| HomeUniversalSearch | ✅ | ✅ | ✅ | ✅ | ❌ |

**P0 فجوات:** `SearchSuggestions` غير موصول · hadith/scholar تغطية رقيقة

## تحسينات شُحنت

1. تطبيع `ئو→وو` + طي حالة اللاتيني  
2. توسيع مرادفات آمن (كلمة واحدة فقط؛ الأصل أولاً) حتى لا تغرق «سور» نتائج السور  
3. محرّك + بوابة `test:search-excellence` ضمن `test:design-governance`

## التالي

1. توسيع فهرسة الحديث/العلماء/الفقه/السيرة  
2. وصل `SearchSuggestions` + `trackSearchUx` في GSM/Home  
3. قياس latency على جهاز (DEVICE_REQUIRED)

بوابة: `pnpm run test:search-excellence`
