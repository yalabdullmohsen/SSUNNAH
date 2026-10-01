# خطة الإغلاق النهائية لمشروع «سُنّة»

| Field | Value |
|---|---|
| Captured | 2026-10-01T04:10Z |
| Live baseline | [`FINAL_CLOSURE_LIVE_BASELINE.md`](./FINAL_CLOSURE_LIVE_BASELINE.md) · **LIVE_BASELINE_LOCKED** |
| SoT tip (live) | `8255ed5db` (#2422 ADMIN-FINAL-2) |
| Active phase | **PHASE 4 ADMIN-FINAL-3 Core CRUD** (after FINAL-2 MATCH) |
| Rule | مرحلة واحدة · PR واحد · MATCH قبل التالي |

## الحالة الحالية (عند القفل الحي)

```text
main = production = 8255ed5db / 8255ed5d · MATCH
ADMIN-FINAL-2 = ADMIN_FINAL_2_MERGED_AND_DEPLOYED (#2422)

WAVE1–WAVE13 = CLOSED
Startup Typography P0/P1/P2 = CLOSED
Dark Loader = CLOSED
Identity / Cards / Buttons residual phases = CLOSED (نطاقها)
Back Authority P7 = BACK_P7_MERGED_AND_DEPLOYED
ADMIN-FINAL-1 = CLOSED
Route Feedback Priority = ROUTE_FEEDBACK_PRIORITY_MERGED_AND_DEPLOYED
Route Feedback Public = ROUTE_FEEDBACK_PUBLIC_COMPLETE
Admin FINAL-3…7 = OPEN
Mushaf CSS Bridge = OPEN (NewMushafReader + VerifiedMushafReader import)
Device QA = DEVICE_REQUIRED
Store = HOLD · WEB_RELEASED_NATIVE_HOLD
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
| 0 | Live State Lock | `LIVE_BASELINE_LOCKED` · `FINAL_CLOSURE_LIVE_BASELINE.md` |
| 1 | Back Authority P7 | `BACK_P7_MERGED_AND_DEPLOYED` ✅ |
| 2 | Route Feedback priority routes | `ROUTE_FEEDBACK_PRIORITY_MERGED_AND_DEPLOYED` |
| 3 | ADMIN-FINAL-2 Inbox unify | `ADMIN_FINAL_2_MERGED_AND_DEPLOYED` ✅ (#2422 → `8255ed5db`) |
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
