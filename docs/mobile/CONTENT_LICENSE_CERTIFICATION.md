# CONTENT LICENSE CERTIFICATION — سُنّة (Mobile First Gate)

| Field | Value |
|-------|-------|
| Status | **`LICENSE_CERTIFICATION_REQUIRED`** |
| Tip at charter | `57bdf91e` |
| Rule | لا يُعتبر أي محتوى جاهزًا للنشر على التطبيق / Widget / Watch / Live Activity / Offline Package إلا بعد توثيق الحقوق |
| Forbidden claims until complete | `CONTENT_CERTIFIED` · `AUDIO_CERTIFIED` · `STORE_SUBMISSION_READY` · `STORE_GO` |

## Hard gate

```text
ANY UNKNOWN = BLOCK publish / bundle / offline / watch / widget / live activity
```

---

## A. القرآن الكريم

- [ ] مصدر نص القرآن موثق
- [ ] ترخيص الاستخدام موثق
- [ ] ترخيص التوزيع موثق
- [ ] يجوز النشر داخل التطبيقات
- [ ] يجوز النشر دون اتصال
- [ ] يجوز النشر عبر Apple Watch
- [ ] يجوز النشر عبر Widgets
- [ ] يجوز النشر عبر Live Activities

أدلة مطلوبة: اسم المصدر · الموقع الرسمي · نوع الترخيص · رابط الترخيص · تاريخ المراجعة  
مرجع حي: `docs/mushaf/MUSHAF_PROTECTED_ASSET_MANIFEST.md` · `docs/LICENSES.md` · `LICENSE_RISKS.md`

## B. مصحف المدينة / QPC

- [ ] مصدر الملفات موثق
- [ ] ترخيص استخدام مصحف المدينة موثق
- [ ] حقوق إعادة التوزيع موثقة
- [ ] حقوق التضمين داخل التطبيق موثقة
- [ ] حقوق التضمين داخل Apple Watch موثقة
- [ ] حقوق التضمين داخل Widgets موثقة
- [ ] حقوق التضمين داخل Offline Package موثقة

مرجع: `STORE_ASSET_MANIFEST.md` — QPC = **OWNER_APPROVED pending / BLOCKED_LICENSE store**

## C. التلاوات القرآنية

لكل قارئ: اسم · مصدر · جهة نشر · استخدام · نسخ · offline · streaming · إعادة توزيع · تضمين  
حالات مسموحة فقط: `PUBLIC_DOMAIN` · `OPEN_LICENSE` · `LICENSED` · `OWNER_PERMISSION`  
أي `UNKNOWN` = ممنوع النشر  
مرجع حي: everyayah / mp3quran = **STREAM_ONLY** (ToS غير موقّع للتغليف)

## D. الأذان

انظر `docs/mobile/ADHAN_AUDIO_AUDIT.md`  
- [ ] كل ملف مصدر معروف
- [ ] كل ملف ترخيص معروف
- [ ] حقوق توزيع/تجاري معروفة
- [ ] جودة / sample rate / bitrate موثقة

حالة حالية: **`AUDIO_LICENSE_PARTIAL`** (CC0 field فقط مؤكد خارجيًا)

## E. الدروس والمحاضرات

لكل درس: محاضر · مصدر · مالك · إذن نشر · إعادة توزيع · offline · تضمين  
تصنيف: `OWNED` · `LICENSED` · `OPEN_USE` · `OWNER_PERMISSION_REQUIRED` · `UNKNOWN`

## F. الكتب والمتون

- [ ] ملكية فكرية معروفة
- [ ] حقوق طبع منتهية أو مرخصة
- [ ] إعادة النشر قانونية
- [ ] فهرسة/بحث قانونية
- [ ] Offline قانوني

## G. اللجنة الدائمة للإفتاء

قبل أي تكامل:
- [ ] مصدر البيانات
- [ ] حق إعادة النشر
- [ ] حق التوزيع داخل التطبيقات
- [ ] التحديثات الدورية
- [ ] نسبة المحتوى للمصدر

توثيق القناة: API / RSS / Database / Manual Import — **لا استيراد بلا إذن مكتوب**

## H. فتاوى علماء آخرين

لكل مصدر: مالك · ترخيص · إعادة نشر · تخزين · بحث · فهرسة  
سياسة المنتج: لا محتوى غير مرخص · لا تخزين محمي بلا إذن

## I. الصور

مصدر · ترخيص · استخدام · تعديل · إعادة توزيع — لكل أصل

## J. الخرائط الذهنية

داخلي = ملكية المشروع · خارجي = إذن استخدام/إعادة توزيع/تعديل

## K. الخطوط

اسم · ترخيص · تجاري · تضمين iOS · watchOS · Android  
QPC/QUL = بوابة OWNER منفصلة

## L. Apple Watch

لكل مادة على الساعة: عرض · مزامنة · تخزين مؤقت · أجهزة تابعة — كلها ☐ حتى إثبات

## M. Widgets & Live Activities

لكل مادة: خارج التطبيق · Lock Screen · Widget · Live Activity — كلها ☐ حتى إثبات

## N. Notifications

محتوى الإشعار قانوني · لا يتجاوز شروط المصدر

## O. Offline Packages

تخزين محلي · طويل المدى · إعادة تحميل · توزيع داخل التطبيق — كلها ☐ لكل حزمة

## P. Store Compliance

**Apple:** Privacy · Terms · Copyright · Attribution · Audio licenses · Third-party licenses  
**Google:** Privacy · Copyright · SDK · Data Safety  

---

## Final status machine

| Claim | Allowed when |
|-------|----------------|
| `LICENSE_CERTIFICATION_REQUIRED` | **CURRENT** (default) |
| `CONTENT_CERTIFIED` | ALL sections A–O audited · no UNKNOWN |
| `AUDIO_CERTIFIED` | ALL audio LICENSED / OPEN / PD / OWNER |
| `THIRD_PARTY_LICENSES_VERIFIED` | attributions complete |
| `STORE_SUBMISSION_READY` | CONTENT + AUDIO + THIRD_PARTY + MRMP M12 |
| `STORE_GO` | previous + Owner approval + RC evidence |

```text
LICENSE_CERTIFICATION_REQUIRED
```
