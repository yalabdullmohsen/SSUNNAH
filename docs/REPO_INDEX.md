# فهرس المستودع (REPO_INDEX)

حدّث بسطر عند تغيير بنيوي. لا تُعِد بناء الفهرس من الصفر كل جلسة.

جذر Git الفعلي: `/Users/alabdullmohsen/majlis-app` (لا تستخدم `majalis-correct`) · GitHub: `yalabdullmohsen/majalis` · منتج الويب: `artifacts/majalis`.

## حزم artifacts

| مسار | دور | في typecheck/build الجذري؟ |
|---|---|---|
| `artifacts/majalis` | ويب سُنّة (أساسي) | نعم |
| `artifacts/api-server` | Express/Vercel API | منفصل (يُبنى عند الحاجة في CI) |
| `artifacts/majalis-mobile` | Expo | مستبعد |
| `artifacts/majalis-pitch` | تسويق | مستبعد |
| `artifacts/majalis-promo` | تسويق | مستبعد |
| `artifacts/mockup-sandbox` | تجارب | مستبعد |
| `artifacts/mushafi` | أصول/أدوات مصحف | حسب الحاجة |
| `artifacts/supabase` | SQL/سياسات | يدوي/cron |
| `artifacts/majlisilm-flutter` | مهجور | مستبعد من workspace |
| `artifacts/data` / `release-train` | بيانات/قطارات | مساعدة |

## أوامر فعلية (جذر)

- `pnpm run typecheck` / `pnpm run build` — يستبعدان pitch/promo/mockup/mobile/api-server.
- ويب: `PORT=24216 BASE_PATH=/ pnpm --filter @workspace/majalis run dev|build|typecheck|lint`
- بوابة PR محلية: `pnpm run verify:pr`
- CI موحّد: `.github/workflows/ci.yml` → **Verify build** + **ci-required** (Skipped في بوابة إلزامية = فشل)
- إعداد مساحة CI: `.github/actions/setup-workspace`

## مداخل التطبيق

- توجيه: `artifacts/majalis/src/App.tsx` (wouter)
- إقلاع: `artifacts/majalis/src/main.tsx`
- صفحات مجال: `src/pages/{quran,worship,fiqh,hadith,lessons,library,account}/`
- صفحات مسطّحة كثيرة: `src/views/*.tsx` (~211)
- مصحف: `src/pages/quran/ui/MushafPageView.tsx` + `src/components/quran/*` + `src/styles/quran.css` / `mushaf-v2.css`
- تنقّل مكاني: `src/lib/spatial-nav.ts` + `src/components/motion/*` + `styles/components/native-feel.css`
- سرد واعٍ (نطق فقط): `src/lib/ai-narration/*` + `src/lib/speech-read-aloud.ts` — واجهة منتج: قصص الأنبياء
- prerender/SEO: سكربتات `artifacts/majalis/scripts/prerender.mjs`, `post-build-seo.mjs`, بوابات `verify:seo-prerender` داخل `package.json` build
- sitemap: يُولَّد ضمن سلسلة `generate:seo` / post-build (لا تحذف مسارًا ظاهرًا فيه بلا حذف المدخل)

## CSS — حرج مستورد من `main.tsx` (مستورد)

`app/styles/theme.css` · `brand-v4.css` · `tokens.css` · `index.css` · `design-system.css` · `instant-interaction.css` · `native-feel.css` · `chunk-recovery-toast.css` · `final-release.css` · `brand-v4-components.css` · `brand-v4-contrast-fixes.css` · `a11y-release-gate.css` · `capacitor-native-ux.css` · `m2030/{foundation,navigation,pages,interactions}.css` · `theme-aliases.css` · `ios-edge.css` · `sunnah-visual-language.css` (مؤجّل) · `m2030/home.css` (مع الرئيسية)

