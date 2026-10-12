/**
 * قسم «الصوت دون اتصال» → Data/audio/surah-reciters.json (docs/native/requests/audio.md).
 * [{id, nameAr, surahBaseUrl}] من RECITERS في src/lib/quran-audio.ts مع احترام quran-audio-remote.json.
 * المعرّف = مجلد MajlisOfflineAudio/<id>/ فتبقى التنزيلات صالحة.
 */
import fs from "node:fs";

export default async function exportAudio({ json, reject, counts, appRoot }) {
  const { RECITERS } = await import(`${appRoot}/src/lib/quran-audio.ts`);
  const off = JSON.parse(fs.readFileSync(`${appRoot}/public/data/quran-audio-remote.json`, "utf8"));
  const disabled = new Set(off.disabledReciterIds ?? []);
  const rows = [];
  for (const r of RECITERS) {
    if (disabled.has(r.id)) { reject("audio-reciters", "معطَّل مركزيًا"); continue; }
    if (!r.surahBaseUrl) { reject("audio-reciters", "بلا رابط سور"); continue; }
    rows.push({ id: r.id, nameAr: r.nameAr, surahBaseUrl: r.surahBaseUrl });
  }
  json("audio/surah-reciters.json", rows);
  (counts.audio ??= {})["surah-reciters"] = rows.length;
}
