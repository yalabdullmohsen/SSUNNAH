# تدقيق Knip — الشيفرة والتبعيات غير المستخدمة

> **تقرير فقط — لم يُحذف أي شيء.** أي حذف لاحق يكون في PRs دفعات مستقلة بعد تحقق يدوي (نمط `chore(dead-code)` القائم).

| البند | القيمة |
|---|---|
| الأداة | Knip 5.88.1 (بلا ملف إعداد — الاكتشاف التلقائي لمساحات pnpm) |
| التاريخ | 2026-10-05 |
| الـcommit | `25ee964` (main) |
| الأمر | `DATABASE_URL=postgres://knip:knip@127.0.0.1:5432/knip pnpm --package=knip@5 --package=typescript@5.9.3 --package=@types/node@22 dlx knip --reporter json --no-exit-code` |

`DATABASE_URL` قيمة وهمية محلية فقط: Knip يحمّل `lib/db/drizzle.config.ts` الذي يرفض العمل بدونها. لا اتصال بقاعدة بيانات ولا أسرار.

## الملخص

| الفئة | العدد | الثقة |
|---|---|---|
| ملفات غير مستوردة — **بلا أي مرجع نصي** في المستودع | 321 | عالية (مرشّح حذف بعد مراجعة) |
| ملفات غير مستوردة — لها مرجع نصي (سكربت/workflow/مسار ديناميكي) | 685 | منخفضة (غالبًا تُشغَّل بـ`node` مباشرة) |
| تبعيات `dependencies` غير مستخدمة | 12 | متوسطة |
| تبعيات `devDependencies` غير مستخدمة | 97 | متوسطة |
| تبعيات مستخدمة وغير مُدرجة (unlisted) | 5 | عالية — خطر بناء |
| استيرادات لا تُحَل (unresolved) | 4 | عالية — تحقق |
| ملفات تنفيذية غير مُدرجة (binaries) | 2 | منخفضة |
| exports غير مستخدمة | 2916 في 937 ملف | منخفضة–متوسطة |
| types غير مستخدمة | 1236 في 596 ملف | منخفضة |
| exports مكررة (duplicates) | 109 | منخفضة |

### منهجية الثقة

Knip يبني رسم الاستيراد من نقاط دخول مكتشفة (package.json، Vite، Vitest، Playwright…). ما لا يراه: السكربتات المستدعاة من workflows بـ`node path`، الدوال بمسارات Vercel (`api/`)، الاستيراد الديناميكي بمسارات مركّبة، وإعدادات الأدوات المحمّلة بالاصطلاح.
لذلك صُنّف كل ملف بـ`git grep` لاسمه (بلا الامتداد) خارج `*.md` و`docs/` و`reports/`: وجود مرجع نصي ⇒ ثقة منخفضة؛ غيابه ⇒ ثقة عالية.

## 1) ملفات بلا أي مرجع نصي (ثقة عالية) — حسب المجلد

| المجلد | العدد |
|---|---|
| `artifacts/majalis/scripts` | 290 |
| `artifacts/majalis/src` | 14 |
| `artifacts/majalis/lib` | 5 |
| `artifacts/majalis-mobile/components` | 2 |
| `.migration-backup/index.js` | 1 |
| `artifacts/majalis-mobile/metro.config.js` | 1 |
| `artifacts/majalis-promo/src` | 1 |
| `artifacts/majalis/postcss.config.mjs` | 1 |
| `artifacts/majalis/visual-check.mjs` | 1 |
| `artifacts/majalis/visual-check2.mjs` | 1 |
| `artifacts/majalis/workbox-quran-engine.config.cjs` | 1 |
| `artifacts/mockup-sandbox/src` | 1 |
| `scripts/generate-quiz-200-csv.mjs` | 1 |
| `scripts/verify-lesson-time.mjs` | 1 |

<details><summary>القائمة الكاملة (321)</summary>

