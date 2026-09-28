# مركز تفنيد الشبهات (Program 13)

| Field | Value |
|---|---|
| Wave | SHUBUHAT_CENTER_W1 |
| Canonical list | `/discover-islam/doubts` |
| Alias | `/shubuhat` → list |
| Detail | `/discover-islam/doubts/:slug` |
| Runtime | `dawah-service` + `STATIC_DAWAH_SHUBUHAT` |
| Contract | `lib/shubuhat-contract.ts` |

## Principles

1. **No unsupported AI rebuttals** — answers come from curated/approved records only.
2. **No hostile or insulting tone**.
3. **Missing sources** → show educational limitation; do not invent citations.
4. **Public search** indexes only `PROVENANCE_COMPLETE` records (W1: keep EXCLUDED until enriched).

## Required page fields (Program 13)

| Field | Mapping |
|---|---|
| Exact question | `shubha_text` + `title` |
| Scope | category + `complexity_level` |
| Concise answer | `short_answer` |
| Detailed answer | `detailed_refutation` |
| Evidence | `evidences[]` |
| Source quotations | evidence `text` + `ref` |
| References | `sources[]` |
| Related | list hub + contact (related IDs follow-up) |
| Language | Arabic (`ar`, RTL) in W1 |
| Last updated | `updated_at` |
| Attribution | source titles/authors when present |

## Completeness tiers

| Tier | Meaning |
|---|---|
| `STRUCTURE_ONLY` / ok structure | Core Q&A present |
| `PROVENANCE_PARTIAL` | Evidence present; scholarly `sources[]` empty |
| `PROVENANCE_COMPLETE` | Evidence + named sources |
| `BLOCKED_INCOMPLETE` | Missing required structure |

## Explicit non-goals (W1)

- Filling empty `sources[]` by AI memory
- Polemical comparisons of Islamic sects
- Personalized fatwa generation
