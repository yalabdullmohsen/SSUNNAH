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
- جولة 2: توسيع فحص التكرار لكل المحتوى (check-content-duplication-all.py + N2_DUPLICATION_HANDOFF.md → ن2). AUDIO_HEADERS_CHECK على build 106 (لا 104): دليل كود ✔ (بلا Authorization/apikey/كوكيز في مسار الصوت)، وفحص Proxy على الجهاز **لم يُجرَ** — يحتاج لقطات من ن4/يوسف. بنود ن4 (workflow:160، Watch، Privacy Report) وبند يوسف (وصف TestFlight القديم) لا أتابعها؛ تبقى هنا فقط. verify-merged لـ#3445 و#3447 عند انتهاء الفحوص.
- جولة 3: AUDIO_HEADERS_CHECK على 106 (دليل كود) + تصنيف أ/ب/ج في N2_DUPLICATION_HANDOFF.md (ج=446 من 506؛ quiz 256، qa 186، stories 4). تحفّظان: مسار عرض qa، وهل `demo-` في التصدير الحي.
- جولة 4: تحقّق التحفّظين. `demo-` **خارج** التصدير الحي (مرشّح export-ios-data.mjs + تحقق native-export-data.sh:46)؛ qa لا تُشحن إجاباته (عناوين بحث فقط). ج الظاهر فعلًا = **195** (quiz 191، qa 0، stories 4) بدل 446؛ القائمة النهائية في N2_DUPLICATION_HANDOFF.md. قائمة ترويسات Proxy لـ106 (Authorization، apikey، Cookie، Referer، Origin، User-Agent، معرّف مستخدم) مع المقبول لكل منها في AUDIO_HEADERS_CHECK.md ← تنفيذها ن4 على المحاكي.
- جولة 5: حُدّثت STORE_LISTING/WHATS_NEW/REVIEW_NOTES بالمدموج فقط (الإبلاغ وتنبيه الذكاء الاصطناعي #3398/#3407/#3414، إخفاء الشريط #3377/#3429) وأُغلقت ملاحظة G2؛ SCREENSHOT_PLAN للتصميم الجديد (مشروطة حتى الدمج)؛ أُنشئت RELEASE_READINESS.md. لا «!» في الكود (الأيقونة `info.circle`).
  المتبقي المرقّم: 1) #3462 بطاقة الآية/مؤقت الخروج — مفتوح، بانتظار ن1 · 2) #3450 الشرح الأول — مفتوح · 3) #3461 و#3454–#3458 قصص الأنبياء — مفتوحة · 4) التصميم الموحّد شاشات لا مواصفات (#3447) · 5) أمور ن4 (workflow:160، Watch، Privacy Report) ويوسف (وصف TestFlight) — في هذا الملف فقط. عند دمج أيٍّ من 1–3: أضف جملته وحدّث RELEASE_READINESS.
