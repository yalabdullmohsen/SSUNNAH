# SEARCH_UX_IMPROVEMENT_PLAN

Generated: 2026-10-03

SearchSuggestions wired: **false**

| Surface | box | suggestions | recent | highlight | grouping | filters | empty | analytics |
|---|---|---|---|---|---|---|---|---|
| SearchView | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GlobalSearchModal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| HomeUniversalSearch | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

## Gaps (priority)

- **P0** SearchSuggestions: Wire SearchSuggestions into SearchView and/or GlobalSearchModal / Home
- **P1** analytics: Call trackSearchUx from GlobalSearchModal + HomeUniversalSearch
- **P1** Home analytics: Instrument HomeUniversalSearch with search UX events
- **P1** GSM grouping: Section results in GlobalSearchModal like SearchView
- **P0** hadith coverage: Expand hadith docs in unified index (now 6)
- **P0** scholar coverage: Expand scholar docs in unified index (now 10)
- **P1** fiqh coverage: Expand fiqh docs in unified index (now 1)
