import { useEffect, useState } from "react";
import { Badge, IconLink, ListGroup, ListRow, NavigationBar, PrayerTimeRow, SectionHeader } from "@/design-system";
import { PrayerHero } from "./PrayerHero";
import { useSharedPrayerCountdownLive, useSharedPrayerData } from "@/components/prayer/PrayerCountdownProvider";
import { formatTime12 } from "@/lib/prayer-times";
import { loadPrayerAlertPrefs, patchPrayerAlertPrefs } from "@/lib/prayer-alert-preferences";
import { S } from "@/design-system/strings";

/** تبويب «العبادات»: الصلاة القادمة · جدول المواقيت · الأذكار والقبلة والتسبيح · مراتب الناس في الصلاة. */
export default function WorshipPage() {
  const { data } = useSharedPrayerData();
  const live = useSharedPrayerCountdownLive();
  const [alerts, setAlerts] = useState(() => loadPrayerAlertPrefs().alertsEnabled);
  useEffect(() => { setAlerts(loadPrayerAlertPrefs().alertsEnabled); }, []);
  const five = (data?.prayers ?? []).filter((p) => p.obligatory);
  return (
    <div className="sn-screen" data-testid="worship-screen">
      <NavigationBar title={S.worship_01} trailing={<IconLink icon="search" label={S.navigation_03} href="/search" />} />
      <div className="sn-container sn-stack sn-stack--lg">
        <PrayerHero />
        <section className="sn-stack" aria-label={S.prayerHero_05}>
          <SectionHeader title={S.prayerHero_05} actionLabel={S.worship_02} actionHref="/prayer-times" />
          <ListGroup>
            <ListRow icon="bell" title={S.worship_03} description={S.worship_04} toggle={{ checked: alerts, onChange: (v) => { setAlerts(v); patchPrayerAlertPrefs({ alertsEnabled: v }); } }} />
            {five.length === 0 ? <ListRow icon="clock" title={S.worship_05} description={S.worship_06} href="/prayer-times" /> : null}
            {five.map((p) => (
              <PrayerTimeRow key={p.key} name={p.name} time={formatTime12(p.time24)} next={p.key === live?.next?.key} />
            ))}
          </ListGroup>
          {data?.date?.hijri ? <Badge>{data.date.hijri}</Badge> : null}
        </section>
        <section className="sn-stack" aria-label={S.worship_07}>
          <SectionHeader title={S.worship_08} />
          <ListGroup>
            <ListRow icon="adhkar" title={S.home_03} description={S.worship_09} href="/adhkar" />
            <ListRow icon="qibla" title={S.home_05} description={S.worship_10} href="/qibla" />
            <ListRow icon="tasbih" title={S.home_04} description={S.worship_11} href="/tasbih" />
            <ListRow icon="hand" title={S.worship_12} description={S.worship_13} href="/duas" />
          </ListGroup>
        </section>
        <section className="sn-stack" aria-label={S.worship_14}>
          <SectionHeader title={S.worship_15} />
          <ListGroup>
            <ListRow icon="mosque" title={S.worship_14} description={S.worship_16} href="/prayer-ranks" />
            <ListRow icon="info" title={S.worship_17} description={S.worship_18} href="/salah-guide" />
          </ListGroup>
        </section>
      </div>
    </div>
  );
}
