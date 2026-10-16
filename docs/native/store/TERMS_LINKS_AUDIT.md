# TERMS_LINKS_AUDIT — مواضع روابط «شروط الاستخدام» (تقرير إلى ن4)

> فحص ملفات فقط (2026-10-16)، بلا تعديل Swift. قرار المالك: **لا تُنشأ صفحة شروط؛ يُعتمد EULA القياسي من Apple** (في App Store Connect يبقى License Agreement على الافتراضي ولا يُرفع اتفاق مخصص).

## ما وُجد
| الموضع | ما يفعله | الحالة |
|---|---|---|
| `artifacts/majalis/ios/App/SunnahNative/Sources/SunnahNative/Sections/account/AccountPrivacyCenterScreen.swift:55` | `AccountLinkRow(title: "شروط الاستخدام", path: "/terms")` ضمن «سياسات ومستندات» | **مشكلة:** المسار `/terms` في التطبيق هو شاشة «المصطلحات» (`RouteTitles.swift:69` «المصطلحات»، `LibraryScreens.swift:161` `ListTemplate(detailBase: "/terms")`، `SectionsCatalog.swift:166` «الشروط والأحكام» ضمن «اللغة والمكتبة»). فالصف المسمّى «شروط الاستخدام» يفتح قائمة مصطلحات لا شروطًا |
| `AccountPrivacyCenterScreen.swift:10` | نص حق: «الاطلاع على سياسة الخصوصية وشروط الاستخدام.» | يعد بمستند غير موجود |
| `docs/native/store/LINKS_AUDIT.md:11` | `…/sunnah-legal/terms.html` لا يظهر في أي ملف؛ HTTP 404 | لا عائق (قرار EULA القياسي) |
| `docs/store-release/ATTRIBUTIONS.md:49` | `/privacy` · `/terms` (جدول الويب: Legal) | وثيقة الويب لا التطبيق الأصلي |

لا رابط شروط في `Info.plist` ولا في `PrivacyInfo.xcprivacy` ولا في `ios-native/` ولا في ملفات ميتاداتا المتجر (`APPSTORE_METADATA.md` لا يذكر رابط شروط، وحقول ASC المطلوبة هي الدعم والخصوصية فقط).

## المطلوب من ن4 (قراره، لا أعدّل Swift)
1. صف `AccountPrivacyCenterScreen.swift:55`: إمّا حذفه، أو توجيهه إلى EULA القياسي من Apple (`https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`) بدل المسار الداخلي `/terms`.
2. نص الحق في السطر 10: حذف «وشروط الاستخدام» أو تعديله بما يطابق القرار.
3. إن بقي الصف، فالتحقق بالبناء أنه لا يفتح قائمة المصطلحات.
لم أتحقق من سلوك الشاشة بالتشغيل؛ الاستنتاج من الكود فقط.
