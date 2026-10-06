/**
 * بطاقة تذكيرات الأذكار في صفحة الأذكار — ملخص ورابط إلى شاشة الإعدادات الموحّدة
 * (كانت تحمل مفاتيح موازية لا تشغّل المفتاح العام فلا أثر لها).
 */
import { Link } from "wouter";
import { REMINDER_CATEGORIES, loadReminderPrefs, reminderGroups } from "@/lib/adhkar-reminders";

export function AdhkarRemindersCard() {
  const groups = reminderGroups();
  const prefs = loadReminderPrefs();
  const on = REMINDER_CATEGORIES.filter((c) => groups[c.group] && prefs.categories[c.id]?.enabled);
  return (
    <section className="adhkar-reminders-card" aria-labelledby="adhkar-reminders-title">
      <h2 id="adhkar-reminders-title" className="adhkar-reminders-card__title">تذكيرات الأذكار</h2>
      <p role="status">
        {on.length ? `مفعّلة: ${on.map((c) => c.title).join("، ")}` : "لا تذكيرات مفعّلة."}
      </p>
      <p>
        <Link href="/notification-settings">ضبط التذكيرات (الوقت، الصوت، الفئات)</Link>
      </p>
    </section>
  );
}
