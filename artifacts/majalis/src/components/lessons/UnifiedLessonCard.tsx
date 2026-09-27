import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { MoreHorizontal } from "lucide-react";
import { AdminInlineEdit } from "@/components/AdminInlineEdit";
import {
  downloadUnifiedCalendar,
  openLessonExternalUrl,
  prominenceClass,
  type UnifiedLesson,
} from "@/lib/unified-lesson-card";
import { cleanDisplayText } from "@/lib/display-text";
import {
  computeNextOccurrenceMs,
  formatRelativeTimeDetailed,
  formatShortLessonTime,
  hasConfirmedLessonSchedule,
  isKuwaitTomorrow,
  isLessonInProgress,
  isSameKuwaitDay,
} from "@/lib/lesson-time";
import { getLessonDeliveryMode } from "@/lib/lessons/lessonNormalize";
import { looksLikePersonSpeaker } from "@/lib/lesson-speaker-guard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { stashLessonForNavigation } from "@/lib/lessons-service";
import type { KuwaitLessonRecord } from "@/lib/kuwait-lessons";
import { resolveLessonType } from "@/lib/lesson-type";

type Props = {
  lesson: UnifiedLesson;
  compact?: boolean;
  showRegister?: boolean;
  registered?: boolean;
  onToggleRegister?: () => void;
};

function unifiedToStashRecord(lesson: UnifiedLesson): KuwaitLessonRecord {
  return {
    id: lesson.id,
    title: lesson.title,
    sheikhName: lesson.sheikhName,
    organizerName: lesson.organizerName,
    sheikhImage: lesson.sheikhImage,
    category: lesson.category,
    day: lesson.day,
    time: lesson.scheduleTime || lesson.time,
    mosque: lesson.mosque,
    region: lesson.region,
    governorate: lesson.governorate,
    sortKey: lesson.sortKey,
    nextOccurrenceMs: lesson.nextOccurrenceMs,
    note: lesson.note,
    description: lesson.description,
    gregorianDate: lesson.gregorianDate,
    hijriDate: lesson.hijriDate,
    activityType: lesson.activityType || "درس",
    sessionCount: lesson.sessionCount,
    linkedLessons: lesson.linkedLessons,
    hasLiveStream: lesson.hasLiveStream,
    hasRecording: lesson.hasRecording,
    recordingUrl: lesson.recordingUrl,
    mapsUrl: lesson.mapsUrl,
    streamUrl: lesson.streamUrl,
    siteUrl: lesson.siteUrl,
    keywords: lesson.keywords,
  };
}

function FactRow({ label, value }: { label: string; value?: string | null }) {
  const text = value != null && value !== "" ? cleanDisplayText(String(value)) : "";
  if (!text) return null;
  return (
    <div className="lesson-unified-card__fact">
      <span className="lesson-unified-card__fact-label">{label}</span>
      <span className="lesson-unified-card__fact-value">{text}</span>
    </div>
  );
}

