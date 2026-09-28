# Admin v3 Retirement Matrix — Phase 3

**Date:** 2026-09-28  
**Branch:** `cursor/admin-v3-crud-p3`  
**Rule:** No Legacy route deleted in this phase. Only `SAFE_REMOVE_CANDIDATE` may be removed in a future dedicated PR.

| Legacy route | v3 route | feature parity | permission parity | API parity | deep-link | tests | status |
|---|---|---|---|---|---|---|---|
| `/admin` (no section) | `/admin/v3` | shell | AdminRouteGuard | n/a | yes | migration-gate | **MIGRATED** |
| `/admin?section=submissions` | `/admin/v3/reviews` | approve/reject/list | review.* + API | `/api/admin/submissions` | Legacy kept | p3-native-gate | **MIGRATED** (Legacy **KEEP**) |
| `/admin/review-hub` | `/admin/v3/reviews` (+ legacy link) | partial (hub local) | UI only on hub | none for hub | yes | existing | **KEEP** |
| `/admin/review-center` | settings/reviews legacy link | automation queue | admin | lesson-automation APIs | yes | — | **KEEP** |
| `/admin?section=lessons` | `/admin/v3/content/lessons` | list/create/edit/archive | content.* API | `/api/admin/v3/lessons` | Legacy kept | p3-native-gate | **MIGRATED** (Legacy **KEEP**) |
| `/admin?section=sheikhs` | `/admin/v3/content/sheikhs` | list/create/edit/delete | content.* API | `/api/admin/v3/sheikhs` | Legacy kept | p3-native-gate | **MIGRATED** (Legacy **KEEP**) |
| `/admin?section=fawaid` | `/admin/v3/content/fawaid` | list/create/edit/archive | content.* API | `/api/admin/v3/fawaid` | Legacy kept | p3-native-gate | **MIGRATED** (Legacy **KEEP**) |
| `/admin?section=categories` | `/admin/v3/taxonomy` | list/create/edit/archive + cycle guard | content.edit API | `/api/admin/v3/categories` | Legacy kept | p3-native-gate | **MIGRATED** (Legacy **KEEP**) |
| `/admin?section=users` | `/admin/v3/community` | list + legacy role change | users.manage API | `/api/admin/v3/users` | Legacy kept | p3-native-gate | **MIGRATED** (Legacy **KEEP**) |
| `/admin?section=library` | content hub legacy card | full in Legacy | RLS client | none v3 | yes | — | **KEEP** |
| `/admin?section=adhkar` | content hub legacy | Legacy | RLS | none v3 | yes | — | **KEEP** |
| `/admin?section=telegram` | settings ops legacy | Legacy | content.edit | `/api/admin/telegram` | yes | — | **KEEP** |
| `/admin/integrations/instagram` | settings ops legacy | Legacy | content.edit | instagram API | yes | — | **KEEP** |
| `/admin/automation/*` | settings ops legacy | Legacy | admin | many | yes | — | **KEEP** |
| `/admin?section=search-analytics` | `/admin/v3/analytics` → tool | read Legacy | analytics.read | search-analytics | yes | — | **REDIRECT_READY** (UI hub only) |
| `/admin/legacy` | — | full Legacy shell | isAdmin | mixed | yes | migration-gate | **KEEP** |
| `/admin/v3/audit` | `/admin/v3/audit` | server+local read | audit.read | `/api/admin/v3/audit` | yes | p3-native-gate | **MIGRATED** |
| LearningPathsSection (orphan) | — | none | — | — | no | — | **BLOCKED** / ORPHAN |
| Full Legacy delete | — | — | — | — | — | — | **BLOCKED** — not `SAFE_REMOVE_CANDIDATE` |

## SAFE_REMOVE_CANDIDATE

_None in this phase._

## Redirect loop check

| From | To | Loop risk |
|---|---|---|
| `/admin` | `/admin/v3` | none (section keeps Legacy) |
| `/admin/v3/review` | `/admin/v3/reviews` | none |
| `/admin/v3/users` | `/admin/v3/community` | none |
| `/admin/v3/notifications|automation|system` | `/admin/v3/settings` | none |
| Native pages → Legacy links | `?section=` / standalone | none (one-way) |
