/**
 * توقيت الآيات من Quran Foundation (api/v4 chapter_recitations?segments=true).
 * Run: node --import tsx src/lib/__tests__/surah-ayah-timing.test.ts
 */
import assert from "node:assert/strict";
import { RECITERS } from "../quran-audio";
import {
  QURAN_COM_RECITATION_BY_RECITER,
  parseQuranComChapterTimings,
  resolveSurahAyahTimings,
} from "../surah-ayah-timing";

// مقتطع من الرد الحي: GET /api/v4/chapter_recitations/7/112?segments=true (2026-10-06)، أول آيتين فقط.
const FIXTURE = {
  audio_file: {
    id: 1133,
    chapter_id: 112,
    file_size: 356480.0,
    format: "mp3",
    audio_url: "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/112.mp3",
    timestamps: [
      { verse_key: "112:1", timestamp_from: 0, timestamp_to: 2980, duration: 2980, segments: [[1, 0, 430], [2, 430, 700], [3, 700, 1680], [4, 1680, 2915]] },
      { verse_key: "112:2", timestamp_from: 2980, timestamp_to: 5510, duration: 2530, segments: [[1, 2915, 3965], [2, 3965, 5400]] },
    ],
  },
};

assert.deepEqual(parseQuranComChapterTimings(FIXTURE), [
  { ayahNumber: 1, startTime: 0, endTime: 2.98 },
  { ayahNumber: 2, startTime: 2.98, endTime: 5.51 },
]);
// الشكل القديم (audio_file.segments) أو رد فارغ ⇒ null (يُستخدم التقدير النسبي).
assert.equal(parseQuranComChapterTimings({ audio_file: { segments: [[1, 0, 1000]] } }), null);
assert.equal(parseQuranComChapterTimings(null), null);

// كل مفتاح مربوط يجب أن يكون معرّف قارئ حقيقيًا في الكتالوج.
const catalogIds = new Set(RECITERS.map((r) => r.id));
for (const [id, qf] of Object.entries(QURAN_COM_RECITATION_BY_RECITER)) {
  assert.ok(catalogIds.has(id), `mapped reciter "${id}" missing from RECITERS`);
  assert.ok(Number.isInteger(qf) && qf > 0, `bad QF recitation id for ${id}`);
}

// فشل الشبكة ⇒ تقدير نسبي بلا استثناء.
globalThis.fetch = (() => Promise.reject(new Error("offline"))) as typeof fetch;
for (const id of ["alafasy", ...Object.keys(QURAN_COM_RECITATION_BY_RECITER)]) {
  const r = await resolveSurahAyahTimings(112, id, 10, [
    { numberInSurah: 1, text: "قل هو الله أحد" },
    { numberInSurah: 2, text: "الله الصمد" },
  ]);
  assert.equal(r.precise, false);
  assert.equal(r.timings.length, 2);
}

console.log("surah-ayah-timing: ok");
