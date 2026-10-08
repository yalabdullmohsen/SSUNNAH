import { LazySectionAccordionPage } from "@/components/LazySectionAccordionPage";
import { NavigationBar } from "@/design-system";

export default function ImanTopicsPage() {
  return (
    <div className="sn-screen">
    <NavigationBar title="الإيمان بالله وعالم الغيب" large={false} />
    <LazySectionAccordionPage
      eyebrow="الإيمان والعقيدة"
      title="الإيمان بالله وعالم الغيب"
      route="/iman-topics"
      exportName="IMAN_TOPICS"
      relatedKey="iman"
      load={() => import("@/lib/iman-topics-data")}
    />
    </div>
  );
}
