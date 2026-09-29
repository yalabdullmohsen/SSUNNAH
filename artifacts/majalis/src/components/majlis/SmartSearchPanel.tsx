/**
 * Flutter `SmartSearchEngine` UI — category chips + filtered results.
 */
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, BookOpen, Gavel, History, Search, X } from "lucide-react";
import {
  filterSmartSearch,
  SEARCH_CATEGORY_LABELS,
  type SearchCategory,
  type SmartSearchItem,
} from "@/lib/smart-search-engine";
import { EMPTY } from "@/lib/ui-copy";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";
import "@/styles/majlisilm-shell.css";

export type SmartSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (item: SmartSearchItem) => void;
};

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "quran":
      return <BookOpen size={18} aria-hidden="true" />;
    case "fiqh":
      return <Gavel size={18} aria-hidden="true" />;
    case "sirah":
      return <History size={18} aria-hidden="true" />;
    default:
      return <Bookmark size={18} aria-hidden="true" />;
  }
}

export function SmartSearchPanel({ open, onClose, onSelect }: SmartSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");

  const results = useMemo(
    () => filterSmartSearch(query, category),
    [query, category],
  );

  if (!open) return null;

  return (
    <div className="smart-search" role="dialog" aria-modal="true" aria-label="بحث ذكي" dir="rtl">
      <div className="smart-search__bar">
        <IconButton label="رجوع" className="smart-search__back" onClick={onClose}>
          <ArrowRight size={20} aria-hidden="true" />
        </IconButton>
        <div className="smart-search__input-wrap">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في القرآن والفقه والسيرة…"
            aria-label="نص البحث"
          />
          {query ? (
            <IconButton label="مسح" onClick={() => setQuery("")}>
              <X size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
        </div>
      </div>

      <div className="smart-search__chips" role="tablist" aria-label="تصنيف البحث">
        {(Object.keys(SEARCH_CATEGORY_LABELS) as SearchCategory[]).map((cat) => (
          <Button
            key={cat}
            type="button"
            variant="ghost"
            size="small"
            role="tab"
            aria-selected={category === cat}
            className={`smart-search__chip${category === cat ? " is-on" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {SEARCH_CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      <ul className="smart-search__results">
        {results.map((item) => (
          <li key={`${item.category}-${item.title}`}>
            <Button
              type="button"
              variant="ghost"
              className="smart-search__row"
              onClick={() => {
                onSelect?.(item);
                onClose();
              }}
            >
              <span className="smart-search__icon">
                <CategoryIcon category={item.category} />
              </span>
              <span className="smart-search__text">
                <strong>{item.title}</strong>
                <small>{item.sub}</small>
              </span>
            </Button>
          </li>
        ))}
        {results.length === 0 ? (
          <li className="smart-search__empty">{EMPTY.searchShort}</li>
        ) : null}
      </ul>
    </div>
  );
}

export default SmartSearchPanel;