- `.migration-backup/index.js` — ⚠️ إيجابي كاذب محتمل: نسخة احتياطية مؤرشفة
- `artifacts/majalis-mobile/components/KeyboardAwareScrollViewCompat.tsx`
- `artifacts/majalis-mobile/components/OptimizedList.example.tsx`
- `artifacts/majalis-mobile/metro.config.js` — ⚠️ إيجابي كاذب محتمل: إعداد Metro/Expo بالاصطلاح
- `artifacts/majalis-promo/src/components/video/index.ts`
- `artifacts/majalis/lib/bootstrap-debug.mjs`
- `artifacts/majalis/lib/cms/production-mode.mjs`
- `artifacts/majalis/lib/content-import/supabase-importer.mjs`
- `artifacts/majalis/lib/content-production/index.mjs`
- `artifacts/majalis/lib/service-guard.mjs`
- `artifacts/majalis/postcss.config.mjs` — ⚠️ إيجابي كاذب محتمل: إعداد أداة يُحمَّل بالاصطلاح
- `artifacts/majalis/scripts/_apply-trust-fields.mjs`
- `artifacts/majalis/scripts/_apply-trust-remaining.mjs`
- `artifacts/majalis/scripts/_hadith-audit.mjs`
- `artifacts/majalis/scripts/_inventory-trust.mjs`
- `artifacts/majalis/scripts/apply-books-migration.mjs`
- `artifacts/majalis/scripts/apply-learning-path-migration.mjs`
- `artifacts/majalis/scripts/apply-prophet-stories-migration.mjs`
- `artifacts/majalis/scripts/apply-quran-recitation-migration.mjs`
- `artifacts/majalis/scripts/apply-rag-migrations.mjs`
- `artifacts/majalis/scripts/apply-rls-islamic-stories.mjs`
- `artifacts/majalis/scripts/arabic-search-explain-benchmark.mjs`
- `artifacts/majalis/scripts/audit-all-routes.mjs`
- `artifacts/majalis/scripts/audit-aria-labels.mjs`
- `artifacts/majalis/scripts/audit-back-navigation.mjs`
- `artifacts/majalis/scripts/audit-critical-routes-http.mjs`
- `artifacts/majalis/scripts/audit-iphone-routes.mjs`
- `artifacts/majalis/scripts/audit-qa-categories.mjs`
- `artifacts/majalis/scripts/bootstrap-verified-knowledge.mjs`
- `artifacts/majalis/scripts/build-fiqh-books.mjs`
- `artifacts/majalis/scripts/build-r49-content.mjs`
- `artifacts/majalis/scripts/build-r50-content.mjs`
- `artifacts/majalis/scripts/build-r51-content.mjs`
- `artifacts/majalis/scripts/build-r52-content.mjs`
- `artifacts/majalis/scripts/build-r53-content.mjs`
- `artifacts/majalis/scripts/build-r54-content.mjs`
- `artifacts/majalis/scripts/build-r55-content.mjs`
- `artifacts/majalis/scripts/build-r56-content.mjs`
- `artifacts/majalis/scripts/build-r57-content.mjs`
- `artifacts/majalis/scripts/build-r58-content.mjs`
- `artifacts/majalis/scripts/build-r59-content.mjs`
- `artifacts/majalis/scripts/build-r60-content.mjs`
- `artifacts/majalis/scripts/build-r61-content.mjs`
- `artifacts/majalis/scripts/build-r62-content.mjs`
- `artifacts/majalis/scripts/build-r63-content.mjs`
- `artifacts/majalis/scripts/build-r64-content.mjs`
- `artifacts/majalis/scripts/build-r65-content.mjs`
- `artifacts/majalis/scripts/build-r66-content.mjs`
- `artifacts/majalis/scripts/build-r67-content.mjs`
- `artifacts/majalis/scripts/build-r68-content.mjs`
- `artifacts/majalis/scripts/build-r69-content.mjs`
- `artifacts/majalis/scripts/build-r70-content.mjs`
- `artifacts/majalis/scripts/build-r71-content.mjs`
- `artifacts/majalis/scripts/build-r72-content.mjs`
- `artifacts/majalis/scripts/build-r72-pm.mjs`
- `artifacts/majalis/scripts/build-r73-content.mjs`
- `artifacts/majalis/scripts/build-r74-content.mjs`
- `artifacts/majalis/scripts/build-r74-pm.mjs`
- `artifacts/majalis/scripts/build-r75-content.mjs`
- `artifacts/majalis/scripts/build-r76-content.mjs`
- `artifacts/majalis/scripts/build-r76-pm.mjs`
- `artifacts/majalis/scripts/build-r77-content.mjs`
- `artifacts/majalis/scripts/build-r78-content.mjs`
- `artifacts/majalis/scripts/build-r78-pm.mjs`
- `artifacts/majalis/scripts/build-search-index.ts`
- `artifacts/majalis/scripts/clean-content-audit-round2.mjs`
- `artifacts/majalis/scripts/clean-ui-view-filler.mjs`
- `artifacts/majalis/scripts/content-audit-round10-people.mjs`
- `artifacts/majalis/scripts/content-audit-round11-people.mjs`
- `artifacts/majalis/scripts/content-audit-round12-people.mjs`
- `artifacts/majalis/scripts/content-audit-round5-people.mjs`
- `artifacts/majalis/scripts/content-audit-round6-people.mjs`
- `artifacts/majalis/scripts/content-audit-round7-people.mjs`
- `artifacts/majalis/scripts/content-audit-round8-people.mjs`
- `artifacts/majalis/scripts/content-audit-round9-people.mjs`
- `artifacts/majalis/scripts/content-gates/expand-discover-history.mjs`
- `artifacts/majalis/scripts/content-gates/expand-nations.mjs`
- `artifacts/majalis/scripts/content-gates/expand-prophets.mjs`
- `artifacts/majalis/scripts/content-gates/expand-quran-people.mjs`
- `artifacts/majalis/scripts/content-gates/expand-round3-discover-quiz.mjs`
- `artifacts/majalis/scripts/content-gates/expand-tafsir-baqarah-imran.mjs`
- `artifacts/majalis/scripts/content-gates/fill-knowledge-tafsir-muyassar.mjs`
- `artifacts/majalis/scripts/content-gates/fix-content-audit-batch-b044.mjs`
- `artifacts/majalis/scripts/content-gates/fix-content-audit-batch-b045.mjs`
- `artifacts/majalis/scripts/contrast-check.mjs`
- `artifacts/majalis/scripts/count-r57-gaps.mjs`
- `artifacts/majalis/scripts/data-cleanup-dryrun.mjs`
- `artifacts/majalis/scripts/diversify-lesson-bridges-r40.mjs`
- `artifacts/majalis/scripts/diversify-lesson-bridges-r41.mjs`
- `artifacts/majalis/scripts/diversify-lesson-bridges-r47.mjs`
- `artifacts/majalis/scripts/enrich-fiqh-stub-lessons.mjs`
- `artifacts/majalis/scripts/enrich-r103-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r107-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r108-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r109-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r110-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r111-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r112-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r113-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r114-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r115-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r116-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r117-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r118-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r119-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r120-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r121-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r122-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r123-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r124-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r125-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r126-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r127-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r128-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r130-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r132-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r133-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r134-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r135-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r136-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r137-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r140-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r141-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r142-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r146-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r40-targets.mjs`
- `artifacts/majalis/scripts/enrich-r41-scientific-slices.mjs`
- `artifacts/majalis/scripts/enrich-r41-targets.mjs`
- `artifacts/majalis/scripts/enrich-r42-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r42-quiz.mjs`
- `artifacts/majalis/scripts/enrich-r42-seeds.mjs`
- `artifacts/majalis/scripts/enrich-r43-seeds.mjs`
- `artifacts/majalis/scripts/enrich-r44-seeds.mjs`
- `artifacts/majalis/scripts/enrich-r45-seeds.mjs`
- `artifacts/majalis/scripts/enrich-r46-seeds.mjs`
- `artifacts/majalis/scripts/enrich-r47-seeds.mjs`
- `artifacts/majalis/scripts/enrich-r49-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r59-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r81-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r83-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r85-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r87-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r89-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r91-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r93-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r95-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r97-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r99-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-round100-content.mjs`
- `artifacts/majalis/scripts/enrich-round101-content.mjs`
- `artifacts/majalis/scripts/enrich-round102-content.mjs`
- `artifacts/majalis/scripts/enrich-round103-content.mjs`
- `artifacts/majalis/scripts/enrich-round103-raises.mjs`
- `artifacts/majalis/scripts/enrich-round104-content.mjs`
- `artifacts/majalis/scripts/enrich-round105-content.mjs`
- `artifacts/majalis/scripts/enrich-round106-content.mjs`
- `artifacts/majalis/scripts/enrich-round132-content.mjs`
- `artifacts/majalis/scripts/enrich-round133-content.mjs`
- `artifacts/majalis/scripts/enrich-round45.mjs`
- `artifacts/majalis/scripts/enrich-round46.mjs`
- `artifacts/majalis/scripts/enrich-round47.mjs`
- `artifacts/majalis/scripts/enrich-round49.mjs`
- `artifacts/majalis/scripts/enrich-round50-content.mjs`
- `artifacts/majalis/scripts/enrich-round51-content.mjs`
- `artifacts/majalis/scripts/enrich-round52-content.mjs`
- `artifacts/majalis/scripts/enrich-round53-content.mjs`
- `artifacts/majalis/scripts/enrich-round54-content.mjs`
- `artifacts/majalis/scripts/enrich-round55-content.mjs`
- `artifacts/majalis/scripts/enrich-round56-content.mjs`
- `artifacts/majalis/scripts/enrich-round57-content.mjs`
- `artifacts/majalis/scripts/enrich-round58-content.mjs`
- `artifacts/majalis/scripts/enrich-round59-content.mjs`
- `artifacts/majalis/scripts/enrich-round60-content.mjs`
- `artifacts/majalis/scripts/enrich-round61-content.mjs`
- `artifacts/majalis/scripts/enrich-round61-raises.mjs`
- `artifacts/majalis/scripts/enrich-round62-content.mjs`
- `artifacts/majalis/scripts/enrich-round63-content.mjs`
- `artifacts/majalis/scripts/enrich-round63-raises.mjs`
- `artifacts/majalis/scripts/enrich-round64-content.mjs`
- `artifacts/majalis/scripts/enrich-round65-content.mjs`
- `artifacts/majalis/scripts/enrich-round65-raises.mjs`
- `artifacts/majalis/scripts/enrich-round66-content.mjs`
- `artifacts/majalis/scripts/enrich-round68-content.mjs`
- `artifacts/majalis/scripts/enrich-round69-content.mjs`
- `artifacts/majalis/scripts/enrich-round69-raises.mjs`
- `artifacts/majalis/scripts/enrich-round69.mjs`
- `artifacts/majalis/scripts/enrich-round70-content.mjs`
- `artifacts/majalis/scripts/enrich-round71-content.mjs`
- `artifacts/majalis/scripts/enrich-round72-content.mjs`
- `artifacts/majalis/scripts/enrich-round73-content.mjs`
- `artifacts/majalis/scripts/enrich-round73-raises.mjs`
- `artifacts/majalis/scripts/enrich-round74-content.mjs`
- `artifacts/majalis/scripts/enrich-round75-content.mjs`
- `artifacts/majalis/scripts/enrich-round75-raises.mjs`
- `artifacts/majalis/scripts/enrich-round77-content.mjs`
- `artifacts/majalis/scripts/enrich-round78-content.mjs`
- `artifacts/majalis/scripts/enrich-round79-content.mjs`
- `artifacts/majalis/scripts/enrich-round80-content.mjs`
- `artifacts/majalis/scripts/enrich-round81-content.mjs`
- `artifacts/majalis/scripts/enrich-round82-content.mjs`
- `artifacts/majalis/scripts/enrich-round83-content.mjs`
- `artifacts/majalis/scripts/enrich-round83-raises.mjs`
- `artifacts/majalis/scripts/enrich-round84-content.mjs`
- `artifacts/majalis/scripts/enrich-round85-content.mjs`
- `artifacts/majalis/scripts/enrich-round85-raises.mjs`
- `artifacts/majalis/scripts/enrich-round85-seed-raises.mjs`
- `artifacts/majalis/scripts/enrich-round86-content.mjs`
- `artifacts/majalis/scripts/enrich-round87-bios.mjs`
- `artifacts/majalis/scripts/enrich-round87-content.mjs`
- `artifacts/majalis/scripts/enrich-round87-raises.mjs`
- `artifacts/majalis/scripts/enrich-round88-content.mjs`
- `artifacts/majalis/scripts/enrich-round89-content.mjs`
- `artifacts/majalis/scripts/enrich-round89-raises.mjs`
- `artifacts/majalis/scripts/enrich-round89-seed-raises.mjs`
- `artifacts/majalis/scripts/enrich-round90-content.mjs`
- `artifacts/majalis/scripts/enrich-round91-bios.mjs`
- `artifacts/majalis/scripts/enrich-round91-content.mjs`
- `artifacts/majalis/scripts/enrich-round91-raises.mjs`
- `artifacts/majalis/scripts/enrich-round92-content.mjs`
- `artifacts/majalis/scripts/enrich-round93-content.mjs`
- `artifacts/majalis/scripts/enrich-round93-fiqh-landmarks.mjs`
- `artifacts/majalis/scripts/enrich-round93-raises.mjs`
- `artifacts/majalis/scripts/enrich-round93-seed-raises.mjs`
- `artifacts/majalis/scripts/enrich-round94-content.mjs`
- `artifacts/majalis/scripts/enrich-round95-bios.mjs`
- `artifacts/majalis/scripts/enrich-round95-content.mjs`
- `artifacts/majalis/scripts/enrich-round95-raises.mjs`
- `artifacts/majalis/scripts/enrich-round96-content.mjs`
- `artifacts/majalis/scripts/enrich-round97-content.mjs`
- `artifacts/majalis/scripts/enrich-round97-fiqh-landmarks.mjs`
- `artifacts/majalis/scripts/enrich-round97-raises.mjs`
- `artifacts/majalis/scripts/enrich-round97-seed-raises.mjs`
- `artifacts/majalis/scripts/enrich-round98-content.mjs`
- `artifacts/majalis/scripts/enrich-round99-bios.mjs`
- `artifacts/majalis/scripts/enrich-round99-content.mjs`
- `artifacts/majalis/scripts/enrich-round99-raises.mjs`
- `artifacts/majalis/scripts/extract-client-seeds-to-json.mjs`
- `artifacts/majalis/scripts/fill-empty-fiqh-chapters.mjs`
- `artifacts/majalis/scripts/fiqh-expand-adab-and-enrich.mjs`
- `artifacts/majalis/scripts/fiqh-strip-template-practical.mjs`
- `artifacts/majalis/scripts/fix-admin-auth.mjs`
- `artifacts/majalis/scripts/fix-quiz-section-props.mjs`
- `artifacts/majalis/scripts/fix-r45-stories.mjs`
- `artifacts/majalis/scripts/gen-rulings-sync-sql.mjs`
- `artifacts/majalis/scripts/generate-autonomous-ai-report.mjs`
- `artifacts/majalis/scripts/generate-codebase-inventory.mjs`
- `artifacts/majalis/scripts/generate-digital-learning-report.mjs`
- `artifacts/majalis/scripts/generate-global-reference-report.mjs`
- `artifacts/majalis/scripts/generate-governance-report.mjs`
- `artifacts/majalis/scripts/generate-icons.ts`
- `artifacts/majalis/scripts/generate-import-files.mjs`
- `artifacts/majalis/scripts/generate-islamic-intelligence-report.mjs`
- `artifacts/majalis/scripts/generate-open-platform-report.mjs`
- `artifacts/majalis/scripts/generate-section-og-images.mjs`
- `artifacts/majalis/scripts/generate-world-cities.mjs`
- `artifacts/majalis/scripts/islamic-stories-migrate.mjs`
- `artifacts/majalis/scripts/islamic-stories-seed-1.mjs`
- `artifacts/majalis/scripts/islamic-stories-seed-2.mjs`
- `artifacts/majalis/scripts/islamic-stories-seed-3.mjs`
- `artifacts/majalis/scripts/islamic-stories-seed-4.mjs`
- `artifacts/majalis/scripts/islamic-stories-seed-5.mjs`
- `artifacts/majalis/scripts/json-to-lessons-csv.mjs`
- `artifacts/majalis/scripts/measure-home-cls.mjs`
- `artifacts/majalis/scripts/measure-home-tbt.mjs`
- `artifacts/majalis/scripts/measure-lesson-bodies-r42.mjs`
- `artifacts/majalis/scripts/measure-mushaf-opening-ornaments.mjs`
- `artifacts/majalis/scripts/measure-startup-flicker-u4.mjs`
- `artifacts/majalis/scripts/merge-quran-people-from-knowledge.mjs`
- `artifacts/majalis/scripts/migrate-quiz-section-ids.mjs`
- `artifacts/majalis/scripts/migrate-views-batch.mjs`
- `artifacts/majalis/scripts/mushaf-flip-perf-sim.mjs`
- `artifacts/majalis/scripts/mushaf-madinah/capture-classic-round.mjs`
- `artifacts/majalis/scripts/perf-regression-gate.mjs`
- `artifacts/majalis/scripts/print-pooler-database-url.mjs`
- `artifacts/majalis/scripts/process-zaghloul-video.mjs`
- `artifacts/majalis/scripts/production-verify.mjs`
- `artifacts/majalis/scripts/publish-prerender.mjs`
- `artifacts/majalis/scripts/quran-import/fetch-qpc-fonts.mjs`
- `artifacts/majalis/scripts/r48-replacement-block.ts`
- `artifacts/majalis/scripts/r48-stories-insert.ts`
- `artifacts/majalis/scripts/rebalance-lesson-bridges.mjs`
- `artifacts/majalis/scripts/regen-fiqh-sessions-json.mjs`
- `artifacts/majalis/scripts/regen-scholars-list-json.mjs`
- `artifacts/majalis/scripts/restore-lesson-bodies.mjs`
- `artifacts/majalis/scripts/scan-content-audit.mjs`
- `artifacts/majalis/scripts/seed-citation-sources.mjs`
- `artifacts/majalis/scripts/seed-hadith-collections.mjs`
- `artifacts/majalis/scripts/seed-recommendations.mjs`
- `artifacts/majalis/scripts/seed-search-index.mjs`
- `artifacts/majalis/scripts/smoke-pages.mjs`
- `artifacts/majalis/scripts/split-design-system-authority.mjs`
- `artifacts/majalis/scripts/strip-content-padding.mjs`
- `artifacts/majalis/scripts/strip-fawaid-sermon-tails.mjs`
- `artifacts/majalis/scripts/strip-lesson-template-tails.mjs`
- `artifacts/majalis/scripts/sync-public-lessons-metadata.mjs`
- `artifacts/majalis/scripts/sync-seo-data.ts`
- `artifacts/majalis/scripts/tafsir/download-tafsir-bundles.mjs`
- `artifacts/majalis/scripts/tafsir/sanitize-tafsir-bundles.mjs`
- `artifacts/majalis/scripts/take-screenshots.ts`
- `artifacts/majalis/scripts/verify-owner-env.mjs`
- `artifacts/majalis/scripts/verify-search.ts`
- `artifacts/majalis/src/components/admin/review-hub/index.ts`
- `artifacts/majalis/src/features/mushaf-reader/mushaf-verse-marker-tokens.ts`
- `artifacts/majalis/src/features/mushaf-reader/reader-overlay-coordinator.ts`
- `artifacts/majalis/src/features/prayer-times/index.ts`
- `artifacts/majalis/src/lib/__tests__/app-routing-source.ts`
- `artifacts/majalis/src/lib/audio/index.ts`
- `artifacts/majalis/src/lib/prayer-notification-service.ts`
- `artifacts/majalis/src/lib/surah-names-uthmani-full.ts`
- `artifacts/majalis/src/lib/verified-hadith-fill-daif-b3.ts`
- `artifacts/majalis/src/lib/verified-hadith-fill-mawdu-b2.ts`
- `artifacts/majalis/src/lib/verified-hadith-fill-mawdu-b3.ts`
- `artifacts/majalis/src/lib/verified-hadith-fill-sahih-b4.ts`
- `artifacts/majalis/src/styles/pages/learning-quiz.css`
- `artifacts/majalis/src/views/admin/LearningPathsSection.tsx`
- `artifacts/majalis/visual-check.mjs`
- `artifacts/majalis/visual-check2.mjs`
- `artifacts/majalis/workbox-quran-engine.config.cjs` — ⚠️ إيجابي كاذب محتمل: إعداد Workbox يُمرَّر لأداة البناء
- `artifacts/mockup-sandbox/src/components/ui/button-group.tsx`
- `scripts/generate-quiz-200-csv.mjs`
- `scripts/verify-lesson-time.mjs`

</details>

## 2) ملفات لها مرجع نصي (ثقة منخفضة) — حسب المجلد

| المجلد | العدد |
|---|---|
| `artifacts/majalis/scripts` | 232 |
| `artifacts/majalis/src` | 183 |
| `artifacts/majalis/lib` | 165 |
| `artifacts/mockup-sandbox/src` | 55 |
| `artifacts/majalis/api` | 4 |
| `artifacts/majalis/public` | 4 |
| `artifacts/majalis-promo/src` | 3 |
| `artifacts/majalis-mobile/components` | 2 |
| `artifacts/majalis/content` | 2 |
| `artifacts/majalis/server` | 2 |
| `.migration-backup/AuthProvider.jsx` | 1 |
| `.migration-backup/NavBar.jsx` | 1 |
| `.migration-backup/index.d.ts` | 1 |
| `.migration-backup/layout.jsx` | 1 |
| `.migration-backup/next.config.js` | 1 |
| `.migration-backup/page.jsx` | 1 |
| `.migration-backup/supabase.js` | 1 |
| `.migration-backup/theme.js` | 1 |
| `.migration-backup/ui.jsx` | 1 |
| `api/assistant.js` | 1 |
| `api/assistant/health.js` | 1 |
| `api/cron/sync-data.js` | 1 |
| `api/healthz.js` | 1 |
| `api/prayer-times.js` | 1 |
| `app/api/updates` | 1 |
| `app/layout.tsx` | 1 |
| `artifacts/api-server/api` | 1 |
| `artifacts/majalis/lighthouserc.cjs` | 1 |
| `artifacts/majalis/middleware.js` | 1 |
| `docs/ux/homepage-redesign` | 1 |
| `lib/api-handlers/account-delete.js` | 1 |
| `lib/api-spec/orval.config.ts` | 1 |
| `scripts/ci/changed-scope.ts` | 1 |
| `scripts/design-governance-preflight.mjs` | 1 |
| `scripts/device-evidence/capture-build-context.mjs` | 1 |
| `scripts/device-evidence/validate-evidence-rows.mjs` | 1 |
| `scripts/device-evidence/validate-physical-evidence-pack.mjs` | 1 |
| `scripts/store-compliance-audit.mjs` | 1 |
| `scripts/sync-mushaf-page-metadata.mjs` | 1 |
| `scripts/total-trust-hadith-tafsir.mjs` | 1 |
| `scripts/total-trust-inventory.mjs` | 1 |
| `scripts/total-trust-mushaf-boundary.mjs` | 1 |
| `scripts/total-trust-route-states.mjs` | 1 |

<details><summary>القائمة الكاملة مع مثال مرجع (685)</summary>

