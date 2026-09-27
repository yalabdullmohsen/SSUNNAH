# Admin Audit — Wave 1 Kickoff

**تاريخ:** 2026-09-27  
**مرجع جرد سابق:** `docs/admin/LEGACY_ADMIN_INVENTORY.md`

## ملخص تنفيذي

لوحة الإدارة الحالية (Legacy + Admin v3 الجزئي) مكتظة: ~40 قسمًا في الشريط، تكرار مراكز مراجعة/محتوى/أتمتة، ونصوص Unicode حرفية في شاشات توثيق/أتمتة.

Wave 1 تُثبّت: إصلاح Unicode · IA بسبعة وجهات · مسار تطبيع عرض · وثائق.

## P0 — Unicode

| بند | نتيجة |
|---|---|
| السبب | `\uXXXX` داخل JSX text |
| ملفات مصدر أُصلحت | 9 تحت `views/admin` |
| مسار مركزي | `lib/admin-display-text.ts` |
| بوابة منع الرجوع | `admin-unicode-jsx-gate.test.ts` |

## التنقّل قبل / بعد

| قبل (v3) | بعد (Wave 1) |
|---|---|
| الرئيسية · محتوى · مراجعة · تحليلات · مستخدمون · إشعارات · أتمتة · نظام · إعدادات · تدقيق | نظرة عامة · مراجعات · محتوى · تصنيف · تحليلات · مجتمع · إعدادات |

## ما لم يُمسّ

- CRUD Legacy تحت `/admin?section=`  
- حراس المسار `AdminLazyRoute` / `AdminRouteGuard`  
- سياسات Supabase  
- عتبات تباين/لقطات

## موجات لاحقة

انظر `ADMIN_REDESIGN_PLAN.md`.

## لقطات قبل/بعد

**PRODUCTION_VALIDATION_REQUIRED** — لقطات تحريرية تُلتقط بعد دمج Wave 1 على بيئة مشرف.
