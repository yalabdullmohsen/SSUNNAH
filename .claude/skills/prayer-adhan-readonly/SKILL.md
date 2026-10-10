---
name: prayer-adhan-readonly
description: مواقيت الصلاة والأذان: قراءة المخرجات فقط. استخدمها عند أي ميزة تستهلك المواقيت أو الأذان أو تجدول إشعارًا لها.
---

# المواقيت والأذان
- حساب المواقيت وجدولة الأذان لا يُغيَّران في أي موجة؛ الميزات الجديدة تستهلك مخرجات المحرك فقط (`.claude/rules/protected-content.md`).
- التشخيص: `pnpm run diagnose:prayer-times` (`scripts/diagnose-prayer-times.mjs`)، وخريطة المسار `docs/performance/ADHAN_PIPELINE_MAP.md` و`docs/PRAYER_TIME_DIAGNOSIS.md`.
- البوابات: `test:prayer-engine-p0`، `test:prayer-notif-timing`، `test:prayer-notification-scheduler`، `test:adhan-7day-window`، `test:prayer-adhan-parity`.
- صوت الأذان له بوابات حقوق وحزمة (انظر مهارة audio-licenses-sources). في iOS صلاة الويب على LocalNotifications؛ الإشعارات الأصلية للأذكار فقط (انظر ios-notifications-native).
