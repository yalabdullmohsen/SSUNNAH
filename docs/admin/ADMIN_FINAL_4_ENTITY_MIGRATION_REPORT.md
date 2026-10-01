# ADMIN-FINAL-4 — Entity Migration Report

| Field | Value |
|---|---|
| Status | **ADMIN_FINAL_4** (pending MERGED_AND_DEPLOYED) |
| Base tip | `5ec1a84e` (ADMIN-FINAL-3 MATCH) |
| Gate | `admin-final-4-entity-migration-gate.test.ts` |
| Rule | رابط v3→Legacy ≠ ترحيل كامل |

## Migration Matrix

| Entity | v3 route | Legacy | API | List | Search | Filter | Page | Create | Read/Edit | Archive/Delete | Restore | Perm | OLA | Audit | Tests | Mobile parity | Consumers | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Library | `/admin/v3/content/library` | `?section=library` | `/api/admin/v3/library` | ✓ | ✓ | status | ✓ | ✓ | ✓ | soft archive | ✓ draft | content.* | id eq | ✓ | gate | shell RTL | Legacy LibrarySection | **V3_COMPLETE** |
| Islamic Stories | `/admin/v3/content/islamic-stories` | `?section=islamic-stories` | `/api/admin/v3/islamic-stories` | ✓ | ✓ | approved | ✓ | ✓ | ✓ | unapprove | N/A (bool) | content.* | id eq | ✓ | gate | shell RTL | Legacy section | **V3_COMPLETE** |
| Prophet Stories | `/admin/v3/content/prophet-stories` | `?section=prophet-stories` | `/api/admin/v3/prophet-stories` | ✓ | ✓ | approved | ✓ | ✓ | content+approve | unapprove | N/A | content.* | id eq | ✓ | gate | shell RTL | Legacy citations editor | **V3_PARTIAL** |
| Arbaeen Love | `/admin/v3/content/arbaeen` | `?section=arbaeen-love` | `/api/admin/v3/arbaeen` | ✓ | ✓ | review_status | ✓ | ✓ | ✓ | reject | ✓ draft | content.* | id eq | ✓ | gate | shell RTL | Legacy ArbaeenLoveSection | **V3_COMPLETE** |
| Adhkar | — | `?section=adhkar` | none (seed+localStorage) | Legacy | Legacy | — | — | local | local | local | — | client | N/A | N/A | — | Legacy | `adhkar-admin` / seed | **LEGACY_REQUIRED** · **BLOCKED_SOURCE** |
| Universities | — | `/admin/universities` | `/api/admin/universities` (+programs/faqs) | Legacy | Legacy | nested | Legacy | nested | nested | nested | — | Admin API | nested | Legacy | — | Legacy | UniversitiesAdminPage | **LEGACY_REQUIRED** |
| Sources | — | `/admin/sources` | automation APIs | Legacy | — | — | — | — | — | — | — | automation | — | — | — | Legacy | AutomationSourcesPage | **V3_LINK_ONLY** → **ADMIN-FINAL-6** |

## Classifications (honest)

| Class | Items |
|---|---|
| **V3_COMPLETE** | Library · Islamic Stories · Arbaeen |
| **V3_PARTIAL** | Prophet Stories — citations JSON editor stays Legacy until dedicated UI; content + approval native |
| **LEGACY_REQUIRED** | Adhkar (no Supabase table; `adhkar-seed` + `adhkar-admin` localStorage) · Universities (nested programs/requirements/faqs/reminders) |
| **BLOCKED_SOURCE** | Adhkar — no server entity to migrate without schema OWNER_ACTION |
| **V3_LINK_ONLY** | Sources — automation surface; migration owned by ADMIN-FINAL-6 |
| **MIGRATE_NOW** | (done this PR) Library · Islamic Stories · Arbaeen · Prophet core |

## Critical rule

وجود رابط من Admin v3 إلى Legacy **لا يُعد ترحيلًا كاملًا**.  
Adhkar / Universities / Sources تبقى مصنّفة صراحة وليست `V3_COMPLETE`.

## Security contracts (new APIs)

- `requireAdminAccess` + `content.*` permissions
- `pickFields` — no mass assignment
- no client role trust
- `sendSafeError` — no raw DB / stack
- governance audit on mutate/archive
- Prophet Stories: citations not accepted from body in v3 (Legacy path only)

## Closure

`ADMIN_FINAL_4_MERGED_AND_DEPLOYED` after: focused tests · verify:preflight · verify:ci · merge · deploy · `version.json` MATCH · smoke `/admin` 404 public.
