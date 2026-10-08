import { useEffect } from "react";
import { CalendarDays, Clock, Repeat, Zap } from "lucide-react";
import { applyPageSeo } from "@/lib/seo";
import { ListGroup, ListRow, NavigationBar } from "@/design-system";

const CARDS = [
  {
    href: "/quran/worship-hub?surah=1",
    title: "مركز العبادة القرآنية",
    desc: "مواقيت الصلاة، تحفيظ A-B، وتنزيل التلاوات أوفلاين",
    Icon: Clock,
  },
  {
    href: "/quran-memorization",
    title: "اختبارات الحفظ",
    desc: "أنواع متعددة من اختبارات الحفظ القرآني",
    Icon: Zap,
  },
  {
    href: "/quran/hifz-loop?surah=1",
    title: "مشغّل التحفيظ",
    desc: "تكرار A-B مع تظليل الآية وتعديل السرعة",
    Icon: Repeat,
  },
  {
    href: "/quran/memorization-plans",
    title: "خطط الحفظ والمراجعة",
    desc: "خطط مرنة للحفظ والمراجعة والتثبيت",
    Icon: CalendarDays,
  },
];

export default function MemorizationHubPage() {
  useEffect(() => {
    applyPageSeo({
      path: "/memorization",
      title: "الحفظ والمراجعة | سُنّة",
      description: "اختبارات الحفظ وخطط الحفظ والمراجعة في قسم موحّد.",
    });
  }, []);
  return (
    <div className="sn-screen">
      <NavigationBar title="الحفظ والمراجعة" subtitle="اختبارات الحفظ وخطط الحفظ والمراجعة في قسم موحّد." />
      <div className="sn-container sn-stack sn-stack--lg">
        <ListGroup>
          {CARDS.map(({ href, title, desc, Icon }) => (
            <ListRow key={href} href={href} title={title} description={desc} iconNode={<Icon size={20} aria-hidden />} />
          ))}
        </ListGroup>
      </div>
    </div>
  );
}
