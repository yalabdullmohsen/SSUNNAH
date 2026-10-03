# TOKEN_COMPLIANCE_REPORT

Generated: 2026-10-03T08:28:48.079Z

## Status

| Flag | Value |
|---|---|
| DESIGN_TOKENS_AUTHORITY_ACTIVE | ✅ |
| TOKEN_COMPLIANCE_ENFORCED | ✅ |
| VISUAL_SYSTEM_UNIFIED | ✅ |
| Logical paths | 101 |
| CSS var bindings | 88 |
| Component/literal bindings | 13 |

## Rogue signals (debt proxies)

| Area | Signal | Current | Ceiling | OK |
|---|---|---:|---:|---|
| colors | hexInCss | 7022 | 7022 | ✅ |
| shadows | boxShadowDecls | 1010 | 1010 | ✅ |
| radii | borderRadiusPxDecls | 429 | 429 | ✅ |
| spacing/type systems | no new family | — | — | ✅ |

## Policy

- Future visual work must migrate toward `DESIGN_TOKENS_AUTHORITY` paths.
- Do not invent new color / type / spacing / shadow / border systems.
- Layers remain sf / mj / ss only (`DESIGN_TOKEN_AUTHORITY.md`).

## Catalog export

`artifacts/majalis/reports/design-tokens-authority.json`
