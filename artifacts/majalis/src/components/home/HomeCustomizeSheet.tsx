import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/design-system";
import { AppBottomSheet } from "@/components/ui/AppBottomSheet";
import {
  HOME_WIDGET_DEFS,
  getLocalHomepagePrefs,
  saveLocalHomepagePrefs,
  saveRemoteHomepagePrefs,
  resetHomepagePrefs,
  type HomepagePrefs,
} from "@/lib/homepage-layout";

const LABELS: Record<string, string> = Object.fromEntries(HOME_WIDGET_DEFS.map((w) => [w.id, w.label]));

export function HomeCustomizeSheet({
  open,
  onClose,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  onChange: (prefs: HomepagePrefs) => void;
}) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<HomepagePrefs>(() => getLocalHomepagePrefs());

  useEffect(() => {
    if (open) setPrefs(getLocalHomepagePrefs());
  }, [open]);

  const commit = (next: HomepagePrefs) => {
    setPrefs(next);
    saveLocalHomepagePrefs(next);
    onChange(next);
    if (user?.id) saveRemoteHomepagePrefs(user.id, next);
  };

  const toggleHidden = (id: string) => {
    const hiddenSet = new Set(prefs.hidden);
    if (hiddenSet.has(id as never)) hiddenSet.delete(id as never);
    else hiddenSet.add(id as never);
    commit({ ...prefs, hidden: Array.from(hiddenSet) as typeof prefs.hidden });
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = prefs.order.indexOf(id as never);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= prefs.order.length) return;
    const order = [...prefs.order];
    [order[idx], order[target]] = [order[target], order[idx]];
    commit({ ...prefs, order });
  };

  const handleReset = () => {
    const next = resetHomepagePrefs();
    setPrefs(next);
    onChange(next);
    if (user?.id) saveRemoteHomepagePrefs(user.id, next);
  };

  return (
    <AppBottomSheet open={open} onClose={onClose} title="تخصيص الصفحة الرئيسية" snap="full">
      <p className="hcz-hint">
        أظهر أو أخفِ الأقسام، ورتّبها كما تفضّل. يُحفَظ تلقائيًا على هذا الجهاز
        {user ? " ويُزامَن مع حسابك" : ""}.
      </p>

      <div className="hcz-list">
        {prefs.order.map((id, idx) => {
          const isHidden = prefs.hidden.includes(id as never);
          return (
            <div key={id} className={`hcz-row${isHidden ? " hcz-row--hidden" : ""}`}>
              <IconButton
                type="button"
                className="hcz-row__visibility"
                onClick={() => toggleHidden(id)}
                aria-pressed={!isHidden}
                label={isHidden ? `إظهار ${LABELS[id]}` : `إخفاء ${LABELS[id]}`}
              >
                {isHidden ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
              </IconButton>
              <span className="hcz-row__label">{LABELS[id]}</span>
              <div className="hcz-row__move">
                <IconButton
                  type="button"
                  onClick={() => move(id, -1)}
                  disabled={idx === 0}
                  label={`تحريك ${LABELS[id]} للأعلى`}
                >
                  <ArrowUp size={15} strokeWidth={2} />
                </IconButton>
                <IconButton
                  type="button"
                  onClick={() => move(id, 1)}
                  disabled={idx === prefs.order.length - 1}
                  label={`تحريك ${LABELS[id]} للأسفل`}
                >
                  <ArrowDown size={15} strokeWidth={2} />
                </IconButton>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="ghost" size="small" className="hcz-reset" onClick={handleReset}>
        <RotateCcw size={14} strokeWidth={2} aria-hidden="true" /> استعادة الترتيب الافتراضي
      </Button>
    </AppBottomSheet>
  );
}
