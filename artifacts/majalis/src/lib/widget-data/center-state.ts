export const WIDGET_CENTER_UX_STATES = [
  "LOADING",
  "EMPTY",
  "NO_RESULTS",
  "ERROR",
  "OFFLINE",
  "STALE",
  "PERMISSION_REQUIRED",
  "CONFIGURATION_REQUIRED",
  "AUTH_REQUIRED",
  "LICENSE_BLOCKED",
  "REVIEW_REQUIRED",
  "SUCCESS",
] as const;

export type WidgetCenterUxState = (typeof WIDGET_CENTER_UX_STATES)[number];

export const WIDGET_CENTER_STATE_COPY: Record<WidgetCenterUxState, { title: string; description: string }> = {
  LOADING: { title: "يُحمَّل مركز الويدجت", description: "نقرأ اللقطة المنشورة دون بيانات خاصة." },
  EMPTY: { title: "لا ويدجت في هذا القسم", description: "اختر قسماً آخر أو أعد ضبط التصفية." },
  NO_RESULTS: { title: "لا نتائج مطابقة", description: "جرّب كلمة أقصر أو امسح البحث." },
  ERROR: { title: "تعذّر قراءة حالة الويدجت", description: "أعد المحاولة. إن استمر العطل افتح سُنّة ثم حدّث البيانات." },
  OFFLINE: { title: "الجهاز غير متصل", description: "اللقطات المحلية تبقى ظاهرة إن وُجدت، دون ادّعاء حداثة الشبكة." },
  STALE: { title: "البيانات قديمة", description: "افتح سُنّة وحدّث بيانات الويدجت لإعادة النشر." },
  PERMISSION_REQUIRED: { title: "يلزم إذن", description: "إذن الموقع أو الإشعارات مطلوب لبعض الويدجت، دون عرض الإحداثيات." },
  CONFIGURATION_REQUIRED: { title: "يلزم إعداد", description: "اختر المحتوى أو فعّل التتبع من هذا المركز ثم أضف الويدجت." },
  AUTH_REQUIRED: { title: "يلزم تسجيل الدخول", description: "هذا العنصر مرتبط بالحساب. التقدّم المحلي يبقى على الجهاز." },
  LICENSE_BLOCKED: { title: "محتوى غير مرخّص للويدجت", description: "لن يُعرض نص أو صوت خارج الترخيص المعتمد." },
  REVIEW_REQUIRED: { title: "بانتظار المراجعة الشرعية", description: "المناسبة لا تُعرض كحقيقة مؤكدة حتى اعتمادها." },
  SUCCESS: { title: "البيانات جاهزة", description: "اللقطة المنشورة صالحة للعرض بعد التثبيت في تحديث iOS القادم." },
};
