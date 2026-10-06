import { useEffect, useState } from "react";
import { Badge, IconLink, ListGroup, ListRow, NavigationBar, PrayerTimeRow, SectionHeader } from "@/design-system";
import { PrayerHero } from "./PrayerHero";
import { useSharedPrayerCountdownLive, useSharedPrayerData } from "@/components/prayer/PrayerCountdownProvider";
import { formatTime12 } from "@/lib/prayer-times";
import { loadPrayerAlertPrefs, patchPrayerAlertPrefs } from "@/lib/prayer-alert-preferences";

/** تبويب «العبادات»: الصلاة القادمة · جدول المواقيت · الأذكار والقبلة والتسبيح · مراتب الناس في الصلاة. */
export default function WorshipPage() {
  const { data } = useSharedPrayerData();
  const live = useSharedPrayerCountdownLive();
  const [alerts, setAlerts] = useState(() => loadPrayerAlertPrefs().alertsEnabled);
  useEffect(() => { setAlerts(loadPrayerAlertPrefs().alertsEnabled); }, []);
  const five = (data?.prayers ?? []).filter((p) => p.obligatory);
  return (
    <div className="sn-screen" data-testid="worship-screen">
      <NavigationBar title="العبادات" trailing={<IconLink icon="search" label="بحث" href="/search" />} />
      <div className="sn-container sn-stack sn-stack--lg">
        <PrayerHero />
        <section className="sn-stack" aria-label="مواقيت اليوم">
          <SectionHeader title="مواقيت اليوم" actionLabel="التفاصيل" actionHref="/prayer-times" />
          <ListGroup>
            <ListRow icon="bell" title="تنبيهات الأذان" description="إشعار عند دخول وقت الصلاة" toggle={{ checked: alerts, onChange: (v) => { setAlerts(v); patchPrayerAlertPrefs({ alertsEnabled: v }); } }} />
            {five.length === 0 ? <ListRow icon="clock" title="لا توجد مواقيت بعد" description="حدّد المدينة من تفاصيل المواقيت" href="/prayer-times" /> : null}
            {five.map((p) => (
              <PrayerTimeRow key={p.key} name={p.name} time={formatTime12(p.time24)} next={p.key === live?.next?.key} />
            ))}
          </ListGroup>
          {data?.date?.hijri ? <Badge>{data.date.hijri}</Badge> : null}
        </section>
        <section className="sn-stack" aria-label="الأذكار والقبلة والتسبيح">
          <SectionHeader title="أدوات العبادة" />
          <ListGroup>
            <ListRow icon="adhkar" title="الأذكار" description="أذكار الصباح والمساء وبعد الصلاة" href="/adhkar" />
            <ListRow icon="qibla" title="القبلة" description="اتجاه الكعبة من موقعك" href="/qibla" />
            <ListRow icon="tasbih" title="التسبيح" description="عدّاد التسبيح" href="/tasbih" />
            <ListRow icon="hand" title="الأدعية" description="أدعية من الكتاب والسنة" href="/duas" />
          </ListGroup>
        </section>
        <section className="sn-stack" aria-label="مراتب الناس في الصلاة">
          <SectionHeader title="الصلاة" />
          <ListGroup>
            <ListRow icon="mosque" title="مراتب الناس في الصلاة" description="مراتب المصلّين وفضل كل مرتبة" href="/prayer-ranks" />
            <ListRow icon="info" title="دليل الصلاة" description="الصلاة خطوة بخطوة" href="/salah-guide" />
          </ListGroup>
        </section>
      </div>
    </div>
  );
}
