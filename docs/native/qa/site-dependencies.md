# اعتماد التطبيق وقت التشغيل على الموقع (siteURL)

الموقعان `www.ssunnah.com` و`majlisilm.com` متوقفان (HTTP 402). الشرط: يعمل التطبيق كاملًا بلا تعليق ولا انهيار ولا مؤشر تحميل أبدي، بمهلة ≤ 8ث لأي طلب موقع.
التصنيف: **بديل محزوم** (بذرة/كاش) · **يتدهور** (رسالة ودية) · **يكسر ميزة** (تحتاج الموقع فعلًا).

| الاعتماد | الملف | التصنيف | سلوك الموقع الميت | المهلة |
|---|---|---|---|---|
| `/api/auto-content` (+`slug`) و`/api/updates` | `Data/RemoteTransport.swift` + `RemoteSeeds.swift` | بديل محزوم | آخر نسخة على القرص، وإلا البذرة المحزومة | 8ث |
| `/data/lessons/*.json`، `/data/sources/accounts.json` | `AccountNetwork.swift`، `SirahScreens+Native`، `LibraryScreens+Native` | بديل محزوم | كاش ثم بذرة | 8ث |
| `/rest/v1/*` (الإشارات، تسجيل الدروس) | `RemoteTransport` | لا اعتماد (Supabase) | — | 8ث |
| `POST /api/submissions` (أضف محتوى) | `AccountAPI.submitContent` | **يكسر ميزة** → يتدهور برسالة | «تعذر الاتصال، حاول مرة أخرى.» | 8ث (كانت 60ث) |
| `POST /api/account/export` (تصدير البيانات) | `AccountAPI.exportAccount` | **يكسر ميزة** → يتدهور برسالة | «تعذّر تحميل المحتوى. أعد المحاولة.» | 8ث (كانت 60ث) |
| `/api/citations/<slug>` | `Special/CitationScreen.swift` | يتدهور | حالة «غير متاح/بلا اتصال» | 8ث |
| حذف الحساب | `Platform/AccountDeletion.swift` | **أُزيل الاعتماد** | RPC `delete_my_account` على Supabase (كان `/api/account/delete` على الموقع) | 15ث |
| تسجيل الدخول/الخروج/الاستعادة | `ios-native/.../SupabaseAuthAdapter.swift` | لا اعتماد (Supabase Auth) | أخطاء الشبكة كلها ← «لا اتصال» | 15ث (كانت 30ث) |
| روابط المشاركة `siteURL + path` | `AccountComponents.swift` (`AccountShareRow`) | يتدهور | لا شبكة؛ الرابط ميت عند المستلم فقط | — |
| ICS (PRODID/UID) | `AccountLessons.swift` | لا اعتماد | معرّفات نصية فقط | — |
| تنزيل التلاوات | `Audio/OfflineRecitation.swift` | لا اعتماد (خوادم `*.mp3quran.net`) | رسالة فشل التنزيل | — |
| الويدجت، الإشعارات، BGTask، الصلاة، المصحف | `SunnahPrayer`، `Notifications`، `Mushaf` | لا اعتماد | لا طلبات شبكة للموقع | — |
| Universal Links (`applinks` لأربعة نطاقات) | entitlements | يتدهور | تفتح الروابط في Safari فقط؛ التطبيق لا يتأثر | — |

## الإثبات
`Tests/SunnahNativeTests/SiteDeadTests.swift`: بروتوكول URL يعيد 402 لكل من `www.ssunnah.com` و`ssunnah.com` و`majlisilm.com` و`www.majlisilm.com` ويسجّل المضيفات:
- `RemoteTransport` يفشل فورًا بخطأ `status(402)` لا بتعليق؛ `ContentLoader` يقدّم البذرة/الكاش.
- `AccountAPI` (الإرسال/التصدير) يفشل بخطأ ويحمل مهلة 8ث؛ الجلسة الافتراضية مهلتها 8ث بلا `waitsForConnectivity`.
- حذف الحساب لا يلمس أي مضيف ميت، ويطلب `POST {SUPABASE_URL}/rest/v1/rpc/delete_my_account` فقط.

## حذف الحساب (شرط App Store 5.1.1(v))
- العميل: `SupabaseAccountDeleter` خلف `AccountDeleting`؛ الشاشة `AccountDeletionView` (الحساب ← مركز الخصوصية ← حذف الحساب نهائيًا) بتأكيد كتابي «حذف»، ثم `signOut` ومسح الجلسة والتفضيلات والكاش المحليين.
- الفشل: لا اتصال/مهلة ← «لا يوجد اتصال بالإنترنت»؛ 401/403 ← «انتهت الجلسة…»؛ 404 (الدالة غير مطبّقة) ← «خدمة حذف الحساب غير متاحة حاليًا»؛ والزر يعود قابلًا للضغط دائمًا.
- **الدالة في قاعدة البيانات يجهّزها المالك** (`public.delete_my_account()` بلا معاملات، SECURITY DEFINER تحذف `auth.uid()` وبياناته)؛ لم يُطبَّق أي SQL.
