import { useCallback, useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button, Card, ErrorState, EmptyState, IconButton, ListGroup, ListRow, NavigationBar, SkeletonCard, useToast } from "@/design-system";
import { getUnifiedLessonById } from "@/lib/lessons-service";
import type { KuwaitLessonRecord } from "@/lib/kuwait-lessons";
import { isLocalBookmarked, toggleLocalBookmark } from "@/lib/local-bookmarks";
import { S } from "@/design-system/strings";
import { goBackOrFallback } from "@/lib/navigation-back";

function icsFor(l: KuwaitLessonRecord): string {
  const start = new Date(l.nextOccurrenceMs && l.nextOccurrenceMs > 0 ? l.nextOccurrenceMs : Date.now());
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sunnah//Lessons//AR", "BEGIN:VEVENT", `UID:lesson-${l.id}@ssunnah.com`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, ...(l.recurring ? ["RRULE:FREQ=WEEKLY"] : []), `SUMMARY:${l.title}`, `LOCATION:${l.mosque}`, `DESCRIPTION:${l.sheikhName}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}

/** تفاصيل الدرس: عنوان كبير · الشيخ · الموعد · المكان (خرائط) · إضافة للتقويم · مشاركة. */
export default function LessonDetailScreen() {
  const [, params] = useRoute("/lessons/:id");
  const [location, navigate] = useLocation();
  const toast = useToast();
  const id = params?.id ?? "";
  const [state, setState] = useState<"loading" | "error" | "missing" | "ready">("loading");
  const [lesson, setLesson] = useState<KuwaitLessonRecord | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setState("loading");
    getUnifiedLessonById(id)
      .then(({ lesson: l }) => {
        if (!l) return setState("missing");
        setLesson(l);
        setSaved(isLocalBookmarked("lesson", l.id));
        setState("ready");
      })
      .catch(() => setState("error"));
  }, [id]);
  useEffect(load, [load]);

  const addToCalendar = () => {
    if (!lesson) return;
    const blob = new Blob([icsFor(lesson)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lesson-${lesson.id}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(S.lessonDetail_01);
  };
  const share = () => {
    if (!lesson) return;
    const text = `${lesson.title} — ${lesson.sheikhName} — ${lesson.day} ${lesson.time} — ${lesson.mosque}`;
    if (typeof navigator.share === "function") void navigator.share({ title: lesson.title, text, url: window.location.href }).catch(() => undefined);
    else void navigator.clipboard?.writeText(`${text}\n${window.location.href}`).then(() => toast(S.home_14), () => toast(S.home_15, "danger"));
  };

  return (
    <div className="sn-screen" data-testid="lesson-detail-screen">
      <NavigationBar
        title={lesson?.title ?? S.lessonDetail_02}
        leading={<IconButton icon="chevron" label={S.lessonDetail_03} onClick={() => goBackOrFallback(location, "/lessons")} className="sn-back" />}
        trailing={lesson ? <IconButton icon={saved ? "bookmarkFilled" : "bookmark"} label={saved ? S.content_01 : S.content_09} onClick={() => setSaved(toggleLocalBookmark({ contentType: "lesson", contentId: lesson.id, title: lesson.title, href: `/lessons/${lesson.id}` }))} /> : null}
      />
      <div className="sn-container sn-stack sn-stack--lg">
        {state === "loading" ? <SkeletonCard /> : null}
        {state === "error" ? <ErrorState onRetry={load} /> : null}
        {state === "missing" ? <EmptyState icon="lessons" title={S.lessonDetail_04} description={S.lessonDetail_05} action={<Button variant="secondary" onClick={() => navigate("/lessons")}>{S.lessonDetail_06}</Button>} /> : null}
        {state === "ready" && lesson ? (
          <>
            <ListGroup>
              <ListRow icon="user" title={lesson.sheikhName} description={S.lessonDetail_07} />
              <ListRow icon="calendar" title={[lesson.day, lesson.time].filter(Boolean).join(" · ")} description={lesson.recurring ? S.lessonDetail_08 : lesson.gregorianDate} />
              <ListRow icon="location" title={lesson.mosque} description={[lesson.region, lesson.governorate].filter(Boolean).join(" · ")} href={lesson.mapsUrl || undefined} />
            </ListGroup>
            <div className="sn-row">
              <Button variant="primary" icon="calendarAdd" onClick={addToCalendar}>{S.lessonDetail_09}</Button>
              <Button variant="secondary" icon="share" onClick={share}>{S.content_03}</Button>
            </div>
            {lesson.description || lesson.note ? (
              <Card><p className="sn-t-body">{lesson.description || lesson.note}</p></Card>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
