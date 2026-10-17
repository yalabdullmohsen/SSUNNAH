# المضيفات الشبكية — استخراج ساكن (2026-10-17، ن4)

المنهج: `rg` على كود SunnahApp/SunnahWatch/الودجت و`SunnahNative/Sources` وInfo.plist/entitlements/PrivacyInfo، ثم تحليل `ios-native/Data/**/*.json` (مولَّد، غير متتبَّع). **لا توجد قائمة مضيفات مسموحة في المستودع** (بُحث عنها)؛ الجدول أدناه هو المرجع المقترح لـن5 ويوسف للمقارنة مع App Privacy Report.

## الاتصالات الفعلية المتوقعة (طلبات من التطبيق)
| المضيف | الاستعمال | الدليل |
|---|---|---|
| `ngmvmlulzacrlicuagyp.supabase.co` | Supabase: REST/Auth/حذف الحساب (الافتراضي، يُستبدل بـSUPABASE_URL في Info.plist) | `Data/RemoteTransport.swift:25` |
| `server{6,7,8,9,10,11,12,13}.mp3quran.net` | بث/تنزيل سور كاملة `{base}/{SSS}.mp3` عند ضغط المستخدم | `Audio/OfflineRecitation.swift:18` + `Data/audio/surah-reciters.json` |

## روابط تُفتح في Safari/خارجيًا (ليست طلبات التطبيق)
| المضيف | الاستعمال |
|---|---|
| `yalabdullmohsen.github.io` | صفحتا الخصوصية والدعم (`AccountPrivacyCenterScreen.swift:6-7`) |
| `ssunnah.com`، `www.ssunnah.com`، `majlisilm.com`، `www.majlisilm.com` | روابط الموقع (Universal Links `applinks:` في SunnahApp.entitlements، و`Route.swift:49`) |
| مضيفات المراجع داخل بيانات المحتوى (مثل `shamela.ws`، `sunnah.com`، `quran.com`، `t.me`، `instagram.com`، `*.awqaf.gov.kw`، `iifa-aifi.org`، `en.wikipedia.org`…) | حقول مصدر/رابط تُعرض نصًا أو تُفتح بنقرة؛ لا يجلبها التطبيق تلقائيًا (لا `URLSession` إلا في RemoteTransport وAccountNetwork وAccountDeletion وOfflineRecitation) |

## مذكورة في نص «المصادر» أو الاختبارات فقط — لا كود جلب في هذه الشجرة
`everyayah.com`، `api.quran.com`، `api.alquran.cloud`، `tanzil.net`، `qul.tarteel.ai`، `fonts.google.com`، `pewresearch.org`. **صُحّح (2026-10-17):** نص `AccountTexts.swift` (التفسير/التلاوات) طابق الواقع: لا يجلب التطبيق تفاسير ولا يبثّ من EveryAyah/api.quran.com، والمضمَّن الميسّر والسعدي فقط.

## الساعة والودجت
لا URLs ولا `URLSession` في SunnahWatch وPrayerWidgetResources؛ PrivacyInfo للثلاثة موجود.

## ATS
لا `NSAppTransportSecurity` ولا `NSExceptionDomains` في Info.plist (التطبيق/الساعة): HTTPS فقط افتراضيًا. كل المضيفات أعلاه HTTPS.

## للمطابقة مع App Privacy Report
المتوقع ظهوره في التقرير: Supabase، `*.mp3quran.net` (عند التشغيل)، وأي مضيف إضافي = فجوة تُبلَّغ.
