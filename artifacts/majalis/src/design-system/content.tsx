import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Icon, type DsIconName } from "./Icon";
import { Badge, Card, IconButton } from "./primitives";
import { Switch } from "./navigation";
import { toArabicIndicDigits, toLatinDigits } from "@/lib/numerals";
import { cn } from "@/lib/utils";

type ActionHandlers = { onSave?: () => void; onShare?: () => void; saved?: boolean };

function CardActions({ onSave, onShare, saved }: ActionHandlers) {
  if (!onSave && !onShare) return null;
  return (
    <span className="sn-card-actions">
      {onSave ? <IconButton icon={saved ? "bookmarkFilled" : "bookmark"} label={saved ? "إزالة من المحفوظات" : "حفظ"} size={20} onClick={onSave} /> : null}
      {onShare ? <IconButton icon="share" label="مشاركة" size={20} onClick={onShare} /> : null}
    </span>
  );
}

/** مرجع آية بصيغة «البقرة: ٢٥٥» بأرقام عربية. */
export function formatAyahRef(surah: string, ayah: number | string): string {
  return `${surah}: ${toArabicIndicDigits(ayah)}`;
}

/** بطاقة حديث — Sunnah Text 20/1.9 (أو 24 للمميّز) + مرجع بخط الواجهة. */
export function HadithCard({ text, source, featured, ...actions }: { text: string; source?: string; featured?: boolean } & ActionHandlers) {
  return (
    <Card variant={featured ? "featured" : "standard"} className="sn-hadith-card" aria-label="حديث">
      <p className={cn("sn-hadith-card__text", featured ? "sn-t-hadith-featured" : "sn-t-hadith")}>{text}</p>
      <div className="sn-card-ref">
        <span>{source}</span>
        <CardActions {...actions} />
      </div>
    </Card>
  );
}

/** بطاقة آية — Sunnah Quran 24/2.0 (ارتفاع السطر يحمي التشكيل) + مرجع «السورة: رقم». */
export function AyahCard({ text, surah, ayah, ...actions }: { text: string; surah: string; ayah: number | string } & ActionHandlers) {
  return (
    <Card variant="featured" className="sn-ayah-card" aria-label="آية">
      <p className="sn-ayah-card__text sn-t-ayah" lang="ar">{text}</p>
      <div className="sn-card-ref">
        <span>{formatAyahRef(surah, ayah)}</span>
        <CardActions {...actions} />
      </div>
    </Card>
  );
}

export type LessonCardData = {
  id: string;
  title: string;
  sheikh: string;
  when?: string;
  place?: string;
  mode?: "حضوري" | "عن بُعد";
};

/** بطاقة درس موحّدة — تُستعمل في الرئيسية والدروس والبحث. */
export function LessonCard({ lesson, href, saved, onSave }: { lesson: LessonCardData; href: string; saved?: boolean; onSave?: () => void }) {
  return (
    <article className="sn-card sn-lesson-card">
      <Link href={href} className="sn-lesson-card__link">
        <span className="sn-t-headline">{lesson.title}</span>
      </Link>
      <span className="sn-t-subhead sn-t-secondary">{lesson.sheikh}</span>
      <div className="sn-lesson-card__meta">
        {lesson.when ? <span className="sn-meta-item"><Icon name="clock" size={20} />{lesson.when}</span> : null}
        {lesson.place ? <span className="sn-meta-item"><Icon name="location" size={20} />{lesson.place}</span> : null}
        {lesson.mode ? <Badge>{lesson.mode}</Badge> : null}
        {onSave ? <IconButton icon={saved ? "bookmarkFilled" : "bookmark"} label={saved ? "إزالة الدرس من المحفوظات" : "حفظ الدرس"} size={20} onClick={onSave} /> : null}
      </div>
    </article>
  );
}

/** صف وقت صلاة مع مفتاح تنبيه. */
export function PrayerTimeRow({ name, time, next, alarm, onAlarmChange }: { name: string; time: string; next?: boolean; alarm?: boolean; onAlarmChange?: (v: boolean) => void }) {
  return (
    <div className="sn-prayer-row" data-next={next ? "true" : undefined}>
      <span className="sn-prayer-row__name">{name}{next ? <> <Badge tone="success">القادمة</Badge></> : null}</span>
      <time className="sn-prayer-row__time">{time}</time>
      {onAlarmChange ? <Switch checked={!!alarm} onChange={onAlarmChange} label={`تنبيه ${name}`} /> : null}
    </div>
  );
}

function pad(n: number) {
  return toArabicIndicDigits(String(Math.max(0, n)).padStart(2, "0"));
}

function CountdownView({ h, m, s }: { h: number; m: number; s: number }) {
  const parts: Array<[number, string]> = [[h, "ساعة"], [m, "دقيقة"], [s, "ثانية"]];
  return (
    <span className="sn-countdown" role="timer" aria-label={`متبقٍ ${h} ساعة و${m} دقيقة`}>
      {parts.map(([v, label], i) => (
        <span key={label} className="sn-countdown__unit">
          <span>{pad(v)}{i < 2 ? <span className="sn-countdown__sep">:</span> : null}</span>
          <span className="sn-countdown__label">{label}</span>
        </span>
      ))}
    </span>
  );
}

/** عدّاد تنازلي حيّ إلى لحظة محددة (ساعات : دقائق : ثوانٍ) بأرقام ثابتة العرض. */
export function Countdown({ target, onElapsed }: { target: Date; onElapsed?: () => void }) {
  const [left, setLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, target.getTime() - Date.now());
      setLeft(ms);
      if (ms === 0) onElapsed?.();
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, onElapsed]);
  const s = Math.floor(left / 1000);
  return <CountdownView h={Math.floor(s / 3600)} m={Math.floor((s % 3600) / 60)} s={s % 60} />;
}

/** عرض عدّ جاهز بصيغة HH:MM:SS (من مزوّد المواقيت المشترك — بلا إعادة حساب). */
export function CountdownHms({ hms }: { hms: string }) {
  const [h = 0, m = 0, s = 0] = toLatinDigits(hms).split(":").map((x) => Number.parseInt(x, 10) || 0);
  return <CountdownView h={h} m={m} s={s} />;
}

export type QuickItem = { id: string; label: string; href: string; icon: DsIconName };

/** شبكة الوصول السريع 4×2. */
export function QuickGrid({ items }: { items: readonly QuickItem[] }) {
  return (
    <nav className="sn-quick-grid" aria-label="وصول سريع">
      {items.map((it) => (
        <Link key={it.id} href={it.href} className="sn-quick-item sn-pressable">
          <span className="sn-quick-item__icon"><Icon name={it.icon} size={24} /></span>
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function Hscroll({ children, label }: { children: ReactNode; label: string }) {
  return <div className="sn-hscroll" role="list" aria-label={label}>{children}</div>;
}
