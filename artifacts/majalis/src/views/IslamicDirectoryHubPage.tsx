import { Landmark, MapPin, GraduationCap } from "lucide-react";
import MergedSectionHubPage from "@/views/MergedSectionHubPage";
import contentCounts from "@/data/content-counts.json";
import { toArabicDigits } from "@/lib/utils";
import { NavigationBar } from "@/design-system";

export default function IslamicDirectoryHubPage() {
  const universities = toArabicDigits(contentCounts.universities ?? 0);
  const institutions = toArabicDigits(contentCounts.institutions ?? 0);
  const landmarks = toArabicDigits(contentCounts.landmarks ?? 0);

  return (
    <div className="sn-screen">
    <NavigationBar title="الدليل الإسلامي" large={false} />
    <MergedSectionHubPage
      path="/islamic-directory"
      title="الدليل الإسلامي"
      description="دليل موحّد للجامعات الشرعية والمؤسسات الإسلامية والمساجد والمشاهد التاريخية — بهوية واحدة وبيانات مُدقَّقة."
      cards={[
        {
          href: "/universities",
          title: "دليل الجامعات والكليات الشرعية",
          desc: `${universities} جامعة ومعهدًا — برامج وأسئلة شائعة ومقارنة`,
          Icon: GraduationCap,
        },
        {
          href: "/institutions",
          title: "المؤسسات الإسلامية",
          desc: `${institutions} مؤسسة — مساجد ومكتبات ومراكز وهيئات`,
          Icon: Landmark,
        },
        {
          href: "/islamic-landmarks",
          title: "المساجد والمشاهد",
          desc: `${landmarks} معلمًا على الخريطة عبر العصور الإسلامية`,
          Icon: MapPin,
        },
      ]}
    />
    </div>
  );
}
