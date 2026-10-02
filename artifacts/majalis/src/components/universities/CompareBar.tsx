import "@/styles/components/university-card.css";
import { Link } from "wouter";
import { useCompare } from "./CompareContext";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/design-system/Buttons";

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  if (compareList.length === 0) return null;

  return (
    <div dir="rtl" className="compare-bar">
      <div className="compare-bar__inner">
        <span className="compare-bar__label">
          المقارنة ({compareList.length}/4):
        </span>

        <div className="flex gap-2 flex-wrap flex-1">
          {compareList.map((u) => (
            <span key={u.slug} className="compare-chip">
              {u.name_ar.slice(0, 25)}{u.name_ar.length > 25 ? "…" : ""}
              <IconButton
                type="button"
                onClick={() => removeFromCompare(u.slug)}
                label={`إزالة ${u.name_ar} من المقارنة`}
                className="compare-chip__remove"
              >
                ×
              </IconButton>
            </span>
          ))}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {compareList.length >= 2 && (
            <Link href="/universities/compare" className="univ-btn univ-btn--primary">
              قارن الآن ←
            </Link>
          )}
          <Button type="button" variant="ghost" onClick={clearCompare} className="compare-bar__clear">
            مسح الكل
          </Button>
        </div>
      </div>
    </div>
  );
}
