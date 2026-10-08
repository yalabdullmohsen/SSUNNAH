import { SectionAccordionLayout } from "@/components/SectionAccordionLayout";
import { NavigationBar } from "@/design-system";
import { USRA_MUJTAMA } from "@/lib/usra-mujtama-data";
import { accordionExploreLinks } from "@/lib/explore-links";

export default function UsraMujtamaPage() {
  return (
    <div className="sn-screen">
    <NavigationBar title="العلاقات والأسرة والمسؤولية" large={false} />
    <SectionAccordionLayout
      eyebrow="الأسرة والمجتمع"
      title="العلاقات والأسرة والمسؤولية"
      route="/usra-mujtama"
      sections={USRA_MUJTAMA}
      relatedLinks={accordionExploreLinks("usra")}
    />
    </div>
  );
}