`brand-v4` / `m2030` / `final-release` / SVL = **KEEP** وقت التشغيل حتى هجرة مرحلية — التصنيف الكامل: `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` (+ `docs/release/LEGACY_CLEANUP_REPORT.md`).  
`styles/pages/*-legacy.css` = **REMOVED (WAVE2)** — القواعد الحيّة في `lessons.css` / `optimized-sheikh-image.css` / `home-widget-chrome.css` / `content-reading-shell` / `topic-page`. قبل أي حذف CSS: `rg -n "filename.css" artifacts/majalis`.  
حدود المصحف: `docs/design/MUSHAF_CSS_BOUNDARY.md` · بوابات `test:legacy-css-retirement` + `test:mushaf-css-boundary`.  
تقرير Visual+Interaction: `docs/design/SUNNAH_VISUAL_INTERACTION_FINAL_REPORT.md` (PARTIAL · WEB_RELEASED_NATIVE_HOLD).

## رموز / تعارضات شائعة

- Git الصحيح للمستودع = جذر monorepo (ليس داخل `artifacts/majalis` وحده).
- لا `framer-motion` (بوابة `test:native-feel`).
- ازدواج `@types/react` web/mobile معروف؛ `skipLibCheck`؛ لا «تصلح» بحذف UI.
- مسار المصحف الغمري: `isImmersiveChromePath` يخفي الشرائط العامة.
- حالات تفاعل ليلي: `src/styles/interaction-states.css` (DEFAULT/HOVER/ACTIVE/FOCUS_VISIBLE/SELECTED/CURRENT/HIGHLIGHTED/VISITED + `::selection` + breadcrumbs).

## Workflows (مختصر)

| ملف | متى |
|---|---|
| `ci.yml` | PR/push main — المطلوب Verify build + ci-required |
| `auto-merge-to-main.yml` | تفعيل squash بعد Verify |
| `auto-deploy.yml` | بعد main |
| `vercel-check.yml` | يدوي فقط (بعد throughput) |
| `preview-smoke.yml` | يدوي فقط (بعد throughput) |
| `ios-*.yml` | paths على ios/capacitor |
| `mushaf-gates-nightly.yml` | ليلي كامل |


## تطور المنتج

| `docs/architecture/TECHNOLOGY_INVENTORY.md` | **World-Class Eng PR-0** — جرد تقنيات + قرارات تبعيات + هدف معماري |

