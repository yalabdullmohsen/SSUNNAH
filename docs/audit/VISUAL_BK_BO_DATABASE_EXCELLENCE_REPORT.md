# Visual BK–BO — تميّز قاعدة البيانات (Database Excellence)

Date: 2026-10-03 · Branch: `cursor/visual-unification-wave` · PR #2491

**Connection:** `NOT_CONNECTED` (لا `DATABASE_URL`) — لا اختراع لـ pg_stat.

## الصحة الكلية

**SUNNAH_DATABASE_HEALTH: 66 · NEEDS_WORK**

| Dimension | Score | Rating |
|---|---:|---|
| indexes | 90 | EXCELLENT |
| RLS | 88 | EXCELLENT |
| search | 85 | EXCELLENT |
| realtime | 80 | GOOD |
| scalability | 50 | NEEDS_WORK |
| performance* | 46 | CRITICAL |
| costs* | 44 | CRITICAL |
| schema_quality* | 45 | CRITICAL |

\* بروكسيات ساكنة (select* / churn فهارس) حتى يُربَط pg_stat

## مخطط (SQL)

| Metric | Value |
|---|---:|
| sql files | 461 |
| create table stmts | 614 |
| create index stmts | 916 |
| enable RLS | 597 |
| create policy | 830 |
| open FOR ALL USING(true) | **0** |

## QUERY_OPTIMIZATION_QUEUE

- **P0 select(*) = 48**
- P1 unbounded / N+1 suspects = 32
- أعلى تكلفة سطح عميل: **Admin** (costProxy 94) · Library · Account

### أهم الجداول من العميل
lessons · bookmarks · categories · sheikhs · fawaid · auto_imported_content · sharia_rulings

## INDEX_AUTHORITY

✅ hot filter indexes · ✅ FK indexes · ✅ search_index  
⚠️ duplicate index name defs في الهجرات (churn) — unused indexes = NOT_CONNECTED

## CACHE

React Query defaults: staleTime **300000** · gcTime **900000**  
useQuery sites ≈ 5 (فرصة توسيع التغطية) · duplicate fetch risk **HIGH**

## Next (مرتّب)

1. امتصاص `select('*')` ×48 (أعمدة صريحة)  
2. ربط `DATABASE_URL` → pg_stat_statements (أعلى 20% latency)  
3. توسيع React Query keys على قوائم الدروس/المحتوى  
4. لا إضعاف RLS

بوابة: `test:database-excellence`
