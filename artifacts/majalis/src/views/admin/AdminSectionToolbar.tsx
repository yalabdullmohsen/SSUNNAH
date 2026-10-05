import { AdminSectionHeader } from "@/components/admin/AdminLayout";

type Props = {
  title: string;
  count?: number;
  badge?: React.ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
};

/** واجهة توافق — الرأس والأدوات من سلطة التخطيط AdminSectionHeader. */
export function AdminSectionToolbar({
  title,
  count,
  badge,
  search,
  onSearchChange,
  searchPlaceholder = "بحث...",
  actions,
  filters,
}: Props) {
  const toolbar =
    onSearchChange || filters ? (
      <>
        {onSearchChange && (
          <input
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="adm-input ast-search"
            aria-label="بحث"
          />
        )}
        {filters}
      </>
    ) : undefined;
  return <AdminSectionHeader title={title} count={count} badge={badge} actions={actions} toolbar={toolbar} />;
}