| `artifacts/majalis/docs/design/SUNNAH_VISUAL_LANGUAGE.md` | لغة سُنّة البصرية (SVL) — أساس + موجات PR |
| `artifacts/majalis/src/styles/modern-islamic-editorial-tokens.css` | **Modern Islamic Editorial** — ورق/زيتوني/ذهب (تعليمي؛ ليس المصحف) |
| `docs/design/SUNNAH_DESIGN_SYSTEM_REPORT.md` | توحيد Design System (PR-3 استقرار) |
| `docs/design/SUNNAH_FOUNDATION_RESET_PR0_BASELINE.md` | Foundation Reset PR-0 — خريطة اعتماديات + Baseline |
| `docs/design/SUNNAH_FOUNDATION_RESET_PR1_TOKENS.md` | Foundation Reset PR-1 — Tokens + Typography + Density |
| `docs/design/SUNNAH_UI_REFINEMENT_AUDIT.md` | **UI Refinement** — تدقيق + سلم XS/SM/MD/LG + بطاقات أكثف |
| `docs/design/DESIGN_TOKEN_AUTHORITY.md` | **Visual System PR-1** — سلطة التوكنات `--sf-*` / `--ss-*` / توافق `--mj-*` |
| `docs/design/SUNNAH_VISUAL_SYSTEM_BASELINE.md` | خط أساس مقاييس الدين البصري + ميزانيات متناقصة |
| `docs/design/LEGACY_CSS_RETIREMENT_MATRIX.md` | مصفوفة تفكيك CSS القديمة (KEEP/LEGACY/BLOCKED) + موجة PR-9 SAFE_REMOVE |
| `docs/design/MUSHAF_CSS_BOUNDARY.md` | **Interaction PR-9** — حدود CSS المصحف الحي vs Madinah المؤرشف |
| `docs/design/SUNNAH_VISUAL_INTERACTION_FINAL_REPORT.md` | تقرير Visual+Interaction (#2336–#2345) · PARTIAL · HOLD |
| `docs/design/INTERACTION_COMPONENT_AUTHORITY.md` | **Interaction PR-1** — عقد Button/Link/IconButton/FAB/Back |
| `docs/design/CARD_SURFACE_AUTHORITY.md` | **Interaction PR-5** — سلطة AppCard / InteractiveCard / StatusCard / Surfaces |
| `docs/audit/SUNNAH_FINAL_COMPLETION_AUDIT.md` | تدقيق إغلاق Visual+Interaction (#2336–#2346) — أرقام حية + PARTIAL |
| `docs/audit/SUNNAH_FINAL_COMPLETION_LIVE_STATE.md` | حالة حية tip/prod/PR train للتدقيق النهائي |
| `docs/audit/FINAL_REMEDIATION_LIVE_STATE.md` | **Final Remediation** — tip/prod/موجات حية |
| `docs/audit/SUNNAH_FINAL_REMEDIATION_REPORT.md` | تقرير الإغلاق الجذري — `WEB_RELEASED_NATIVE_HOLD` |
| `docs/audit/ROUTE_QUALITY_MATRIX.json` | مصفوفة جودة المسارات (حقول PENDING صادقة) |
| `docs/audit/DEVICE_QA_REGISTER.md` | سجل DEVICE_REQUIRED — بلا أرقام ملفّقة |
| `docs/design/TOKEN_MIGRATION_MATRIX.md` | مصفوفة هجرة الطبقات → `--sf-*`/`--sf2-*` |
| `docs/design/FINAL_TOKEN_ROLE_MATRIX.md` | **U2** — مصفوفة أدوار التوكن النهائية (canvas…focus) |
| `docs/design/PAGE_CONTRACT_MATRIX.md` | عقد AppPage/PageHeader vs UtilityScreen |
| `docs/design/UTILITYSCREEN_MIGRATION_MATRIX.md` | تقاعد UtilityScreen — 128→9 KEEP |
| `docs/audit/SUNNAH_DEBT_REDUCTION_WAVE_2_REPORT.md` | Debt Reduction Wave 2 — soft-card consumers=0 · PARTIAL |
| `docs/design/CARD_MIGRATION_STATUS.md` | حالة هجرة soft-cards → سلطة البطاقات |
| `docs/design/DARK_MODE_BRIDGE_INVENTORY.md` | جرد جسور الليل (بدون حذف جماعي) |
| `docs/audit/SUNNAH_REPOSITORY_CLOSURE_REPORT.md` | إغلاق المستودع موجة 1 — WEB_RELEASED_NATIVE_HOLD |
| `docs/remediation/SUNNAH_FINAL_CLOSURE_PROGRAM.md` | برنامج الإغلاق النهائي — مراحل متسلسلة · MATCH قبل التالي |
| `docs/remediation/FINAL_CLOSURE_LIVE_BASELINE.md` | **PHASE 0** — قفل الحالة الحية `LIVE_BASELINE_LOCKED` |
| `docs/audit/ROUTE_FEEDBACK_PRIORITY_CLOSURE_REPORT.md` | **PHASE 1** — Route Feedback Priority + evidence gate |
| `docs/audit/ROUTE_FEEDBACK_PRIORITY_EVIDENCE.json` | أدلة COMPLETE لمسارات الأولوية |
| `docs/audit/ROUTE_FEEDBACK_PUBLIC_EXPANSION_REPORT.md` | **PHASE 2** — توسيع Feedback للمسارات العامة |
| `docs/audit/ROUTE_FEEDBACK_PUBLIC_CLASSIFICATION.json` | تصنيف كل المسارات العامة + أدلة الصنف |
| `docs/remediation/ROUTE_THEME_OWNERSHIP.md` | مالك سطح المسار (`commitRouteSurface`) — بلا تسرّب pts-immersive |
| `docs/design/FORM_FEEDBACK_AUTHORITY.md` | **Interaction PR-6** — سلطة النماذج + FormFields + Empty/Loading/Error/Offline |
| `docs/admin/ADMIN_FINAL_MIGRATION_AND_SECURITY_BASELINE.md` | **ADMIN-FINAL-1** — خط أساس حي للترحيل والأمن |
| `docs/admin/ADMIN_FINAL_SCOPE_MANIFEST.md` | **ADMIN-FINAL-1** — نطاق + `IMPLEMENTATION_FROZEN` |
| `docs/admin/ADMIN_FINAL_1_CLOSURE_REPORT.md` | **ADMIN-FINAL-1** — إغلاق MERGED_AND_DEPLOYED |
| `docs/admin/ADMIN_FINAL_2_REVIEWS_INBOX_CLOSURE_REPORT.md` | **ADMIN-FINAL-2** — `ADMIN_FINAL_2_MERGED_AND_DEPLOYED` (#2422 → `8255ed5d`) |
| `docs/remediation/POST_ADMIN_FINAL_2_LIVE_BASELINE.md` | **POST_ADMIN_FINAL_2_BASELINE_LOCKED** — جرد حي بعد FINAL-2 |
| `docs/admin/ADMIN_FINAL_3_CORE_CRUD_CLOSURE_REPORT.md` | **ADMIN-FINAL-3** — Core CRUD Lessons/Sheikhs/Fawaid/Categories/Users/Roles |
| `docs/admin/ADMIN_FINAL_ROUTE_AND_OWNERSHIP_MATRIX.md` | **ADMIN-FINAL-1** — مصفوفة مسارات/ملكية/تصنيف |
| `docs/security/ADMIN_SERVER_AUTHORIZATION_CLOSURE_REPORT.md` | جرد تفويض خادم Admin · `AUTH_INVENTORY_BASELINED` |
| `docs/admin/ANALYTICS_PLATFORM_REPORT.md` | منصة تحليلات Admin v3 — `/admin/v3/analytics` · PARTIAL · بلا mock |
| `docs/design/ADMIN_V3_INTERACTION_AUTHORITY.md` | **Interaction PR-7** — سلطة تفاعل Admin v3 (Button/AppCard/FormFields/States) |
| `docs/design/DARK_MODE_AUTHORITY.md` | **Interaction PR-8** — سلطة الوضع الليلي (`--sf-*`/`--ss-*`/`--mj-*` · مفتاح `data-theme` واحد) |
| `docs/design/SUNNAH_INTERACTION_SYSTEM_BASELINE.md` | خط أساس مقاييس الأزرار + ميزانيات متناقصة |
| `docs/design/UNIFIED_SEARCH_ARCHITECTURE.md` | بحث موحّد `/search` — نطاقات كاملة |
| `docs/design/PROPHETS_STORIES_REBUILD_BASELINE.md` | **قصص الأنبياء PR-0** — جرد Routes/ألوان كحلية/كروم (بلا إصلاح منتج) |
| `docs/qa/MUSHAF_CONTROLS_INVENTORY.md` | جرد أزرار المصحف + إصلاح SYSTEM/LIGHT/DARK والأسهم والفاصل |

| `docs/performance/SUNNAH_WORLD_CLASS_BASELINE.md` | خط أساس برنامج World-Class Product Polish (PR-1) |
| `docs/performance/STARTUP_TYPOGRAPHY_FOUC_LIVE_BASELINE.md` | **Startup Typography FOUC P0/P1** — خط أساس + إضافة إصلاح سلطة `html` font-size |
| `docs/performance/SUNNAH_FINAL_PROGRAM_PHASE0_LIVE_TRUTH.md` | **FINAL PROGRAM P0** — حالة حية للاستئناف |
| `docs/performance/STARTUP_TYPOGRAPHY_FOUC_SCOPE_MANIFEST.md` | **Startup Typography FOUC P0** — نطاق + `IMPLEMENTATION_FROZEN` |
| `docs/performance/STARTUP_TYPOGRAPHY_FOUC_PHASE1_SCOPE.md` | **Startup Typography FOUC P1** — توحيد سلطة مقياس الخط |
| `docs/performance/STARTUP_TYPOGRAPHY_FOUC_PHASE2_SCOPE.md` | **Startup Typography FOUC P2** — size-adjust 97% + gate |
| `docs/performance/STARTUP_ROOT_CAUSE_REPORT.md` | **Startup PR-0** — Timeline + جرد مصادر الجاهزية + أسباب جذرية (بلا إصلاح منتج) |
| `docs/performance/REAL_STARTUP_FLICKER_ROOT_CAUSE_REPORT.md` | **قياس حي d4445a6a** — FOUC/CLS/هوية بعد First Paint على `/` وsearch/quran-hub/mushaf/prayer · حكم **C** |
| `docs/performance/ZERO_STARTUP_FLICKER_EXECUTION_REPORT.md` | تنفيذ إغلاق جزئي — Font/Canvas Authority · حكم **STARTUP_FLICKER_PARTIALLY_FIXED** |
| `docs/performance/ZERO_STARTUP_FLICKER_FINAL_VERIFICATION.md` | نهائيّة الإغلاق — theme mut=0 · chrome skeleton · حكم صادق **PARTIALLY_FIXED** |
| `docs/performance/evidence/zero-startup-flicker-final-local/` | أدلة CDP محلية للجولة النهائية |
| `docs/performance/evidence/real-startup-flicker-d4445a6a/` | أدلة CDP + لقطات + metrics لتقرير الوميض الحي |
| `docs/performance/ZERO_FLICKER_LAYOUT_SHIFT_ROOT_CAUSE_PR0.md` | **Zero Flicker PR-0** — جذر القفزات/الوميض + خط أساس صلاة (بلا إصلاح منتج) |
| `docs/performance/PRAYER_PAGE_FLASH_FIX.md` | إصلاح وميض صفحة الصلاة — صدفة متزامنة + useLayoutEffect + هيكل صلاة |
| `docs/performance/WAVE5_CRITICAL_FOUC_BASELINE.md` | **WAVE5** — خط أساس Critical CSS / FOUC على tip بعد WAVE4 |
| `docs/performance/WAVE5_CSS_IMPORT_GRAPH.md` | **WAVE5** — رسم استيرادات CSS sync/deferred + تصنيفات |
| `docs/performance/WAVE5_SCOPE_MANIFEST.md` | **WAVE5** — نطاق وتجميد التنفيذ |
| `docs/performance/SUNNAH_WAVE5_STARTUP_FOUC_CLS_CLOSURE_REPORT.md` | **WAVE5** — إغلاق Critical CSS / FOUC / CLS / startup |
| `docs/mushaf/WAVE6_MUSHAF_FLUIDITY_BASELINE.md` | **WAVE6** — خط أساس سلاسة المصحف / تقليب الصفحات |
| `docs/mushaf/WAVE6_SCOPE_MANIFEST.md` | **WAVE6** — نطاق وتجميد التنفيذ |
| `docs/mushaf/WAVE6_REAL_DEVICE_TEST_MATRIX.md` | **WAVE6** — مصفوفة أجهزة (DEVICE_REQUIRED) |
| `docs/mushaf/SUNNAH_MUSHAF_FINAL_COMPLETE_CLOSURE_REPORT.md` | إغلاق المصحف النهائي · DEVICE_HOLD |
| `docs/mushaf/SUNNAH_MUSHAF_COMPLETE_EXPERIENCE_ENHANCEMENT_REPORT.md` | تحسين تجربة المصحف · DEVICE_HOLD |
| `docs/mushaf/MUSHAF_FINAL_CLOSURE_LIVE_STATE.md` | حالة إغلاق المصحف الحية |
| `docs/mushaf/MUSHAF_PROTECTED_ASSET_MANIFEST.md` | أصول القرآن المحمية · BLOCKED_QURAN_INTEGRITY |
| `docs/mushaf/MUSHAF_CONTROL_SEMANTIC_MATRIX.md` | مصفوفة دلالات أدوات المصحف |
| `docs/mushaf/MUSHAF_COMPLETE_EXPERIENCE_BASELINE.md` | خط أساس تجربة المصحف |
| `docs/mushaf/SUNNAH_WAVE6_MUSHAF_FLUIDITY_CLOSURE_REPORT.md` | **WAVE6** — إغلاق سلاسة المصحف / تأخير التقليب |
| `docs/audit/SUNNAH_POST_WAVE6_FINAL_BASELINE.md` | **Phase0** — خط أساس حي بعد WAVE6 قبل WAVE7→13 |
| `docs/design/WAVE7_IDENTITY_CASCADE_ABSORPTION_REPORT.md` | **WAVE7** — امتصاص طبقات الهوية / إزالة reload-to-win |
| `docs/design/WAVE8_CARD_SURFACE_VALUE_ABSORPTION_REPORT.md` | **WAVE8** — امتصاص inline/radii/z-index إلى توكنات السطح |
| `docs/admin/WAVE9_ADMIN_INTERACTION_CLOSURE_REPORT.md` | **WAVE9** — إغلاق دين تفاعل/نماذج Admin + AdminConfirmDialog |
| `docs/mushaf/WAVE10_MUSHAF_CONTROL_SEMANTIC_CLOSURE_REPORT.md` | **WAVE10** — ضوابط المصحف الدلالية (بدون إعادة فتح WAVE6) |
| `docs/audit/WAVE11_ROUTE_QUALITY_EXPANSION_REPORT.md` | **WAVE11** — توسيع تغطية جودة المسارات العامة |
| `docs/audit/SUNNAH_REMAINING_PROBLEMS_MASTER_COPYABLE.md` | جرد المشاكل المتبقية الكامل (قابل للنسخ) بعد WAVE5 |
| `docs/performance/startup-pr0-baseline-metrics.json` | مقاييس/جرد Startup PR-0 (NOT MEASURED للجهاز) |
| `artifacts/majalis/src/lib/app-startup-controller.ts` | **Startup PR-1** — AppStartupController (آلة حالات الإقلاع مصدر حقيقة واحد) |
| `artifacts/majalis/src/lib/background-ui-fonts.ts` | **Startup PR-2** — تسخين خطوط اختيارية بعد INTERACTIVE بلا UI |
| `artifacts/majalis/ios/.../LaunchBackground.colorset` | **Startup PR-3** — لون إطلاق أصلي فاتح/داكن يطابق App Shell |
| `artifacts/majalis/src/App.tsx` (`ChromeNavFallback` / `ChromeBottomFallback`) | **Startup PR-4** — هيكل هيدر/تذييل ثابت من أول إطار |
| `artifacts/majalis/src/components/home/HomeHeroLcp.tsx` | **Startup PR-5** — Hero hydration مستقر (بلا ٠٪ قبل الاستعادة + شرائح ثابتة) |

| `docs/lessons-guide/` | دليل الدروس — عقد + Migration مقترحة (Feature Flag OFF) |
| `docs/memorization-research/` | **مسار الحفظ + البحوث الشرعية** — PR-0…PR-5 (تفاصيل + مصدر أصلي آمن) · `test:memorization-research-pr5` |

| `docs/product/` | سجل أقسام المنتج (39) + تدقيق اكتمال + IA intent groups · `lib/product/` |
| `docs/product-evolution/` | خط أساس برنامج التطوير + تقرير المراحل (P0+) |
| `docs/content-quality/TOTAL_TRUST_*` + `reports/total-trust/` | برنامج TOTAL TRUST (تحقق محتوى/مسارات؛ لا حكم شرعي آلي) |
| `docs/content-quality/islamic-sects-*` + `ISLAMIC_SECTS_*` | جرد/قرارات بشرية/حراسة نشر الفرق (لا PUBLISHED آلي) |
| `docs/admin/LEGACY_ADMIN_INVENTORY.md` | جرد Admin Legacy قبل Admin v3 Complete Rebuild |
| `docs/release/CURRENT_PROJECT_STATUS.md` | **سطح الحالة الحي الوحيد** — tip/إنتاج/HOLD/P0/Owner/Device |
| `docs/release/SUNNAH_RELEASE_UI_BASELINE.md` | **PR-0 إطلاق واجهة** — جرد Routes/فلاتر/عيوب مؤكدة قبل أي إعادة بناء UI |
| `docs/release/CURRENT_RELEASE_TRUTH.md` | حقيقة main/إنتاج/تصنيف البنود — مصدر مزامنة التقارير |
| `docs/release/OWNER_ACTIONS_CURRENT.md` | قرارات المالك فقط (لا ينفّذها الوكيل) |
| `docs/release/RELEASE_FREEZE.md` | تجميد Store RC مفصول عن دمج main للإصلاح |
| `docs/design/SUNNAH_AUTHORITY_UNIFICATION_FINAL_MAP.md` | خريطة توحيد السلطات · يمنع أنظمة موازية |
| `docs/audit/LIVE_UNIFICATION_BASELINE.md` | **U0** خط أساس حي للتوحيد 100% · tip/إنتاج/جرد/قياس |
| `docs/audit/SUNNAH_FINAL_PROGRAM_CONTINUATION_STATE.md` | حالة متابعة البرنامج الحيّة |
| `docs/audit/SUNNAH_FINAL_INTERNAL_AND_EXTERNAL_BOUNDARY_REPORT.md` | إغلاق داخلي نهائي WAVE7→13 · INTERNAL_CLOSURE_COMPLETE · WEB_RELEASED_NATIVE_HOLD |
| `docs/audit/WAVE13_FINAL_DEVICE_EVIDENCE_RUNBOOK.md` | Runbook أدلة أجهزة · كل صف غير منفَّذ = DEVICE_REQUIRED |
| `docs/audit/SUNNAH_FULL_PROJECT_AUDIT.md` | تدقيق شامل 2026-09-21 (`PARTIAL`) — خط أساس Remediation |

## MRMP — قطار جاهزية التطبيق (مستقل عن UNIFIED)

قطار **موازٍ** لـ U0–U13؛ لا يتبع unused-css/LHCI. هدف: `IOS_RELEASE_CANDIDATE_READY` → `ANDROID_RELEASE_CANDIDATE_READY` → `STORE_SUBMISSION_READY` → `STORE_GO`.

| مسار | دور |
|---|---|
| `docs/mobile/MRMP_V1_MASTER_PROGRAM.md` | **MRMP v1** — ميثاق البرنامج · M1–M14 · ترتيب P0 عند أولوية التطبيق |
| `docs/mobile/MOBILE_SUCCESS_CONTRACT.md` | عقد نجاح التطبيق (21 بندًا) — كل ☐ يمنع `STORE_GO` إن كان P0 |
| `docs/mobile/MRMP_V1_TRACKER.md` | لوحة حية للمراحل + blockers |
| `docs/mobile/SUNNAH_MOBILE_READINESS_FINAL_REPORT.md` | تقرير جاهزية التطبيق (M14 living) · حكم حالي `MOBILE_PARTIALLY_READY` |
| `docs/mobile/phases/M01_*.md` … `M13_*.md` | one-pagers للمراحل |
| `docs/mobile/SUNNAH_MOBILE_FIRST_EXPANSION_MASTERPLAN.md` | **Mobile First Expansion** — Watch/Widgets/LA/Maps/Fatwa · `MOBILE_FIRST_MASTERPLAN_COMPLETE` |
| `docs/mobile/ADHAN_AUDIO_AUDIT.md` | تدقيق أصوات الأذان (afinfo + حقوق) · `AUDIO_LICENSE_PARTIAL` |
| `docs/mobile/CONTENT_LICENSE_CERTIFICATION.md` | بوابة تراخيص المحتوى الأصلي · `LICENSE_CERTIFICATION_REQUIRED` |
| `docs/mobile/LICENSE_CERTIFICATION_STATUS.md` | حالة التراخيص الحالية (CURRENT) |
| `docs/mobile/MOBILE_READINESS_STATUS.md` | حالة جاهزية التطبيق الحالية (CURRENT) |
| `docs/mobile/IOS_NATIVE_ARCHITECTURE_CERTIFICATION.md` | شهادة هوية iOS + entitlements · App Group `group.com.yousef.majlisilm` |
| `docs/mobile/IOS_SHARED_DATA_CONTRACT.md` | عقد مشاركة بيانات App Group · عقود Widget/Watch (بلا تنفيذ) |
| `docs/audit/IOS_APP_GROUPS_FOUNDATION_REPORT.md` | T-028 · `IOS_SHARED_DATA_FOUNDATION_READY` |
| `docs/audit/IOS_WIDGETS_PRAYER_CERTIFICATION_REPORT.md` | T-029 · `IOS_WIDGETS_PRAYER_CERTIFIED` · PrayerWidget 6 families |
| `docs/audit/PRAYER_LIVE_ACTIVITY_CERTIFICATION_REPORT.md` | T-031 · `PRAYER_LIVE_ACTIVITY_CERTIFIED` · 4 phases + Dynamic Island |
| `docs/audit/IOS_APP_SHELL_STABILITY_REPORT.md` | T-032 · `IOS_APP_SHELL_NOT_STABLE` (FAIL) · Simulator evidence pack |
| `docs/audit/evidence/t032-ios-app-shell/` | أدلة لقطات/مصفوفة محاكي T-032 |
| `scripts/ios-app-shell-stability-matrix.sh` | تشغيل مصفوفة استقرار الصدفة على Simulator |
| `docs/audit/IOS_AUTH_CERTIFICATION_REPORT.md` | T-034 · `IOS_AUTH_NOT_CERTIFIED` (FAIL) · Cap localStorage ≠ Keychain primary |
| `docs/audit/evidence/t034-ios-auth/` | أدلة/جرد ثابت لمصادقة iOS T-034 |
| `docs/audit/MUSHAF_IOS_DEVICE_CERTIFICATION_REPORT.md` | T-036 · `MUSHAF_IOS_NOT_CERTIFIED` (FAIL) · device 25/50/100 NOT MEASURED |
| `docs/audit/evidence/t036-mushaf-ios/` | أدلة تكامل ثابت + لقطات محاكي T-036 |
| `docs/audit/IOS_PRAYER_ADHAN_CERTIFICATION_REPORT.md` | T-037 · `IOS_PRAYER_ADHAN_NOT_CERTIFIED` (FAIL) · device delivery UNPROVEN |
| `docs/audit/evidence/t037-ios-prayer-adhan/` | أدلة ثابتة/محاكي لصلاة وأذان T-037 |
| `docs/audit/IOS_PUSH_CERTIFICATION_REPORT.md` | T-038 · `IOS_PUSH_NOT_CERTIFIED` (FAIL) · APNs device delivery UNPROVEN |
| `docs/audit/evidence/t038-ios-push/` | أدلة ثابتة/محاكي لـ Push T-038 |
| `docs/audit/IOS_ACCESSIBILITY_CERTIFICATION_REPORT.md` | T-039 · `IOS_ACCESSIBILITY_NOT_CERTIFIED` (FAIL) · VoiceOver device UNPROVEN |
| `docs/audit/evidence/t039-ios-a11y/` | أدلة/جرد إمكانية الوصول T-039 |
| `docs/audit/IOS_DEVICE_MATRIX_CERTIFICATION_REPORT.md` | T-040 · `IOS_DEVICE_MATRIX_INCOMPLETE` (FAIL) |
| `docs/audit/MOBILE_PERFORMANCE_CERTIFICATION_REPORT.md` | T-041 · `MOBILE_PERFORMANCE_NOT_CERTIFIED` (FAIL) · no device numeric tables |
| `docs/audit/evidence/t041-mobile-performance/` | أدلة/نموذج fluidity فقط — بلا قياسات جهاز T-041 |
| `docs/audit/SUNNAH_MASTER_CLOSURE_REGISTER.md` | **Master Closure Register** · `MASTER_CLOSURE_REGISTER_LOCKED` |
| `docs/audit/SUNNAH_COMPLETE_PRODUCT_RELEASE_BOUNDARY_REPORT.md` | تقرير حدود الإغلاق الحي · `PROJECT_CLOSURE_PARTIAL` |
| `docs/audio-rights/evidence/cc0-adhan-istanbul-2026-10-01/` | مرشّح أذان CC0 إسطنبول · `CC0_ADHAN_CANDIDATE` |
| `docs/qa/IOS_RELEASE_CHECKLIST.md` / `ANDROID_RELEASE_CHECKLIST.md` | قوائم إطلاق أصلية يُعاد استخدامها |
| `docs/store-release/STORE_100_PERCENT_READINESS.md` | جاهزية المتجر 100% (HOLD حتى أدلة) |

## حوكمة الوكيل

| ملف | دور |
|---|---|
| `docs/AGENT_THROUGHPUT.md` | مسار Targeted Read → … → Full Verify + **Finalization Freeze Protocol** |
| `.cursor/rules/majlisilm-agent-throughput.mdc` | قاعدة Cursor الدائمة للمسار والتجميد |
| `.cursor/rules/majlisilm-ci-safe.mdc` | منع إضعاف CI؛ `verify:preflight` قبل `verify:ci` |
| `scripts/verify-preflight.mjs` | فحوص سريعة إلزامية قبل `verify:ci` (`pnpm run verify:preflight`) |
| `scripts/__tests__/agent-throughput-policy.test.mjs` | بوابة نصية لمنع الدوران/التوسع/تخفيف البوابات |

بروتوكول الوكيل: `docs/AGENT_THROUGHPUT.md` (يشمل `IMPLEMENTATION_FROZEN` وميزانيات البحث/التصحيح).
