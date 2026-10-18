# مطابقة الخصوصية مع أرشيف حقيقي (SunnahApp-1.2.0-106.xcarchive، 2026-10-18)
مصدر: فحص ثنائي الأرشيف نفسه (plutil/codesign) لا الشيفرة المصدرية.

| النقطة | ما في الأرشيف 106 | الحكم |
|---|---|---|
| manifest المُحزَّم | `PrivacyInfo.xcprivacy` الأصلي: 5 أنواع مرتبطة بالمستخدم (Email, UserID, Name, OtherUserContent, ProductInteraction — الغرض AppFunctionality فقط، Tracking=false) + FileTimestamp C617.1 + UserDefaults CA92.1/1C8F.1 | يحسم تعارض 1: manifest الـCapacitor الأوسع (PhoneNumber/DeviceID/SearchHistory/CrashData/PerformanceData) **غير مُحزَّم** |
| الودجت/الساعة | manifest لكلٍّ: UserDefaults 1C8F.1 فقط، بلا بيانات مجموعة | سليم |
| Device ID / APNs | لا `aps-environment` في الهدف ولا الودجت؛ لا `remote-notification` في UIBackgroundModes (audio, fetch فقط) | لا Device ID؛ الإشعارات محلية. (مصدر Capacitor يحويهما لكنه خارج الأرشيف) |
| Capacitor | لا أثر في الحزمة | محسوم |
| التشفير | `ITSAppUsesNonExemptEncryption=false` | سليم |
| الموقع | `NSLocationWhenInUse` فقط، وصفه «على جهازك فقط» | Not collected |
| Associated domains | ssunnah.com وmajlisilm.com | ملاحظة: موقع ssunnah.com مؤجَّل (Vercel) فروابط عامة قد لا تفتح |
| `get-task-allow` | true (نسخة اختبار) | يُصحَّح تلقائيًا بتوقيع التوزيع؛ تحقق من أرشيف RC_FINAL |

**يبقى على يوسف:** App Privacy Report من الجهاز لمقارنة المضيفات بـ`NETWORK_HOSTS.md` (Supabase و`server*.mp3quran.net` فقط). Product Interaction (2.5) ما زال مُعلنًا في manifest؛ تأكد أن ASC يطابقه.
