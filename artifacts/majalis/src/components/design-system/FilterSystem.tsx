/**
 * Filter authorities — re-export of `components/filters` (single kit).
 * See docs/design/FILTER_AUTHORITY_MAP.md
 *
 * Exclusive chip choice → SegmentedFilter
 * Sheet / advanced → FilterSheet
 * Active / reset → ActiveFilters · FilterResetButton
 * Bars → FilterBar / UnifiedFilterBar / UnifiedPrimaryFilters
 */
export {
  FilterChip,
  type FilterChipProps,
  SegmentedFilter,
  type SegmentedFilterItem,
  FilterBar,
  FilterSheet,
  FilterToggle,
  ActiveFilters,
  type ActiveFilterItem,
  FilterResetButton,
  UnifiedFilterBar,
  UnifiedPrimaryFilters,
  type UnifiedFilterOption,
} from "@/components/filters";
