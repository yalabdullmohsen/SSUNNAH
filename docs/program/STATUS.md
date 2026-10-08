# الحالة الحية

آخر تحديث: 2026-10-08 · main عند `953fbe670` · يُحدَّث في PR مستقل بعد كل دمج (النافذة 3).

## PRs المفتوحة
| PR | النافذة | الموضوع | الحالة |
|---|---|---|---|
| #2742 | 1 | محرك التسميع (WhisperKit) | مفتوح — يمس `project.pbxproj` و`package.json` |
| #2746 | 3 | إصلاح مفتاح ASC لـTestFlight | محجوب: `blocked:danger-path` (workflow) — دمج يدوي من يوسف |
| #2747 | 3 | حزمة `SunnahNative` (TabView/NavigationStack) | محجوب: `blocked:danger-path` (`ios/`) — دمج يدوي |
| #2748 | 3 | طبقة البيانات `SunnahDataKit` | محجوب: `blocked:danger-path` (`ios/`) — دمج يدوي |
| #2749 | 3 | `WebScreen` (WKWebView) | محجوب: `blocked:danger-path` (`ios/`) — دمج يدوي |

## فروع rescue/*
| الفرع | متقدم/متأخر عن main | الإجراء (BACKLOG) |
|---|---|---|
| `rescue/fix-arabic-search-migrations-v2-v5` | +1 / −74 | فحص هجرات الإنتاج — يحتاج قرارًا |
| `rescue/feat-settings-notifications-unified` | +2 / −117 | مقارنة بمركز الإشعارات الجديد ثم حذف |
| `rescue/fix-device-compat-matrix` | +4 / −107 | استخراج البوابة فقط إلى PR جديد |
| `rescue/ui-component-layer-consolidation-cards` | +1 / −114 | للنافذة 2 بعد ratchet |
| `rescue/ui-component-layer-consolidation-w1` | +1 / −114 | للنافذة 2 بعد ratchet |

## القرارات المعلّقة (يوسف)
| القرار | المرجع |
|---|---|
| تفعيل ruleset حماية main (فحوص إلزامية) | BACKLOG §حماية main |
| هجرات البحث العربي v2-v5 | BACKLOG §rescue |
| دمج #2742 إن لم يندمج تلقائيًا | #2742 |
| دمج #2746-#2749 يدويًا، أو استثناء مسارات `SunnahNative/`/`SunnahDataKit/`/`SunnahWeb/` من `DANGER_PATH_PATTERNS` | `.github/scripts/safe-auto-merge/constants.mjs` |

## الدفعة 3: الأقسام (هجرة بقية واجهة الويب إلى `sn-`)
المصدر: استيراد `@/components/(design-system|ui-common|ui/mj)` في `src/` (300 ملف) مع baseline الـratchet (5738 لونًا · 480 استيرادًا · 1622 زرًا/بطاقة). القائمة التفصيلية بالملفات: `docs/program/batch3-files.txt`. قسم واحد لكل PR، مرتّبة بالأكثر استخدامًا أولًا.
مستثنى: الأذان والإشعارات والمواقيت (15 ملفًا — النافذة 3 تبنيه أصليًا) · ما في #2755/#2757 (دليل الصلاة/التفسير/علوم القرآن/مسار الحفظ/مركز الحفظ).

| # | القسم | الملفات | PR | الحالة |
|---|---|---|---|---|
| 01 | القرآن (`pages/quran`, `components/quran`, `QuranViewer`) | 28 | — | قيد التنفيذ |
| 02 | الرئيسية والتنقل والبحث والمكوّنات المشتركة | 28 | — | معلّق |
| 03 | الحديث | 9 | — | معلّق |
| 04 | الدروس والتعلّم | 13 | — | معلّق |
| 05 | الفقه والمذاهب | 19 | — | معلّق |
| 06 | العبادة والأذكار والرقائق | 10 | — | معلّق |
| 07 | المكتبة والمسابقات والفوائد | 17 | — | معلّق |
| 08 | الحساب والصفحات القانونية | 26 | — | معلّق |
| 09 | المعرفة والسيرة والمحتوى (`views/*`) | 75 | — | معلّق |
| 10 | الإدارة | 49 | — | أخيرًا |

## تنبيه
- رفع TestFlight فاشل على main في كل التشغيلات منذ 2026-08-28 (`invalid curve name` في مفتاح ASC) — الإصلاح في #2746 (ينتظر الدمج).

## المدموج
| PR | الموضوع |
|---|---|
| #2745 | توثيق البرنامج `docs/program/` |
