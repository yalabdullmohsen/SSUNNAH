# استثناءات إغلاق الديون — 1.1.0 (الاستحقاق 2026-10-14)

عدّادان يصلان صفرًا **في الشاشات الموجّهة للمستخدم**: `oldSystemImports` و`backButtonsOutsideNavBar`. ما يلي مستثنى بقرار، مع مراجعة مؤرَّخة.

| المسار | العدّاد | العدد (2026-10-08) | السبب | مراجعة |
|---|---|---|---|---|
| `src/views/admin/**`، `src/admin-v3/**` (~49 ملفًا) | oldSystemImports | 43 | لوحة إدارة داخلية لا يراها الزائر؛ تُهاجر بعد 1.1.0 | 2026-11-15 |
| `src/components/design-system/**`، `ui-common/**`، `ui/mj/**` (ملفات التعريف) | oldSystemImports | ~30 | تعريفات النظام القديم؛ تُحذف حين لا يبقى مستهلك | بعد آخر مستهلك |
| `FloatingBackButton.tsx`، `GlobalBackButton.tsx` | backButtons | 13 | تعريفات الأزرار القديمة؛ تُحذف بعد نقل المستهلكين إلى NavigationBar | بعد نقل المستهلكين |
| `src/pages/dev/**` | oldSystemImports | 7 | صفحات مطوّرين غير مفهرسة | 2026-11-15 |
| `src/views/PrivacyPage.tsx` | الأربعة | — | ملكية ن5 (قاعدة التنسيق) حتى إشعار المالك | عند إشعار المالك |
| `hexOutsideTokens` (5715) و`localButtonsAndCards` (1622) | — | — | خارج نطاق 1.1.0 بقرار المالك؛ لا ارتفاع مسموح (ratchet) | 2026-12-01 |
