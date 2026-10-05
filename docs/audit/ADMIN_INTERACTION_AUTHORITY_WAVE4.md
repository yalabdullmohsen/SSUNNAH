# سلطة التفاعل في لوحة الإدارة — الموجة 4

TASK_CLASSIFICATION: SHARED_PLATFORM (ADMIN_ONLY surfaces)

## النطاق

ترحيل كل عناصر `<button>` الخام في 24 ملفًا تحت `src/views/admin/` إلى `Button` الرسمي (`@/components/ui/button`): **66 عنصرًا**.

| المجموعة | الملفات | العناصر |
|---|---|---:|
| 4 عناصر | AdminShell، InstagramManualAssistPanel، IslamicIntelligenceSection، KnowledgeReasoningSection، LessonsSection، Phase2TrialImport، QaSection، TelegramSection | 32 |
| 3 عناصر | ArbaeenLoveSection، AutonomousAiSection، ClientErrorLogsSection، GlobalReferenceSection، ResearchesSection، ScholarlyVerificationSection، SubmissionsSection، VerifiedKnowledgeSection | 24 |
| عنصران | InstagramIntegrationPage، KnowledgeEngineSection | 4 |
| عنصر واحد | AggregatorSection، AutomationCenterPage، ContentProductionDashboardPage، LessonImportUrlPage، MajlisKnowledgeEnginePage، SearchAnalyticsSection | 6 |

## القرارات

- المتغيّرات دلاليًا: `primary` للإجراء الرئيس (تشغيل/حفظ/موافقة/إضافة)، `destructive` للحذف والرفض، `ghost` للتبويبات والمرشّحات والإغلاق والتعديل الصغير، `outline` للإجراءات الثانوية المحايدة.
- `TelegramSection` ‏`Btn`: يربط متغيّراته المحلية (`primary|secondary|danger`) بـ`primary|outline|destructive` دون تغيير الواجهة.
- `AdminShell` عناصر التنقّل: الأيقونة عبر `iconStart` للحفاظ على فجوة flex، مع `justify-start whitespace-normal [&_svg]:size-3.5` لحفظ تخطيط الصف وحجم الأيقونة.
- `tgm-expand-btn`: ‏`justify-end` لحفظ المحاذاة الطرفية.
- لم يتغيّر أي منطق، وبقيت كل الخصائص (`type`/`key`/`aria-*`/`className`/`style`/`disabled`/`title`).

NO_SQL_CHANGE · NO_RLS_CHANGE · NO_CEILING_RAISE · NO_GATE_WEAKENING

البوابة: `node --import tsx src/lib/__tests__/admin-interaction-authority-wave4-gate.test.ts`
