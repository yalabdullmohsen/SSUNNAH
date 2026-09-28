# PHASE 7 — Environment Changeset

| Field | Value |
|---|---|
| Generated | 2026-09-28 |
| Rule | No production SQL/RLS applied · no secret values · absence of secret must not open sensitive features |

## Elements

### E-001 — Vercel production project (web)

| Field | Value |
|---|---|
| Purpose | Host `artifacts/majalis` production web |
| Required environment | Production Vercel linked to `main` |
| Current evidence | Live `https://www.ssunnah.com/version.json` → `2e008c8d` / `main` |
| Change required | Deploy only after web gate PASS (merge to `main` triggers auto-deploy) |
| Backward compatibility | Additive web assets; keep API contracts |
| Rollback | Redeploy previous commit (OWNER / EXTERNAL) |
| Owner action | Confirm project is official ssunnah target |
| Validation | `version.json` commit == intended SHA |
| Blocking | **Yes** for WEB_DEPLOYMENT until owner secrets + gate list PASS |

### E-002 — `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

| Field | Value |
|---|---|
| Purpose | Client data/auth |
| Required environment | Vercel prod + local `.env` (not committed) |
| Current evidence | App builds without secrets (placeholder client); prod behavior UNKNOWN from repo |
| Change required | None in code for this RC |
| Backward compatibility | Same public anon contract |
| Rollback | N/A |
| Owner action | Confirm present in Vercel |
| Validation | Owner checklist (no value print) |
| Blocking | **Yes** for confident WEB deploy attestation (P7-010) |

### E-003 — Server secrets (assistant / cron / admin / push)

| Field | Value |
|---|---|
| Purpose | Protected API routes |
| Required environment | Vercel / server env |
| Current evidence | Code fails closed without secrets (Phase 2) — values not in repo |
| Change required | None |
| Backward compatibility | Keep existing route shapes |
| Rollback | N/A |
| Owner action | Confirm matrix in `docs/security/API_SECRET_MATRIX.md` |
| Validation | `/api/readyz` per auth policy · no secret echo |
| Blocking | **Yes** if missing for features claimed in release |

### E-004 — SQL / RLS migrations

| Field | Value |
|---|---|
| Purpose | Schema |
| Required environment | Supabase hosted |
| Current evidence | No new SQL in P1–P6 remediation commits |
| Change required | **None for this RC** |
| Backward compatibility | N/A |
| Rollback | N/A |
| Owner action | None for this delta |
| Validation | Path filter on git history |
| Blocking | **No** for this RC (`NOT_APPLICABLE`) |

### E-005 — Apple signing / capabilities

| Field | Value |
|---|---|
| Purpose | TestFlight / App Store |
| Required environment | Apple Developer |
| Current evidence | Bundle ID `com.yousef.majlisilm` in pbxproj |
| Change required | Profiles/certs (owner) — **not in repo** |
| Backward compatibility | Do not change Bundle ID without owner |
| Rollback | N/A |
| Owner action | P7-002 |
| Validation | Archive |
| Blocking | **Yes** for native store |

### E-006 — Android signing / applicationId

| Field | Value |
|---|---|
| Purpose | Play release |
| Required environment | Play Console + keystore |
| Current evidence | `applicationId` `com.majlisilm.app` ≠ Capacitor |
| Change required | Owner decision only — agents must not mutate IDs |
| Backward compatibility | Changing applicationId breaks updates |
| Rollback | Keep existing ID until written strategy |
| Owner action | P7-001 · P7-002 |
| Validation | Signed AAB |
| Blocking | **Yes** for Play |

### E-007 — APNs / FCM / VAPID

| Field | Value |
|---|---|
| Purpose | Push |
| Required environment | Apple / Firebase / web push |
| Current evidence | OWNER_ACTION |
| Change required | Configure outside repo |
| Backward compatibility | Token format unchanged if existing |
| Rollback | Disable push feature flags if any |
| Owner action | P7-015 |
| Validation | Owner-device test only |
| Blocking | Remote push only — not web content |

### E-008 — Associated domains / assetlinks

| Field | Value |
|---|---|
| Purpose | Deep links |
| Required environment | DNS + hosting |
| Current evidence | Not re-proven Phase 7 |
| Change required | Owner verify live files |
| Backward compatibility | Keep existing paths |
| Rollback | N/A |
| Owner action | P7-011 |
| Validation | curl proofs |
| Blocking | Medium for deep links |

### E-009 — Capacitor `server.url`

| Field | Value |
|---|---|
| Purpose | Native shell loads production web |
| Required environment | Native configs |
| Current evidence | `https://www.ssunnah.com` · no localhost |
| Change required | None |
| Backward compatibility | Same host |
| Rollback | Prior config commit |
| Owner action | None |
| Validation | phase6/7 readiness gates |
| Blocking | No |

## Explicit non-actions

- No production migration applied  
- No secret values written to docs  
- No default insecure secrets  
- No destructive schema changes  
