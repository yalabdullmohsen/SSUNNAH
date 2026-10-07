# ملكية المسارات بين النوافذ

**القاعدة:** نافذة واحدة فقط تكتب في كل مسار في الوقت نفسه. من لا يملك المسار لا يعدّله، ولو لسطر. كل نافذة تعمل في worktree جديد من `origin/main` لكل PR وتحذفه بعد الدمج (`git worktree remove` بلا `--force`).

## النوافذ
| النافذة | المهمة | الفرع/PR |
|---|---|---|
| 1 — التسميع | محرك التسميع على الجهاز (WhisperKit) وشاشاته | `feat/tasmee-engine` · #2742 |
| 2 — النظام البصري/SwiftUI | رموز التصميم والمكوّنات البصرية (ويب وSwiftUI) | فروع `feat/ds-*` |
| 3 — البرنامج والتنفيذ العام | هيكل SwiftUI، طبقة البيانات، WebScreen، CI/TestFlight، `docs/program/` | فروع `feat/native-*`، `fix/ci-*`، `docs/program-*` |

## جدول المسارات
| المسار | المالك (يكتب) | ممنوع على |
|---|---|---|
| `ios/App/App/Tasmee/**` | 1 | 2، 3 |
| `ios/App/App/Design/**`، `ios/App/Shared/SunnahBrandColors.swift` | 2 | 1، 3 |
| `ios/App/SunnahNative/Sources/SunnahNative/DesignSystem/**` | 2 | 1، 3 |
| `ios/App/SunnahNative/**` (عدا DesignSystem) | 3 | 1، 2 |
| `ios/App/App/AppDelegate.swift`، `Info.plist`، `ios/App/App/Services/**`، `Config/**` | 3 | 1، 2 |
| `ios/App/PrayerWidget/**`، `PrayerLiveActivity/**`، `ios/App/Shared/**` (عدا الألوان) | 3 | 1، 2 |
| `artifacts/majalis/src/**` المتعلق بالتسميع (`quran/recitation*`، `tasmee*`) | 1 | 2، 3 |
| `artifacts/majalis/src/design-system/**`، `styles/**`، رموز `sn-` | 2 | 1، 3 |
| بقية `artifacts/majalis/src/**` | 3 | 1، 2 (إلا بالدور) |
| `docs/program/**` | 3 | 1، 2 |
| `docs/**` الأخرى | مالك المسار الموثَّق | — |
| `scripts/**`، `.github/workflows/**`، `fastlane/**` | 3 | 1، 2 |
| `supabase/migrations/**` | **لا أحد تلقائيًا** — قرار يوسف لكل هجرة | الجميع |
| `feat/tasmee-engine`، `rescue/*` | 1 / يوسف | 3 |

(المسارات `ios/...` نسبةً إلى `artifacts/majalis/`.)

## الملفات المشتركة — تُعدَّل بالدور
| الملف | الترتيب | الشرط |
|---|---|---|
| `ios/App/App.xcodeproj/project.pbxproj` | 1 (#2742) ← 3 (ربط `SunnahNative`) ← 2 | لا يُفتح PR يمسه قبل دمج سابقه في الترتيب |
| `artifacts/majalis/package.json`، `pnpm-lock.yaml` | 1 ← 3 ← 2 | تغيير واحد لكل PR؛ `--lockfile-only` داخل worktree |
| `artifacts/majalis/src/AppRoutes.tsx` | 3 ← 1 ← 2 | سطر المسار فقط؛ لا إعادة ترتيب |
| baseline الـratchet (`artifacts/majalis/scripts/ui-ratchet-baseline.json`) | لا أحد يرفعه؛ الخفض فقط من النافذة 2 | لا رفع أبدًا |
| `docs/program/STATUS.md` | 3 فقط، في PR مستقل بعد كل دمج | لا يُعدَّل من PRين مفتوحين معًا |

## تسليم الدور
- المالك الحالي يدمج PR الملف المشترك، ثم يُحدَّث سطر في `STATUS.md`، وعندها تبدأ النافذة التالية.
- عند تعارض: النافذة الأحدث تعيد البناء على `origin/main` (rebase محلي على فرعها) ولا تعدّل فرع غيرها.
