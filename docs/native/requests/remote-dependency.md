# اعتماد التطبيق على الموقع (مصادر `.remote`)

الإطلاق يعتمد على بقاء الموقع حيًّا لهذه المسارات فقط. الباقي محزوم في التطبيق ويعمل بلا شبكة.

**العدد: 10 مسارات من 212** (≈4.7%) — 8 عامة + 2 تتطلب تسجيل دخول.

## السلوك
- ناقل `RemoteTransport` (SunnahNative/Data): مهلة 8 ثوانٍ، غير متزامن (لا تجميد للواجهة).
- آخر استجابة ناجحة تُحفظ على القرص (`DiskCache.standard()`) وتُعرض عند الانقطاع أو سقوط الموقع.
- بلا اتصال وبلا كاش: «لا يوجد اتصال، حاول لاحقًا» + زر «إعادة المحاولة» (`ErrorStateView`).
- `/api` و`/data` ← `VERCEL_API_BASE_URL` (الافتراضي https://www.ssunnah.com)؛ `/rest/v1` ← `SUPABASE_URL` + `SUPABASE_ANON_KEY` من Info.plist (ن4: تأكد من وجودهما في Release، وإلا تفشل مسارا الحساب بالرسالة نفسها).

## المسارات
| # | المسار | المصدر | كاش (maxAge) |
|---|--------|--------|--------------|
| 1 | /calendar | /data/lessons/chunk-000.json | ساعة |
| 2 | /car-mode | /data/lessons/chunk-000.json | ساعة |
| 3 | /updates | /api/auto-content + تحديثات المنصة | 15 د |
| 4 | /updates/auto/:slug | /api/auto-content?slug= | 15 د |
| 5 | /teachers | /data/lessons/chunk-000.json | ساعة |
| 6 | /teachers/:slug | /data/lessons/chunk-000.json | ساعة |
| 7 | /sources | /data/sources/accounts.json | يوم |
| 8 | /sources/:id | accounts.json + /data/lessons/feed.json | يوم / ساعة |
| 9 | /stats 🔒 | /rest/v1 (bookmarks, achievements, lesson_registrations, reading_resume) | بلا كاش |
| 10 | /my-submissions 🔒 | /rest/v1 (submissions) | بلا كاش |

خارج الناقل (طلبات إرسال بعميلها الخاص، تحتاج اتصالًا بطبيعتها): /submit، /privacy-center (تصدير البيانات)، /contact.
