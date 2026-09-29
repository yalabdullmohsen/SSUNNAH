import { SectionAccordionLayout } from "@/components/SectionAccordionLayout";
import { USRA_MUJTAMA } from "@/lib/usra-mujtama-data";
import { accordionExploreLinks } from "@/lib/explore-links";
import { DetailScreen } from "@/components/design-system/screens";

export default function UsraMujtamaPage() {
  return (
    <DetailScreen compose="mark">
    <SectionAccordionLayout
      eyebrow="الأسرة والمجتمع"
      title="العلاقات والأسرة والمسؤولية"
      route="/usra-mujtama"
      sections={USRA_MUJTAMA}
      relatedLinks={accordionExploreLinks("usra")}
    />
    </DetailScreen>
  );
}
