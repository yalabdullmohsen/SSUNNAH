# طلب تعديل كود — إلى مالك `AccountTexts`/الواجهة (ن5 لا تعدّل الكود)

المشكلة: `Sections/account/AccountTexts.swift:177` → `contactEmail = "info@ssunnah.com"` (النطاق معلّق؛ لا يصل بريد).
المستخدمون: `Components/SunnahReportIssueButton.swift` (mailto + نسخ النص إلى الحافظة) و`AccountContactScreen.swift` (عرض ونسخ).

المطلوب:
1. قراءة عنوان الدعم من مصدر واحد (ثابت واحد أو إعداد بناء) لا من نص حرفي مكرر.
2. عند وصول العنوان من يوسف يُحدَّث السطر الواحد، ويتحقق مالك الكود أن «إبلاغ عن خطأ» تصل فعلًا.
3. إلى حينها: لا ندّعي في أي نص منشور أن البلاغات تُستقبل.

حقائق الكود الحالية (origin/native-app): الزر والإفصاح يظهران أسفل صفحات المحتوى فقط (قوالب Article/Detail للمكتبة والسيرة والعقيدة، WeakHadithScreens، HadithScreens، PublishedScreens+Native عند وجود reportID). تعليق `SunnahDisclosure.swift` يذكر عن/إعدادات/ترحيب لكن لا استخدام فيها — يُصحَّح التعليق أو تُضاف الاستخدامات. أي إضافة من #3414 تُضاف إلى النصوص بعد دمجه.