export const UnifiedLessonCard = memo(function UnifiedLessonCard({
  lesson,
  compact = false,
  showRegister,
  registered,
  onToggleRegister,
}: Props) {
  const scheduleTime = lesson.scheduleTime || lesson.time;
  const scheduleConfirmed = hasConfirmedLessonSchedule(lesson.day || "", scheduleTime || "");
  const [statusLabel, setStatusLabel] = useState(
    scheduleConfirmed ? lesson.statusLabel : "الوقت قيد التأكيد",
  );
  const [nowLive, setNowLive] = useState(() => isLessonInProgress(lesson.day, scheduleTime));
  const [isToday, setIsToday] = useState(() =>
    isSameKuwaitDay(lesson.nextOccurrenceMs || lesson.sortKey || Date.now()),
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (lesson.featuredHomeStatus === "مستمر") {
      setNowLive(true);
      setStatusLabel("مستمر");
      setIsToday(true);
      return;
    }
    if (!scheduleConfirmed) {
      setNowLive(false);
      setStatusLabel("الوقت قيد التأكيد");
      setIsToday(false);
      return;
    }
    function refresh() {
      const live = isLessonInProgress(lesson.day, scheduleTime);
      const freshMs = computeNextOccurrenceMs(lesson.day, scheduleTime);
      setNowLive(live);
      setIsToday(isSameKuwaitDay(freshMs));
      if (live) {
        setStatusLabel("الآن");
        return;
      }
      if (isSameKuwaitDay(freshMs)) {
        const detailed = formatRelativeTimeDetailed(freshMs, scheduleTime);
        setStatusLabel(detailed === "انتهى" ? "اليوم" : detailed.startsWith("بعد") ? detailed : "اليوم");
        return;
      }
      if (isKuwaitTomorrow(freshMs)) {
        setStatusLabel("غداً");
        return;
      }
      setStatusLabel(formatRelativeTimeDetailed(freshMs, scheduleTime));
    }
    refresh();
    const earlyTimer = window.setTimeout(refresh, 5_000);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.clearTimeout(earlyTimer);
      window.clearInterval(timer);
    };
  }, [lesson.day, scheduleTime, lesson.featuredHomeStatus, scheduleConfirmed]);

  const lessonType = useMemo(
    () =>
      resolveLessonType({
        category: lesson.category,
        title: lesson.title,
        keywords: lesson.keywords,
        activityType: lesson.activityType,
      }),
    [lesson.category, lesson.title, lesson.keywords, lesson.activityType],
  );

  const delivery = useMemo(
    () =>
      getLessonDeliveryMode({
        mosque: lesson.mosque,
        region: lesson.region,
        hasLiveStream: lesson.hasLiveStream,
        streamUrl: lesson.streamUrl,
      }),
    [lesson.mosque, lesson.region, lesson.hasLiveStream, lesson.streamUrl],
  );

  const displayDay = cleanDisplayText(lesson.day || "");
  const displayDate = cleanDisplayText(lesson.gregorianDate || "");
  const displayTime = scheduleConfirmed
    ? cleanDisplayText(lesson.time || formatShortLessonTime(scheduleTime) || scheduleTime || "")
    : "";
  const displayPlace = cleanDisplayText(
    [lesson.mosque, lesson.region].filter(Boolean).join(" — "),
  );
  const scheduleValue = scheduleConfirmed
    ? [displayDay || displayDate, displayTime].filter(Boolean).join(" · ")
    : [displayDay || displayDate, "قيد التأكيد"].filter(Boolean).join(" · ");

  const sheikhLabel =
    lesson.sheikhName && looksLikePersonSpeaker(lesson.sheikhName)
      ? lesson.sheikhName.replace(/^الشيخ(?:ة)?:\s*/u, "")
      : lesson.mosque
        ? `محاضرو ${lesson.mosque}`
        : "المحاضر غير مذكور";

  const prominence = prominenceClass(lesson.sortKey, lesson.archived);
  const todayClass =
    isToday || nowLive || prominence.includes("--today") ? " lesson-unified-card--today" : "";

  const hasOverflow =
    Boolean(lesson.streamUrl) ||
    Boolean(lesson.mapsUrl) ||
    Boolean(showRegister && onToggleRegister) ||
    !compact;

  return (
    <article
      data-cs-card="1"
      data-cs-type="lesson"
      data-lesson-type={lessonType.id}
      className={`lesson-unified-card soft-card soft-card--on-light cs-card card-v2 lesson-unified-card--dense${compact ? " lesson-unified-card--compact" : ""}${todayClass} ${prominence}`.trim()}
    >
      <header className="lesson-unified-card__header">
        <div className="lesson-unified-card__badges">
          <span className="lesson-unified-card__type">{lessonType.label}</span>
          {delivery ? <span className="lesson-unified-card__delivery">{delivery}</span> : null}
          {isToday || nowLive ? (
            <span className="lesson-unified-card__today-flag" aria-label="موعده اليوم">
              اليوم
            </span>
          ) : null}
        </div>
        {nowLive && !lesson.featuredHomeStatus ? (
          <span className="lesson-now-badge" role="status" aria-label="الدرس جارٍ الآن">
            <span aria-hidden="true">●</span> الآن
          </span>
        ) : (
          <span className="lesson-unified-card__status">{statusLabel}</span>
        )}
      </header>

      <div className="lesson-unified-card__body">
        <h3 className="lesson-unified-card__title">{lesson.title}</h3>
        <p className="lesson-unified-card__sheikh">{sheikhLabel}</p>

        <div className="lesson-unified-card__facts" aria-label="معلومات الدرس">
          <FactRow label="الموعد" value={scheduleValue || undefined} />
          <FactRow label="المكان" value={displayPlace || undefined} />
        </div>

        <div
          className={`lesson-unified-card__actions${compact ? " lesson-unified-card__actions--compact" : ""}`}
        >
          {lesson.detailsHref ? (
            <Link
              href={lesson.detailsHref}
              className="lesson-unified-card__btn lesson-unified-card__btn--primary"
              onClick={() => stashLessonForNavigation(unifiedToStashRecord(lesson))}
              onPointerEnter={() => {
                void import("@/pages/lessons/LessonDetailPage").catch(() => undefined);
              }}
            >
              التفاصيل
            </Link>
          ) : null}

          <div className="lesson-unified-card__actions-secondary">
            <FavoriteButton
              contentType="lesson"
              contentId={lesson.id}
              compact
              className="lesson-unified-card__btn lesson-unified-card__btn--secondary"
            />
            {hasOverflow ? (
              <div className="lesson-unified-card__overflow">
                <button
                  type="button"
                  className="lesson-unified-card__btn lesson-unified-card__btn--secondary lesson-unified-card__more"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="المزيد من الإجراءات"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <MoreHorizontal size={18} strokeWidth={2} aria-hidden="true" />
                </button>
                {menuOpen ? (
                  <div className="lesson-unified-card__menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      className="lesson-unified-card__menu-item"
                      onClick={() => {
                        downloadUnifiedCalendar(lesson);
                        setMenuOpen(false);
                      }}
                    >
                      التقويم
                    </button>
                    {lesson.streamUrl ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="lesson-unified-card__menu-item"
                        onClick={() => {
                          openLessonExternalUrl(lesson.streamUrl!);
                          setMenuOpen(false);
                        }}
                      >
                        رابط البث
                      </button>
                    ) : null}
                    {lesson.mapsUrl ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="lesson-unified-card__menu-item"
                        onClick={() => {
                          openLessonExternalUrl(lesson.mapsUrl!);
                          setMenuOpen(false);
                        }}
                      >
                        الموقع
                      </button>
                    ) : null}
                    {showRegister && onToggleRegister ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="lesson-unified-card__menu-item"
                        onClick={() => {
                          onToggleRegister();
                          setMenuOpen(false);
                        }}
                      >
                        {registered ? "إلغاء التسجيل" : "سجّل حضوري"}
                      </button>
                    ) : null}
                    {!compact ? (
                      <AdminInlineEdit
                        contentType="lesson"
                        contentId={lesson.id}
                        initialData={{
                          title: lesson.title,
                          category: lesson.category,
                          mosque: lesson.mosque,
                          region: lesson.region,
                          day_of_week: lesson.day,
                          lesson_time: lesson.time,
                          description: lesson.description,
                        }}
                        className="lesson-unified-card__menu-item"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className="lesson-unified-card__btn lesson-unified-card__btn--secondary"
                onClick={() => downloadUnifiedCalendar(lesson)}
              >
                التقويم
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export default UnifiedLessonCard;
