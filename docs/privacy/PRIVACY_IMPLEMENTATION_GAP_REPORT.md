# Privacy Implementation Gap Report — Phase 6

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Rule | No legal claims beyond code evidence |

## Data map (implementation-oriented)

| Data | Purpose | Storage | Identity-linked | Status / gap |
|---|---|---|---|---|
| Auth session | login | Supabase + local | yes | PASS routes; hosted MFA OWNER_ACTION |
| Profile | display | Supabase | yes | PARTIAL |
| Bookmarks / reading progress | UX | Preferences/IDB + cloud | optional | PARTIAL sync |
| Learning progress | UX | local/cloud | optional | PARTIAL |
| Push tokens | notifications | device + backend | yes | OWNER_ACTION retention |
| Location | prayer times | device / settings | optional | must not force at boot; fallback city |
| Prayer settings | scheduling | local | no/weak | PASS code paths |
| Analytics / RUM | reliability | client→endpoint | policy | must respect consent if required — PARTIAL |
| Error reports | stability | client | pseudonymous preferred | contract forbids secrets |
| Search telemetry | quality | optional | UNKNOWN if raw query logged | OWNER_ACTION policy |
| AI requests | assistant | server | may contain user text | server secrets OWNER_ACTION |
| Account export/deletion | rights | API + UI | yes | PARTIAL; hosted verify OWNER_ACTION |
| Admin audit | compliance | Supabase | yes | Admin only |
| Cookies / localStorage / IDB | app state | device | mixed | clear-user-local-data paths exist |

## Gaps requiring OWNER_ACTION

- Align privacy policy text with actual telemetry fields.  
- Confirm retention periods in hosted systems.  
- Confirm consent gating if marketing analytics exist.  
- Verify production account deletion end-to-end.  

## Non-claims

This report is not a legal privacy policy and does not assert GDPR/CCPA certification.
