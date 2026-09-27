import { useEffect, useState } from "react";
import { Link } from "wouter";
import { History } from "lucide-react";
import { getRecentPages, type RecentPage } from "@/lib/recent-pages";
import "@/styles/components/home-recent-rail.css";

function pathMeta(href: string): string {
  if (href.startsWith("/mushaf")) return "مصحف";
  if (href.startsWith("/lessons")) return "درس";
  if (href.startsWith("/adhkar")) return "أذكار";
  if (href.startsWith("/hadith")) return "حديث";
  if (href.startsWith("/tarikh")) return "تاريخ";
  if (href.startsWith("/prophets")) return "أنبياء";
  if (href.startsWith("/fiqh")) return "فقه";
  if (href.startsWith("/search")) return "بحث";
  return "صفحة";
}

/** نشاط أخير — شريط أفقي؛ يُخفى إن لم توجد زيارات */
export function HomeRecentPagesBar() {
  const [pages, setPages] = useState<RecentPage[]>([]);
  useEffect(() => {
    setPages(getRecentPages(8));
  }, []);
  if (pages.length < 1) return null;
  return (
    <section className="hrr" aria-labelledby="home-recent-title" data-testid="home-recent-rail">
      <div className="hrr__head">
        <History size={16} strokeWidth={1.8} aria-hidden="true" />
        <h2 id="home-recent-title" className="hrr__title">
          نشاط أخير
        </h2>
      </div>
      <ul className="hrr__rail">
        {pages.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="hrr__chip">
              <span className="hrr__chip-title">{p.label}</span>
              <span className="hrr__chip-meta">{pathMeta(p.href)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
