/**
 * تلاوة هجينة QF/mp3quran خلف راية مطفأة افتراضيًا.
 * Run: node --import tsx src/lib/__tests__/qf-recitation-audio.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RECITERS, getSurahAudioUrl } from "../quran-audio";
import {
  QF_RECITATION_AUDIO_FLAG,
  QF_RECITATION_BY_RECITER,
  isQfRecitationAudioEnabled,
  resolveSurahStream,
} from "../qf-recitation-audio";

const store = new Map<string, string>();
globalThis.localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
} as unknown as Storage;

let calls: string[] = [];
let respond: () => Promise<Response> = () => Promise.reject(new Error("offline"));
globalThis.fetch = ((url: string) => {
  calls.push(String(url));
  return respond();
}) as typeof fetch;

const QF_BODY = {
  audio_file: {
    audio_url: "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/112.mp3",
    timestamps: [
      { verse_key: "112:1", timestamp_from: 0, timestamp_to: 2980 },
      { verse_key: "112:2", timestamp_from: 2980, timestamp_to: 5510 },
    ],
  },
};

// 1) الراية مطفأة افتراضيًا ⇒ mp3quran + تقدير (timings=null) ولا طلب لـ QF.
assert.equal(isQfRecitationAudioEnabled(), false);
let r = await resolveSurahStream(112, "alafasy");
assert.deepEqual(r, { url: getSurahAudioUrl(112, "alafasy"), provider: "mp3quran", timings: null });
assert.equal(calls.length, 0);

// 2) مفعّلة + فشل QF ⇒ سقوط إلى mp3quran بلا استثناء.
store.set(QF_RECITATION_AUDIO_FLAG, "1");
assert.equal(isQfRecitationAudioEnabled(), true);
r = await resolveSurahStream(112, "alafasy");
assert.equal(r.provider, "mp3quran");
assert.equal(r.timings, null);
assert.match(calls[0]!, /^\/api\/qf-chapter-audio\?recitation=7&chapter=112$/);
respond = () => Promise.resolve(new Response("{}", { status: 503 }));
assert.equal((await resolveSurahStream(112, "alafasy")).provider, "mp3quran");

// 3) مفعّلة + قارئ مربوط ⇒ ملف QF نفسه وتوقيت دقيق بالثواني بلا تحجيم.
respond = () => Promise.resolve(new Response(JSON.stringify(QF_BODY), { status: 200 }));
r = await resolveSurahStream(112, "alafasy");
assert.equal(r.provider, "qf");
assert.equal(r.url, QF_BODY.audio_file.audio_url);
assert.deepEqual(r.timings, [
  { ayahNumber: 1, startTime: 0, endTime: 2.98 },
  { ayahNumber: 2, startTime: 2.98, endTime: 5.51 },
]);
// مخزّن للجلسة: لا طلب ثانٍ.
calls = [];
assert.equal((await resolveSurahStream(112, "alafasy")).provider, "qf");
assert.equal(calls.length, 0);

// 4) قارئ غير متوفّر في QF ⇒ mp3quran دائمًا ولا طلب.
r = await resolveSurahStream(112, "dosari");
assert.equal(r.provider, "mp3quran");
assert.equal(calls.length, 0);

// 5) كل مفتاح ربط موجود في الكتالوج، والمعرّفات مرتّلة صحيحة (لا مجوّد 1/8 ولا معلّم 12 ولا 11 المختلّ).
const ids = new Set(RECITERS.map((x) => x.id));
for (const [id, qf] of Object.entries(QF_RECITATION_BY_RECITER)) {
  assert.ok(ids.has(id), `mapped reciter "${id}" missing from RECITERS`);
  assert.ok(![1, 8, 11, 12].includes(qf), `${id} → ${qf} ليس تسجيلًا مرتّلًا مطابقًا`);
}

// 6) التنزيلات الدائمة تبقى mp3quran (شروط QF: تخزين ≤ أسبوع)، وCSP يسمح بملفات QF.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
assert.doesNotMatch(readFileSync(resolve(root, "src/lib/quran-audio-downloads.ts"), "utf8"), /qf-recitation-audio|quranicaudio/);
assert.match(readFileSync(resolve(root, "vercel.json"), "utf8"), /media-src[^;]*https:\/\/download\.quranicaudio\.com/);
assert.doesNotMatch(readFileSync(resolve(root, "lib/api-handlers/qf-chapter-audio.js"), "utf8"), /QF_CLIENT_SECRET\s*=\s*["']/);

console.log("qf-recitation-audio: ok");
