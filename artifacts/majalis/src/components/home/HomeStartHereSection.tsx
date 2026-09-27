import { Link } from "wouter";
import { HOME_START_HERE_COPY } from "./home-start-here-data";

/**
 * بطاقة الزائر الجديد — مضغوطة: عنوان + جملة + CTA واحد.
 * بلا شبكة خطوات عملاقة تستهلك الشاشة الأولى.
 */
export function HomeStartHereSection() {
  return (
    <section aria-label="ابدأ من هنا" className="home-start-here home-start-here--compact home-start-here--slim">
      <div className="hsh-header">
        <span className="hsh-eyebrow">{HOME_START_HERE_COPY.eyebrow}</span>
        <h2 className="hsh-title">{HOME_START_HERE_COPY.title}</h2>
        <p className="hsh-lead">{HOME_START_HERE_COPY.lead}</p>
        <div className="hsh-actions">
          <Link href="/lessons" className="hsh-actions__primary">
            {HOME_START_HERE_COPY.primaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
