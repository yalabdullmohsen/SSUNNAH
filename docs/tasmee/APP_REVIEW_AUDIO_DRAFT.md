# مسودة: نص مراجعة التطبيق — الميكروفون وبيانات الصوت (Audio Data)

> مسودة للمالك، لم تُدمج ولم تُرسل. تُراجع قبل أي تقديم لـApp Store.

## تنبيه تعارض يجب حسمه أولًا
`docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md` (سطر Audio Data) يقول «Not collected — no mic usage string»، وهذا **يخالف الواقع**:
- `Info.plist` فيه `NSMicrophoneUsageDescription`.
- «اختبار التلاوة» (`RecitationTestAiPage`) يرسل التسجيل إلى Groq بعد موافقة صريحة.

الجواب الصحيح في App Privacy: **Audio Data = Collected** (من «اختبار التلاوة» فقط)، الغرض App Functionality، غير مرتبط بالهوية، لا يُستخدم للتتبع. يلزم تعديل ذلك الملف وإجابات App Store Connect معًا.

## App Review Notes (إنجليزي)
The app requests microphone access only when the user starts a recitation feature.

1. Tasmee (memorization check): audio is captured and processed entirely on-device by a bundled/downloaded Core ML speech model. Audio is not uploaded, not stored on disk, and not retained after the session.
2. Recitation Test (optional): before any recording the app shows a dedicated consent screen explaining that one audio clip will be sent once to a third-party speech-to-text provider (Groq) to obtain a transcript. No audio is captured before consent; consent can be withdrawn in the same screen at any time. The audio is not stored by us (neither on device nor on our servers), and we do not keep the transcript.
3. No audio is used for advertising, analytics or tracking, and no account is required for either feature.

To test: Quran → Recitation Test → Start → accept consent → recite a verse. Tasmee works offline once the model is downloaded.

## نص NSMicrophoneUsageDescription (قائم، للمقارنة)
«يُستخدم الميكروفون لتسجيل تلاوتك. في وضع التسميع تُعالج التلاوة على جهازك فقط ولا تُرسل. وفي اختبار التلاوة تُرسل إلى خدمة خارجية لتحويلها إلى نص بعد موافقتك.» — متسق مع النص أعلاه.

## بناء القياس (TestFlight الداخلي فقط)
في بناء `TASMEE_DIAGNOSTICS` قد تُحفظ عيّنات الصوت في **الذاكرة** لمحاذاة الكلمات (`keepSessionAudio`، بسقف زمني) ولا تُكتب على القرص ولا تُرسل. هذا البناء لا يُرسل إلى مراجعة App Store إطلاقًا.

## نقاط تحقق قبل التقديم
- تأكيد أن Groq لا يحتفظ بالصوت (شروط المزوّد/ZDR) قبل الإبقاء على عبارة «لا يُخزَّن».
- مطابقة نص الموافقة في الواجهة مع هذه الصياغة.
- تحديث `APP_STORE_PRIVACY_ANSWERS_DRAFT.md` وسياسة الخصوصية العامة.
