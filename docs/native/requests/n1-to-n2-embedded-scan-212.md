# ن1 → ن2: مسح النصوص المضمَّنة لبقية مسارات الـ212

المنهج: لكل مكوّن في `ROUTE_TEMPLATE_MAP.json` حُلّل ملفه عبر `lazy/*.ts`، وعُدّت ثوابته العليا الكبيرة (`const [A-Z_]{4,} = [`/`{`)، ثم قورنت بالمُصدِّرات والملفات في `ios-native/Data`. 63 صفحة فيها ثوابت؛ لم يظهر مسار فيه نص عرض مضمَّن غير مُصدَّر.

| الحالة | الصفحات |
|---|---|
| مُصدَّرة سابقًا (ملف Data قائم) | adab-talab-ilm، akhlaq، alamat-saah، asma-husna، hikam-salaf، janna-naar، malaika، raqaiq، tawhid، tawba، sawm، tahara، sins-and-rights، prophetic-medicine، sahabah، seerah، shamael، discover-islam، methodology، wasaya-nabawiyya |
| مُصدَّرة في #3069/#3085 (embedded) | tahara، sawm، hajj، janaza، salah-guide، mawarith، tawhid، duas-quran، sunan-yawmiyya، adhan-help، hadith-science، dalail-nubuwwah، sunnah-studies |
| لا تحتاج تصديرًا | islam-stats (محسوبة/مضمَّنة في التطبيق)، prophets (مُوثَّقة في data-exemptions: prophets-knowledge)، stories (تسميات واجهة فقط)، وباقي الصفحات: ثوابت واجهة (تبويبات/أيقونات/ألوان) |
| غير مُصدَّرة عمدًا | hadith/arbaeen-love-of-allah: جدول Supabase، قراءة الإنتاج تحتاج إذن المالك |

لم يُضف ملف تصدير جديد (لا تكرار).
