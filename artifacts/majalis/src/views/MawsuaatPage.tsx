import { SectionAccordionLayout } from "@/components/SectionAccordionLayout";
import { MAWSUAAT } from "@/lib/mawsuaat-data";
import { accordionExploreLinks } from "@/lib/explore-links";
import { NavigationBar } from "@/design-system";

export default function MawsuaatPage() {
  return (
    <div className="sn-screen">
<NavigationBar title="الموسوعة العملية" large={false} />
    <SectionAccordionLayout
      eyebrow="الموسوعة العملية"
      title="دروس يومية · موقف وحكم · بين أمرين"
      route="/mawsuaat"
      sections={MAWSUAAT}
      relatedLinks={accordionExploreLinks("mawsuaat")}
    />
    </div>
  );
}
