# مسودة: نص مراجعة التطبيق — الميكروفون وبيانات الصوت (Audio Data)

> مسودة للمالك، لم تُرسل. الأدلة التفصيلية في `docs/store-release/APP_STORE_PRIVACY_ANSWERS_DRAFT.md` (قسم «Audio Data — الأدلة»). اطُّلع على شروط Groq في 2026-10-08.

## App Review Notes (إنجليزي — جاهز للصق بعد حسم البنود المعلّقة)
The app requests microphone access only when the user starts a recitation feature.

1. **Tasmee (memorization check)** — audio is captured and processed entirely on-device by a Core ML speech model. Nothing is uploaded and nothing is written to disk; audio is held in memory only for the duration of the session.
2. **Recitation Test (optional)** — before any recording, the app shows a dedicated consent screen. Only after the user taps "I agree" is one clip (up to 45 seconds) sent, via our server, to a third-party speech-to-text provider (Groq) to obtain a transcript. The audio is sent alone: no name, account or user identifier. No audio is captured or sent before consent, and consent can be withdrawn at any time from the same screen. Our server processes the clip in memory only; we store neither the audio nor the transcript.
3. Audio is not used for advertising, analytics or tracking. No account is required.

To test: Quran → Recitation Test → Start → accept consent → recite a verse. Tasmee works offline once its model is downloaded.

## عبارات معلّقة (لا تُضاف قبل شرطها)
- «Groq does not retain the audio» ← معلّقة حتى تفعيل Zero Data Retention على حساب Groq (**مهمة المالك**: GroqCloud ← Data Controls). الموثّق الآن: «By default, Groq does not retain customer data for inference requests»، مع استثناء سجلات الأعطال/الإساءة «up to 30 days» (https://console.groq.com/docs/your-data، 2026-10-08). لذلك النص أعلاه لا يتعهّد عن Groq بشيء.
- «we store neither audio nor transcript» ← أثبتها الكود (`recitation-transcribe.js`: معالجة في الذاكرة، بلا ملفات ولا DB ولا تسجيل للمحتوى).

## صفحة سياسة الخصوصية العامة (`PrivacyPage.tsx`) — لا أعدّلها بنفسي
**الموجود وصحيح:** إرسال الصوت إلى Groq بعد موافقة، حتى 45ث، الصوت وحده، ≤30 يومًا لدى Groq ما لم يُفعَّل ZDR، سحب الموافقة.
**الناقص:**
1. قسم «مدة الاحتفاظ» يقول فقط «التسجيلات الصوتية: لا تُخزَّن على خوادمنا مطلقًا»، دون ذكر نسخة Groq المؤقتة.
2. لا يذكر أن عنوان IP يُحفظ ≤24 ساعة كعدّاد حد يومي في Upstash.
3. لا يوضح أن سحب الموافقة يوقف الإرسال المستقبلي فقط ولا يحذف ما أُرسل سابقًا.

**التعديل المقترح — بند في «مدة الاحتفاظ» (عربي):**
> التسجيلات الصوتية (اختبار التلاوة): لا نخزّن التسجيل ولا النص المفرَّغ على خوادمنا. قد تحتفظ خدمة Groq بنسخة مؤقتة لأغراض الأمان وكشف الإساءة حتى ٣٠ يومًا ما لم يُفعَّل خيار عدم الاحتفاظ. نحتفظ بعنوان الاتصال (IP) حتى ٢٤ ساعة فقط لعدّاد الحد اليومي، دون ربطه بالتسجيل. سحب الموافقة يوقف أي إرسال لاحق ولا يمسّ ما أُرسل قبله.

**English:**
> Voice recordings (Recitation Test): we do not store the recording or its transcript on our servers. Groq may keep a temporary copy for security and abuse investigation for up to 30 days unless its zero-data-retention option is enabled. We keep your connection address (IP) for at most 24 hours solely for a daily rate limit, not linked to the recording. Withdrawing consent stops any future upload; it does not affect clips already sent.

(الصياغة الثانية عن Groq تُحدَّث بعد تفعيل ZDR: «Groq does not retain it».)

## بناء القياس (TestFlight الداخلي فقط)
في بناء `TASMEE_DIAGNOSTICS` قد تُحفظ عيّنات الصوت في **الذاكرة** (`keepSessionAudio`، بسقف زمني) ولا تُكتب على القرص ولا تُرسل. لا يُرسل هذا البناء لمراجعة App Store.

## ثغرة في بيان الخصوصية الأصلي
`PrivacyInfo.xcprivacy` لا يعلن AudioData. إضافته تعديل في `ios/` فيُطلق TestFlight، فلم يُلمس؛ بقرار المالك.
