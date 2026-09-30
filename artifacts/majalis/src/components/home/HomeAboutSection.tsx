import { Link } from "wouter";
import { BookMarked, GraduationCap, Scale, Users } from "lucide-react";

const PILLARS = [
  {
    Icon: GraduationCap,
    title: "العلم الشرعي الموثّق",
    desc: "محتوى مُراجَع من مصادر معتمدة في القرآن والسنة والفقه والعقيدة",
  },
  {
    Icon: Users,
    title: "علماء متخصصون",
    desc: "أرشيف تراجم العلماء من مختلف العصور والتخصصات",
  },
  {
    Icon: Scale,
    title: "الدقة والأمانة",
    desc: "كل مسألة تُرجَع إلى مصدرها، وكل حكم يُذكر دليله",
  },
  {
    Icon: BookMarked,
    title: "متاح للجميع",
    desc: "من المبتدئ إلى المتخصص، بلغة عربية واضحة وأدوات تفاعلية",
  },
];

export function HomeAboutSection() {
  return (
    <section className="home-about home-section" aria-labelledby="about-home-heading" dir="rtl">
      <div className="home-section-head">
        <div className="home-about__head-row">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20">
            <polygon points="10,1 13,7 20,7 15,12 17,19 10,15 3,19 5,12 0,7 7,7" fill="var(--mj-brand-deep)"/>
            <polygon points="10,4 12.5,8.5 17.5,8.5 13.5,12 15,17 10,14 5,17 6.5,12 2.5,8.5 7.5,8.5" fill="var(--mj-brand-deep)" opacity="0.5"/>
          </svg>
          <div>
            <p className="home-about__eyebrow home-eyebrow">من نحن</p>
            <h2 id="about-home-heading" className="home-about__title">عن سُنّة</h2>
          </div>
        </div>
      </div>

      <div className="home-about__body">
        <p>
          سُنّة منصة إسلامية رقمية متخصصة تجمع طلاب العلم الشرعي وعموم المسلمين في مكان واحد،
          تُقدّم دروساً علمية من مشايخ متخصصين، ومحتوى يومياً في
          القرآن الكريم والسنة النبوية والأذكار والفقه والأحكام الشرعية، كل ذلك بلغة عربية واضحة مع حرص تام
          على الدقة والأمانة في نقل العلم الشرعي.
        </p>
        <p>
          انطلقت المنصة لتكون مرجعاً أميناً يُسهم في نشر العلم الشرعي النافع وتيسير الوصول إليه
          لكل مسلم حيثما كان، مع توفير أدوات عملية كمواقيت الصلاة والمسبحة الرقمية وإذاعات القرآن
          الكريم، وذلك كله خدمةً لدين الله وابتغاءً لمرضاته.
        </p>
      </div>

      <div className="home-about__pillars">
        {PILLARS.map(({ Icon, title, desc }) => (
          <div key={title} className="home-about__pillar">
            <svg
              aria-hidden="true"
              className="home-about__pillar-deco"
              width="60"
              height="60"
              viewBox="0 0 60 60"
            >
              <polygon points="30,3 40,20 57,20 45,33 50,50 30,41 10,50 15,33 3,20 20,20" fill="var(--mj-brand-deep)"/>
            </svg>
            <span className="home-about__pillar-icon">
              <Icon size={15} strokeWidth={2} />
            </span>
            <strong className="home-about__pillar-title">{title}</strong>
            <span className="home-about__pillar-desc">{desc}</span>
          </div>
        ))}
      </div>

      <div className="home-about__actions">
        <Link href="/lessons" className="home-about__cta home-about__cta--primary">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3 1 7l8 4 8-4-8-4z"/><path d="M5 9.5v3.5a4 4 0 0 0 8 0V9.5"/></svg>
          ابدأ من هنا ←
        </Link>
        <Link href="/sitemap" className="home-about__cta home-about__cta--secondary">
          كل الأقسام
        </Link>
      </div>
    </section>
  );
}
