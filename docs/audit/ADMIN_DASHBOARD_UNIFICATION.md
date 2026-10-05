# توحيد لوحة التحكم — التدقيق والإصلاح

البوابة: `pnpm --filter @workspace/majalis run test:admin-dashboard-unification`
(`artifacts/majalis/src/lib/__tests__/admin-dashboard-unification-gate.test.ts`).

## منهجية التدقيق

- **تشغيل فعلي**: خادم Vite محلي مع تجاوز مصادقة مؤقت (غير مُلتزَم) لدور super_admin، ثم Playwright على **79 مسارًا**:
  38 مسارًا مستقلًا (`/admin/*` و`/admin/v3/*`) + 41 قسمًا (`/admin?section=*`)، بعرضين: سطح المكتب 1366 والجوال 390.
  جُمعت أخطاء الصفحة وconsole، وتحميل `admin.css`، والفيض الأفقي، والاتجاه RTL، والأنماط المضمّنة بـhex، مع لقطات شاشة.
- **تدقيق ساكن**: الموجّه (`AppRoutes.tsx`، `AdminV3Router`، `AdminEntryBridge`)، تنقّل `AdminShell`، شبكة الاستيراد لكل ملف في
  `src/views/admin` و`src/components/admin`، ومسح hex/الحوارات الأصلية/التبويبات.
- Supabase غير متاح محليًا: حالات «حدث خطأ» في مراكز v3 هي فشل جلب متوقَّع لا انهيار.

## النتائج (بالدليل)

| # | المشكلة | الدليل | الحالة |
|---|---------|--------|--------|
| 1 | **الصفحات المستقلة بلا تنسيق** — 15 مسارًا ملفوفًا بـ`AdminShell` (`/admin/automation/*`، `/admin/auto-content`، `/admin/content-import/*`…) | `admin.css` كان يُستورد من `AdminPage.tsx` فقط؛ التشغيل الفعلي: `adminCss=false` ولقطة تُظهر نصًا خامًا بلا شريط جانبي | أُصلح: `AdminShell` يملك `admin.css` |
| 2 | **الشريط الجانبي غير مقروء** (نص أبيض على خلفية فاتحة) | `pages/admin-shell.css` (نسخة قديمة بأسماء أصناف ميتة) يُحمَّل بعد `admin.css` ويفرض `background: transparent` على `.admin-sidebar` | أُصلح: حُذف الملف المتعارض |
| 3 | **قسم Telegram يُركَّب مرتين** | `section === "telegram"` مكرر في `AdminPage.tsx` | أُصلح |
| 4 | **قسم مجهول = صفحة فارغة** (`?section=xyz`) | لا تحقق من المفتاح | أُصلح: `resolveAdminSection` ← لوحة التحكم |
| 5 | **حاجز أخطاء الأقسام غير مستخدم** | `AdminSectionBoundary` معرّف في `AdminUI.tsx` بلا أي مستهلك | أُصلح: يلف كل قسم مع `resetKey` |
| 6 | **تحذير React في كل صفحات v3** + فقدان أنماط الأزرار-الروابط | `Button asChild` يمرّر Fragment إلى Radix `Slot` ← `Invalid prop className supplied to React.Fragment` (17 مسارًا) | أُصلح من الجذر في `components/ui/button.tsx` |
| 7 | **لوحة التحكم عالقة على هيكل التحميل عند فشل الجلب** | `if (loading \|\| !data) return <Skeleton…>` بعد `catch` | أُصلح: حالة خطأ موحّدة مع إعادة المحاولة |
| 8 | **عنوان الصفحات المستقلة خاطئ** (مثل «الدروس» على مراقبة الأتمتة) | `AdminShell section="lessons"` في 6 صفحات | أُصلح: عناوين المسارات المستقلة |
| 9 | شارتا حالة مكررتان بخريطتين مختلفتين (`AdminUI.StatusBadge` و v3 `AdminStatusBadge` تعرض القيمة الخام الإنجليزية) | ملفان | وُحِّدتا على `lib/admin-status.ts` |
| 10 | ألوان hex في شارات الحالة بـ`admin.css` | `.admin-badge--*` | استُبدلت بتوكنات `--mj-*` (تدعم الداكن) |
| 11 | **10 نسخ محلية من `StatCard`** بألوان hex | Scholarly/Verified/GlobalReference/IslamicIntelligence/OpenPlatform/KnowledgeEngine/KnowledgeReasoning/ContentProduction/AutomationDashboard/AutonomousAi | السلطة جاهزة (`AdminStatCard`)؛ الترحيل في موجة الأقسام |
| 12 | 98 لون hex في TSX اللوحة (منها أنماط مضمّنة مثل `"--arp-tab-bg": "#E8F5E9"`) | مسح ساكن | سقف ثابت في البوابة (98) يُخفَّض مع كل موجة |
| 13 | تبويبات يدوية بألوان مضمّنة (Dawah، AutomationReview) | `style={{ "--arp-tab-bg": … }}` | `AdminTabs` جاهز (ContentTabs + أسهم RTL)؛ الترحيل في موجة الأقسام |
| 14 | ملفات ميتة | `LearningPathsSection` + `learning-paths/*` (ألغيت المسارات في #1185، صفر استيراد)، و`review-hub/{DiffViewer,ReviewFilterBar,ReviewStatCards,index}` (البرميل غير مستورد) | موجة الحذف (مقيّدة بسقف 400 سطر/PR) |
| — | حوارات المتصفح الأصلية | 0 (`window.confirm/alert/prompt`) — كلها عبر `useAdminConfirm` | محروس بالبوابة |
| — | الفيض الأفقي على الجوال | 0 مسار | — |

## سلطة التخطيط الواحدة

`src/components/admin/AdminLayout.tsx` — لا مكونات مكررة؛ يعيد استخدام القائم:

- `AdminSectionLayout` / `AdminSectionHeader`: رأس القسم + الإجراءات + شريط الأدوات (أصناف `ast-*`)؛ `AdminSectionToolbar` أصبح واجهة توافق تفوّض إليه.
- `AdminStateGate`: تحميل/خطأ/فارغ عبر `AdminV3Loading` / `AdminV3ErrorState` / `AdminV3Empty` (فوق LoadingStateV2/ErrorStateV2/EmptyStateV2).
- `AdminStatCard` + `AdminStatGrid`: بطاقة إحصاء بنبرة (`neutral|success|warning|danger|info|accent`) بتوكنات.
- `AdminStatusPill` / `AdminToneBadge` / `AdminToneText`: الحالة من `resolveAdminStatus` (lib/admin-status.ts).
- `AdminTabs`: `ContentTabs` (role=tablist/tab) + أسهم WAI-ARIA واعية لـRTL + Home/End.
- التأكيد: `useAdminConfirm` القائم؛ الإشعارات: `useAdminShell().showSuccess/showError` القائم.

لم تُمسّ عقود Supabase RPC/SQL ولا فحوص الأدوار.

## المتبقي

- موجة الأقسام: ترحيل نسخ `StatCard` العشر والتبويبات اليدوية وخرائط الألوان (Lessons/Fawaid/AutoContent/AutomationReview/Submissions/Telegram/ImageImport…) إلى السلطة، وخفض سقف hex.
- موجة الحذف: `review-hub` الميت (≈295 سطرًا). مجموعة `learning-paths` (≈1383 سطرًا؛ ملف واحد 778 سطرًا) تتجاوز سقف 400 سطر حذف لكل PR — تحتاج استثناءً صريحًا من المالك.
