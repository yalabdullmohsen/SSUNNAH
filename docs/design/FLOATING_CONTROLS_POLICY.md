# Floating Controls Policy — سُنّة

| Field | Value |
|---|---|
| Status | **AUTHORITY (Interaction PR-4)** |
| Owner | Navigation / FAB cleanup |
| Related | `INTERACTION_COMPONENT_AUTHORITY.md` · `NAVIGATION_AND_SAFE_AREA.md` |
| Back preference | In-page `AppBackButton` over floating host |

## Inventory

| Control | Route / surface | Purpose | z-index token | `--z-*` | Safe-area | Bottom-nav collision | Necessity |
|---|---|---|---|---|---|---|---|
| `PageHeaderV2` / in-page chrome | Per-page header | Title + optional actions; primary back via `AppBackButton` inline | content / sticky container | `--z-sticky` (100) when sticky | N/A (in flow) | None | **Required** — prefer first |
| `AppBackButton` (inline/hero/lobby/plain) | Pages with section chrome (`hasInPageBackChrome`, lobbies, detail) | Unified history/Capacitor back | in-flow | — | N/A | None | **Required** when page owns back |
| `GlobalBackControlHost` / `FloatingBackButton` | Global (hidden `/`, immersive mushaf, adhan-settings, `hasInPageBackChrome`) | Unified bottom-edge back FAB | `--z-fab` | `--z-fab` (220) | `--inset-bottom` + `--global-back-bottom` | Cleared via `--global-back-clearance` / above nav | **Conditional** — only when no in-page AppBack |
| `ScrollToTop` | Global after `scrollY > 720`; hidden under dialog/sheet | Jump to top | `--z-fab` / calm polish ~180–220 | `--z-fab` | `data-safe-area="1"` + `--inset-*` | Opposite edge from back (RTL: inline-end); above `--bottom-nav-height` | **Optional** — must not cover primary FAB/critical CTA |
| `BottomNavBar` | App shell (hidden immersive/auth) | Primary section tabs (`Link`) | `--z-bottom-nav` / `--z-nav` | `--z-bottom-nav` (210), `--z-nav` (200) | `--inset-bottom` | Is the reserved strip | **Required** |
| `NavBar` + `SideNavDrawer` | App shell (hidden immersive) | Top chrome + drawer; Links for routes | `--z-app-header` / `--z-overlay-drawer` | `--z-app-header` (200), `--z-overlay-drawer` (10040) | Header safe-area | Drawer overlays; does not sit in FAB lane | **Required** |
| `AssistantFloatingWidget` | Global FAB (hidden assistant page, admin, path allowlist) | Open scientific assistant | `--z-fab` | `--z-fab` (220) | Bottom inset + chrome CSS | Shares FAB lane; must clear BottomNav | **Product-proven** — at most one primary FAB with assistant as candidate |
| `AdminSiteEditBar` | Admin sessions only; hidden immersive | Local page text edit FAB | Inline ~9990 / dialog 10001 | Prefer migrate to `--z-overlay-*` later | Bottom `90px` offset (legacy) | Potentially conflicts with assistant/back — admin-only | **Admin-only** floating OK |
| `QuranActionBar` | Non-mushaf ayah chrome (engine UI) | Ayah play/tafsir/bookmark/share | Engine CSS (sheet-like) | Align with `--z-sheet` / audio chrome when shared | Must clear mini-player + nav | Must not cover BottomNav | **Contextual** sheet, not global primary FAB |
| Mushaf reader chrome | `/mushaf` etc. | Immersive controls | MUSHAF_SPECIAL | — | Own chrome | BottomNav hidden | **Out of scope** this wave |

## 13 policy rules

1. **PageHeader first** — Prefer `PageHeaderV2` / in-page header actions before any floating control.
2. **In-page controls** — Prefer in-page `Button` / `AppBackButton` / toolbar over fixed FABs.
3. **Sticky in container** — If persistence is needed, sticky inside the page container beats viewport-fixed FAB.
4. **FAB only if proven** — Add a FAB only with product proof (task frequency + no in-page alternative).
5. **At most one primary FAB** — Never stack multiple primary FABs (assistant vs page CTA vs back).
6. **FloatingBack not with AppBackButton** — If in-page `AppBackButton` can show (`hasInPageBackChrome` / page chrome), suppress `GlobalBackControlHost`.
7. **ScrollToTop no overlap critical action** — Must not cover primary CTA, back FAB, or BottomNav tabs.
8. **Safe areas** — Respect `--inset-bottom` / `--inset-*` and `env(safe-area-inset-*)`.
9. **Not cover BottomNav** — Floating controls sit above `--bottom-nav-height` + inset; never obscure tabs.
10. **Move/hide on keyboard** — Reposition or hide when virtual keyboard / `visualViewport` shrinks usable height.
11. **Not behind Dialog/Sheet** — Hide or yield under open Dialog/Sheet/`aria-modal` (ScrollToTop already does).
12. **No raw z-index** — Use `--z-*` tokens (`--z-fab`, `--z-bottom-nav`, `--z-overlay-*`); no ad-hoc numeric `z-index` in new code.
13. **No `!important` hide** — Do not hide conflicting FABs with `display:none !important` patches; fix ownership in React.

## FloatingBack ↔ AppBackButton wiring (PR-4)

- **Source of truth for in-page ownership:** `hasInPageBackChrome(pathname)` in `lib/immersive-chrome.ts`.
- **Host:** `GlobalBackControlHost` sets `hideBack` when home, immersive mushaf, adhan-settings, **or** `hasInPageBackChrome`.
- **Host still uses** `AppBackButton variant="bar"` with `autoHideFloating={false}` so prayer/non-listed routes keep the unified bottom back without emptying the host shell.
- **Already handled previously:** host hid home / mushaf / adhan-settings; AppBackButton auto-hide covered the same list when `autoHideFloating` is true on non-host call sites.
- **PR-4 change:** host additionally suppresses when in-page AppBack chrome owns the route (rule 6).

## Migration notes (PR-4)

- Raw `<button>` in nav/FAB surfaces → `Button` / `IconButton` (`label` required for icon-only).
- Navigation stays on Wouter `Link` (`BottomNavBar`, nav tabs, auth links).
- No mushaf* migration; no admin-v3 CRUD pages; `AdminSiteEditBar` floating only.
- No new hex / `!important` / Framer Motion in this wave.
