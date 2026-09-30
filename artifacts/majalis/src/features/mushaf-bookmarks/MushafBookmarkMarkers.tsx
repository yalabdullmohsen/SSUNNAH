import { memo, useLayoutEffect, useMemo, useState } from "react";
import {
  getBookmarksOnPage,
  type MyBookmark,
} from "@/lib/quran-my-bookmarks";
import { getBookmarkKindMeta, resolveBookmarkColor } from "@/lib/quran-bookmark-kinds";
import "@/styles/reader-bookmarks.css";

import { Button } from "@/components/ui/button";
type Props = {
  page: number;
  container: HTMLElement | null;
  /** لا تقيس أثناء السحب */
  enabled?: boolean;
  onOpenAyah?: (ayahKey: string) => void;
};

type Marker = {
  id: number;
  ayahKey: string;
  top: number;
  color: string;
  label: string;
  kindLabel: string;
};

/**
 * ألسنة جانبية رفيعة — خارج صندوق النص، بلا تغطية للآية أو تغيير تخطيط المصحف.
 */
export const MushafBookmarkMarkers = memo(function MushafBookmarkMarkers({
  page,
  container,
  enabled = true,
  onOpenAyah,
}: Props) {
  const bookmarks = useMemo(() => getBookmarksOnPage(page), [page]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const dark =
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark");

  useLayoutEffect(() => {
    if (!container || !enabled || bookmarks.length === 0) {
      setMarkers([]);
      return;
    }
    const origin = container.getBoundingClientRect();
    const next: Marker[] = [];
    const seen = new Set<string>();
    for (const b of bookmarks) {
      const dedupe = `${b.kind}:${b.ayahKey}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      const node = container.querySelector<HTMLElement>(
        `[data-verse="${CSS.escape(b.ayahKey)}"]`,
      );
      /* إن لم تُعثر الآية: ألسنة عند هامش الصفحة حسب الترتيب */
      let top: number;
      if (node) {
        const r = node.getBoundingClientRect();
        if (r.height < 1) continue;
        top = r.top - origin.top + r.height / 2;
      } else {
        top = 48 + next.length * 28;
      }
      next.push({
        id: b.id,
        ayahKey: b.ayahKey,
        top,
        color: resolveBookmarkColor(b.kind, b.customColor, dark),
        label: b.customName || b.label,
        kindLabel: getBookmarkKindMeta(b.kind).label,
      });
    }
    setMarkers(next);
  }, [container, enabled, bookmarks, dark]);

  if (!enabled || markers.length === 0) return null;

  return (
    <div className="rb-markers" data-testid="mushaf-bookmark-markers" aria-hidden="false">
      {markers.map((m) => (
        <Button
          key={`${m.id}-${m.ayahKey}`}
          type="button"
          className="rb-markers__tab"
          style={{ top: `${m.top}px`, ["--rb-tab" as string]: m.color }}
          title={m.label}
          aria-label={`${m.kindLabel}: ${m.label}`}
          onClick={() => onOpenAyah?.(m.ayahKey)}
        >
          <span className="rb-markers__tab-chip" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
});

/** للاختبارات — عدد فواصل الصفحة دون DOM */
export function countPageBookmarks(page: number): number {
  return getBookmarksOnPage(page).length;
}

export type { MyBookmark };
