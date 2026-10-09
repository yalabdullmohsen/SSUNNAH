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

## Data collected — جاهز للنسخ إلى App Store Connect (مطابق لـPrivacyInfo، 2026-10-09)

App Privacy → «Do you or your third-party partners collect data from this app?» = **Yes**. Tracking = **No** لكل الأنواع.

| الفئة في ASC | النوع في ASC | Linked to the user | Used for tracking | Purposes | المصدر في الكود |
|---|---|---|---|---|---|
| Contact Info | Email Address | Yes | No | App Functionality | Supabase Auth والمراسلات |
| Contact Info | Name | Yes | No | App Functionality | `profiles.full_name` والشهادات |
| Contact Info | Phone Number | Yes | No | App Functionality | `dawah_contact_requests.contact_value` (اختياري) |
| Identifiers | User ID | Yes | No | App Functionality | معرّف Supabase |
| Identifiers | Device ID | Yes | No | App Functionality | رمز APNs في `push_subscriptions` |
| User Content | Other User Content | Yes | No | App Functionality | ملاحظات، مفضلة، تقييمات، بلاغات، خطط |
| Usage Data | Product Interaction | Yes | No | App Functionality, Analytics | التقدّم و`content_views` |
| Search History | Search History | Yes | No | App Functionality, Analytics | `search_analytics_events` |
| Diagnostics | Crash Data | No | No | App Functionality | `client_error_logs` بلا معرّف |
| Diagnostics | Performance Data | No | No | Analytics | Web Vitals بعد الموافقة، بلا معرّف |
| User Content | Audio Data | **Not collected** | — | — | التسميع على الجهاز فقط؛ انظر أدناه |

غير مجموع: الموقع (القبلة والمواقيت تُحسب على الجهاز)، والمالية، والصحة، وجهات الاتصال، والصور، والمعرّف الإعلاني.

## Required Reason APIs

| API | Reason | Evidence |
|-----|--------|----------|
| User Defaults | CA92.1 | PrivacyInfo |

## OWNER_ACTION before submit

1. Paste/confirm nutrition labels in ASC match this draft.  
2. If analytics/RUM ever ships with PII → update PrivacyInfo **and** ASC in the same change.  
3. Confirm no ATT / IDFA usage remains absent.

## Audio Data — غير مجموع (2026-10-09)

- وضع التسميع داخل المصحف يعالج الصوت بنموذج على الجهاز؛ لا يُرسل صوت ولا نص مفرَّغ، ولا يُحفظ التسجيل بعد الجلسة.
- صفحة «اختبار التلاوة» (المسار إلى Groq) حُذفت في #2799 وصار مسارها تحويلًا إلى `/mushaf?tasmee=1`. `src/lib/recitation-test/api.ts` لا يستورده أي كود في الواجهة.
- نص إذن الميكروفون (`scripts/mic-usage-description.txt` = `Info.plist`): «يُستخدم الميكروفون لتسجيل تلاوتك في وضع التسميع داخل المصحف. تُعالج التلاوة على جهازك فقط ولا تُرسل ولا تُحفظ.»
- البوابات: `app-store-readiness-gate` و`test-ios-capacitor-gates` و`recitation-test-ai-gate` تمنع `AudioData` وأي «خدمة خارجية» في نص الإذن.

### شرط أي إرسال سحابي لاحق (مزوّد Groq في محرك التسميع v2)
1. **OWNER_ACTION:** تفعيل Zero Data Retention في Groq (Data Controls). قاعدة المالك: ZDR فقط. المصدر: https://console.groq.com/docs/your-data.
2. في التغيير نفسه: إعادة `AudioData` (غير مرتبط، بلا تتبع، App Functionality) إلى PrivacyInfo، وتحديث نص الإذن وصفحة الخصوصية وجدول ASC، وشاشة موافقة صريحة قبل أول إرسال.
3. هذا يتطلب نسخة متجر جديدة.
