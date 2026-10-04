# STATE_ARCHITECTURE

## Global stores / contexts

| Store | Kind | Owner | Notes |
|---|---|---|---|
| TanStack QueryClient | Cache | `createAppQueryClient` | staleTime 300s catalog; search shorter |
| Auth session | Context | AuthProvider | Sole Supabase session owner |
| Theme preference | Context | ThemePreferenceProvider | Marks `mj:theme-applied` |
| Font preference | Context | FontPreferenceProvider | |
| Language | Context | LanguageProvider | |
| User preferences | Context | UserPreferencesProvider | |
| Prayer countdown | Context | PrayerCountdownProvider | Deferred; no calc ownership change |
| App startup FSM | Module singleton | app-startup-controller | NATIVE_LAUNCH → INTERACTIVE |
| Bootstrap stages | Module singleton | app-bootstrap-pipeline | Blocking stage set locked |
| Mushaf audio/ayah sync | Feature stores | mushaf-madinah | SPECIAL_CASE |
| Quran engine | Context | QuranEngineContext | KEEP_JUSTIFIED |

## Event ownership

| Event | Publisher | Consumers |
|---|---|---|
| `mj:app-startup` | app-startup-controller | Shell / splash |
| `mj:app-painted` / `app:first-paint` | main.tsx | Perf marks |
| `mj:theme-applied` | theme-preference | Boot readiness |
| window error / unhandledrejection | error-report | Local + `/api/client-error` |
| Search obs counters | search-observability | Diagnostics / tests |

## Maturity rules

1. One owner per concern — no duplicate session/theme hydration.
2. Query invalidation uses `queryKeys` prefixes.
3. Feature stores stay inside feature folders.
4. Platform health is read-only aggregation (`getPlatformHealthSnapshot`).

STATE_ARCHITECTURE_MATURE
