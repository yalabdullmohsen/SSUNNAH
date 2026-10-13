/**
 * مجموعة «آية اليوم» كما في الموقع (lib/daily-content.ts) → Data/home/daily-ayah.json.
 * نسخ حرفي؛ لا إعادة صياغة. الاختيار يتم في التطبيق بنفس getDayIndex (Asia/Kuwait) ثم % الطول.
 */
const TAGS = { source_origin: "site-code", review_status: "pending-owner-review" };
export default async function exportHome({ json, counts, appRoot }) {
  const { DAILY_AYAH_POOL, DAILY_HADITH_POOL } = await import(`${appRoot}/src/lib/daily-content.ts`);
  const { filterForPublicZone } = await import(`${appRoot}/src/lib/content-display-zones.ts`);
  const rows = DAILY_AYAH_POOL.map(({ id, text, surah, ayahNumber, reference, meaning }) => ({ id, text, surah, ayahNumber, reference, meaning, ...TAGS }));
  json("home/daily-ayah.json", rows);
  (counts.home ??= {})["daily-ayah"] = rows.length;

  /* حديث اليوم: المجموعة بعد filterForPublicZone(…,"dailyReminder") وإن فرغت فالكاملة (كـgetDailyHadith). لا حقل number في سجل الموقع فلا يُختلق. */
  const filtered = filterForPublicZone(DAILY_HADITH_POOL, "dailyReminder");
  const hadith = (filtered.length > 0 ? filtered : DAILY_HADITH_POOL).map((h) => ({ ...h, ...TAGS }));
  json("home/daily-hadith.json", hadith);
  counts.home["daily-hadith"] = hadith.length;

  /* خوارزمية الاختيار حرفيًا (getDayIndex/pickDailyItem) */
  json("home/daily-algorithm.json", { timeZone: "Asia/Kuwait", index: "floor(Date.UTC(y,m-1,d)/86400000) % pool.length" });
}
