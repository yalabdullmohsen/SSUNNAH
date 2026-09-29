import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { KuwaitLessonRecord } from "@/lib/kuwait-lessons";
import { formatSheikhName } from "@/lib/sheikh-name";
import { isOnlineVenue } from "@/lib/lessons/lessonNormalize";
import { computeNextOccurrenceMs, isSameKuwaitDay, isSameKuwaitWeek } from "@/lib/lesson-time";
import { isWomenFriendlyLesson } from "@/lib/lesson-women-attendance";

export type LessonQuickFilterId =
  | "all"
  | "lessons"
  | "courses"
  | "in_person"
  | "remote"
  | "archive"
  | "today"
  | "this_week"
  | "women";

export type LessonQuickFilters = {
  schedule: LessonQuickFilterId;
  sheikh: string;
  category: string;
};

export const DEFAULT_LESSON_QUICK_FILTERS: LessonQuickFilters = {
  schedule: "all",
  sheikh: "كل المشايخ",
  category: "الكل",
};

/** فلاتر سريعة — شريط أفقي لاصق: زمن → حضور → نوع */
const SCHEDULE_CHIPS: Array<{ id: LessonQuickFilterId; label: string }> = [
  { id: "all", label: "الكل" },
  { id: "today", label: "اليوم" },
  { id: "this_week", label: "هذا الأسبوع" },
  { id: "in_person", label: "حضوري" },
  { id: "remote", label: "عن بعد" },
  { id: "lessons", label: "دروس" },
  { id: "courses", label: "دورات" },
  { id: "archive", label: "أرشيف" },
];

export const LESSON_WEEK_FILTER_LABEL = "هذا الأسبوع";

function isStandaloneLesson(lesson: KuwaitLessonRecord): boolean {
  return !(lesson.isCourse || lesson.activityType === "دورة");
}

export function applyLessonQuickFilters(
  lessons: KuwaitLessonRecord[],
  filters: LessonQuickFilters,
  nowMs = Date.now(),
): KuwaitLessonRecord[] {
  if (filters.schedule === "archive") return [];

  return lessons.filter((lesson) => {
    const nextMs = lesson.nextOccurrenceMs ?? computeNextOccurrenceMs(lesson.day, lesson.time);
    const inPerson = Boolean(lesson.mosque?.trim()) && !isOnlineVenue(lesson.mosque, lesson.region);
    const remote =
      Boolean(lesson.hasLiveStream || lesson.streamUrl) || isOnlineVenue(lesson.mosque, lesson.region);

    if (filters.schedule === "in_person" && !inPerson) return false;
    if (filters.schedule === "remote" && !remote) return false;
    if (filters.schedule === "today" && !isSameKuwaitDay(nextMs, nowMs)) return false;
    if (filters.schedule === "this_week" && !isSameKuwaitWeek(nextMs, nowMs)) return false;
    if (filters.schedule === "courses" && !(lesson.isCourse || lesson.activityType === "دورة")) {
      return false;
    }
    if (filters.schedule === "lessons" && !isStandaloneLesson(lesson)) return false;
    if (filters.schedule === "women" && !isWomenFriendlyLesson(lesson)) return false;

    if (filters.sheikh !== "كل المشايخ") {
      const target = formatSheikhName(filters.sheikh) || filters.sheikh;
      const name = formatSheikhName(lesson.sheikhName) || lesson.sheikhName;
      if (name !== target) return false;
    }
    if (filters.category !== "الكل" && lesson.category !== filters.category) return false;
    return true;
  });
}

type Props = {
  lessons: KuwaitLessonRecord[];
  filters: LessonQuickFilters;
  onChange: (next: LessonQuickFilters) => void;
  searchSlot?: ReactNode;
  filterSlot?: ReactNode;
};

export function LessonFilters({ filters, onChange, searchSlot, filterSlot }: Props) {
  const hasTools = Boolean(searchSlot || filterSlot);
  return (
    <div className="lesson-filters lesson-filters--compact lesson-filters--sticky-rail">
      <div className="lesson-filters__bar" role="toolbar" aria-label="تصفية سريعة">
        <div className="lesson-filters__chips filter-chips" data-lesson-filter-rail="1">
          {SCHEDULE_CHIPS.map((chip) => (
            <Button
              key={chip.id}
              type="button"
              variant="ghost"
              className={`filter-chips__chip${filters.schedule === chip.id ? " is-active" : ""}`}
              aria-pressed={filters.schedule === chip.id}
              onClick={() => onChange({ ...filters, schedule: chip.id })}
            >
              <span className="filter-chips__label">{chip.label}</span>
            </Button>
          ))}
        </div>
        {hasTools ? (
          <div className="lesson-filters__tools" aria-label="حسب الشيخ والفئة والمزيد">
            {searchSlot}
            {filterSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
}
