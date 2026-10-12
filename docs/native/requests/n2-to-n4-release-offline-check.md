# طلب من ن2 إلى ن4: تحقق Release دون اتصال (خطوة في دورة ن4)

بأمر المالك 2026-10-12. ن2 لا تبني Release ولا تشغّل المحاكي.

بعد بناء Release في دورتك:
1. افتح `.app` وتأكد أن ملفات البذور العشرة موجودة داخل الحزمة: `Data/seed/auto-content.json` و`Data/seed/platform-updates.json` وبذور المسارات الثمانية الأخرى (`docs/native/requests/remote-dependency.md`).
2. تأكد أن `RemoteSeeds`/`ContentLoader` يقرأها عند فشل الشبكة: عدّل Info.plist داخل **نسخة** الـ.app فقط (SUPABASE_URL وVERCEL_API_BASE_URL إلى `https://offline.invalid`) ثم افتح `/institutions` و`/sources` والتقط لقطة.
3. تأكد أن `Data/fiqh/{sujood-sahw,arkan,arkan-iman,fadail-aamal,tawba,fiqh-qawaid}.json` غير فارغة. المتوقع بعد #3024: 8 / 5 / 6 / 108 / 51 / 58.

لا تعديل Info.plist المصدري في أي commit. لا تصدير يدوي: السكربت فقط.
