import { SectionAccordionLayout } from "@/components/SectionAccordionLayout";
import { NavigationBar } from "@/design-system";
import { MAQASID_SHARIA } from "@/lib/maqasid-sharia-data";
import { accordionExploreLinks } from "@/lib/explore-links";

export default function MaqasidShariaPage() {
  return (
    <div className="sn-screen">
    <NavigationBar title="مقاصد الشريعة الإسلامية" large={false} />
    <SectionAccordionLayout
      eyebrow="أصول الفقه"
      title="مقاصد الشريعة الإسلامية"
      route="/maqasid-sharia"
      sections={MAQASID_SHARIA}
      relatedLinks={accordionExploreLinks("maqasid")}
    />
    </div>
  );
}
