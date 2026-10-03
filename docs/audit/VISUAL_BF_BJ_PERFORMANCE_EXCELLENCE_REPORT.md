# Visual BF–BJ — أداء بلا تخمين (Performance Excellence)

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave` · PR #2491

**Policy:** Numbers first · No speculative fixes · DEVICE_REQUIRED لما لم يُقَس.

## 1) REACT_RENDER_COST_AUDIT (بروكسي ساكن)

| Surface | Risk score |
|---|---:|
| **Mushaf** | **152** |
| Prayer | 56 |
| Lesson player | 52 |
| Home | 36 |
| Admin | 30 |
| Search | 14 |

أعلى ملفات مصحف: `NewMushafReader.tsx` · `VerifiedMushafReader.tsx` · `useMushafPager.ts`

## 2) MUSHAF_PERFORMANCE_DEEP_DIVE

| Static signal | Count |
|---|---:|
| useEffect | 78 |
| useState | 71 |
| addEventListener | 25 |
| requestAnimationFrame | 15 |
| ResizeObserver | 4 |
| setInterval | 0 |

| Measured | Value |
|---|---|
| MushafReaderPage JS gzip (live dist) | **29.78 KiB** (soft ≤40) |
| Page-turn latency | NOT_MEASURED_THIS_RUN → turn telemetry |
| DOM node count | NOT_MEASURED_THIS_RUN |

## 3) STARTUP_PERFORMANCE

- Sync CSS in `main.tsx`: **14**
- Live entry JS gzip: **102.33 KiB** (gate ≤120)
- Live CSS gzip: **29.16 KiB**
- Documented prod: CLS 0.0004 · STARTUP_CHROME_STABLE · LHCI_HOME_MOBILE_CLOSED

## 4) NETWORK_EFFICIENCY

| Signal | Count |
|---|---:|
| supabase `.from` approx | 535 |
| `select('*')` | **48 → P0** |
| refetchInterval | 0 |

## 5) PERFORMANCE_BUDGET_ENFORCEMENT

Budgets: `performance-budget.json` + `test:bundle-budget` + critical-css + LHCI  
`PERFORMANCE_DRIFT_ALERTS` this run: **none** (dist present · within gzip gates)

## بوابة

`test:performance-excellence` ضمن `test:design-governance`

## Next (DEVICE_REQUIRED قبل أي إصلاح)

1. React Profiler على NewMushafReader / VerifiedMushafReader  
2. mushaf-turn-telemetry لزمن قلب الصفحة  
3. امتصاص تدريجي لـ `select('*')` ×48  
4. لا خفض أسقف ميزانية
