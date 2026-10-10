---
name: audio-licenses-sources
description: الأصوات والتراخيص ومصادر المحتوى وصفحة /sources. استخدمها عند إضافة صوت أو خط أو مكتبة أو مصدر أو تعديل نص الحقوق.
---

# الصوت والتراخيص والمصادر
- نص الحقوق: «الحقوق غير محفوظة — لوجه الله». صفحة المصادر: `src/views/SourcesLicensesPage.tsx` + بياناتها `src/data/content-sources.ts`؛ بوابة المحتوى: `test:licenses` (`scripts/verify-licenses-gate.mjs`) و`check:sources-and-licenses`.
- الجرد: `docs/LICENSES.md`، و`docs/store-release/ISLAMIC_SOURCES_EVALUATION.md` و`LICENSE_DECISION_MATRIX.md` و`THIRD_PARTY_NOTICES.md`. مصدر جديد خلف feature flag بموافقة المالك وسجله هناك.
- الصوت: `docs/store-release/AUDIO_RELEASE_ALLOWLIST.json`، بوابات `test:prayer-audio-rights` و`test:ios-sound-compliance` و`test:sound-pack`، وتدقيق `audit:audio`.
- المحتوى الشرعي: مهارة sharia-content. مصدر غير محسوم الترخيص يُوسم ولا يُنسب إليه ترخيص مفتوح.
