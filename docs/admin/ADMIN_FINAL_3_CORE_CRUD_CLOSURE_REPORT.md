# ADMIN-FINAL-3 — Core CRUD Closure

| Field | Value |
|---|---|
| Status | **ADMIN_FINAL_3_MERGED_AND_DEPLOYED** · tip `5ec1a84e` · production MATCH |
| Base tip | `a04419361` (after ADMIN-FINAL-2 seal) |
| Post-FINAL-2 baseline | [`POST_ADMIN_FINAL_2_LIVE_BASELINE.md`](../remediation/POST_ADMIN_FINAL_2_LIVE_BASELINE.md) · **LOCKED** |
| PR | [#2424](https://github.com/yalabdullmohsen/majalis/pull/2424) |
| Gate | `admin-final-3-core-crud-gate.test.ts` |
| Entities | Lessons · Sheikhs · Fawaid · Categories · Users · Roles |

## Coverage matrix

| Entity | List | Search | Filter | Page | Create | Read/Edit | Archive/Delete | Restore | Validation | Perms | Audit | Empty/Error |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Lessons | ✓ v3 | ✓ | status | ✓ | ✓ | ✓ + conflict 409 | archive | ✓ draft | ✓ | content.* | ✓ | ✓ |
| Sheikhs | ✓ v3 | ✓ | — | ✓ | ✓ | ✓ | hard delete (schema) | N/A | ✓ | content.* | ✓ | ✓ |
| Fawaid | ✓ v3 | ✓ | status | ✓ | ✓ | ✓ | archive | ✓ draft | ✓ | content.* | ✓ | ✓ |
| Categories | ✓ v3 | ✓ client | status | tree≤2k | ✓ | ✓ | archive | ✓ published | slug/cycle | content.* | ✓ | ✓ |
| Users | ✓ v3 | ✓ | role client | ✓ | **OWNER_ACTION** (Auth) | role edit | **OWNER_ACTION** | N/A | role allowlist | users.* | ✓ | ✓ |
| Roles | catalog | — | — | — | N/A (code catalog) | read matrix | N/A | N/A | — | users.read | view | ✓ |

## Routes

| Path | Surface |
|---|---|
| `/admin/v3/content/lessons` | EntityCrudPage |
| `/admin/v3/content/sheikhs` | EntityCrudPage |
| `/admin/v3/content/fawaid` | EntityCrudPage |
| `/admin/v3/taxonomy` | TaxonomyPage |
| `/admin/v3/community` | UsersPage |
| `/admin/v3/community/roles` | RolesPage (NEW) |

## Honest residuals

| Item | Class |
|---|---|
| User account Create/Delete via Supabase Auth | **OWNER_ACTION** |
| Roles as DB table | **NOT_APPLICABLE** — governance roles are code catalog; assignment via Users |
| Sheikh soft-archive | **KEEP_JUSTIFIED** — schema has no status; hard delete + confirm |
| Offline offline-banner on admin CRUD | chrome contract / **NOT_APPLICABLE** for sensitive mutations |
| No optimistic updates on role/archive | enforced (busy + await) |

## Closure

`ADMIN_FINAL_3_MERGED_AND_DEPLOYED` after merge · deploy · version MATCH · smoke `/admin` 404 public.
