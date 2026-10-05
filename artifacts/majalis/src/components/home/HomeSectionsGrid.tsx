/**
 * شبكة أقسام مضغوطة — عمودان · البطاقة كلها قابلة للنقر · بلا CTA منفصل.
 */
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { IA_HOME_PRIMARY } from "@/lib/ia-final-structure";
import { getSectionByRoute } from "@/config/sections.registry";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import "@/styles/components/home-sections-grid.css";

function SectionTile({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  /* الاسم والأيقونة من سجل الأقسام — نفس ما تعرضه القوائم وصفحة الأقسام */
  const section = getSectionByRoute(href);
  const Icon = section?.icon ?? BookOpen;
  const label = section?.label ?? title;
  const { ref, onPointerEnter, onPointerDown, onFocus } = usePrefetchRoute(href);
  return (
    <li>
      <div ref={ref}>
        <Link
          href={href}
          className="hsg__card"
          onPointerEnter={onPointerEnter}
          onPointerDown={onPointerDown}
          onFocus={onFocus}
          aria-label={label}
        >
          <span className="hsg__icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <span className="hsg__copy">
            <strong className="hsg__title">{label}</strong>
            <span className="hsg__desc">{desc}</span>
          </span>
        </Link>
      </div>
    </li>
  );
}

export function HomeSectionsGrid() {
  return (
    <section
      className="hsg home-primary-portals home-primary-portals--compact"
      aria-label="الأقسام الرئيسية"
      data-testid="home-primary-portals"
    >
      <div className="hsg__head">
        <h2 className="hsg__heading">الأقسام الرئيسية</h2>
      </div>
      <ul className="hsg__grid ss-feature-grid" data-cards-grid="1">
        {IA_HOME_PRIMARY.map((item) => (
          <SectionTile key={item.href} href={item.href} title={item.title} desc={item.desc} />
        ))}
      </ul>
    </section>
  );
}
