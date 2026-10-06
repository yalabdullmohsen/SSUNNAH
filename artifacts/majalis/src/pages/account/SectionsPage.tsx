/**
 * صفحة /sections — لوبي موحّد بلا لافتة وبلا بحث محلي.
 * عنوان كبير واحد (iOS Large Title) من رأس اللوبي — بلا رأس صفحة مكرّر.
 */
import { useEffect } from "react";
import { applyPageSeo } from "@/lib/seo";
import { MoreHubFromRegistry } from "@/features/more/MoreHubFromRegistry";
import { GridScreen } from "@/components/design-system/screens";
import "@/components/sections/section-cards.css";
import "@/styles/pages/lessons-sections-v2.css";
import "@/styles/sunnah-identity-sections.css";

export default function SectionsPage() {
  useEffect(() => {
    applyPageSeo({
      title: "الأقسام — سُنّة",
      description:
        "أقسام سُنّة: العلوم الشرعية، القصص، الدعوة، العبادة، التعلّم، والحساب.",
      path: "/sections",
    });
  }, []);

  return (
    <GridScreen compose="mark" columns={2}>
      <MoreHubFromRegistry />
    </GridScreen>
  );
}
