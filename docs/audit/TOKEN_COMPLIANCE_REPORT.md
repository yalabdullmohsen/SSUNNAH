# TOKEN_COMPLIANCE_REPORT

Generated: 2026-10-06T19:03:53.856Z

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
| colors | hexInCss | 5212 | 5212 | ✅ |
| shadows | boxShadowDecls | 1002 | 1002 | ✅ |
| radii | borderRadiusPxDecls | 349 | 349 | ✅ |
| spacing/type systems | no new family | — | — | ✅ |

## Policy

- Future visual work must migrate toward `DESIGN_TOKENS_AUTHORITY` paths.
- Do not invent new color / type / spacing / shadow / border systems.
- Layers remain sf / mj / ss only (`DESIGN_TOKEN_AUTHORITY.md`).

## Catalog export

`artifacts/majalis/reports/design-tokens-authority.json`
