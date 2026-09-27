/**
 * مقترحات من سجل القراءة المحلي — بلا محتوى مخترع.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { getContinueReadingEntries } from "@/lib/continue-reading";
import { getRecentPages } from "@/lib/recent-pages";
import "@/styles/components/home-recommended.css";

type Rec = { href: string; title: string; meta: string };

function buildRecommended(): Rec[] {
  const out: Rec[] = [];
  const seen = new Set<string>();

  for (const e of getContinueReadingEntries(6)) {
    if (e.section === "library") continue;
    const href = e.route;
    if (!href || seen.has(href)) continue;
    seen.add(href);
    out.push({ href, title: e.title, meta: "متابعة" });
  }

  for (const p of getRecentPages(6)) {
    if (seen.has(p.href)) continue;
    seen.add(p.href);
    out.push({ href: p.href, title: p.label, meta: "زيارة سابقة" });
  }

  return out.slice(0, 6);
}

export function HomeRecommended() {
  const [items, setItems] = useState<Rec[]>([]);

  useEffect(() => {
    setItems(buildRecommended());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="hrc" aria-labelledby="home-recommended-title" data-testid="home-recommended">
      <div className="hrc__head">
        <h2 id="home-recommended-title" className="hrc__title">
          مقترح لك
        </h2>
      </div>
      <ul className="hrc__rail">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="hrc__chip">
              <span className="hrc__chip-title">{item.title}</span>
              <span className="hrc__chip-meta">{item.meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
