/**
 * مجموعة «آية اليوم» كما في الموقع (lib/daily-content.ts) → Data/home/daily-ayah.json.
 * نسخ حرفي؛ لا إعادة صياغة. الاختيار يتم في التطبيق بنفس getDayIndex (Asia/Kuwait) ثم % الطول.
 */
export default async function exportHome({ json, counts, appRoot }) {
  const { DAILY_AYAH_POOL } = await import(`${appRoot}/src/lib/daily-content.ts`);
  const rows = DAILY_AYAH_POOL.map(({ id, text, surah, ayahNumber, reference, meaning }) => ({ id, text, surah, ayahNumber, reference, meaning }));
  json("home/daily-ayah.json", rows);
  (counts.home ??= {})["daily-ayah"] = rows.length;
}
