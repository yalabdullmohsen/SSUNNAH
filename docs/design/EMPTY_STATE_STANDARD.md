# EMPTY_STATE_STANDARD — سُنّة

| Field | Value |
|---|---|
| Status | **ACTIVE** |
| Date | 2026-10-03 |
| Exit | `EMPTY_STATE_EXCELLENCE` |
| Canonical | `EmptyStateV2` (`design-system`) · aliases `AppEmptyState` |
| Related | `STATE_AUTHORITY_MAP` · `FEEDBACK_AUTHORITY_MAP` |

## Contract (every empty state)

| Slot | Required | Guidance |
|---|---|---|
| **title** | yes | جملة عربية واضحة — ماذا ينقص |
| **description** | recommended | سياق قصير بلا لوم للمستخدم |
| **nextStep** | recommended | خطوة استرداد واحدة |
| **ctaLabel + href/onCtaClick** | when actionable | زر/رابط سلطة (`Button` / `Link`) |
| **icon** | optional | أيقونة هادئة أو علامة «س» الافتراضية |
| **navPath** | optional | فتات تنقّل عند الضياع في العمق |

## Surfaces to audit (excellence)

Search · Lessons · Mushaf (SPECIAL) · Hadith · Fiqh · Library · Settings · Admin

## Forbidden

- «لا توجد نتائج» بلا CTA عندما يوجد مسار استرداد واضح
- رسوم/إيموجي عشوائية لكل صفحة
- حالات فارغة مخصّصة تتجاوز `EmptyStateV2` بدون مبرر SPECIAL_CASE

## Migration

عند لمس الشاشة: استبدل الحالات الفارغة المحلية بـ `EmptyStateV2` واملأ `nextStep` + CTA.
