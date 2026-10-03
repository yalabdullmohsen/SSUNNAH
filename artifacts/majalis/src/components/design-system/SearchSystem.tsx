/**
 * Search authorities — façades over FormFields + result cards + product search entry.
 * See docs/design/SEARCH_AUTHORITY_MAP.md
 *
 * Global entry: GlobalSearchModal → /search · runAppSearch
 * In-page field: SearchInput (canonical) · SearchField (compat → SearchInput)
 * Results: SearchResultCard
 */
export { SearchInput, type SearchInputProps } from "./FormFields";
export {
  SearchResultCard,
  isBlockedSearchHref,
  type SearchResultItem,
} from "@/components/search/SearchResultCards";
