# SUNNAH FINAL Program — Phase 3: Dark Deferred Absorb

| Field | Value |
|---|---|
| Status | **IMPLEMENTED** (Delivery = merge + MATCH) |
| Base | `origin/main` @ `6a2a3697` (Startup Typography FOUC P2 MATCH) |
| Branch | `cursor/dark-deferred-absorb-p3` |
| Product | `artifacts/majalis` |
| Authority | `docs/design/DARK_MODE_AUTHORITY.md` |

## Live truth at start

| Probe | Result |
|---|---|
| `origin/main` | `6a2a369733e1f5d5c10e66f2049f01c431c86440` |
| Production `https://www.ssunnah.com/version.json` | `6a2a3697` **MATCH** |
| Vercel Production deployment SHA | `6a2a3697` |
| Open program PRs | none for this phase (#2299 / #1791 out of scope) |

## Root cause (code-proven)

1. إقلاع داكن يستورد `dark-mode-surfaces` + `dark-design-system` + `premium-dark-refine` + `luxury-night-v2`.
2. بعد `load` + idle، `loadNonCriticalCss` يعيد `import()` لنفس الثلاث طبقات (+ `interaction-states` المتزامن أصلًا).
3. Vite يخزّن وحدة CSS — إعادة الاستيراد **لا** تعيد حقن الترتيب في Cascade؛ توهّم «reload-to-win» بلا أثر حقيقي، مع تكلفة شبكة/جدولة ووميض محتمل عند اكتمال الطبقات المؤجّلة النهارية.
4. `ThemePreferenceProvider` و`App` (luxury) كانا مسارات تحميل منفصلة لنفس الملفات.

## Fix (minimal)

| Change | Role |
|---|---|
| `src/lib/ensure-dark-layers.ts` | محمّل idempotent واحد للطبقات ACTIVE_COMPATIBILITY |
| `main.tsx` boot | `ensureDarkLayersForBoot()` |
| `main.tsx` idle | `ensureDarkCoreLayers()` فقط إن `!isDarkCoreLoadStarted()` — بلا إعادة `interaction-states` |
| `ThemePreferenceProvider` | `ensureDarkLayersForThemeSwitch()` |
| `App.tsx` night | `ensureDarkLuxuryBundle()` |

**لا** نظام ثيم/توكن/لوحة ليل جديدة · **لا** `!important` · **لا** مساس بمصحف/صلاة/أذان.

## Gates

```bash
pnpm --filter @workspace/majalis run test:dark-deferred-absorb
pnpm --filter @workspace/majalis run test:dark-mode-authority
pnpm --filter @workspace/majalis run test:dark-unified
```

## Explicit non-claims

- لا `SUNNAH_ZERO_FLICKER_COMPLETE` (CLS جهاز = DEVICE_REQUIRED)
- لا حذف ملفات الجسور الليلية (KEEP حتى REMOVE_CANDIDATE ببرهان)
- لا STORE GO / FULLY COMPLETE

## Residual (next phases)

| Item | Class |
|---|---|
| امتصاص هوية bridges (brand-v4 / tokens / redesign) → Foundation + ↓ hex/`!important` | FIXABLE — phase تالية |
| اعتزال ملفات dark bridges بعد parity كامل | FIXABLE لاحق |
| cold/warm FOUC رقمي على جهاز | DEVICE_REQUIRED |
