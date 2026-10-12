/**
 * مسارات القرآن (docs/native/requests/quran.md): التلاوة والحلقات، من مصدر الموقع حرفيًا بلا إضافة.
 * - quran/tilawa-reciters.json: القرّاء المُحقَّقون كما تعرضهم /quran-hub/tilawa (ترتيب DEFAULT_VERIFIED_RECITER_IDS)
 * - quran/circles.json: حلقات التحفيظ (QURAN_CIRCLES_SEED) المعتمدة والنشطة فقط كما يعرضها الموقع
 * - مركز العبادة (/quran/worship-hub): لا ملف خاص — يركّب quran/ + audio/surah-reciters + المواقيت المحسوبة داخل التطبيق.
 */
export default async function exportQuranTracks({ json, reject, counts, appRoot }) {
  const { DEFAULT_VERIFIED_RECITER_IDS } = await import(`${appRoot}/src/lib/audio-registry.ts`);
  const { RECITERS } = await import(`${appRoot}/src/lib/quran-audio.ts`);
  const byId = new Map(RECITERS.map((r) => [r.id, r]));
  const rec = [];
  for (const id of DEFAULT_VERIFIED_RECITER_IDS) {
    const r = byId.get(id);
    if (!r || !r.everyayahFolder) { reject("quran-tilawa", "قارئ بلا مجلد آيات"); continue; }
    rec.push({ id: r.id, nameAr: r.nameAr, order: rec.length + 1 });
  }
  json("quran/tilawa-reciters.json", rec);

  const { QURAN_CIRCLES_SEED } = await import(`${appRoot}/src/lib/quran-circles-seed.ts`);
  const rows = [];
  for (const c of QURAN_CIRCLES_SEED) {
    if (c.is_approved !== true || c.is_active !== true) { reject("quran-circles", "غير معتمد/غير نشط"); continue; }
    rows.push(c);
  }
  json("quran/circles.json", rows);
  (counts.quran ??= {})["tilawa-reciters"] = rec.length;
  counts.quran.circles = rows.length;
}
