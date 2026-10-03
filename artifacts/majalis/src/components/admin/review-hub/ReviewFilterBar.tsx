/**
 * Filter tabs + stream chips + global search + bulk bar.
 */
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FILTER_TAB_LABELS,
  type ReviewFilterTab,
  type ReviewStream,
} from "@/lib/admin-review-hub";

export type ReviewFilterBarProps = {
  filter: ReviewFilterTab;
  filterCounts: Record<ReviewFilterTab, number>;
  streamFocus: "all" | ReviewStream;
  searchQuery: string;
  selectedCount: number;
  onFilter: (f: ReviewFilterTab) => void;
  onStreamFocus: (s: "all" | ReviewStream) => void;
  onSearch: (q: string) => void;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onClearSelection: () => void;
};

const TABS: ReviewFilterTab[] = [
  "pending",
  "high_priority",
  "flagged_ai",
  "approved",
  "rejected",
];

export function ReviewFilterBar({
  filter,
  filterCounts,
  streamFocus,
  searchQuery,
  selectedCount,
  onFilter,
  onStreamFocus,
  onSearch,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
}: ReviewFilterBarProps) {
  return (
    <div className="rh-filters">
      <div className="rh-filters__search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="بحث بمعرّف المستخدم، رقم الآية، أو التصنيف…"
          aria-label="بحث في طابور المراجعة"
        />
        {searchQuery ? (
          <Button variant="secondary" size="small"
            type="button"
            className="rh-filters__clear"
            onClick={() => onSearch("")}
            aria-label="مسح البحث"
          >
            <X size={14} />
          </Button>
        ) : null}
      </div>

      <div className="rh-filters__streams" role="tablist" aria-label="نوع الطابور">
        {(
          [
            ["all", "الكل"],
            ["recitation", "تلاوات"],
            ["content", "محتوى وتفسير"],
          ] as const
        ).map(([key, label]) => (
          <Button variant="secondary" size="small"
            key={key}
            type="button"
            role="tab"
            aria-selected={streamFocus === key}
            className={streamFocus === key ? "is-on" : undefined}
            onClick={() => onStreamFocus(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="rh-filters__tabs" role="tablist" aria-label="حالة المراجعة">
        {TABS.map((tab) => (
          <Button variant="secondary" size="small"
            key={tab}
            type="button"
            role="tab"
            aria-selected={filter === tab}
            className={`rh-filters__tab${filter === tab ? " is-on" : ""}`}
            onClick={() => onFilter(tab)}
          >
            {FILTER_TAB_LABELS[tab]}
            <span className="rh-filters__count">{filterCounts[tab]}</span>
          </Button>
        ))}
      </div>

      {selectedCount > 0 ? (
        <div className="rh-filters__bulk" role="region" aria-label="إجراءات جماعية">
          <span>محدد: {selectedCount}</span>
          <Button variant="secondary" size="small" type="button" className="rh-btn rh-btn--sage" onClick={onBulkApprove}>
            اعتماد الكل
          </Button>
          <Button variant="secondary" size="small" type="button" className="rh-btn rh-btn--rose" onClick={onBulkReject}>
            رفض الكل
          </Button>
          <Button variant="secondary" size="small" type="button" className="rh-btn rh-btn--ghost" onClick={onClearSelection}>
            إلغاء التحديد
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ReviewFilterBar;
