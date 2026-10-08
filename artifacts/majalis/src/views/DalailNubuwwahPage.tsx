import { SectionAccordionLayout } from "@/components/SectionAccordionLayout";
import { DALAIL_NUBUWWAH } from "@/lib/dalail-nubuwwah-data";
import { accordionExploreLinks } from "@/lib/explore-links";
import { NavigationBar } from "@/design-system";

export default function DalailNubuwwahPage() {
  return (
    <div className="sn-screen">
    <NavigationBar title="دلائل النبوة" large={false} />
    <SectionAccordionLayout
      eyebrow="السيرة والتاريخ"
      title="دلائل النبوة"
      route="/dalail-nubuwwah"
      sections={DALAIL_NUBUWWAH}
      relatedLinks={accordionExploreLinks("dalail")}
    />
    </div>
  );
}
