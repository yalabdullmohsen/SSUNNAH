# Store Identity Decision — سُنّة

**القرار: موقَّع — المالك (يوسف) — 2026-10-11**

| # | القرار |
|---|---|
| 1 | **Bundle ID يبقى `com.yousef.majlisilm`** (الخيار A): تحديث للتطبيق المنشور، لا تطبيق جديد، وتستمر هوية TestFlight/المتجر السابقة. لا إعادة تسمية. |
| 2 | **`SunnahApp.xcodeproj` (SwiftUI) يحل محل مشروع Capacitor عند الإصدار.** يحمل نفس Bundle ID والفريق (`5D8TX37HTS`)؛ ويُرفع رقم البناء فوق آخر بناء منشور (CURRENT_PROJECT_VERSION 56). |

**السجل السابق (للتاريخ):** كان Capacitor يضبط `appName` = سُنّة و`appId` = `com.yousef.majlisilm` و`server.url` = `https://www.ssunnah.com`. الخيار B (اسم جديد) كان سيُنشئ إدراجًا جديدًا ويقطع الاستمرارية؛ رُفض.

**Status:** **DECIDED** — يُغلق بند OWN-06 في `MANUAL_OWNER_ACTION.md`.
