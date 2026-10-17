# handoff ن5 (محدَّث 2026-10-16)

مدموج (verify-merged ✓): #3422، #3424. هذه الدفعة: عنوان الدعم الرسمي `info@ssunnah.com` (يطابق `AccountTexts.contactEmail`)؛ لا طلب كود لـن1.

ما بقي:
- عنوان الدعم محسوم: `SUPPORT_EMAIL` في `docs/site/config.js`؛ support.html تُنشر من ن4 (الرابط في ASC_REVIEW_INFORMATION)؛ البريد اختبره يوسف ويصل.
- حارس الروابط (`scripts/native-static-links-check.sh`، #3410) يغطي روابط sunnah-legal في مصادر التطبيق فقط ولا يغطي `docs/site`: طلب لـن4 بتغطيتها.
- سطر Watch: `WATCH_LINE_STAGED.md` — بعد تأكيد ن4.
- أرقام البناء 106/النهائي في TESTFLIGHT_COPY بعد ن4.
- بعد دمج #3414: أضف ما يجلبه إلى صفحة الدعم والنصوص.
- أُنجز في الدفعة: SOURCES_CLAIM_AUDIT.md، PRIVACY_REQUIRED_REASON_AUDIT.md، docs/native/check-asc-lengths.py (كلها OK). «ما الجديد» مطابق للكود (ويدجت مواقيت/آية/ذكر في PrayerWidgetBundle؛ لا Watch).
- ديون: Privacy Report من أرشيف حقيقي؛ قرار PrivacyInfo (يوسف)؛ تصحيح وصف TestFlight في ASC (يوسف)؛ الذيل الموحّد (إفصاح+مصدر+إبلاغ) وتصحيح SunnahDisclosure.short: طلب لـن1 في SOURCES_CLAIM_AUDIT.md (الصياغة صُحّحت في المتجر/الموقع)؛ AUDIO_HEADERS_CHECK على 104 (ن4)؛ تأكيد ن4 أن docs/site تُنشر وأن حارس الروابط يغطيها (لم أجد الحارس بالاسم).
- تدقيق مراجعة Apple: `APPLE_REVIEW_RISK_AUDIT.md` (18 بندًا). أخطاره: الساعة خارج مشروع الأرشيف (ن4)، دالة delete_my_account على الإنتاج غير مُثبَتة (ن3/ن4)، حساب مراجع (يوسف/ن3)، «قيد التوثيق» وأقسام المتجر (ن1/ن2)، PrivacyInfo هاتف/اسم/remote-notification (ن4)، الإفصاح عن الذكاء الاصطناعي ومصادر السيرة (ن1+يوسف)، نص المراجعة المسبقة للمساهمات (ن1).

- تحديث التدقيق: أُغلق #1/#9/#10 بدليل يوسف؛ المتبقي #16 #8/12 #7 #15/17 #4/2. مدخلات المصادر والجملتان في `SOURCES_SCREEN_ENTRIES.md` (لا روابط في الكتالوج وكل الكتب pending_review). ينتظر: تأكيد ن4 للمشروع المرفوع، الساعة بعد تأكيده، Privacy Report.

- جولة المواصفات: PROPHETS_STORIES_SPEC، DESIGN_SYSTEM_SPEC، ASSETS_LICENSES، CONTENT_TEMPLATE_DUPLICATION_REPORT (+أداة check-content-duplication.py)؛ أُضيفت مخاطر 19–23 للتدقيق. المتبقي: فحص تكرار بقيّة public/data وcontent (ن2)، تصحيح workflow سطر 160 (ن4).
