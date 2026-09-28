# Phase 5 — Real Device Matrix

| Field | Value |
|---|---|
| Date | 2026-09-28 |
| Branch | `cursor/design-ux-a11y-p5` |
| Policy | Simulation ≠ real device. Untested hardware = **DEVICE_REQUIRED**. |

## Automated / local simulation (code + Playwright where present)

| Target | Method | Result |
|---|---|---|
| 320–430px widths | `responsive-overflow.spec.ts` + CSS media inventory | Covered in CI suite when run |
| Tablet / desktop viewports | Playwright config projects | Covered when suite run |
| Large font / font stability | `font-stability.spec.ts` | Automated font metrics |
| Zoom 200% | partial via responsive specs | Not claimed complete |
| prefers-reduced-motion | `motion-policy.css` + gate | Code-level |
| RTL | `dir="rtl"` on shells + product default | Code-level |
| Safe area tokens | PageContainer + bottom-nav gates | Code-level |
| Notch / home indicator | CSS `env(safe-area-inset-*)` | **DEVICE_REQUIRED** for visual proof |
| iOS Dynamic Type extremes | — | **DEVICE_REQUIRED** |
| Android font scale extremes | — | **DEVICE_REQUIRED** |
| Capacitor back gesture | existing nav guards | **DEVICE_REQUIRED** on device |
| Virtual keyboard overlap | `useVisualViewportOffset` exists | **DEVICE_REQUIRED** |
| Landscape mobile | responsive specs partial | **DEVICE_REQUIRED** for chrome overlap |
| Physical tablet landscape | — | **DEVICE_REQUIRED** |
| Status bar (iOS/Android native) | Capacitor status bar helpers | **DEVICE_REQUIRED** |
| Offline airplane mode UX | OfflineStateV2 + cache (P4) | **DEVICE_REQUIRED** for store path |
| Screen reader VoiceOver / TalkBack | — | **DEVICE_REQUIRED** |
| Real LCP/CLS on cellular | — | **DEVICE_REQUIRED** |

## Checklist (owners)

| Device class | Owner action | Status |
|---|---|---|
| iPhone with notch + home indicator | Visual pass: home, mushaf chrome, prayer, bottom nav | DEVICE_REQUIRED |
| Large Android phone | Same routes + font scale 1.3–1.5 | DEVICE_REQUIRED |
| Tablet portrait/landscape | Bottom nav hide ≥880px + tables | DEVICE_REQUIRED |
| Capacitor iOS build | Back, safe area, haptics not on scroll | DEVICE_REQUIRED |
| Capacitor Android build | Back, keyboard, offline | DEVICE_REQUIRED |

Do **not** mark COMPLETE for device rows above without a dated real-device pass.
