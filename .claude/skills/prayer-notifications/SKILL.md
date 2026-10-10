---
name: prayer-notifications
description: إشعارات الأذان والتذكيرات المحلية. استخدمها عند أي تعديل على جدولة التنبيهات أو الأصوات أو ترتيب التذكيرات أو أذونات الإشعارات.
---

# الإشعارات والتذكيرات

- المراجع: `docs/prayer-notifications-rebuild-inventory.md` (المكوّنات)، `docs/store-release/DEVICE_NOTIFICATION_MATRIX.md` (الأدلة المطلوبة)، `docs/performance/ADHAN_PIPELINE_MAP.md`.
- الملفات: `src/lib/prayer-alert-scheduler.ts` (المنسّق)، `prayer-local-notifications.ts` (Capacitor)، `prayer-notification-scheduler.ts` (مصالحة Desired↔Pending بقفل single-flight)، `prayer-notification-ids.ts`.
- **حساب المواقيت وجدولة الأذان لا يُغيَّران**؛ الميزات الجديدة تستهلك مخرجات المحرك.
- قرار المالك: كل أنواع التذكيرات بترتيب **غير مزدحم** (حد أقصى معقول يوميًا، دمج المتقارب، إيقاف فردي لكل نوع، ساعات هدوء).
- الأصوات (الأذان/الأذكار): فقط ما في `AUDIO_RELEASE_ALLOWLIST.json`؛ أي صوت جديد بترخيص موثّق.
- لا تدّعِ نجاح التوصيل من محاكٍ أو اختبار وحدة؛ الدليل جهاز حقيقي في `DEVICE_EVIDENCE/`.
- نصوص الأذونات (Purpose strings) واضحة وصادقة وبلا ضغط.
