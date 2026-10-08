# App Store Privacy Answers — Draft (aligned to PrivacyInfo.xcprivacy)

| Field | Value |
|-------|-------|
| Phase | T-048 |
| Source of truth (repo) | `artifacts/majalis/ios/App/App/PrivacyInfo.xcprivacy` |
| ASC console sync | **OWNER_ACTION** — do not claim ASC matches until owner confirms |

This draft maps **manifest → proposed ASC answers**. It does **not** assume App Store Connect already contains these values.

## Tracking

| Question | Proposed | Evidence |
|----------|----------|----------|
| Used for tracking? | **No** | `NSPrivacyTracking = false` |
| Tracking domains | none | — |

## Data collected

| Data type | Linked to user? | Used for tracking? | Purposes | Evidence |
|-----------|-----------------|--------------------|----------|----------|
| Email Address | Yes | No | App Functionality | PrivacyInfo · auth/signup |
| Coarse Location | No | No | App Functionality | PrivacyInfo · Qibla when-in-use |
| Audio Data | No (غير مرتبط بالهوية؛ انظر الأدلة) | No | App Functionality | اختبار التلاوة فقط · «Audio Data — الأدلة» أدناه |
| Payment / Financial | No | — | — | Product claim: no ads/payments in listing |

## Required Reason APIs

| API | Reason | Evidence |
|-----|--------|----------|
| User Defaults | CA92.1 | PrivacyInfo |

## OWNER_ACTION before submit

1. Paste/confirm nutrition labels in ASC match this draft.  
2. If analytics/RUM ever ships with PII → update PrivacyInfo **and** ASC in the same change.  
3. Confirm no ATT / IDFA usage remains absent.

## Audio Data — الأدلة (اطُّلع 2026-10-08)

**الجواب المقترح:** Audio Data = **Collected**، الغرض App Functionality، **غير مرتبط بالهوية**، **لا تتبع**. الميزة: «اختبار التلاوة» فقط؛ وضع التسميع على الجهاز لا يرسل شيئًا.

| السؤال | الجواب | الدليل في الكود |
|---|---|---|
| مسار البيانات | الهاتف ← `POST /api/recitation-transcribe` (Vercel) ← `api.groq.com` (whisper-large-v3) | `src/lib/recitation-test/api.ts`, `lib/api-handlers/recitation-transcribe.js` |
| ماذا يُرسل | صوت ≤45ث + mimeType + المدة + `consent:true` فقط. لا ترويسة Authorization ولا معرّف مستخدم ولا حساب. لا نص متوقَّع للمزوّد | `api.ts` (headers: Content-Type فقط)؛ ترويسة `Bearer` في المعالج هي مفتاح الخادم لا المستخدم |
| حفظ الخادم للصوت/النص/السجلات | لا حفظ: يُعالج في الذاكرة، لا ملفات ولا صفوف DB. السجلات: رمز حالة وأرقام المدة/الحجم فقط، لا محتوى | رأس `recitation-transcribe.js` + `console.warn/error` فيه |
| ما يُحفظ عن الطلب | مفتاح تحديد المعدل `recitation-daily:<IP>` في Upstash، نافذة منزلقة 24 ساعة (عدّاد لا صوت) | `rate-limit.mjs` · `checkRateLimit` + `getTrustedClientIp` |
| ربط الصوت بشخص | لا: لا يُقرن الصوت بحساب ولا IP؛ IP عدّاد فقط ولا يُمرَّر إلى Groq (Groq يرى عنوان خادم Vercel) | المعالج لا يمرّر أي ترويسة عميل إلى Groq |
| الموافقة قبل الإرسال | شاشة صريحة، ولا يُطلب الميكروفون قبلها؛ الخادم يرفض بـ403 دون `consent===true` | `RecitationTestAiPage.tsx` (مجموعة `recitation-consent`)، `api.ts` (`hasRecitationConsent`)، المعالج (`consent_required`) |
| نص الموافقة (حرفي) | «لتحليل تلاوتك يُرسَل تسجيلك الصوتي (حتى ٤٥ ثانية) عبر خادم سُنّة إلى خدمة تحويل الصوت إلى نص من طرف ثالث: Groq (خدمة ذكاء اصطناعي خارجية). يُرسَل الصوت وحده، ولا نرسل اسمك ولا بياناتك الأخرى. لا يُخزَّن التسجيل لدينا بعد المعالجة ولا نحتفظ بالنص المفرَّغ، وقد تحتفظ Groq بنسخة مؤقتة لأغراض الأمان وكشف الإساءة (حتى ٣٠ يومًا). لن يبدأ التسجيل ولن يُرسَل أي صوت قبل موافقتك، ويمكنك سحب الموافقة في أي وقت.» | `RecitationTestAiPage.tsx` ~300–307 |
| السحب والحذف | زر «سحب موافقة إرسال التسجيل» يمسح العلامة المحلية ويوقف أي إرسال لاحق. **لا آلية لحذف ما أُرسل سابقًا**: لا يوجد عندنا ما يُحذف، وما قد يبقى لدى Groq ≤30 يومًا خارج تحكّمنا | `consent.ts` (`revokeRecitationConsent`) |

### استثناءات يجب إدراجها عند الإفصاح
1. عنوان IP يُحفظ ≤24 ساعة في Upstash كمفتاح عدّاد (غير مقرون بالصوت). إن عُدّ IP معرّفًا فهو Identifiers لا Audio Data؛ القرار للمالك في ASC.
2. لدى Groq احتمال احتفاظ مؤقت ≤30 يومًا للأمان/الإساءة ما لم يُفعَّل ZDR.

### مصدر شروط Groq
https://console.groq.com/docs/your-data (اطُّلع 2026-10-08؛ الصفحة بلا تاريخ تحديث). اقتباس: «By default, Groq does not retain customer data for inference requests.» والاستثناء: سجلات مؤقتة للأعطال/الإساءة «up to 30 days, unless legally required to retain longer». ZDR: يفعّله المدير من Data Controls في GroqCloud.

### معلّقات
- **OWNER_ACTION:** تفعيل Zero Data Retention على حساب Groq (Data Controls). قبل ذلك لا يُكتب «لا يحتفظ مزوّدنا بالصوت» في أي نص مراجعة.
- **فجوة PrivacyInfo.xcprivacy:** لا يعلن `NSPrivacyCollectedDataTypeAudioData` رغم الإرسال أعلاه. إضافته تعديل في `ios/` (يطلق TestFlight تلقائيًا) فلم يُلمس هنا؛ يُجدول مع بناء قادم بقرار المالك.
- مزامنة إجابات ASC: OWNER_ACTION.
