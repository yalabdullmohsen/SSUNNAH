# نظام علامات المصحف — سُنّة

حالة التنفيذ: **IMPLEMENTED (local-first)** · بلا تعديل نص/ترقيم/تخطيط المصحف · **بدون نشر** في هذه المهمة.

## 1. Bookmark architecture

```
UI overlays (sheet / side tabs / manager / resume cards)
        ↓
quran-my-bookmarks-ops  (setReading / addTyped / list / hifz progress)
        ↓
quran-my-bookmarks      (local JSON + memory index)
        ↓
mushaf-bookmark-cloud-sync → reading_resume bundle (عند تسجيل الدخول)
mushaf-bookmark-analytics  → مقاييس محلية فورية
```

المصحف يبقى مصدر الحقيقة للصفحات؛ العلامات طبقة فوقية فقط (`rb-*` خارج Geometry).

## 2. Data model

| حقل | معنى |
|---|---|
| `id` | معرّف رقمي محلي |
| `kind` | `reading` \| `hifz` \| `review` \| `custom` (+ legacy) |
| `page` | رقم صفحة المصحف |
| `ayahKey` | أول آية ظاهرة / مرجع مستقر (`سورة:آية`) |
| `createdAt` / `updatedAt` | ISO |
| `note?` | ملاحظة اختيارية |
| `rangeFromPage?` / `rangeToPage?` | نطاق الحفظ فقط |

**قواعد النوع**

- `reading`: علامة واحدة نشطة — كل حفظ جديد يستبدل السابق + يحدّث `savePagePosition`.
- `hifz` / `review` / `custom`: متعدد.
- لا تكرار لنفس `(ayahKey, kind)` النشط (ما عدا reading الذي يُصفّى بالكامل).

## 3. Sync design

1. الكتابة دائمًا محلية أولًا (`myBookmarks`).
2. `scheduleMushafBookmarksSync` يعلّم dirty ويؤجّل الدفع.
3. عند الاتصال + جلسة: دمج بـ `updatedAt` ثم رفع حزمة `mushaf_marks_v1` في `reading_resume`.
4. جدول `bookmarks` العام (دروس/كتب) **غير مستخدم** لعلامات المصحف.

## 4. UI mockups (نصي)

```
┌────────────────────────────┐
│  المصحف · ص ٣٢١            │
│  ▌ ألسنة جانبية رفيعة      │
│                            │
│  ┌─ ورقة علامة ─────────┐ │
│  │ حفظ كموضع قراءة       │ │
│  │ حفظ للحفظ             │ │
│  │ حفظ للمراجعة          │ │
│  │ علامة مخصصة           │ │
│  └───────────────────────┘ │
└────────────────────────────┘

┌─ علامات المصحف ────────────┐
│ [آخر موضع قراءة · متابعة]  │
│ قراءة · حفظ · مراجعة · شخصي│
│ … قائمة مجمّعة …           │
└────────────────────────────┘
```

## 5. Mushaf integration

- زر **علامة** في شريط الأدوات → `MushafPageBookmarkSheet`.
- قائمة الآية → `MushafBookmarkComposer` (الأنواع الأربعة).
- `MushafBookmarkMarkers`: ألسنة هامشية لا تغطي النص.
- رابط المدير: `/mushaf/bookmarks` — عنوان «علامات المصحف».

## 6. Quran home integration

- `LastReadingBookmarkCard` في مركز القرآن + متابعة التعلّم + صفحة العلامات.
- نص CTA: «العودة إلى آخر موضع قراءة» / «متابعة».

## 7. Offline strategy

- قراءة/كتابة متزامنة من التخزين المحلي.
- الطابور السحابي يؤجَّل حتى `online` + auth.
- لا await شبكة في مسار قلب الصفحة.

## 8. Accessibility review

- RTL كامل على الورقة والمدير.
- `aria-label` عربية على الإجراءات والألسنة.
- أهداف لمس ≥ 44px تقريبًا على أزرار الورقة.
- لوحة المفاتيح: أزرار أصلية قابلة للتركيز؛ لا اعتراض على أسهم تقليب الصفحة أثناء الورقة (`edgesDisabled`).

## 9. Performance review

- لا استيراد سحابي في مسار الرندر الحرج.
- فهرس صفحات في الذاكرة (`memPageIndex`).
- تحديث العلامات عبر `bookmarkEpoch` موضعي — بلا إعادة بناء كامل للصفحة.
- المزامنة بعد idle / timeout قصير.

## 10. Before / after

| قبل | بعد |
|---|---|
| أنواع متفرقة (ورد/تدبر/…) في الواجهة الأولى | أربعة أنواع منتج واضحة |
| موضع القراءة = `lastPage` فقط | `reading` bookmark صريح + بطاقة استئناف |
| نقاط هامش صغيرة | ألسنة جانبية + تسميات a11y |
| مدير بعنوان «الفواصل» | «علامات المصحف» + حالة فارغة المطلوبة |
| بلا مزامنة حزمة مصحف | حزمة `mushaf_marks_v1` عبر الحساب |

### Mockups

<img alt="ورقة علامة المصحف" src="./mockups/mushaf-bookmark-sheet-after.png" />
<img alt="شاشة علامات المصحف" src="./mockups/mushaf-bookmarks-manager-after.png" />

| Before (سلوك قديم) | After (هذا التنفيذ) |
|---|---|
| أنواع متفرقة في الواجهة الأولى | أربعة إجراءات منتج واضحة في الورقة |
| استئناف عبر lastPage فقط | بطاقة «آخر موضع قراءة» + نوع `reading` |
| نقاط هامش | ألسنة جانبية `rb-markers__tab` |

لقطات جهاز حقيقية اختيارية بعد البناء المحلي — **بلا نشر** في هذه المهمة.
