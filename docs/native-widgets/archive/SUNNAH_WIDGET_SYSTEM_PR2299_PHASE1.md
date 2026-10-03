> **ARCHIVE ONLY — SUPERSEDED.** Preserved from PR #2299 Phase 1 for history.
> Current authority: `artifacts/majalis/ios/App/PrayerWidget/` + `PrayerLiveActivity/`
> (merged via #2452 T-028 · #2453 T-029 · #2454 T-031). Do **not** reintroduce
> `SunnahWidgetsPlugin` / Android widget path from this document into product code.

# سُنّة — نظام الودجت الأصلي (Native Widget System)

حالة التنفيذ: **Phase 1 (أساس إنتاجي)** · المسار: `artifacts/majalis/src/lib/native-widgets/`

لا يغيّر بيانات القرآن ولا محرك مواقيت الصلاة. المحتوى المعتمد فقط.

---

## 1) Architecture plan

```
React / Capacitor (WebView)
  └─ native-widgets/          ← عقود JSON + تفضيلات + deep links + تحليلات
       └─ writeSnapshot() → Capacitor plugin
              ├─ iOS App Group UserDefaults → WidgetKit extension
              └─ Android SharedPreferences → AppWidgetProvider
```

- **مصدر الحقيقة للحسابات:** `prayer-times.ts` (بدون تعديل المعادلات).
- **مصدر الحقيقة للمصحف:** موضع القراءة الموجود أصلًا → deep link `/mushaf`.
- **الأذكار/الأدعية/الفوائد:** من المحتوى المعتمد المنشور فقط؛ لا اختراع.
- **الهوية البصرية:** توكنات AA (`#15382D` / `#48645A` / `#5F7168` / زمرد `#0F5C3F`).

امتداد iOS الحالي `PrayerLiveActivityExtension` (WidgetKit) يُوسَّع بودجات الشاشة الرئيسية/القفل دون هدف Xcode جديد في Phase 1.

---

## 2) iOS WidgetKit plan

| مرحلة | المحتوى |
|---|---|
| **P1** | Next Prayer: systemSmall + accessoryCircular/Rectangular/Inline · قراءة JSON من App Group |
| **P2** | Prayer Times medium/large · Daily Adhkar · Daily Dua |
| **P3** | Quran verse · Resume Mushaf · Learning · Motivation · Streak · Smart |
| **P4** | Configuration intents (AppIntent) · Material-like theming · Arabic/English |

متطلبات Apple Developer:
- App Group: `group.com.yousef.majlisilm.widgets`
- تحديث وصف المتجر + لقطات ودجت
- اختبار على جهاز حقيقي (المحاكي لا يغطّي كل أحجام القفل)

---

## 3) Android AppWidget plan

| مرحلة | المحتوى |
|---|---|
| **P1** | `NextPrayerWidgetProvider` (2×2) + Material You ألوان ديناميكية اختيارية |
| **P2** | Prayer Times (resizeable) · Adhkar · Dua |
| **P3** | باقي الأنواع + Glance اختياري لاحقًا |
| **P4** | Pin widget prompt · WorkManager تحديث دقيق منخفض البطارية |

`SharedPreferences` باسم `sunnah_widgets` + مفتاح `snapshot_v1`.

---

## 4) Shared data layer

ملف اللقطة `SunnahWidgetSnapshot` (JSON):

- `version`, `updatedAt`, `locale`, `theme`
- `prayer`: current/next/remaining/hijri/gregorian/city
- `adhkar` / `dua` / `ayah` / `mushafResume` / `lesson` / `motivation` / `streak` / `smart`
- كل حقل اختياري؛ الودجت يعرض ما يتوفر فقط

التفضيلات `SunnahWidgetPrefs`: theme · refreshMode · city · calculationMethod · contentTypes · autoRotation · fontScale · locale.

---

## 5) Widget configuration UX

المسار: `/widget-settings`

- قائمة أنواع الودجت وحالة التفعيل
- مدينة/طريقة الحساب (تربط بتفضيلات الصلاة الحالية دون تغيير المحرك)
- وضع التحديث · التدوير · مقياس الخط · اللغة
- زر «مزامنة الآن» يكتب اللقطة ويطلب `reloadAllTimelines` / `updateAppWidget`

---

## 6) Refresh strategy

| وضع | السلوك |
|---|---|
| `timeline` | WidgetKit Timeline كل 15–60 دقيقة + عند دخول التطبيق |
| `on_open` | كتابة لقطة عند فتح مواقيت/أذكار/مصحف |
| `manual` | زر المزامنة فقط |
| Android | `updatePeriodMillis` ≥ 30 دقيقة + تحديث فوري بعد `writeSnapshot` |

تجنّب الشبكة داخل الودجت: كل البيانات من اللقطة المحلية.

---

## 7) Deep-linking architecture

| ودجت | مسار |
|---|---|
| Prayer / Next / Countdown | `/prayer-times` |
| Adhkar | `/adhkar` (+ فئة إن وُجدت) |
| Dua | `/duas` |
| Quran / Resume | `/mushaf` (مع استعادة الموضع الموجودة) |
| Lesson | `/lesson/:id` أو `/lessons` |
| Motivation | `/fawaid` أو حديث معتمد |
| Streak | `/prayer-times` |
| Settings | `/widget-settings` |

المضيفون الموثوقون: `https://www.ssunnah.com…` و`majlisilm://` عبر `native-deep-link.ts`.

---

## 8) Capacitor / native changes

- Plugin: `SunnahWidgets` — `writeSnapshot` · `reloadAll` · `isSupported`
- iOS: App Group entitlements (App + Extension)
- Android: `receiver` في Manifest + layouts
- لا تغيير RLS/Supabase · لا تغيير نص القرآن

---

## 9) App Store / Play update requirements

- تفعيل App Group في Apple Developer
- بناء جديد لـ TestFlight / App Store (امتداد WidgetKit محدّث)
- وصف المزايا + لقطات ودجت iOS/Android
- مراجعة سياسة المحتوى الديني (محتوى معتمد فقط)
- Android: رفع AAB يتضمن `AppWidgetProvider`

---

## 10) Rollout plan

1. **P1 (هذا الـPR):** عقود + إعدادات + Next Prayer iOS/Android + جسر + بوابات  
2. **P2:** صلاة كاملة + أذكار + دعاء + قفل موسّع  
3. **P3:** قرآن/متابعة/دروس/تحفيز/سلسلة/ذكي  
4. **P4:** إعدادات Intent · تحليلات كاملة · تحسين بطارية · إنجليزي كامل  

بوابة العقد: `native-widgets-phase1-gate.test.ts`.
