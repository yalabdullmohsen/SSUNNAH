import { useMemo } from "react";
import { Button, Card, CountdownHms, Icon, Skeleton } from "@/design-system";
import { useSharedPrayerCountdownLive, useSharedPrayerData } from "@/components/prayer/PrayerCountdownProvider";
import { formatTime12 } from "@/lib/prayer-times";
import { S } from "@/design-system/strings";

/** بطاقة Hero للصلاة القادمة: الاسم + عدّاد حيّ + المدينة + مواقيت اليوم الخمس. */
export function PrayerHero() {
  const { data, loading } = useSharedPrayerData();
  const live = useSharedPrayerCountdownLive();
  const five = useMemo(() => (data?.prayers ?? []).filter((p) => p.obligatory), [data]);
  if (!data && loading) return <Card variant="hero" aria-busy="true"><Skeleton shape="block" /></Card>;
  if (!data || !live?.next) {
    return (
      <Card variant="hero">
        <p className="sn-t-headline">{S.prayerHero_01}</p>
        <p className="sn-t-subhead">{S.prayerHero_02}</p>
        <Button variant="on-hero" size="m" onClick={() => { window.location.assign("/prayer-times"); }}>{S.prayerHero_03}</Button>
      </Card>
    );
  }
  return (
    <Card variant="hero" aria-label={S.prayerHero_04}>
      <div className="sn-spot-head">
        <div>
          <p className="sn-t-footnote sn-spot-kicker">{S.prayerHero_04}</p>
          <p className="sn-t-title1">{live.next.name}</p>
        </div>
        <span className="sn-meta-item sn-t-footnote"><Icon name="location" size={20} />{data.city}</span>
      </div>
      <div className="sn-spot-count"><CountdownHms hms={live.remainingHms} /></div>
      <ul className="sn-prayer-strip" aria-label={S.prayerHero_05}>
        {five.map((p) => (
          <li key={p.key} className="sn-prayer-strip__item" data-next={p.key === live.next?.key ? "true" : undefined}>
            <span className="sn-t-caption">{p.name}</span>
            <span className="sn-t-footnote sn-num">{formatTime12(p.time24)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

