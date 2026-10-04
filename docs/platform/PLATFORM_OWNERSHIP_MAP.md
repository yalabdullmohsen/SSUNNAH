# PLATFORM_OWNERSHIP_MAP

Clear boundaries for long-term maintainability.

## Layers

| Layer | Owns | Must not own |
|---|---|---|
| `main.tsx` | Boot, root ErrorBoundary, QueryClient, platform diagnostics init | Feature UI, domain fetches |
| `App.tsx` | Chrome, provider stack, immersive route policy | Query defaults, mushaf glyph data |
| `AppRoutes` / `src/app/routes` | Lazy route table + SafeLazyRoute | Business data |
| `src/pages/*` | Domain screens + local UI state | Global query defaults |
| `src/features/mushaf-*` | Mushaf experience | Prayer calc, search ranking |
| `src/lib/query-*` | Cache contracts + keys | UI chrome |
| `src/lib/app-startup-*` | Startup state machine | Route rendering |
| `src/components/design-system` | Feedback V2 / cards / forms | Domain content |
| `docs/platform` + gates | Platform governance | Product copy |

## Provider ownership (runtime)

Documented in `PLATFORM_PROVIDER_OWNERSHIP` (`AppProviders.tsx`):

1. ErrorBoundary (root) — `main.tsx`
2. QueryClientProvider — `main.tsx`
3. AppProviders marker — `main.tsx` (composition seam)
4. Theme → Font → Language → UserPreferences → Auth — `App.tsx`
5. PrayerCountdownProvider — deferred shell in `App.tsx`

## Data ownership

| Data | Owner |
|---|---|
| Catalog lists | TanStack Query + `queryKeys` |
| Auth session | AuthProvider only |
| Theme / font / lang | Dedicated preference providers |
| Mushaf page / audio clock | Feature stores under `mushaf-madinah` |
| Search counters | `search-observability` (privacy-safe) |
| Client errors | `error-report` (+ local ring buffer) |
| Platform health | `platform-health` snapshot |

## Coupling rules

- No new parallel provider trees outside App / main.
- No ad-hoc query keys outside `query-keys.ts` (gate-enforced).
- No Quran mapping / prayer calc / search ranking edits in platform waves.
