# معمارية البحث الموحّد — سُنّة

**نقطة الدخول الواحدة:** `/search` (و`/search/:q`)  
**التنفيذ:** `runAppSearch` ← `unified-local` + نطاقات `search-scopes`  
**الواجهة:** `SearchView` — سجل حديث · اقتراحات · شرائح أقسام · بطاقات نطاق

## المصادر المشمولة (نطاقات)

| نطاق | مسار/أنواع |
|---|---|
| قرآن | `/mushaf` · `/quran-hub` · surah/ayah |
| تفسير | `/tafsir` |
| حديث | `/hadith` · corpus |
| فقه | `/fiqh` · fatwa/qa |
| أذكار/أدعية | `/adhkar` · `/duas` |
| دروس | `/lessons` · courses |
| فوائد | `/fawaid` |
| سيرة | `/seerah` |
| تاريخ | `/tarikh-islami` |
| أنبياء | `/prophets` · nations |
| تعرّف على الإسلام | `/discover-islam` |
| معرفة | `/knowledge` · madhahib · islamic-sects |
| معجم | `/islamic-glossary` |
| مراجع | `/sources` · references |

## ترتيب الصلة

1. تطابق العنوان (tolerant Arabic)  
2. المسافة التحريرية  
3. أولوية النوع (`kindPriority`)  
4. ترتيب أبجدي عربي

## تجربة المستخدم

- سجل حديث: `search-history`  
- اقتراحات عند فراغ النتائج + شائع (`POPULAR_FALLBACK`)  
- لا انتقال تلقائي عند استعلام واحد (بوابة search-no-autonav)  
- نتائج admin/auth مُصفّاة

## موجات لاحقة

- ضمان تغطية `public/data/search/index.json` لكل نطاق  
- دمج بحث المصحف `/quran/search` كوضع specialized داخل نفس الصفحة  
- اقتراحات سياقية حسب القسم الحالي
