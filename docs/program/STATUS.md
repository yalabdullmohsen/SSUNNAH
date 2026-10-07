# الحالة الحية

آخر تحديث: 2026-10-08 · main عند `b267c471c` · يُحدَّث في PR مستقل بعد كل دمج (النافذة 3).

## PRs المفتوحة
| PR | النافذة | الموضوع | الحالة |
|---|---|---|---|
| #2742 | 1 | محرك التسميع (WhisperKit) | مفتوح — يمس `project.pbxproj` و`package.json` |
| (هذا) | 3 | توثيق البرنامج `docs/program/` | دمج تلقائي |

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

## تنبيه
- رفع TestFlight فاشل على main في كل التشغيلات منذ 2026-08-28 (`invalid curve name` في مفتاح ASC) — إصلاحه أول PR للنافذة 3.
