# ⚠ هدف Capacitor القديم — لا يُرفع

هذا المجلد (`App`/`App.xcodeproj`) هو غلاف Capacitor القديم. يحمل المعرّف `com.yousef.majlisilm` نفسه لكنه يحوي أذونات وقدرات لا يملكها التطبيق الأصلي (ميكروفون، حركة، `remote-notification`، `aps-environment`)، فرفعه يخالف إفصاح App Privacy.

- **المرفوع فعلًا:** scheme `SunnahApp` من `ios-native/SunnahApp.xcodeproj` فقط (`scripts/native-archive-prepare.sh` أو `fastlane native_beta`).
- scheme `App` هنا مضبوط على أرشفة Debug عمدًا كي لا يصلح للرفع من Organizer.
- يحرس ذلك `scripts/native-capabilities-check.py` (قائمة `docs/native/capabilities-allowlist.json`).
- لا تحذف الملفات ولا تغيّر صلاحياتها (قرار المالك 2026-10-16: تعطيل لا حذف).
