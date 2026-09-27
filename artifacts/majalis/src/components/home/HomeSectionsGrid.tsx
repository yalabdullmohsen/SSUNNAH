/**
 * شبكة أقسام مضغوطة — عمودان · البطاقة كلها قابلة للنقر · بلا CTA منفصل.
 */
import { Link } from "wouter";
import {
  BookMarked,
  BookOpen,
  Clock,
  GraduationCap,
  LayoutGrid,
  Scale,
} from "lucide-react";
import { IA_HOME_PRIMARY } from "@/lib/ia-final-structure";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import "@/styles/components/home-sections-grid.css";

const ICONS = {
  "/quran-hub": BookMarked,
  "/lessons": GraduationCap,
  "/prayer-times": Clock,
  "/fiqh": Scale,
  "/adhkar": BookOpen,
  "/sections": LayoutGrid,
} as const;

function SectionTile({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  const Icon = ICONS[href as keyof typeof ICONS] ?? BookOpen;
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
          aria-label={title}
        >
          <span className="hsg__icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <span className="hsg__copy">
            <strong className="hsg__title">{title}</strong>
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
