# TOKEN_COMPLIANCE_REPORT

Generated: 2026-10-03T09:21:22.190Z

## Status

| Flag | Value |
|---|---|
| DESIGN_TOKENS_AUTHORITY_ACTIVE | ✅ |
| TOKEN_COMPLIANCE_ENFORCED | ✅ |
| VISUAL_SYSTEM_UNIFIED | ✅ |
| Logical paths | 125 |
| CSS var bindings | 104 |
| Component/literal bindings | 21 |

## Rogue signals (debt proxies)

| Area | Signal | Current | Ceiling | OK |
|---|---|---:|---:|---|
| colors | hexInCss | 7022 | 7022 | ✅ |
| shadows | boxShadowDecls | 986 | 986 | ✅ |
| radii | borderRadiusPxDecls | 392 | 392 | ✅ |
| spacing/type systems | no new family | — | — | ✅ |

## Policy

- Future visual work must migrate toward `DESIGN_TOKENS_AUTHORITY` paths.
- Do not invent new color / type / spacing / shadow / border systems.
- Layers remain sf / mj / ss only (`DESIGN_TOKEN_AUTHORITY.md`).

## Catalog export

`artifacts/majalis/reports/design-tokens-authority.json`
