/**
 * Flutter `AdminMainLayout` header — search, notifications, reviewer identity.
 */
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";

export type ReviewHubHeaderBarProps = {
  searchQuery: string;
  onSearch: (q: string) => void;
  onOpenMobile: () => void;
};

export function ReviewHubHeaderBar({
  searchQuery,
  onSearch,
  onOpenMobile,
}: ReviewHubHeaderBarProps) {
  const { user } = useAuth();
  const fullName = user?.profile?.full_name?.trim() || "د. محمد العالم";
  const initial = fullName.charAt(0) || "م";

  return (
    <header className="rh-header">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rh-mobile-toggle [&_svg]:size-[18px]"
        onClick={onOpenMobile}
        aria-label="فتح القائمة"
      >
        <Menu size={18} />
      </Button>

      <div className="rh-header__search">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="بحث سريع برقم الآية، اسم القارئ، أو رقم المعاملة…"
          aria-label="بحث سريع"
        />
      </div>

      <div className="rh-header__spacer" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rh-header__icon [&_svg]:size-5"
        aria-label="الإشعارات"
      >
        <Bell size={20} strokeWidth={1.6} />
      </Button>

      <div className="rh-header__user">
        <span className="rh-header__avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="rh-header__name">{fullName}</span>
      </div>
    </header>
  );
}

export default ReviewHubHeaderBar;
