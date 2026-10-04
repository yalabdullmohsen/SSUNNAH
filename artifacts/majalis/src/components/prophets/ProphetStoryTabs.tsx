/**
 * تبويبات قراءة قصة النبي — واجهة فوق ContentTabs (TAB authority).
 * RTL · قابل للتمرير · هدف لمس ≥44×44 · مؤشر للحالة النشطة.
 */
import { ContentTabs } from "@/components/design-system/TabSystem";

export type ProphetStoryTab = {
  id: string;
  label: string;
};

type Props = {
  tabs: ProphetStoryTab[];
  activeId: string;
  onSelect: (id: string) => void;
};

export function ProphetStoryTabs({ tabs, activeId, onSelect }: Props) {
  if (!tabs.length) return null;

  return (
    <nav
      className="prophet-story-tabs prophet-detail-toc"
      data-component="ProphetStoryTabs"
      data-testid="prophet-story-tabs"
      aria-label="أقسام القصة"
    >
      <ContentTabs
        className="prophet-story-tabs__track prophet-detail-toc__track"
        ariaLabel="أقسام القصة"
        idPrefix="prophet"
        variant="pill"
        value={activeId}
        onChange={onSelect}
        items={tabs.map((tab) => ({ id: tab.id, label: tab.label }))}
      />
    </nav>
  );
}