- `.migration-backup/AuthProvider.jsx` ← `.github/CODEOWNERS` — نسخة احتياطية مؤرشفة
- `.migration-backup/NavBar.jsx` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs` — نسخة احتياطية مؤرشفة
- `.migration-backup/index.d.ts` ← `.github/workflows/ci.yml` — نسخة احتياطية مؤرشفة
- `.migration-backup/layout.jsx` ← `.github/scripts/release-train/classify.mjs` — نسخة احتياطية مؤرشفة
- `.migration-backup/next.config.js` ← `artifacts/majalis/scripts/verify-deploy-output.mjs` — نسخة احتياطية مؤرشفة
- `.migration-backup/page.jsx` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs` — نسخة احتياطية مؤرشفة
- `.migration-backup/supabase.js` ← `.github/CODEOWNERS` — نسخة احتياطية مؤرشفة
- `.migration-backup/theme.js` ← `.migration-backup/NavBar.jsx` — نسخة احتياطية مؤرشفة
- `.migration-backup/ui.jsx` ← `.cursor/rules/majlisilm-ci-safe.mdc` — نسخة احتياطية مؤرشفة
- `api/assistant.js` ← `api/assistant/health.js` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `api/assistant/health.js` ← `.github/scripts/release-train/__tests__/rollback.test.mjs` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `api/cron/sync-data.js` ← `artifacts/majalis/data/governance-technical-docs.json` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `api/healthz.js` ← `.github/scripts/release-train/__tests__/rollback.test.mjs` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `api/prayer-times.js` ← `.github/scripts/release-train/constants.mjs` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `app/api/updates/route.ts` ← `.github/workflows/phase2-trial-import.yml` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `app/layout.tsx` ← `.github/scripts/release-train/classify.mjs`
- `artifacts/api-server/api/index.js` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `artifacts/majalis-mobile/components/CustomImage.tsx` ← `artifacts/majalis-mobile/components/OptimizedList.example.tsx`
- `artifacts/majalis-mobile/components/OptimizedList.tsx` ← `artifacts/majalis-mobile/components/OptimizedList.example.tsx`
- `artifacts/majalis-promo/src/components/video/ReplitLoadingScene.tsx` ← `artifacts/majalis-promo/src/components/video/index.ts`
- `artifacts/majalis-promo/src/hooks/use-mobile.tsx` ← `artifacts/majalis/src/components/ui/sidebar.tsx`
- `artifacts/majalis-promo/src/lib/utils.ts` ← `artifacts/majalis/components.json`
- `artifacts/majalis/api/_deps.mjs` ← `artifacts/majalis/api/index.js` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `artifacts/majalis/api/healthz.js` ← `.github/scripts/release-train/__tests__/rollback.test.mjs` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `artifacts/majalis/api/index.js` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `artifacts/majalis/api/lessons/[id].js` ← `artifacts/majalis-mobile/app/_layout.tsx` — دالة Vercel serverless — نقطة دخول بالاصطلاح
- `artifacts/majalis/content/archive/rulings-encyclopedia/seeds/rulings-encyclopedia-seed.generated.ts` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/content/archive/rulings-encyclopedia/seeds/rulings-seed.ts` ← `"artifacts/majalis/content/archive/rulings-encyclopedia/data/chunks/\330\247\331\204\330\243\330\263\330\261\330\251.json"`
- `artifacts/majalis/lib/analytics-platform/access.mjs` ← `.github/workflows/resolve-pr-conflicts.yml`
- `artifacts/majalis/lib/analytics-platform/aggregate.mjs` ← `.github/scripts/ci/__tests__/aggregate-required.test.mjs`
- `artifacts/majalis/lib/api-handlers/account/delete.js` ← `.github/scripts/release-train/merge-sequential.mjs`
- `artifacts/majalis/lib/api-handlers/account/export.js` ← `.github/actions/setup-workspace/activate-pnpm.sh`
- `artifacts/majalis/lib/api-handlers/admin/ai-agents.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/analytics-platform.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/auth-context.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/auto-content.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/auto-knowledge-engine.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/autonomous-ai.js` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/api-handlers/admin/autonomous-platform.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/bootstrap-owner.js` ← `.github/workflows/owner-bootstrap.yml`
- `artifacts/majalis/lib/api-handlers/admin/check-fiqh-links.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/admin/content-import.js` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/lib/api-handlers/admin/content-production.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/feature-health.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/global-reference.js` ← `artifacts/majalis/data/global-reference-report.json`
- `artifacts/majalis/lib/api-handlers/admin/governance.js` ← `.cursor/rules/majlisilm-general.mdc`
- `artifacts/majalis/lib/api-handlers/admin/instagram-integration.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/islamic-intelligence.js` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/api-handlers/admin/knowledge-pipeline.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/knowledge-reasoning.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/lesson-automation.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/lesson-from-image.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/lesson-from-url.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/majlis-knowledge-engine.js` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/lib/api-handlers/admin/open-platform.js` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/api-handlers/admin/platform-bootstrap.js` ← `.github/scripts/safe-auto-merge/constants.mjs`
- `artifacts/majalis/lib/api-handlers/admin/production-activate.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/scholarly-verification.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/admin/search-analytics.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/smart-cms.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/source-monitor.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/admin/submissions.js` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/lib/api-handlers/admin/sync-fiqh-council.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/admin/telegram.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/admin/v3.js` ← `.migration-backup/package-lock.json`
- `artifacts/majalis/lib/api-handlers/admin/verified-knowledge.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/assistant/health.js` ← `.github/scripts/release-train/__tests__/rollback.test.mjs`
- `artifacts/majalis/lib/api-handlers/auto-content.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/citations.js` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/lib/api-handlers/client-error-log.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/content-delta.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/content-relations.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/cron/ai-agents.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/apply-migrations.js` ← `artifacts/majalis/.env.local.example`
- `artifacts/majalis/lib/api-handlers/cron/auto-content-health.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/auto-content-sync.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/auto-knowledge-sync.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/autonomous-orchestrator.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/autonomous-platform.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/bootstrap-database.js` ← `.github/workflows/phase2-trial-import.yml`
- `artifacts/majalis/lib/api-handlers/cron/bootstrap-owner.js` ← `.github/workflows/owner-bootstrap.yml`
- `artifacts/majalis/lib/api-handlers/cron/check-fiqh-links.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/connector-health.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/content-scheduler.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/content-scoring.js` ← `artifacts/majalis/lib/__tests__/p0-queue-workers.test.mjs`
- `artifacts/majalis/lib/api-handlers/cron/daily-benefit-rotation.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/cron/global-reference-review.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/governance-backup.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/import-phase2-trial.js` ← `.github/workflows/phase2-trial-import.yml`
- `artifacts/majalis/lib/api-handlers/cron/islamic-intelligence.js` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/api-handlers/cron/knowledge-reasoning.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/knowledge-sync.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/lesson-intelligence.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/lesson-source-monitor.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/majlis-knowledge-engine.js` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/lib/api-handlers/cron/monitor-sources.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/platform-bootstrap.js` ← `.github/scripts/safe-auto-merge/constants.mjs`
- `artifacts/majalis/lib/api-handlers/cron/process-import-jobs.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/researches-daily-import.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/cron/scholarly-verification.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/source-monitor.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/cron/sync-data.js` ← `api/cron/sync-data.js`
- `artifacts/majalis/lib/api-handlers/cron/sync-fiqh-council.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/system-health.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/cron/telegram-processor.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/cron/universities-review.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/cron/verified-knowledge.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/daily-content.js` ← `artifacts/majalis/data/governance-report.json`
- `artifacts/majalis/lib/api-handlers/deep-health.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/digital-learning.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/feed.js` ← `.github/scripts/safe-auto-merge/__tests__/path-classifier.test.mjs`
- `artifacts/majalis/lib/api-handlers/fiqh-research-assistant.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/global-reference.js` ← `artifacts/majalis/data/global-reference-report.json`
- `artifacts/majalis/lib/api-handlers/intelligent-search.js` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/api-handlers/internal/status.js` ← `.cursor/rules/majlisilm-ci-safe.mdc`
- `artifacts/majalis/lib/api-handlers/knowledge-graph.js` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/lib/api-handlers/knowledge-reasoning.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/knowledge-recommendations.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/knowledge-search.js` ← `artifacts/majalis/data/release-audit-report.json`
- `artifacts/majalis/lib/api-handlers/learning-path.js` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/lib/api-handlers/lesson-page.js` ← `artifacts/majalis/api/lessons/[id].js`
- `artifacts/majalis/lib/api-handlers/narration-tts.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/prayer-times.js` ← `.github/scripts/release-train/constants.mjs`
- `artifacts/majalis/lib/api-handlers/public-config.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/push-subscribe.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/rag-research.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/reading-sync.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/recommendations.js` ← `artifacts/majalis/data/islamic-intelligence-report.json`
- `artifacts/majalis/lib/api-handlers/researches-submit.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/scholarly-search.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/sitemap.js` ← `.cursor/rules/majlisilm-seo.mdc`
- `artifacts/majalis/lib/api-handlers/submissions.js` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/lib/api-handlers/topic-content.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/transcribe.js` ← `artifacts/majalis/.env.local.example`
- `artifacts/majalis/lib/api-handlers/universities-vercel.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/api-handlers/universities.js` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/api-handlers/updates.js` ← `app/api/updates/route.ts`
- `artifacts/majalis/lib/api-handlers/v1.js` ← `.github/scripts/ci/__tests__/dist-artifact-identity.test.mjs`
- `artifacts/majalis/lib/api-handlers/v2.js` ← `.github/CODEOWNERS`
- `artifacts/majalis/lib/api-handlers/v3.js` ← `.migration-backup/package-lock.json`
- `artifacts/majalis/lib/api-handlers/webhook/telegram.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/cms/apify-instagram-connector.mjs` ← `artifacts/majalis/lib/cms/instagram-multitype-sync.mjs`
- `artifacts/majalis/lib/cms/draft-service.mjs` ← `artifacts/majalis/lib/api-handlers/admin/smart-cms.js`
- `artifacts/majalis/lib/cms/instagram-manual-assist.mjs` ← `artifacts/majalis/lib/api-handlers/admin/instagram-integration.js`
- `artifacts/majalis/lib/cms/instagram-multitype-sync.mjs` ← `artifacts/majalis/lib/cms/instagram-content-classifier.mjs`
- `artifacts/majalis/lib/cms/sitemap-builder.mjs` ← `artifacts/majalis/lib/api-handlers/feed.js`
- `artifacts/majalis/lib/content-import/import-worker.mjs` ← `artifacts/majalis/lib/api-handlers/admin/content-import.js`
- `artifacts/majalis/lib/digital-learning/ai-lesson.mjs` ← `artifacts/majalis/lib/digital-learning/index.mjs`
- `artifacts/majalis/lib/digital-learning/analytics.mjs` ← `artifacts/majalis/data/autonomous-ai-report.json`
- `artifacts/majalis/lib/digital-learning/calendar.mjs` ← `.github/workflows/ci.yml`
- `artifacts/majalis/lib/digital-learning/certificates.mjs` ← `artifacts/majalis/data/digital-learning-report.json`
- `artifacts/majalis/lib/digital-learning/index.mjs` ← `artifacts/majalis/lib/api-handlers/digital-learning.js`
- `artifacts/majalis/lib/digital-learning/library.mjs` ← `.migration-backup/01_schema.sql`
- `artifacts/majalis/lib/digital-learning/notifications.mjs` ← `artifacts/api-server/src/routes/index.ts`
- `artifacts/majalis/lib/digital-learning/paths-seed.mjs` ← `artifacts/majalis/lib/digital-learning/ai-lesson.mjs`
- `artifacts/majalis/lib/digital-learning/paths.mjs` ← `.github/CODEOWNERS`
- `artifacts/majalis/lib/digital-learning/progress.mjs` ← `.github/scripts/safe-auto-merge/eligibility.mjs`
- `artifacts/majalis/lib/digital-learning/quiz-engine.mjs` ← `artifacts/majalis/lib/digital-learning/index.mjs`
- `artifacts/majalis/lib/digital-learning/report.mjs` ← `.github/scripts/ci/dist-artifact-identity.mjs`
- `artifacts/majalis/lib/digital-learning/storage.mjs` ← `.migration-backup/package-lock.json`
- `artifacts/majalis/lib/fiqh-council-dedup.mjs` ← `artifacts/majalis/lib/fiqh-council-sync.mjs`
- `artifacts/majalis/lib/fiqh-council-sync.mjs` ← `artifacts/majalis/src/lib/__tests__/fiqh-council-completeness.test.ts`
- `artifacts/majalis/lib/fiqh-link-checker.mjs` ← `artifacts/majalis/lib/api-handlers/admin/check-fiqh-links.js`
- `artifacts/majalis/lib/global-reference/index.mjs` ← `artifacts/majalis/lib/api-handlers/admin/global-reference.js`
- `artifacts/majalis/lib/global-reference/report.mjs` ← `.github/scripts/ci/dist-artifact-identity.mjs`
- `artifacts/majalis/lib/global-reference/versioning.mjs` ← `artifacts/majalis/data/global-reference-report.json`
- `artifacts/majalis/lib/governance/docs.mjs` ← `.cursor/rules/majlisilm-agent-throughput.mdc`
- `artifacts/majalis/lib/governance/index.mjs` ← `artifacts/majalis/lib/api-handlers/admin/governance.js`
- `artifacts/majalis/lib/governance/lifecycle.mjs` ← `artifacts/majalis-mobile/components/ErrorBoundary.tsx`
- `artifacts/majalis/lib/governance/performance.mjs` ← `.github/scripts/release-train/constants.mjs`
- `artifacts/majalis/lib/governance/report.mjs` ← `.github/scripts/ci/dist-artifact-identity.mjs`
- `artifacts/majalis/lib/governance/role-sync.mjs` ← `artifacts/majalis/lib/api-handlers/admin/governance.js`
- `artifacts/majalis/lib/lesson-id-aliases.mjs` ← `artifacts/majalis/lib/api-handlers/lesson-page.js`
- `artifacts/majalis/lib/open-platform/audit.mjs` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs`
- `artifacts/majalis/lib/open-platform/auth.mjs` ← `.github/scripts/release-train/classify.mjs`
- `artifacts/majalis/lib/open-platform/docs.mjs` ← `.cursor/rules/majlisilm-agent-throughput.mdc`
- `artifacts/majalis/lib/open-platform/index.mjs` ← `artifacts/majalis/lib/api-handlers/admin/open-platform.js`
- `artifacts/majalis/lib/open-platform/rate-limit.mjs` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs`
- `artifacts/majalis/lib/open-platform/report.mjs` ← `.github/scripts/ci/dist-artifact-identity.mjs`
- `artifacts/majalis/lib/open-platform/router.mjs` ← `.replit`
- `artifacts/majalis/lib/open-platform/webhooks.mjs` ← `artifacts/majalis/data/governance-technical-docs.json`
- `artifacts/majalis/lib/platform-health.mjs` ← `artifacts/majalis/lib/__tests__/p0-reliability.test.mjs`
- `artifacts/majalis/lib/rag/cache.mjs` ← `.github/actions/setup-workspace/action.yml`
- `artifacts/majalis/lib/rag/constants.mjs` ← `.github/scripts/release-train/__tests__/classify.test.mjs`
- `artifacts/majalis/lib/rag/generation.mjs` ← `artifacts/majalis/data/global-reference-report.json`
- `artifacts/majalis/lib/rag/index.mjs` ← `artifacts/majalis/lib/api-handlers/rag-research.js`
- `artifacts/majalis/lib/rag/intent.mjs` ← `.github/workflows/ci.yml`
- `artifacts/majalis/lib/rag/ranking.mjs` ← `artifacts/majalis/data/autonomous-ai-report.json`
- `artifacts/majalis/lib/rag/retrieval.mjs` ← `artifacts/majalis/lib/api-handlers/assistant.js`
- `artifacts/majalis/lib/rum-http.mjs` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `artifacts/majalis/lib/scholarly-intelligence/report.mjs` ← `.github/scripts/ci/dist-artifact-identity.mjs`
- `artifacts/majalis/lib/universities-catalog.mjs` ← `artifacts/majalis/lib/api-handlers/universities.js`
- `artifacts/majalis/lib/updates-ios-fallback.mjs` ← `artifacts/majalis/lib/api-handlers/updates.js`
- `artifacts/majalis/lighthouserc.cjs` ← `artifacts/majalis/config/psi-production-targets.json`
- `artifacts/majalis/middleware.js` ← `.github/scripts/safe-auto-merge/constants.mjs`
- `artifacts/majalis/public/boot-legacy-cache.js` ← `artifacts/majalis/index.html`
- `artifacts/majalis/public/mj-launch-splash-boot.js` ← `artifacts/majalis/index.html`
- `artifacts/majalis/public/quran-engine-sw.js` ← `artifacts/majalis/scripts/native-prune-web-only.mjs`
- `artifacts/majalis/public/sw.js` ← `.github/scripts/release-train/__tests__/classify.test.mjs`
- `artifacts/majalis/scripts/apply-universities-migrations.mjs` ← `artifacts/majalis/src/views/UniversitiesPage.tsx`
- `artifacts/majalis/scripts/audit-data-quality.mjs` ← `artifacts/majalis/scripts/test-library-integrity.mjs`
- `artifacts/majalis/scripts/audit-feature-readiness.mjs` ← `artifacts/majalis/package.json`
- `artifacts/majalis/scripts/audit-public-site.mjs` ← `artifacts/majalis/package.json`
- `artifacts/majalis/scripts/audit-route-partial-closure.mjs` ← `artifacts/majalis/src/lib/__tests__/route-partial-closure-gate.test.ts`
- `artifacts/majalis/scripts/audit-rulings-route-inventory.mjs` ← `artifacts/majalis/src/lib/__tests__/rulings-route-inventory.test.ts`
- `artifacts/majalis/scripts/audit/hadith-takhrij-check.mjs` ← `artifacts/majalis/scripts/content-inventory.mjs`
- `artifacts/majalis/scripts/data-quality-audit.ts` ← `artifacts/majalis/scripts/audit-data-quality.mjs`
- `artifacts/majalis/scripts/design-authority-closure-report.mjs` ← `artifacts/majalis/src/lib/__tests__/design-authority-closure-gate.test.ts`
- `artifacts/majalis/scripts/ds-coverage-report.mjs` ← `artifacts/majalis/src/lib/__tests__/ssunnah-design-system-lockdown-gate.test.ts`
- `artifacts/majalis/scripts/enrich-r138-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r140-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r143-lesson-bodies.mjs` ← `artifacts/majalis/scripts/rebalance-lesson-bridges.mjs`
- `artifacts/majalis/scripts/enrich-r48-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round48.mjs`
- `artifacts/majalis/scripts/enrich-r50-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round50.mjs`
- `artifacts/majalis/scripts/enrich-r51-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round51.mjs`
- `artifacts/majalis/scripts/enrich-r52-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round52.mjs`
- `artifacts/majalis/scripts/enrich-r53-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round53.mjs`
- `artifacts/majalis/scripts/enrich-r54-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round54.mjs`
- `artifacts/majalis/scripts/enrich-r55-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round55.mjs`
- `artifacts/majalis/scripts/enrich-r56-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r57-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r57-lesson-bodies.mjs` ← `artifacts/majalis/scripts/count-r57-gaps.mjs`
- `artifacts/majalis/scripts/enrich-r58-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r59-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r60-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round60.mjs`
- `artifacts/majalis/scripts/enrich-r61-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round61.mjs`
- `artifacts/majalis/scripts/enrich-r62-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r63-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r63-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round63.mjs`
- `artifacts/majalis/scripts/enrich-r64-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round64.mjs`
- `artifacts/majalis/scripts/enrich-r65-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round65.mjs`
- `artifacts/majalis/scripts/enrich-r66-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r67-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r67-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round67.mjs`
- `artifacts/majalis/scripts/enrich-r68-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round68.mjs`
- `artifacts/majalis/scripts/enrich-r69-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r70-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r70-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round70.mjs`
- `artifacts/majalis/scripts/enrich-r71-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round71.mjs`
- `artifacts/majalis/scripts/enrich-r72-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r73-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-r73-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round73.mjs`
- `artifacts/majalis/scripts/enrich-r74-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round74.mjs`
- `artifacts/majalis/scripts/enrich-r75-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round75.mjs`
- `artifacts/majalis/scripts/enrich-r76-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round76.mjs`
- `artifacts/majalis/scripts/enrich-r77-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-round77.mjs`
- `artifacts/majalis/scripts/enrich-r78-lesson-bodies.mjs` ← `artifacts/majalis/scripts/enrich-r103-lesson-bodies.mjs`
- `artifacts/majalis/scripts/enrich-round103-seed-raises.mjs` ← `artifacts/majalis/scripts/test-sins-rights-filler-guard.mjs`
- `artifacts/majalis/scripts/enrich-round103.mjs` ← `artifacts/majalis/scripts/enrich-round103-content.mjs`
- `artifacts/majalis/scripts/enrich-round134-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round135-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round136-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round137-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round138-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round139-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round140-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round141-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round142-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round143-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round144-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round145-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round146-content.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/enrich-round48.mjs` ← `artifacts/majalis/scripts/build-r49-content.mjs`
- `artifacts/majalis/scripts/enrich-round50.mjs` ← `artifacts/majalis/scripts/enrich-round50-content.mjs`
- `artifacts/majalis/scripts/enrich-round51.mjs` ← `artifacts/majalis/scripts/enrich-round51-content.mjs`
- `artifacts/majalis/scripts/enrich-round52.mjs` ← `artifacts/majalis/scripts/enrich-round52-content.mjs`
- `artifacts/majalis/scripts/enrich-round53.mjs` ← `artifacts/majalis/scripts/enrich-round53-content.mjs`
- `artifacts/majalis/scripts/enrich-round54.mjs` ← `artifacts/majalis/scripts/enrich-round54-content.mjs`
- `artifacts/majalis/scripts/enrich-round55.mjs` ← `artifacts/majalis/scripts/enrich-round55-content.mjs`
- `artifacts/majalis/scripts/enrich-round56.mjs` ← `artifacts/majalis/scripts/enrich-round56-content.mjs`
- `artifacts/majalis/scripts/enrich-round57.mjs` ← `artifacts/majalis/scripts/enrich-round57-content.mjs`
- `artifacts/majalis/scripts/enrich-round58.mjs` ← `artifacts/majalis/scripts/enrich-round58-content.mjs`
- `artifacts/majalis/scripts/enrich-round59.mjs` ← `artifacts/majalis/scripts/enrich-round59-content.mjs`
- `artifacts/majalis/scripts/enrich-round60.mjs` ← `artifacts/majalis/scripts/enrich-round60-content.mjs`
- `artifacts/majalis/scripts/enrich-round61.mjs` ← `artifacts/majalis/scripts/enrich-round61-content.mjs`
- `artifacts/majalis/scripts/enrich-round62.mjs` ← `artifacts/majalis/scripts/enrich-round62-content.mjs`
- `artifacts/majalis/scripts/enrich-round63.mjs` ← `artifacts/majalis/scripts/enrich-round63-content.mjs`
- `artifacts/majalis/scripts/enrich-round64.mjs` ← `artifacts/majalis/scripts/enrich-round64-content.mjs`
- `artifacts/majalis/scripts/enrich-round65.mjs` ← `artifacts/majalis/scripts/enrich-round65-content.mjs`
- `artifacts/majalis/scripts/enrich-round66.mjs` ← `artifacts/majalis/scripts/enrich-round66-content.mjs`
- `artifacts/majalis/scripts/enrich-round67-content.mjs` ← `artifacts/majalis/scripts/enrich-round69-content.mjs`
- `artifacts/majalis/scripts/enrich-round67-raises.mjs` ← `artifacts/majalis/scripts/enrich-round69-raises.mjs`
- `artifacts/majalis/scripts/enrich-round67.mjs` ← `artifacts/majalis/scripts/enrich-round67-content.mjs`
- `artifacts/majalis/scripts/enrich-round68.mjs` ← `artifacts/majalis/scripts/enrich-round68-content.mjs`
- `artifacts/majalis/scripts/enrich-round70.mjs` ← `artifacts/majalis/scripts/enrich-round70-content.mjs`
- `artifacts/majalis/scripts/enrich-round71-raises.mjs` ← `artifacts/majalis/scripts/enrich-round73-raises.mjs`
- `artifacts/majalis/scripts/enrich-round71.mjs` ← `artifacts/majalis/scripts/enrich-round71-content.mjs`
- `artifacts/majalis/scripts/enrich-round72.mjs` ← `artifacts/majalis/scripts/enrich-round72-content.mjs`
- `artifacts/majalis/scripts/enrich-round73.mjs` ← `artifacts/majalis/scripts/enrich-round73-content.mjs`
- `artifacts/majalis/scripts/enrich-round74.mjs` ← `artifacts/majalis/scripts/enrich-round74-content.mjs`
- `artifacts/majalis/scripts/enrich-round75.mjs` ← `artifacts/majalis/scripts/enrich-round75-content.mjs`
- `artifacts/majalis/scripts/enrich-round76-content.mjs` ← `artifacts/majalis/scripts/enrich-round87-bios.mjs`
- `artifacts/majalis/scripts/enrich-round76.mjs` ← `artifacts/majalis/scripts/enrich-round76-content.mjs`
- `artifacts/majalis/scripts/enrich-round77-raises.mjs` ← `artifacts/majalis/scripts/enrich-round103-seed-raises.mjs`
- `artifacts/majalis/scripts/enrich-round77.mjs` ← `artifacts/majalis/scripts/enrich-round103-seed-raises.mjs`
- `artifacts/majalis/scripts/enrich-round78.mjs` ← `artifacts/majalis/scripts/enrich-round103.mjs`
- `artifacts/majalis/scripts/enrich-round81-raises.mjs` ← `artifacts/majalis/scripts/enrich-round103-raises.mjs`
- `artifacts/majalis/scripts/enrich-round81.mjs` ← `artifacts/majalis/scripts/enrich-round103-raises.mjs`
- `artifacts/majalis/scripts/enrich-round83.mjs` ← `artifacts/majalis/scripts/enrich-round83-content.mjs`
- `artifacts/majalis/scripts/enrich-round85.mjs` ← `artifacts/majalis/scripts/enrich-round85-content.mjs`
- `artifacts/majalis/scripts/enrich-round87.mjs` ← `artifacts/majalis/scripts/enrich-round87-content.mjs`
- `artifacts/majalis/scripts/enrich-round89.mjs` ← `artifacts/majalis/scripts/enrich-round89-content.mjs`
- `artifacts/majalis/scripts/enrich-round91.mjs` ← `artifacts/majalis/scripts/enrich-round91-content.mjs`
- `artifacts/majalis/scripts/enrich-round93.mjs` ← `artifacts/majalis/scripts/enrich-round93-content.mjs`
- `artifacts/majalis/scripts/enrich-round95.mjs` ← `artifacts/majalis/scripts/enrich-round95-content.mjs`
- `artifacts/majalis/scripts/enrich-round97.mjs` ← `artifacts/majalis/scripts/enrich-round97-content.mjs`
- `artifacts/majalis/scripts/enrich-round99.mjs` ← `artifacts/majalis/scripts/enrich-round99-content.mjs`
- `artifacts/majalis/scripts/gen-quiz-sync-sql.mjs` ← `artifacts/majalis/src/lib/supabase.ts`
- `artifacts/majalis/scripts/generate-scholarly-intelligence-report.mjs` ← `artifacts/majalis/lib/scholarly-intelligence/report.mjs`
- `artifacts/majalis/scripts/generate-seerah-series-seed.mjs` ← `artifacts/majalis/supabase/learn_library_v1_seerah_series_seed.sql`
- `artifacts/majalis/scripts/generate-seo-rulings-helpers.mjs` ← `artifacts/majalis/src/lib/__tests__/production-p0-regressions.test.ts`
- `artifacts/majalis/scripts/inventory-section-verses.mjs` ← `artifacts/majalis/src/lib/__tests__/section-verse-inventory-gate.test.ts`
- `artifacts/majalis/scripts/measure-ui-fallback-metrics.mjs` ← `artifacts/majalis/scripts/verify-font-consistency.mjs`
- `artifacts/majalis/scripts/mushaf-controls-inventory.mjs` ← `artifacts/majalis/package.json`
- `artifacts/majalis/scripts/populate-fiqh-council-issues.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r100-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r101-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r102-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r103-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r104-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r105-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r106-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r132-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r133-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r49-content-data.mjs` ← `artifacts/majalis/scripts/build-r49-content.mjs`
- `artifacts/majalis/scripts/r49-original-stories.ts` ← `artifacts/majalis/scripts/apply-r49-stories.py`
- `artifacts/majalis/scripts/r50-content-data.mjs` ← `artifacts/majalis/scripts/build-r50-content.mjs`
- `artifacts/majalis/scripts/r50-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round50-content.mjs`
- `artifacts/majalis/scripts/r51-content-data.mjs` ← `artifacts/majalis/scripts/build-r51-content.mjs`
- `artifacts/majalis/scripts/r51-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round51-content.mjs`
- `artifacts/majalis/scripts/r51-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round51-content.mjs`
- `artifacts/majalis/scripts/r52-content-data.mjs` ← `artifacts/majalis/scripts/build-r52-content.mjs`
- `artifacts/majalis/scripts/r52-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round52-content.mjs`
- `artifacts/majalis/scripts/r53-content-data.mjs` ← `artifacts/majalis/scripts/build-r53-content.mjs`
- `artifacts/majalis/scripts/r53-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round53-content.mjs`
- `artifacts/majalis/scripts/r54-content-data.mjs` ← `artifacts/majalis/scripts/build-r54-content.mjs`
- `artifacts/majalis/scripts/r54-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round54-content.mjs`
- `artifacts/majalis/scripts/r54-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round54-content.mjs`
- `artifacts/majalis/scripts/r55-content-data.mjs` ← `artifacts/majalis/scripts/build-r55-content.mjs`
- `artifacts/majalis/scripts/r55-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round55-content.mjs`
- `artifacts/majalis/scripts/r56-content-data.mjs` ← `artifacts/majalis/scripts/build-r56-content.mjs`
- `artifacts/majalis/scripts/r56-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round56-content.mjs`
- `artifacts/majalis/scripts/r56-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round56-content.mjs`
- `artifacts/majalis/scripts/r57-content-data.mjs` ← `artifacts/majalis/scripts/build-r57-content.mjs`
- `artifacts/majalis/scripts/r57-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round57-content.mjs`
- `artifacts/majalis/scripts/r58-content-data.mjs` ← `artifacts/majalis/scripts/build-r58-content.mjs`
- `artifacts/majalis/scripts/r58-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round58-content.mjs`
- `artifacts/majalis/scripts/r58-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round58-content.mjs`
- `artifacts/majalis/scripts/r59-content-data.mjs` ← `artifacts/majalis/scripts/build-r59-content.mjs`
- `artifacts/majalis/scripts/r59-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round59-content.mjs`
- `artifacts/majalis/scripts/r60-content-data.mjs` ← `artifacts/majalis/scripts/build-r60-content.mjs`
- `artifacts/majalis/scripts/r60-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round60-content.mjs`
- `artifacts/majalis/scripts/r60-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round60-content.mjs`
- `artifacts/majalis/scripts/r61-content-data.mjs` ← `artifacts/majalis/scripts/build-r61-content.mjs`
- `artifacts/majalis/scripts/r61-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round61-content.mjs`
- `artifacts/majalis/scripts/r62-content-data.mjs` ← `artifacts/majalis/scripts/build-r62-content.mjs`
- `artifacts/majalis/scripts/r62-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round62-content.mjs`
- `artifacts/majalis/scripts/r62-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round62-content.mjs`
- `artifacts/majalis/scripts/r63-content-data.mjs` ← `artifacts/majalis/scripts/build-r63-content.mjs`
- `artifacts/majalis/scripts/r63-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round63-content.mjs`
- `artifacts/majalis/scripts/r64-content-data.mjs` ← `artifacts/majalis/scripts/build-r64-content.mjs`
- `artifacts/majalis/scripts/r64-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round64-content.mjs`
- `artifacts/majalis/scripts/r64-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round64-content.mjs`
- `artifacts/majalis/scripts/r65-content-data.mjs` ← `artifacts/majalis/scripts/build-r65-content.mjs`
- `artifacts/majalis/scripts/r65-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round65-content.mjs`
- `artifacts/majalis/scripts/r66-content-data.mjs` ← `artifacts/majalis/scripts/build-r66-content.mjs`
- `artifacts/majalis/scripts/r66-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round66-content.mjs`
- `artifacts/majalis/scripts/r66-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round66-content.mjs`
- `artifacts/majalis/scripts/r67-content-data.mjs` ← `artifacts/majalis/scripts/build-r67-content.mjs`
- `artifacts/majalis/scripts/r67-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round67-content.mjs`
- `artifacts/majalis/scripts/r68-content-data.mjs` ← `artifacts/majalis/scripts/build-r68-content.mjs`
- `artifacts/majalis/scripts/r68-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round68-content.mjs`
- `artifacts/majalis/scripts/r68-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round68-content.mjs`
- `artifacts/majalis/scripts/r69-content-data.mjs` ← `artifacts/majalis/scripts/build-r69-content.mjs`
- `artifacts/majalis/scripts/r69-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round69-content.mjs`
- `artifacts/majalis/scripts/r70-content-data.mjs` ← `artifacts/majalis/scripts/build-r70-content.mjs`
- `artifacts/majalis/scripts/r70-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round70-content.mjs`
- `artifacts/majalis/scripts/r70-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round70-content.mjs`
- `artifacts/majalis/scripts/r71-content-data.mjs` ← `artifacts/majalis/scripts/build-r71-content.mjs`
- `artifacts/majalis/scripts/r71-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round71-content.mjs`
- `artifacts/majalis/scripts/r72-content-data.mjs` ← `artifacts/majalis/scripts/build-r72-content.mjs`
- `artifacts/majalis/scripts/r72-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round72-content.mjs`
- `artifacts/majalis/scripts/r72-prophetic-medicine.ts` ← `artifacts/majalis/scripts/build-r72-pm.mjs`
- `artifacts/majalis/scripts/r73-content-data.mjs` ← `artifacts/majalis/scripts/build-r73-content.mjs`
- `artifacts/majalis/scripts/r73-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round73-content.mjs`
- `artifacts/majalis/scripts/r74-content-data.mjs` ← `artifacts/majalis/scripts/build-r74-content.mjs`
- `artifacts/majalis/scripts/r74-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round74-content.mjs`
- `artifacts/majalis/scripts/r74-prophetic-medicine.ts` ← `artifacts/majalis/scripts/build-r74-pm.mjs`
- `artifacts/majalis/scripts/r75-content-data.mjs` ← `artifacts/majalis/scripts/build-r75-content.mjs`
- `artifacts/majalis/scripts/r75-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round75-content.mjs`
- `artifacts/majalis/scripts/r76-content-data.mjs` ← `artifacts/majalis/scripts/build-r76-content.mjs`
- `artifacts/majalis/scripts/r76-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round76-content.mjs`
- `artifacts/majalis/scripts/r76-prophetic-medicine.ts` ← `artifacts/majalis/scripts/build-r76-pm.mjs`
- `artifacts/majalis/scripts/r77-content-data.mjs` ← `artifacts/majalis/scripts/build-r77-content.mjs`
- `artifacts/majalis/scripts/r77-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round77-content.mjs`
- `artifacts/majalis/scripts/r78-content-data.mjs` ← `artifacts/majalis/scripts/build-r78-content.mjs`
- `artifacts/majalis/scripts/r78-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round78-content.mjs`
- `artifacts/majalis/scripts/r78-prophetic-medicine.ts` ← `artifacts/majalis/scripts/build-r78-pm.mjs`
- `artifacts/majalis/scripts/r79-content-data.mjs` ← `artifacts/majalis/scripts/enrich-round79-content.mjs`
- `artifacts/majalis/scripts/r79-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round79-content.mjs`
- `artifacts/majalis/scripts/r79-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round79-content.mjs`
- `artifacts/majalis/scripts/r80-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r80-original-stories.ts` ← `artifacts/majalis/scripts/enrich-round80-content.mjs`
- `artifacts/majalis/scripts/r80-prophetic-medicine.ts` ← `artifacts/majalis/scripts/enrich-round80-content.mjs`
- `artifacts/majalis/scripts/r81-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r82-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r83-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r84-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r85-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r86-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r87-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r87-r88-content-factory.mjs` ← `artifacts/majalis/scripts/r87-content-data.mjs`
- `artifacts/majalis/scripts/r88-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r89-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r89-r90-content-factory.mjs` ← `artifacts/majalis/scripts/r89-content-data.mjs`
- `artifacts/majalis/scripts/r90-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r91-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r91-r92-content-factory.mjs` ← `artifacts/majalis/scripts/r91-content-data.mjs`
- `artifacts/majalis/scripts/r92-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r93-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r93-r94-content-factory.mjs` ← `artifacts/majalis/scripts/r93-content-data.mjs`
- `artifacts/majalis/scripts/r94-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r95-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r95-r96-content-factory.mjs` ← `artifacts/majalis/scripts/r95-content-data.mjs`
- `artifacts/majalis/scripts/r96-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r97-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r98-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/r99-content-data.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/regen-library-catalog-json.mjs` ← `artifacts/majalis/scripts/test-library-integrity.mjs`
- `artifacts/majalis/scripts/review-queue.mjs` ← `artifacts/majalis/lib/api-handlers/admin/autonomous-platform.js`
- `artifacts/majalis/scripts/round-content-utils.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/route-debt-full-classification.mjs` ← `artifacts/majalis/src/lib/__tests__/route-partial-closure-gate.test.ts`
- `artifacts/majalis/scripts/run-migrations.mjs` ← `artifacts/majalis/supabase/rls_lockdown_v1.sql`
- `artifacts/majalis/scripts/scholarly-verification-report.mjs` ← `artifacts/majalis/lib/scholarly-verification/orchestrator.mjs`
- `artifacts/majalis/scripts/seerah-round-content-utils.mjs` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/scripts/smoke-nav-menu-runner.mjs` ← `artifacts/majalis/scripts/smoke-nav-menu.mjs`
- `artifacts/majalis/scripts/verify-quran.mjs` ← `artifacts/majalis/package.json`
- `artifacts/majalis/scripts/verify-seo.ts` ← `artifacts/majalis/package.json`
- `artifacts/majalis/server/index.mjs` ← `artifacts/majalis/.replit-artifact/artifact.toml`
- `artifacts/majalis/server/rate-limit.mjs` ← `.github/scripts/safe-auto-merge/__tests__/eligibility.test.mjs`
- `artifacts/majalis/src/components/AdminQuickEdit.tsx` ← `artifacts/majalis/src/lib/__tests__/admin-isolation-gate.test.ts`
- `artifacts/majalis/src/components/GlobalBackButton.tsx` ← `artifacts/majalis/src/App.tsx`
- `artifacts/majalis/src/components/IosAppCta.tsx` ← `artifacts/majalis/src/components/IosAppCtaSlot.tsx`
- `artifacts/majalis/src/components/IosAppCtaSlot.tsx` ← `artifacts/majalis/src/lib/__tests__/ios-app-discovery-gate.test.ts`
- `artifacts/majalis/src/components/MajlisSplash.tsx` ← `artifacts/majalis/src/lib/__tests__/cls-home-gate.test.ts`
- `artifacts/majalis/src/components/MoreBottomSheet.tsx` ← `artifacts/majalis/scripts/generate-codebase-inventory.mjs`
- `artifacts/majalis/src/components/SearchSuggestions.tsx` ← `artifacts/majalis/scripts/search-excellence-engine.mjs`
- `artifacts/majalis/src/components/ShareButton.tsx` ← `artifacts/majalis/scripts/release-candidate-check.mjs`
- `artifacts/majalis/src/components/adhan/MuezzinPicker.tsx` ← `artifacts/majalis/src/lib/__tests__/app-audio-coordinator-gate.test.ts`
- `artifacts/majalis/src/components/admin/AdminDisplayText.tsx` ← `artifacts/majalis/src/lib/__tests__/admin-display-text.test.ts`
- `artifacts/majalis/src/components/admin/review-hub/DiffViewer.tsx` ← `artifacts/majalis/src/components/admin/review-hub/index.ts`
- `artifacts/majalis/src/components/admin/review-hub/ReviewFilterBar.tsx` ← `artifacts/majalis/src/components/admin/review-hub/index.ts`
- `artifacts/majalis/src/components/admin/review-hub/ReviewStatCards.tsx` ← `artifacts/majalis/src/components/admin/review-hub/index.ts`
- `artifacts/majalis/src/components/admin/review-hub/WaveformAudioPlayer.tsx` ← `artifacts/majalis/src/components/admin/review-hub/index.ts`
- `artifacts/majalis/src/components/brand/MajlisWordmark.tsx` ← `artifacts/majalis/src/components/MajlisSplash.tsx`
- `artifacts/majalis/src/components/content-trust/ContentTrustBox.tsx` ← `.cursor/rules/majlisilm-content-governance.mdc`
- `artifacts/majalis/src/components/home/DailyWirdCard.tsx` ← `artifacts/majalis/scripts/audit-feature-readiness.ts`
- `artifacts/majalis/src/components/home/HomeAboutSection.tsx` ← `artifacts/majalis/scripts/test-no-fake-counts.mjs`
- `artifacts/majalis/src/components/home/HomeExplorePlatform.tsx` ← `artifacts/majalis/scripts/master-regression-guard.mjs`
- `artifacts/majalis/src/components/home/HomeLatestUpdates.tsx` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/components/home/HomeLiveStatsStrip.tsx` ← `artifacts/majalis/src/lib/__tests__/home-hide-content-counts.test.ts`
- `artifacts/majalis/src/components/home/HomeQuickAccessV2.tsx` ← `artifacts/majalis/src/lib/__tests__/visual-redesign-v2-tokens-gate.test.ts`
- `artifacts/majalis/src/components/home/HomeSacredOfDay.tsx` ← `artifacts/majalis/scripts/inventory-section-verses.mjs`
- `artifacts/majalis/src/components/home/HomeUpcomingCourses.tsx` ← `artifacts/majalis/lib/__tests__/critical-path-no-select-star.test.mjs`
- `artifacts/majalis/src/components/layout/ContentHubLayout.tsx` ← `artifacts/majalis/scripts/generate-codebase-inventory.mjs`
- `artifacts/majalis/src/components/learning/AssessmentModal.tsx` ← `artifacts/majalis/src/lib/__tests__/content-quality-wave32-gate.test.ts`
- `artifacts/majalis/src/components/lessons/LessonCard.tsx` ← `artifacts/majalis/scripts/audit-feature-readiness.ts`
- `artifacts/majalis/src/components/lessons/LessonScheduleGroup.tsx` ← `artifacts/majalis/src/lib/__tests__/content-quality-wave32-gate.test.ts`
- `artifacts/majalis/src/components/lessons/LessonStatusBadge.tsx` ← `artifacts/majalis/src/components/lessons/LessonCard.tsx`
- `artifacts/majalis/src/components/majlis/EducationalCoursesWidget.tsx` ← `artifacts/majalis/src/components/majlis/MainNavigationScreen.tsx`
- `artifacts/majalis/src/components/majlis/MainNavigationScreen.tsx` ← `artifacts/majalis/src/tests/majlisilm-shell.test.ts`
- `artifacts/majalis/src/components/majlis/QuranReaderWidget.tsx` ← `artifacts/majalis/src/components/majlis/MainNavigationScreen.tsx`
- `artifacts/majalis/src/components/majlis/SmartSearchPanel.tsx` ← `artifacts/majalis/src/components/majlis/MainNavigationScreen.tsx`
- `artifacts/majalis/src/components/memorize/Flashcards.tsx` ← `artifacts/majalis/scripts/verify-brand-green-hex.mjs`
- `artifacts/majalis/src/components/more/MoreSheetThemeToggle.tsx` ← `artifacts/majalis/src/components/MoreBottomSheet.tsx`
- `artifacts/majalis/src/components/motion/Pressable.tsx` ← `artifacts/majalis-mobile/app/(tabs)/_layout.tsx`
- `artifacts/majalis/src/components/motion/SmoothImage.tsx` ← `artifacts/majalis/src/lib/__tests__/native-feel-motion.test.ts`
- `artifacts/majalis/src/components/prayer/PrayerCountdownChip.tsx` ← `artifacts/majalis/src/lib/__tests__/header-ticker.test.ts`
- `artifacts/majalis/src/components/qa/QaCard.tsx` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/components/quran/ImmersivePrefsDrawer.tsx` ← `artifacts/majalis/src/components/majlis/MainNavigationScreen.tsx`
- `artifacts/majalis/src/components/quran/ImmersiveQuranApp.tsx` ← `artifacts/majalis/src/components/majlis/MainNavigationScreen.tsx`
- `artifacts/majalis/src/components/quran/ImmersiveQuranPage.tsx` ← `artifacts/majalis/src/lib/__tests__/content-quality-wave34-gate.test.ts`
- `artifacts/majalis/src/components/quran/ImmersiveVerseOptionsSheet.tsx` ← `artifacts/majalis/src/components/quran/ImmersiveQuranApp.tsx`
- `artifacts/majalis/src/components/quran/QuranReaderPage.tsx` ← `artifacts/majalis/src/lib/quran-immersive.ts`
- `artifacts/majalis/src/components/quran/QuranSurahJumpSearch.tsx` ← `artifacts/majalis/src/components/quran/SurahIndexFlatList.tsx`
- `artifacts/majalis/src/components/quran/QuranVerseList.tsx` ← `artifacts/majalis/src/components/quran/QuranReaderPage.tsx`
- `artifacts/majalis/src/components/quran/SurahIndexFlatList.tsx` ← `artifacts/majalis/src/components/quran/SurahList.tsx`
- `artifacts/majalis/src/components/quran/SurahList.tsx` ← `artifacts/majalis/scripts/generate-unified-search-index.mjs`
- `artifacts/majalis/src/components/quran/TafsirModalViewer.tsx` ← `artifacts/majalis/src/components/majlis/QuranReaderWidget.tsx`
- `artifacts/majalis/src/components/rag/ResearchAnswer.tsx` ← `artifacts/majalis/src/lib/__tests__/content-quality-wave29-gate.test.ts`
- `artifacts/majalis/src/components/rag/SourceCard.tsx` ← `artifacts/majalis/src/components/rag/ResearchAnswer.tsx`
- `artifacts/majalis/src/components/rulings/RulingCategoryGrid.tsx` ← `artifacts/majalis/src/lib/__tests__/closure-pr4-button-semantic-gate.test.ts`
- `artifacts/majalis/src/components/rulings/RulingDetailSections.tsx` ← `artifacts/majalis/src/lib/__tests__/calendar-rulings-soft-gate.test.ts`
- `artifacts/majalis/src/components/rulings/RulingFilters.tsx` ← `artifacts/majalis/src/pages/fiqh/ui/RulingsView.tsx`
- `artifacts/majalis/src/components/sections/SectionRow.tsx` ← `artifacts/majalis/scripts/verify-sections-registry.mjs`
- `artifacts/majalis/src/components/sections/SectionsGrids.tsx` ← `artifacts/majalis/scripts/verify-sections-registry.mjs`
- `artifacts/majalis/src/components/ui/alert.tsx` ← `artifacts/majalis-mobile/app/(tabs)/account.tsx`
- `artifacts/majalis/src/components/ui/command.tsx` ← `.github/actions/setup-workspace/action.yml`
- `artifacts/majalis/src/components/ui/drawer.tsx` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/src/components/ui/field.tsx` ← `.github/actions/setup-workspace/preflight.sh`
- `artifacts/majalis/src/components/ui/form.tsx` ← `.cursor/rules/majlisilm-general.mdc`
- `artifacts/majalis/src/components/ui/input-group.tsx` ← `artifacts/majalis/src/lib/__tests__/ui2-polish-a11y-gate.test.ts`
- `artifacts/majalis/src/components/ui/menubar.tsx` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/components/ui/navigation-menu.tsx` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/components/ui/separator.tsx` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/components/ui/sheet.tsx` ← `.migration-backup/layout.jsx`
- `artifacts/majalis/src/components/ui/sidebar.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/wikimedia-adhan-ogg-2026-09-13.html`
- `artifacts/majalis/src/components/ui/skeleton.tsx` ← `artifacts/majalis/lib/content-ops/pipeline.mjs`
- `artifacts/majalis/src/components/ui/toast.tsx` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/components/ui/tooltip.tsx` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/entities/scholar/api.ts` ← `.github/CODEOWNERS`
- `artifacts/majalis/src/entities/scholar/hooks.ts` ← `.github/scripts/safe-auto-merge/path-classifier.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/AyahActionSheet.tsx` ← `artifacts/majalis/scripts/audit-feature-readiness.ts`
- `artifacts/majalis/src/features/mushaf-madinah/MushafAyahActions.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/unit-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafAyahHighlight.tsx` ← `artifacts/majalis/src/features/mushaf-madinah/MushafPage.tsx`
- `artifacts/majalis/src/features/mushaf-madinah/MushafAyahLine.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/unit-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafAyahNumber.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/unit-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafBasmala.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/unit-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafControls.tsx` ← `artifacts/majalis/scripts/mushaf-controls-inventory.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafPage.tsx` ← `.github/scripts/safe-auto-merge/__tests__/path-classifier.test.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafPageFooter.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/r24-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafPageHeader.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/unit-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafPager.tsx` ← `artifacts/majalis/scripts/mushaf-flip-perf-sim.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafSettingsSheet.tsx` ← `artifacts/majalis/src/features/mushaf-madinah/MushafAyahLine.tsx`
- `artifacts/majalis/src/features/mushaf-madinah/MushafSurahOrnament.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/r24-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/MushafViewport.tsx` ← `artifacts/majalis/scripts/mushaf-madinah/unit-gate.mjs`
- `artifacts/majalis/src/features/mushaf-madinah/TafsirTabPanel.tsx` ← `artifacts/majalis/src/features/mushaf-madinah/AyahActionSheet.tsx`
- `artifacts/majalis/src/features/mushaf-madinah/VerifiedMushafReader.tsx` ← `artifacts/majalis/scripts/audit-feature-readiness.ts`
- `artifacts/majalis/src/features/mushaf-madinah/index.ts` ← `artifacts/majalis/src/lib/__tests__/immersive-chrome.test.ts`
- `artifacts/majalis/src/features/mushaf-madinah/mushaf-ayah-sync-store.ts` ← `artifacts/majalis/src/features/mushaf-madinah/MushafAyahHighlight.tsx`
- `artifacts/majalis/src/features/mushaf-madinah/prefetch-adjacent-audio.ts` ← `artifacts/majalis/src/features/mushaf-madinah/VerifiedMushafReader.tsx`
- `artifacts/majalis/src/features/mushaf-madinah/useMushafResourceGate.ts` ← `artifacts/majalis/src/features/mushaf-madinah/VerifiedMushafReader.tsx`
- `artifacts/majalis/src/features/mushaf-madinah/useQpcPageFont.ts` ← `artifacts/majalis/scripts/mushaf-flip-perf-sim.mjs`
- `artifacts/majalis/src/features/mushaf-reader/MushafExitControl.tsx` ← `artifacts/majalis/src/features/mushaf-reader/mushaf-reader.css`
- `artifacts/majalis/src/features/mushaf-reader/MushafPageView.tsx` ← `artifacts/majalis/src/features/mushaf-reader/MushafPage.tsx`
- `artifacts/majalis/src/features/mushaf-reader/mushaf-internal-perf-contract.ts` ← `artifacts/majalis/src/lib/__tests__/mushaf-internal-perf-pr1-gate.test.ts`
- `artifacts/majalis/src/features/mushaf-reader/mushaf-return-context.ts` ← `artifacts/majalis/src/lib/__tests__/mushaf-signature-p0-baseline-gate.test.ts`
- `artifacts/majalis/src/features/mushaf-reader/useMushafFixedMetrics.ts` ← `artifacts/majalis/src/features/mushaf-reader/index.ts`
- `artifacts/majalis/src/features/mushaf-reader/useNewMushafFontFit.ts` ← `artifacts/majalis/src/lib/__tests__/new-mushaf-reader-gate.test.ts`
- `artifacts/majalis/src/features/mushaf-shared/index.ts` ← `artifacts/majalis/src/lib/__tests__/mushaf-live-import-graph-gate.test.ts`
- `artifacts/majalis/src/hooks/use-mobile.tsx` ← `artifacts/majalis/src/components/ui/sidebar.tsx`
- `artifacts/majalis/src/hooks/useOfflineContent.ts` ← `artifacts/majalis/src/lib/__tests__/pwa-dexie-offline-store.test.ts`
- `artifacts/majalis/src/lib/architecture-excellence/marks-contract.ts` ← `artifacts/majalis/src/lib/__tests__/architecture-excellence-pr1-gate.test.ts`
- `artifacts/majalis/src/lib/border-authority.ts` ← `artifacts/majalis/src/lib/__tests__/elevation-border-governance-authority-gate.test.ts`
- `artifacts/majalis/src/lib/citation-schema.ts` ← `artifacts/majalis/scripts/_apply-trust-fields.mjs`
- `artifacts/majalis/src/lib/color-authority.ts` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/lib/elevation-authority.ts` ← `artifacts/majalis/src/lib/__tests__/elevation-border-governance-authority-gate.test.ts`
- `artifacts/majalis/src/lib/fiqh-catalog-disk.browser-stub.ts` ← `artifacts/majalis/vite.config.ts`
- `artifacts/majalis/src/lib/fiqh/fiqhFilters.ts` ← `artifacts/majalis/src/lib/fiqh/fiqhSearch.ts`
- `artifacts/majalis/src/lib/fiqh/fiqhSearch.ts` ← `artifacts/majalis/scripts/fiqh-section-audit.mjs`
- `artifacts/majalis/src/lib/ios-app-store.ts` ← `artifacts/majalis/src/components/IosAppCta.tsx`
- `artifacts/majalis/src/lib/json-seed-disk.browser-stub.ts` ← `artifacts/majalis/src/lib/json-seed-loader.ts`
- `artifacts/majalis/src/lib/learning-assessment-service.ts` ← `artifacts/majalis/src/components/learning/AssessmentModal.tsx`
- `artifacts/majalis/src/lib/learning-paths-admin-service.ts` ← `artifacts/majalis/src/lib/__tests__/n-plus-one-closure-gate.test.ts`
- `artifacts/majalis/src/lib/lessons/lessonGrouping.ts` ← `artifacts/majalis/scripts/lessons-quality-audit.mjs`
- `artifacts/majalis/src/lib/lessons/lessonSearch.ts` ← `artifacts/majalis/scripts/lessons-quality-audit.mjs`
- `artifacts/majalis/src/lib/library-seed.ts` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/lib/prayer-notifications/store-device-harness.ts` ← `artifacts/majalis/src/lib/__tests__/store-device-harness-gate.test.ts`
- `artifacts/majalis/src/lib/prayer-time-engine.ts` ← `artifacts/majalis/src/lib/__tests__/prayer-engine-p0-gate.test.ts`
- `artifacts/majalis/src/lib/qa-categories.ts` ← `artifacts/majalis-mobile/app/qa/index.tsx`
- `artifacts/majalis/src/lib/qa-utils.ts` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/lib/quran-ref-links.ts` ← `artifacts/majalis/src/components/rulings/RulingDetailSections.tsx`
- `artifacts/majalis/src/lib/rag-service.ts` ← `artifacts/majalis/src/components/rag/ResearchAnswer.tsx`
- `artifacts/majalis/src/lib/rulings-relations.ts` ← `artifacts/majalis/src/components/rulings/RulingDetailSections.tsx`
- `artifacts/majalis/src/lib/scholar-library-links.ts` ← `artifacts/majalis/src/components/rulings/RulingDetailSections.tsx`
- `artifacts/majalis/src/lib/search-suggestions.ts` ← `artifacts/majalis/src/components/SearchSuggestions.tsx`
- `artifacts/majalis/src/lib/section-topics-expand.ts` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/lib/seo-app-jsonld.ts` ← `artifacts/majalis/src/lib/__tests__/ios-app-discovery-gate.test.ts`
- `artifacts/majalis/src/lib/share.ts` ← `.github/actions/setup-workspace/action.yml`
- `artifacts/majalis/src/lib/spacing-authority.ts` ← `artifacts/majalis/src/lib/__tests__/spacing-size-a11y-contrast-authority-gate.test.ts`
- `artifacts/majalis/src/lib/tarikh-islami-data.ts` ← `artifacts/majalis/data/content-audit-inventory-2026-07-25.json`
- `artifacts/majalis/src/lib/typography-authority.ts` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/lib/verified-hadith-fill-daif-b2.ts` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/lib/verified-hadith-fill-daif.ts` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/lib/verified-hadith-fill-mawdu.ts` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/majalis/src/lib/verified-hadith-fill-sahih-b2.ts` ← `artifacts/majalis/src/lib/__tests__/content-quality-r7-gate.test.ts`
- `artifacts/majalis/src/lib/verified-hadith-fill-sahih-b3.ts` ← `artifacts/majalis/src/lib/__tests__/content-quality-r7-gate.test.ts`
- `artifacts/majalis/src/lib/verified-hadith-fill-sahih.ts` ← `artifacts/majalis/src/lib/__tests__/content-quality-r7-gate.test.ts`
- `artifacts/majalis/src/lib/whole-app-excellence/marks-contract.ts` ← `artifacts/majalis/src/lib/__tests__/architecture-excellence-pr1-gate.test.ts`
- `artifacts/majalis/src/lib/world-class-polish/marks-contract.ts` ← `artifacts/majalis/src/lib/__tests__/architecture-excellence-pr1-gate.test.ts`
- `artifacts/majalis/src/pages/account/MemorizePage.tsx` ← `artifacts/majalis/src/lib/__tests__/fiqh-council-completeness.test.ts`
- `artifacts/majalis/src/pages/account/MorePage.tsx` ← `artifacts/majalis/scripts/legacy-routes-redirects-audit.mjs`
- `artifacts/majalis/src/pages/fiqh/RulingDetailPage.tsx` ← `artifacts/majalis/scripts/generate-rulings-encyclopedia.mjs`
- `artifacts/majalis/src/pages/fiqh/RulingsPage.tsx` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/src/pages/fiqh/ui/RulingDetailView.tsx` ← `artifacts/majalis/src/lib/__tests__/content-quality-wave20-gate.test.ts`
- `artifacts/majalis/src/pages/fiqh/ui/RulingsView.tsx` ← `artifacts/majalis/scripts/fix-quiz-section-props.mjs`
- `artifacts/majalis/src/pages/library/LibraryDetailPage.tsx` ← `artifacts/majalis/scripts/generate-seo.mjs`
- `artifacts/majalis/src/pages/library/LibraryPage.tsx` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/src/pages/library/ScholarlyResearchPage.tsx` ← `artifacts/majalis/src/AppRoutes.tsx`
- `artifacts/majalis/src/pages/library/ui/LibraryDetailView.tsx` ← `artifacts/majalis/src/lib/__tests__/content-quality-wave1-p0-gate.test.ts`
- `artifacts/majalis/src/pages/library/ui/LibraryView.tsx` ← `artifacts/majalis/src/pages/library/LibraryPage.tsx`
- `artifacts/majalis/src/pages/library/ui/ScholarlyResearchView.tsx` ← `artifacts/majalis/scripts/fix-quiz-section-props.mjs`
- `artifacts/majalis/src/styles/components/content-trust.css` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/styles/components/home-quick-access-v2.css` ← `artifacts/majalis/src/components/home/HomeQuickAccessV2.tsx`
- `artifacts/majalis/src/styles/components/ios-app-cta.css` ← `artifacts/majalis/src/components/IosAppCta.tsx`
- `artifacts/majalis/src/styles/components/more-bottom-sheet.css` ← `artifacts/majalis/scripts/test-more-hub-contrast-gate.mjs`
- `artifacts/majalis/src/styles/components/muezzin-picker.css` ← `artifacts/majalis/src/components/adhan/MuezzinPicker.tsx`
- `artifacts/majalis/src/styles/components/prayer-countdown-chip.css` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/styles/components/quran-surah-jump-search.css` ← `artifacts/majalis/src/components/quran/QuranSurahJumpSearch.tsx`
- `artifacts/majalis/src/styles/components/source-card.css` ← `artifacts/majalis/src/components/rag/SourceCard.tsx`
- `artifacts/majalis/src/styles/components/surface-polish.css` ← `artifacts/majalis/src/components/home/HomeExplorePlatform.tsx`
- `artifacts/majalis/src/styles/critical-first-paint.css` ← `artifacts/majalis/scripts/defer-entry-css.mjs`
- `artifacts/majalis/src/styles/majlisilm-shell.css` ← `artifacts/majalis/scripts/check-copy-quality.js`
- `artifacts/majalis/src/styles/pages/certificate-verify.css` ← `artifacts/majalis/src/views/learning/CertificateVerifyPage.tsx`
- `artifacts/majalis/src/styles/pages/learning-path-detail.css` ← `artifacts/majalis/src/views/learning/LearningPathDetailPage.tsx`
- `artifacts/majalis/src/styles/pages/learning-paths.css` ← `artifacts/majalis/package.json`
- `artifacts/majalis/src/styles/pages/my-citations.css` ← `artifacts/majalis/scripts/audit-iphone-routes.mjs`
- `artifacts/majalis/src/styles/pages/qa.css` ← `.github/scripts/release-train/__tests__/classify.test.mjs`
- `artifacts/majalis/src/styles/pages/scholarly-research.css` ← `artifacts/majalis/src/AppRoutes.tsx`
- `artifacts/majalis/src/styles/pages/topic.css` ← `artifacts/majalis/content/fiqh/books.json`
- `artifacts/majalis/src/styles/pages/topics-index.css` ← `artifacts/majalis/src/lib/__tests__/platform-logic-suite.test.ts`
- `artifacts/majalis/src/styles/rulings-encyclopedia.css` ← `artifacts/majalis/data/feature-audit-report.json`
- `artifacts/majalis/src/views/MyCitationsPage.tsx` ← `artifacts/majalis/scripts/lint-design-tokens.mjs`
- `artifacts/majalis/src/views/QaPage.tsx` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/src/views/StartHerePage.tsx` ← `artifacts/majalis/scripts/enrich-round103.mjs`
- `artifacts/majalis/src/views/TopicPage.tsx` ← `artifacts/majalis/docs/ds-coverage-report.json`
- `artifacts/majalis/src/views/TopicsIndexPage.tsx` ← `artifacts/majalis/scripts/fix-quiz-section-props.mjs`
- `artifacts/majalis/src/views/admin/learning-paths/AssessmentManager.tsx` ← `artifacts/majalis/src/views/admin/learning-paths/LearningPathTreeEditor.tsx`
- `artifacts/majalis/src/views/admin/learning-paths/LearningPathTreeEditor.tsx` ← `artifacts/majalis/src/lib/__tests__/closure-wave9-admin-interaction-gate.test.ts`
- `artifacts/majalis/src/views/learning/CertificateVerifyPage.tsx` ← `artifacts/majalis/scripts/fix-quiz-section-props.mjs`
- `artifacts/majalis/src/views/learning/LearningPathDetailPage.tsx` ← `artifacts/majalis/scripts/fix-quiz-section-props.mjs`
- `artifacts/majalis/src/views/learning/LearningPathsPage.tsx` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/majalis/src/widgets/SectionHeader.tsx` ← `artifacts/majalis-mobile/components/admin/AdminFormModal.tsx`
- `artifacts/mockup-sandbox/src/components/ui/accordion.tsx` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/mockup-sandbox/src/components/ui/alert-dialog.tsx` ← `artifacts/majalis/eslint.config.js`
- `artifacts/mockup-sandbox/src/components/ui/alert.tsx` ← `artifacts/majalis-mobile/app/(tabs)/account.tsx`
- `artifacts/mockup-sandbox/src/components/ui/aspect-ratio.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/signature-sounds-call-to-prayer-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/avatar.tsx` ← `.migration-backup/01_schema.sql`
- `artifacts/mockup-sandbox/src/components/ui/badge.tsx` ← `.migration-backup/01_schema.sql`
- `artifacts/mockup-sandbox/src/components/ui/breadcrumb.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/signature-sounds-call-to-prayer-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/button.tsx` ← `.migration-backup/NavBar.jsx`
- `artifacts/mockup-sandbox/src/components/ui/card.tsx` ← `.github/workflows/supabase-migrations.yml`
- `artifacts/mockup-sandbox/src/components/ui/carousel.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/signature-sounds-call-to-prayer-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/chart.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/signature-sounds-call-to-prayer-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/checkbox.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/signature-sounds-call-to-prayer-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/collapsible.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/wikimedia-adhan-ogg-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/command.tsx` ← `.github/actions/setup-workspace/action.yml`
- `artifacts/mockup-sandbox/src/components/ui/context-menu.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/dialog.tsx` ← `artifacts/majalis/data/fiqh-council-deleted-2026-07-26-backup.json`
- `artifacts/mockup-sandbox/src/components/ui/drawer.tsx` ← `artifacts/majalis/data/feature-registry.json`
- `artifacts/mockup-sandbox/src/components/ui/dropdown-menu.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/empty.tsx` ← `.github/scripts/ci/dist-artifact-identity.mjs`
- `artifacts/mockup-sandbox/src/components/ui/field.tsx` ← `.github/actions/setup-workspace/preflight.sh`
- `artifacts/mockup-sandbox/src/components/ui/form.tsx` ← `.cursor/rules/majlisilm-general.mdc`
- `artifacts/mockup-sandbox/src/components/ui/hover-card.tsx` ← `artifacts/mockup-sandbox/package.json`
- `artifacts/mockup-sandbox/src/components/ui/input-group.tsx` ← `artifacts/majalis/src/components/ui/input-group.tsx`
- `artifacts/mockup-sandbox/src/components/ui/input-otp.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/input.tsx` ← `.github/actions/setup-workspace/action.yml`
- `artifacts/mockup-sandbox/src/components/ui/item.tsx` ← `.cursor/rules/majlisilm-seo.mdc`
- `artifacts/mockup-sandbox/src/components/ui/kbd.tsx` ← `artifacts/majalis-promo/public/images/parchment.png`
- `artifacts/mockup-sandbox/src/components/ui/label.tsx` ← `.cursor/rules/majlisilm-accessibility.mdc`
- `artifacts/mockup-sandbox/src/components/ui/menubar.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/navigation-menu.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/pagination.tsx` ← `artifacts/majalis/data/open-platform-openapi.json`
- `artifacts/mockup-sandbox/src/components/ui/popover.tsx` ← `artifacts/majalis/src/app/styles/theme.css`
- `artifacts/mockup-sandbox/src/components/ui/progress.tsx` ← `.github/scripts/safe-auto-merge/eligibility.mjs`
- `artifacts/mockup-sandbox/src/components/ui/radio-group.tsx` ← `artifacts/majalis/src/components/ui/field.tsx`
- `artifacts/mockup-sandbox/src/components/ui/resizable.tsx` ← `artifacts/mockup-sandbox/package.json`
- `artifacts/mockup-sandbox/src/components/ui/scroll-area.tsx` ← `artifacts/mockup-sandbox/package.json`
- `artifacts/mockup-sandbox/src/components/ui/select.tsx` ← `.github/scripts/release-train/__tests__/classify.test.mjs`
- `artifacts/mockup-sandbox/src/components/ui/separator.tsx` ← `artifacts/majalis/data/needs-post-review.jsonl`
- `artifacts/mockup-sandbox/src/components/ui/sheet.tsx` ← `.migration-backup/layout.jsx`
- `artifacts/mockup-sandbox/src/components/ui/sidebar.tsx` ← `artifacts/majalis/docs/audio-rights/evidence/wikimedia-adhan-ogg-2026-09-13.html`
- `artifacts/mockup-sandbox/src/components/ui/skeleton.tsx` ← `artifacts/majalis/lib/content-ops/pipeline.mjs`
- `artifacts/mockup-sandbox/src/components/ui/slider.tsx` ← `artifacts/majalis/src/components/notifications/SunnahChannelsPanel.tsx`
- `artifacts/mockup-sandbox/src/components/ui/sonner.tsx` ← `artifacts/mockup-sandbox/package.json`
- `artifacts/mockup-sandbox/src/components/ui/switch.tsx` ← `artifacts/majalis-mobile/app/(tabs)/account.tsx`
- `artifacts/mockup-sandbox/src/components/ui/table.tsx` ← `.github/scripts/ci/__tests__/dist-artifact-identity.test.mjs`
- `artifacts/mockup-sandbox/src/components/ui/tabs.tsx` ← `artifacts/majalis-mobile/app/(tabs)/_layout.tsx`
- `artifacts/mockup-sandbox/src/components/ui/textarea.tsx` ← `.migration-backup/globals.css`
- `artifacts/mockup-sandbox/src/components/ui/toast.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/toaster.tsx` ← `artifacts/mockup-sandbox/src/components/ui/sonner.tsx`
- `artifacts/mockup-sandbox/src/components/ui/toggle-group.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/components/ui/toggle.tsx` ← `artifacts/majalis-mobile/app/(tabs)/lessons.tsx`
- `artifacts/mockup-sandbox/src/components/ui/tooltip.tsx` ← `artifacts/majalis/package.json`
- `artifacts/mockup-sandbox/src/hooks/use-mobile.tsx` ← `artifacts/majalis/src/components/ui/sidebar.tsx`
- `artifacts/mockup-sandbox/src/hooks/use-toast.ts` ← `artifacts/mockup-sandbox/src/components/ui/toaster.tsx`
- `artifacts/mockup-sandbox/src/lib/utils.ts` ← `artifacts/majalis/components.json`
- `docs/ux/homepage-redesign/capture.mjs` ← `artifacts/majalis-mobile/scripts/build.js`
- `lib/api-handlers/account-delete.js` ← `artifacts/majalis/lib/api-dispatch.mjs`
- `lib/api-spec/orval.config.ts` ← `lib/api-spec/package.json`
- `scripts/ci/changed-scope.ts` ← `.github/scripts/safe-auto-merge/path-classifier.mjs`
- `scripts/design-governance-preflight.mjs` ← `artifacts/majalis/src/lib/__tests__/elevation-border-governance-authority-gate.test.ts`
- `scripts/device-evidence/capture-build-context.mjs` ← `artifacts/majalis/src/lib/__tests__/wave13-device-evidence-runbook-gate.test.ts`
- `scripts/device-evidence/validate-evidence-rows.mjs` ← `artifacts/majalis/src/lib/__tests__/wave13-device-evidence-runbook-gate.test.ts`
- `scripts/device-evidence/validate-physical-evidence-pack.mjs` ← `artifacts/majalis/src/lib/__tests__/ios-physical-evidence-ingestion-gate.test.ts`
- `scripts/store-compliance-audit.mjs` ← `artifacts/majalis/src/lib/__tests__/sovereign-ultimate-gate.test.ts`
- `scripts/sync-mushaf-page-metadata.mjs` ← `artifacts/mushafi/scripts/release_check.sh`
- `scripts/total-trust-hadith-tafsir.mjs` ← `artifacts/majalis/src/lib/__tests__/total-trust-phase4-gate.test.ts`
- `scripts/total-trust-inventory.mjs` ← `artifacts/majalis/src/lib/__tests__/total-trust-phase0-gate.test.ts`
- `scripts/total-trust-mushaf-boundary.mjs` ← `artifacts/majalis/src/lib/__tests__/total-trust-phase2-gate.test.ts`
- `scripts/total-trust-route-states.mjs` ← `artifacts/majalis/src/lib/__tests__/total-trust-phase2-gate.test.ts`

</details>

## 3) التبعيات

### غير مستخدمة — dependencies

| الحزمة | package.json |
|---|---|
| `@workspace/db` | `artifacts/api-server/package.json` |
| `cookie-parser` | `artifacts/api-server/package.json` |
| `drizzle-orm` | `artifacts/api-server/package.json` |
| `@capacitor/ios` | `artifacts/majalis/package.json` |
| `@vercel/functions` | `artifacts/majalis/package.json` |
| `compression` | `artifacts/majalis/package.json` |
| `dotenv` | `artifacts/majalis/package.json` |
| `express` | `artifacts/majalis/package.json` |
| `hls.js` | `artifacts/majalis/package.json` |
| `qrcode` | `artifacts/majalis/package.json` |
| `drizzle-zod` | `lib/db/package.json` |
| `zod` | `lib/db/package.json` |

ملاحظة: بعضها يُستخدم خارج رسم الاستيراد (مثل `@capacitor/ios` عبر Capacitor CLI، و`express`/`compression` في خادم محلي) — تحقق قبل الإزالة.

<details><summary>غير مستخدمة — devDependencies (97)</summary>

| الحزمة | package.json |
|---|---|
| `@types/cookie-parser` | `artifacts/api-server/package.json` |
| `@capacitor/assets` | `artifacts/majalis/package.json` |
| `@hookform/resolvers` | `artifacts/majalis/package.json` |
| `@radix-ui/react-avatar` | `artifacts/majalis/package.json` |
| `@radix-ui/react-context-menu` | `artifacts/majalis/package.json` |
| `@radix-ui/react-dropdown-menu` | `artifacts/majalis/package.json` |
| `@radix-ui/react-menubar` | `artifacts/majalis/package.json` |
| `@radix-ui/react-navigation-menu` | `artifacts/majalis/package.json` |
| `@radix-ui/react-separator` | `artifacts/majalis/package.json` |
| `@radix-ui/react-toast` | `artifacts/majalis/package.json` |
| `@radix-ui/react-toggle-group` | `artifacts/majalis/package.json` |
| `@radix-ui/react-tooltip` | `artifacts/majalis/package.json` |
| `@rollup/rollup-darwin-arm64` | `artifacts/majalis/package.json` |
| `@tailwindcss/oxide-darwin-arm64` | `artifacts/majalis/package.json` |
| `@tailwindcss/postcss` | `artifacts/majalis/package.json` |
| `@tailwindcss/typography` | `artifacts/majalis/package.json` |
| `@workspace/api-client-react` | `artifacts/majalis/package.json` |
| `cmdk` | `artifacts/majalis/package.json` |
| `embla-carousel-react` | `artifacts/majalis/package.json` |
| `input-otp` | `artifacts/majalis/package.json` |
| `lightningcss-darwin-arm64` | `artifacts/majalis/package.json` |
| `next-themes` | `artifacts/majalis/package.json` |
| `react-day-picker` | `artifacts/majalis/package.json` |
| `react-hook-form` | `artifacts/majalis/package.json` |
| `tailwindcss` | `artifacts/majalis/package.json` |
| `tw-animate-css` | `artifacts/majalis/package.json` |
| `vaul` | `artifacts/majalis/package.json` |
| `prettier` | `package.json` |
| `@babel/core` | `artifacts/majalis-mobile/package.json` |
| `@expo/cli` | `artifacts/majalis-mobile/package.json` |
| `@expo/ngrok` | `artifacts/majalis-mobile/package.json` |
| `@stardazed/streams-text-encoding` | `artifacts/majalis-mobile/package.json` |
| `@ungap/structured-clone` | `artifacts/majalis-mobile/package.json` |
| `babel-plugin-react-compiler` | `artifacts/majalis-mobile/package.json` |
| `expo-image` | `artifacts/majalis-mobile/package.json` |
| `expo-image-picker` | `artifacts/majalis-mobile/package.json` |
| `expo-linear-gradient` | `artifacts/majalis-mobile/package.json` |
| `expo-location` | `artifacts/majalis-mobile/package.json` |
| `expo-status-bar` | `artifacts/majalis-mobile/package.json` |
| `react-native-svg` | `artifacts/majalis-mobile/package.json` |
| `react-native-worklets` | `artifacts/majalis-mobile/package.json` |
| `zod` | `artifacts/majalis-mobile/package.json` |
| `zod-validation-error` | `artifacts/majalis-mobile/package.json` |
| `@hookform/resolvers` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-accordion` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-alert-dialog` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-aspect-ratio` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-avatar` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-checkbox` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-collapsible` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-context-menu` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-dialog` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-dropdown-menu` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-hover-card` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-label` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-menubar` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-navigation-menu` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-popover` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-progress` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-radio-group` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-scroll-area` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-select` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-separator` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-slider` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-slot` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-switch` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-tabs` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-toast` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-toggle` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-toggle-group` | `artifacts/mockup-sandbox/package.json` |
| `@radix-ui/react-tooltip` | `artifacts/mockup-sandbox/package.json` |
| `class-variance-authority` | `artifacts/mockup-sandbox/package.json` |
| `clsx` | `artifacts/mockup-sandbox/package.json` |
| `cmdk` | `artifacts/mockup-sandbox/package.json` |
| `date-fns` | `artifacts/mockup-sandbox/package.json` |
| `embla-carousel-react` | `artifacts/mockup-sandbox/package.json` |
| `framer-motion` | `artifacts/mockup-sandbox/package.json` |
| `input-otp` | `artifacts/mockup-sandbox/package.json` |
| `lucide-react` | `artifacts/mockup-sandbox/package.json` |
| `next-themes` | `artifacts/mockup-sandbox/package.json` |
| `react-day-picker` | `artifacts/mockup-sandbox/package.json` |
| `react-hook-form` | `artifacts/mockup-sandbox/package.json` |
| `react-resizable-panels` | `artifacts/mockup-sandbox/package.json` |
| `recharts` | `artifacts/mockup-sandbox/package.json` |
| `sonner` | `artifacts/mockup-sandbox/package.json` |
| `tailwind-merge` | `artifacts/mockup-sandbox/package.json` |
| `tailwindcss-animate` | `artifacts/mockup-sandbox/package.json` |
| `vaul` | `artifacts/mockup-sandbox/package.json` |
| `zod` | `artifacts/mockup-sandbox/package.json` |
| `@react-spring/web` | `artifacts/majalis-promo/package.json` |
| `@react-three/drei` | `artifacts/majalis-promo/package.json` |
| `@react-three/fiber` | `artifacts/majalis-promo/package.json` |
| `clsx` | `artifacts/majalis-promo/package.json` |
| `gsap` | `artifacts/majalis-promo/package.json` |
| `lottie-react` | `artifacts/majalis-promo/package.json` |
| `tailwind-merge` | `artifacts/majalis-promo/package.json` |
| `three` | `artifacts/majalis-promo/package.json` |

</details>

### مستخدمة وغير مُدرجة (unlisted) — تعمل اعتمادًا على تبعية متعدّية أو بيئة

| الحزمة | الملف |
|---|---|
| `expo-updates` | `artifacts/majalis-mobile/app.json` |
| `pg` | `scripts/verify-schema-drift-expectations.mjs` |
| `pg` | `scripts/test-postgres-queue-integration.mjs` |
| `pg` | `scripts/db-migration-verify.mjs` |
| `vitest` | `artifacts/majalis/src/shared/arabic-normalize.test.ts` |

### استيرادات لا تُحَل (unresolved)

| المسار | الملف |
|---|---|
| `babel-preset-expo` | `artifacts/majalis-mobile/babel.config.js` |
| `../src/shared/lib/graph-schema.ts` | `artifacts/majalis/scripts/verify-json-schemas.mjs` |
| `../voice-recitation-verify` | `artifacts/majalis/src/lib/__tests__/speech-scroll-sacred-sync-suite.test.ts` |
| `./types.mjs` | `artifacts/majalis/scripts/harvest/adapters/telegram.mjs` |

### ملفات تنفيذية غير مُدرجة (binaries)

| الأمر | المصدر |
|---|---|
| `cap` | `package.json` |
| `cap` | `.github/workflows/ios-testflight-deploy.yml` |

`cap` يوفّره `scripts/cap-shim.mjs` عبر حقل `bin` في الجذر — إيجابي كاذب.

## 4) exports وtypes غير مستخدمة — أعلى 30 ملفًا

| الملف | exports | types |
|---|---|---|
| `artifacts/majalis/src/components/design-system/index.ts` | 133 | 56 |
| `artifacts/majalis/src/lib/mushaf-v2/index.ts` | 34 | 16 |
| `artifacts/majalis/src/lib/quran-data/index.ts` | 34 | 10 |
| `artifacts/majalis/src/features/search/index.ts` | 32 | 12 |
| `artifacts/majalis/src/quran/services/index.ts` | 29 | 14 |
| `artifacts/majalis/src/lib/scholarly-research/index.ts` | 25 | 12 |
| `artifacts/majalis/src/lib/memorization-path/index.ts` | 23 | 10 |
| `artifacts/majalis/src/quran/constants/index.ts` | 32 | 1 |
| `artifacts/majalis/src/lib/quran-journey/index.ts` | 18 | 14 |
| `artifacts/majalis/src/features/mushaf-shared/layout-bands.ts` | 32 | 0 |
| `artifacts/majalis/src/features/mushaf-reader/mushaf-warm-yellow-tokens.ts` | 26 | 0 |
| `artifacts/majalis/src/lib/sovereign/sovereign-bootstrap.ts` | 26 | 0 |
| `artifacts/majalis/src/lib/supabase.ts` | 22 | 2 |
| `artifacts/majalis/src/components/ui-common.tsx` | 22 | 2 |
| `artifacts/majalis/src/lib/digital-learning-service.ts` | 18 | 5 |
| `artifacts/majalis/src/lib/fiqh/fiqhNormalize.ts` | 16 | 5 |
| `artifacts/majalis/lib/cms/lesson-intelligence/index.mjs` | 21 | 0 |
| `artifacts/majalis/lib/islamic-intelligence/index.mjs` | 20 | 0 |
| `artifacts/majalis/src/features/mushaf-reader/index.ts` | 17 | 3 |
| `artifacts/majalis/src/lib/islamic-sects/index.ts` | 8 | 11 |
| `artifacts/majalis/src/lib/ssunnah-theme.ts` | 17 | 2 |
| `artifacts/majalis/src/lib/learning-paths-service.ts` | 12 | 7 |
| `artifacts/majalis/src/lib/quran-personal.ts` | 13 | 6 |
| `artifacts/majalis/lib/autonomous-platform/index.mjs` | 18 | 0 |
| `artifacts/majalis/src/components/ui/InternalCards.tsx` | 13 | 5 |
| `artifacts/majalis/src/components/knowledge/index.ts` | 12 | 6 |
| `artifacts/majalis/src/components/design-system/CardSystem.tsx` | 12 | 6 |
| `artifacts/majalis/src/lib/knowledge-platform/index.ts` | 8 | 9 |
| `artifacts/majalis/src/lib/quran-navigation/index.ts` | 9 | 8 |
| `artifacts/majalis/src/lib/adhan-audio-service.ts` | 11 | 6 |

## الخطوة التالية المقترحة

1. **unlisted/unresolved أولًا** (خطر فعلي على البناء/التشغيل): أدرج `pg` و`vitest` صراحة أو أزل الاستيراد، وأصلح المسارات التي لا تُحَل.
2. إضافة `knip.json` بنقاط الدخول الناقصة (`api/**`، `scripts/**` المستدعاة من workflows، إعدادات الأدوات) لخفض الإيجابيات الكاذبة قبل اعتماد Knip بوابةً في CI بخط أساس.
3. حذف ملفات القسم (1) بدفعات صغيرة مع `tsc` + build + الاختبارات لكل دفعة.
