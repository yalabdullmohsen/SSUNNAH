# خطة الإغلاق النهائية لمشروع «سُنّة»

| Field | Value |
|---|---|
| Captured | 2026-10-01T02:02Z |
| SoT tip after Phase 1 | `2a4e3985` (Back P7 MERGED_AND_DEPLOYED) |
| Active phase | **2 — Route Feedback** (after Back P7 MATCH `2a4e3985`) |
| Rule | مرحلة واحدة · PR واحد · MATCH قبل التالي |

## الحالة الحالية (عند القفل)

```text
main = production = 2a4e3985
Critical CSS gzip = 55766 / 61440 · هامش 5674

WAVE1–WAVE13 = CLOSED
Startup Typography P0/P1/P2 = CLOSED
Dark Loader = CLOSED
Identity / Cards / Buttons residual phases = CLOSED (نطاقها)
Back Authority P7 = **BACK_P7_MERGED_AND_DEPLOYED** (#2415 → `2a4e3985`)
Route Feedback = OPEN (15/415)
Admin FINAL-2+ = OPEN
Mushaf CSS Bridge = OPEN
Device QA = DEVICE_REQUIRED
Store = HOLD
```

## قواعد البرنامج

1. كل مرحلة من أحدث `origin/main`.
2. لا مرحلتان بالتوازي.
3. PR مستقل لكل مرحلة.
4. التالي فقط بعد: tests · merge · main CI · deploy · `version.json` MATCH · smoke.
5. لا رفع ceilings · لا تخفيف بوابات · لا skipped=نجاح لبوابة مطلوبة · لا snapshots تلقائية.
6. ممنوع: `reset --hard` · `git clean -fd` · force push · تجاوز Branch Protection.
7. لا تُمس: نص قرآن · تشكيل · ترقيم · 604 · 15 سطر · page mapping · QPC · حساب صلاة · جدولة أذان.

## ترتيب التنفيذ

| # | مرحلة | معيار إغلاق |
|---|---|---|
| 1 | Back Authority P7 | `BACK_P7_MERGED_AND_DEPLOYED` |
| 2 | Route Feedback priority routes | تغطية عامة ذات أولوية + أدلة |
| 3 | ADMIN-FINAL-2 Inbox unify | `ADMIN_FINAL_2_MERGED_AND_DEPLOYED` |
| 4 | ADMIN-FINAL-3…7 | CRUD · migrate · dialogs · automation · authz |
| 5 | Legacy Admin SAFE_REMOVE | consumer=0 + تكافؤ |
| 6 | Mushaf CSS Bridge | `MADINAH_CSS_BRIDGE_RETIRED` أو KEEP موثق |
| 7 | Quran/Mushaf buttons | ↓ raw + تصنيف |
| 8 | Dark content absorb | طبقات → Foundation/aliases |
| 9 | Deferred identity absorb | ↓ 43 deferred |
| 10 | Cards / visual values | ↓ shadows/radius/z/inline |
| 11 | div/span onClick | 59 → مصنّف/مرحّل |
| 12 | Startup/FOUC hardening | بلا إعادة فتح المغلق |
| 13 | Security final audit | لا P0/P1 مفتوحة في النطاق |
| 14 | Final internal inventory | لا FIXABLE غير مصنّف |
| 15 | Device QA | DEVICE_REQUIRED → أدلة |
| 16 | Owner / licensing | OWNER_ACTION |
| 17 | Store validation | بعد 15–16 |
| 18 | Final boundary report | INTERNAL vs EXTERNAL |

## تعريف الإنجاز

- **داخلي:** `FINAL_INTERNAL_CLOSURE_COMPLETE` — لا P0/P1 · لا FIXABLE غير مصنّف · سلطات · بوابات · main=prod · smoke.
- **كامل:** داخلي + جهاز + مالك + تراخيص + متاجر — قبل أي Store Go.

## ملاحظة حدود Cursor

ما يبقى OWNER/DEVICE/LICENSE يبقى ظاهرًا ومصنّفًا — ليس دينًا مخفيًا.
