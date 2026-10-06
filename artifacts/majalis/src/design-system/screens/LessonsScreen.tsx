import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip, EmptyState, ErrorState, IconLink, LessonCard, NavigationBar, SkeletonCard, type LessonCardData } from "@/design-system";
import { getUnifiedActiveLessons } from "@/lib/lessons-service";
import { fromKuwaitLesson, type UnifiedLesson } from "@/lib/unified-lesson-card";
import { isLocalBookmarked, toggleLocalBookmark } from "@/lib/local-bookmarks";
import { toArabicIndicDigits } from "@/lib/numerals";

const WEEK = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"] as const;
type Mode = "all" | "onsite" | "remote" | "saved";

function weekDays(): Array<{ name: (typeof WEEK)[number]; date: number }> {
  const now = new Date();
  const jsDay = now.getDay(); // 0=الأحد
  const sat = new Date(now);
  sat.setDate(now.getDate() - ((jsDay + 1) % 7));
  return WEEK.map((name, i) => {
    const d = new Date(sat);
    d.setDate(sat.getDate() + i);
    return { name, date: d.getDate() };
  });
}

const isRemote = (l: UnifiedLesson & { hasLiveStream?: boolean; streamUrl?: string }) => Boolean(l.hasLiveStream || l.streamUrl);

export default function LessonsScreen() {
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");
  const [all, setAll] = useState<Array<UnifiedLesson & { hasLiveStream?: boolean; streamUrl?: string }>>([]);
  const [day, setDay] = useState<string>("");
  const [mode, setMode] = useState<Mode>("all");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const days = useMemo(weekDays, []);

  const load = useCallback(() => {
    setState("loading");
    getUnifiedActiveLessons()
      .then(({ lessons }) => {
        const mapped = (Array.isArray(lessons) ? lessons : []).map((l) => ({ ...fromKuwaitLesson(l), hasLiveStream: l.hasLiveStream, streamUrl: l.streamUrl }));
        mapped.sort((a, b) => a.nextOccurrenceMs - b.nextOccurrenceMs);
        setAll(mapped);
        setSaved(Object.fromEntries(mapped.map((l) => [l.id, isLocalBookmarked("lesson", l.id)])));
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);
  useEffect(load, [load]);

  const list = useMemo(
    () =>
      all.filter((l) => {
        if (day && l.day !== day) return false;
        if (mode === "onsite") return !isRemote(l);
        if (mode === "remote") return isRemote(l);
        if (mode === "saved") return Boolean(saved[l.id]);
        return true;
      }),
    [all, day, mode, saved],
  );

  const toData = (l: UnifiedLesson & { hasLiveStream?: boolean; streamUrl?: string }): LessonCardData => ({
    id: l.id, title: l.title, sheikh: l.sheikhName, when: [l.day, l.time].filter(Boolean).join(" · "), place: l.mosque, mode: isRemote(l) ? "عن بُعد" : "حضوري",
  });

  return (
    <div className="sn-screen" data-testid="lessons-screen">
      <NavigationBar title="الدروس" subtitle="دروس علمية موثّقة في الكويت" trailing={<IconLink icon="search" label="بحث" href="/search" />} />
      <div className="sn-container sn-stack">
        <div className="sn-chip-scroller" role="group" aria-label="أيام الأسبوع">
          <Chip selected={day === ""} onClick={() => setDay("")}>كل الأيام</Chip>
          {days.map((d) => (
            <Chip key={d.name} selected={day === d.name} onClick={() => setDay(day === d.name ? "" : d.name)}>
              {d.name} {toArabicIndicDigits(d.date)}
            </Chip>
          ))}
        </div>
        <div className="sn-chip-scroller" role="group" aria-label="تصفية الدروس">
          {([["all", "الكل"], ["onsite", "حضوري"], ["remote", "عن بُعد"], ["saved", "المحفوظ"]] as const).map(([v, label]) => (
            <Chip key={v} selected={mode === v} onClick={() => setMode(v)}>{label}</Chip>
          ))}
        </div>
        {state === "loading" ? <><SkeletonCard /><SkeletonCard /><SkeletonCard /></> : null}
        {state === "error" ? <ErrorState onRetry={load} /> : null}
        {state === "ready" && list.length === 0 ? (
          <EmptyState icon="lessons" title={mode === "saved" ? "لا دروس محفوظة" : "لا دروس مطابقة"} description={mode === "saved" ? "اضغط أيقونة الحفظ على أي درس ليظهر هنا." : "جرّب يومًا آخر أو أزل التصفية."} />
        ) : null}
        {state === "ready" ? list.map((l) => (
          <LessonCard key={l.id} lesson={toData(l)} href={l.detailsHref || `/lessons/${l.id}`} saved={saved[l.id]}
            onSave={() => setSaved((s) => ({ ...s, [l.id]: toggleLocalBookmark({ contentType: "lesson", contentId: l.id, title: l.title, href: `/lessons/${l.id}` }) }))} />
        )) : null}
      </div>
    </div>
  );
}
