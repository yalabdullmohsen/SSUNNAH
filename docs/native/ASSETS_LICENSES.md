# سجلّ الأصول والتراخيص — هيكلٌ وسياسة (توثيقٌ فقط)

## 1) هيكل السجلّ
كلُّ أصلٍ بصريّ/صوتيّ/خطّيّ في الحزمة يُسجَّل بسطرٍ واحد قبل دمجه:

| الملف | المصدر | الترخيص | التاريخ | المسؤول |
|---|---|---|---|---|
| `Assets.xcassets/Explainers/x.imageset` | «رسم أصلي» أو الرابط | «رسم أصلي» أو معرّف الترخيص + رابطه | YYYY-MM-DD | الاسم/الدور |

- الترخيص: «رسم أصلي» (مُنتَج داخليًّا ويملكه المالك) أو معرّفٌ صريح (OFL، CC0…). لا «غير معروف».
- الأصول الخطّيّة والصوتيّة تُحال إلى `AccountTexts` وSOURCES_SCREEN_ENTRIES ولا تُكرَّر هنا.
- بوّابة: اختبارٌ يمسح مجلّد الأصول ويفشل إن وُجد ملفٌّ بلا سطرٍ في السجلّ أو سطرٌ بلا ملف.

## 2) سياسة الصور
1. **رسوماتٌ أصليّة فقط** (هندسيّة/رمزيّة/مخطَّطات)، تُنتَج لهذا المشروع.
2. **لا صورَ من الإنترنت** ولا مكتبات أيقونات/صور مجهولة الترخيص، ولا مولِّدات صورٍ بلا شروط استخدام موثَّقة.
3. **لا تصويرَ لأجنّةٍ حقيقيّة** (ولا صور طبّيّة)؛ مخطَّطاتٌ تجريديّةٌ فقط، ولا تُنسَب إليها قياساتٌ أو أسبوعٌ بعينه بلا مصدر.
4. **لا تجسيدَ للأنبياء ولا للصحابة** (لا وجوهَ ولا أشخاصَ مرسومين، ولا رموزَ تمثيليّة لهم)؛ تُستعمَل الزخرفة الهندسيّة والمشاهد غير البشريّة.
5. لا شعاراتِ جهاتٍ ثالثة ولا علاماتٍ تجاريّة.
6. كلُّ رسمٍ له `illustrationBrief` مكتوبٌ قبل التنفيذ (انظر PROPHETS_STORIES_SPEC) ويُراجَع قبل الدمج.
7. نصٌّ بديل (`accessibilityLabel`) لكلّ رسمٍ ذي معنى؛ الزخرفيُّ يُخفى عن VoiceOver.

## 3) السجلّ (يقرؤه `scripts/native-assets-license-guard.sh`)
الصيغة: `| \`مسار-أو-مجلد/أو-نمط*\` | المصدر | الترخيص | التاريخ | المسؤول |`. الترخيص المقبول: «رسم أصلي»، OFL-1.1، CC0، Apache-2.0، MIT، CC-BY-4.0، QPC-QF (خطوط QPC عبر QF API بحساب مسجَّل؛ يخص ما يُولَّد من خط أسماء السور فقط).
`OWNER_DECISION` = الترخيص بانتظار تأكيد المالك: يمرّ بتحذير في الفحص العادي ويفشل في RC النهائي (`RC_FINAL=1`).
أي أصل مُتتبَّع تحت `ios-native/` أو `SunnahNative/` (عدا Tests) أو `PrayerWidget/` بلا سطر هنا يفشل CI؛ ومصدر إنترنت بلا ترخيص صريح مرفوض.

| الملف | المصدر | الترخيص | التاريخ | المسؤول |
|---|---|---|---|---|
| `ios-native/SunnahApp/Resources/Fonts/Almarai-*.ttf` | Google Fonts — Almarai (Mohamed Gaber) | OFL-1.1 | 2026-10-11 | ن1 |
| `ios-native/SunnahApp/Resources/Fonts/Amiri-*.ttf` | Google Fonts — Amiri (Khaled Hosny) | OFL-1.1 | 2026-10-11 | ن1 |
| `ios-native/SunnahApp/Resources/Fonts/NotoNaskhArabic-*.ttf` | Google Fonts — Noto Naskh Arabic | OFL-1.1 | 2026-10-11 | ن1 |
| `artifacts/majalis/ios/App/PrayerWidget/Fonts/ArefRuqaa-*.ttf` | Google Fonts — Aref Ruqaa | OFL-1.1 | 2026-10-16 | ن3 (#3370) |
| `artifacts/majalis/ios/App/PrayerWidget/Fonts/LaylaThuluth.ttf` | Mohammed Isam — الترخيص مضمَّن في ملف الخط (SIL OFL 1.1) | OFL-1.1 | 2026-10-16 | ن3 (#3370) |
| `ios-native/SunnahApp/Resources/Assets.xcassets/AppIcon*.appiconset/` | أيقونات التطبيق (رسم داخلي بحسب سجل git) | رسم أصلي | 2026-10-14 | ن1 |
| `ios-native/SunnahWatchResources/Assets.xcassets/AppIcon.appiconset/` | أيقونة الساعة (من أيقونة التطبيق) | رسم أصلي | 2026-10-16 | ن1 |
| `ios-native/SunnahApp/Resources/Assets.xcassets/IconPreview-*.imageset/` | معاينات اختيار الأيقونة (من الأيقونات أعلاه) | رسم أصلي | 2026-10-14 | ن1 |
| `ios-native/SunnahApp/Resources/Assets.xcassets/LaunchLogo.imageset/` | شعار شاشة الإطلاق (يتبع الأيقونة) | رسم أصلي | 2026-10-14 | ن1 (#3154) |
| `artifacts/majalis/ios/App/SunnahNative/Art/surah-banner.svg` | لافتة اسم السورة مولَّدة بخط أسماء السور من QPC (#3179)؛ قرار المنسّق: ترخيص QPC المسجَّل | QPC-QF | 2026-10-14 | ن3 |

ملاحظة: رسوم «خلق الإنسان» (`Templates/ExplainerArt.swift`) أشكال SwiftUI مبرمجة أصلية من `illustrationBrief` (رسم أصلي، 2026-10-17، ن1)؛ ليست ملف صورة فلا يتتبعها الحارس، وموثّقة هنا.
