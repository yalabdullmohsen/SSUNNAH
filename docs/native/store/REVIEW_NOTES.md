# REVIEW_NOTES — ملاحظات مراجعة App Review (سُنّة 1.2.0)

> تُلصق في App Store Connect ← الإصدار ← App Review Information ← Notes (الإنجليزية أولًا لأن المراجع غالبًا يقرؤها). الحساب التجريبي **قرار/إجراء المالك** (انظر أسفل).

## Notes (English — paste)

```
Sunnah (com.yousef.majlisilm) is an Arabic Islamic-learning app (Qur'an mushaf, adhkar, hadith, fiqh, seerah, prayer times). Version 1.2.0 is a full rewrite of the already-published app in SwiftUI; the bundle ID and App Store listing are unchanged.

- Most content is bundled and works offline. Features that need a connection: sign-in/account, bookmarks and reading-progress sync, user submissions, and newly published content. Offline, these screens show an explanatory empty state.
- Sign-in is optional. Browsing, Qur'an, adhkar, prayer times and the inheritance (Fara'id) calculator work without an account.
- Location (when in use) is used only to compute prayer times and the Qibla direction on the device; it is not sent to our servers.
- Notifications are local prayer/adhkar reminders (no marketing). Default sound is the system sound.
- Religious texts (Qur'an, hadith, adhkar, fiqh) are carried over unchanged from our published website https://www.ssunnah.com; they are curated content, not user-generated. There is no social feed or public user-generated content.
- No tracking, no ads, no third-party analytics SDK.
How to test sign-in (optional): there is no Sign-in button in Settings (Settings only shows the signed-in e-mail and Sign out). Steps: 1) open the personal screen "My Contributions" (مساهماتي, route /my-submissions), which shows a "تسجيل الدخول" button when signed out; 2) tap "تسجيل الدخول" (Sign in); 3) enter e-mail and password (credentials, if provided, are in the App Review Information fields) and tap "دخول". New accounts: "إنشاء حساب" (Register) sends a confirmation e-mail first. Account deletion (Guideline 5.1.1(v)), requires a signed-in account: Account → Privacy Center (مركز الخصوصية) → "حذف الحساب نهائيًا" (Delete account permanently) → type «حذف» to confirm → the app calls the server function delete_my_account, signs out and clears local data. The same screen is reachable from the sections list as "حذف الحساب" (route /account-deletion). Because deletion deletes the account, please use a disposable account (or create one via "إنشاء حساب"). All other features can be reviewed without signing in.
Religious content note: all Qur'an, hadith, adhkar and fiqh texts are published from our approved website https://www.ssunnah.com and are shown unchanged; the app does not author or edit religious texts.
Demo account: not required (sign-in is optional); if provided, see App Review Information fields.
```

## الميزات التي تحتاج اتصالًا (للمراجع)
تسجيل الدخول/إنشاء الحساب (Supabase Auth، قد يتطلب تأكيد البريد)، المفضلة والتقدم والإنجازات والتسجيل في الدروس، مساهمات المستخدمين (`/api/submissions`)، تصدير بيانات الحساب، المحتوى الجديد المنشور بعد الإصدار. صفحات «البحث الأكاديمي» ونماذج التواصل **تحتاج اتصالًا/حسابًا** وتعرض حالة فارغة منظّمة دونه (انظر `docs/native/data-exemptions.json`).

## الحساب التجريبي (إجراء المالك)
الدخول اختياري، فالمراجعة ممكنة دونه. إن أردتم تقديم حساب: أنشئ حسابًا في Supabase مؤكَّد البريد، وضع بياناته في حقلي **Sign-in required → User name / Password** في App Review Information. **لا تُكتب كلمة المرور في المستودع (عام).** تأكّد من صلاحيته قبل كل إرسال (`docs/store-release/REVIEWER_NOTES.md`).

## ملاحظات
- أُزيل من الصيغة القديمة (`docs/store-release/REVIEWER_NOTES.md`، 1.0.0) ذكر `remote-notification`: التطبيق الأصلي لا يسجّل إشعارات بعيدة (`UIBackgroundModes` = `audio`, `fetch`).
- لا مفتاح ميكروفون ولا حركة في Info.plist الحالي (حُذفا؛ لا تسجيل صوتي ولا CoreMotion في التطبيق).
- **شرط قبل الإرسال (إجراء المالك):** اختبار حذف الحساب عند المراجع يتطلب أن تكون الدالة `delete_my_account` مطبَّقة على الإنتاج (`docs/native/backend/delete-account.sql`)؛ وإلا تظهر «خدمة الحساب غير مهيّأة…» وقد يُرفض التطبيق (5.1.1(v)). وفِّر حسابًا تجريبيًا مؤكَّد البريد في App Review Information لأن الحذف لا يُختبر دون حساب.
- المساهمات (`/api/submissions`) وتصدير بيانات الحساب يعتمدان على خادم الموقع؛ إن تعذّر الاتصال تعرض رسالة لا انهيارًا. لا تَعِد بهما في نص المتجر.
