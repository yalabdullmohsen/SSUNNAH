/**
 * قياس التسميع v2 على تسجيلات حقيقية (المقاطع العشرة C1–C5 وE1–E5) بمقاييس المحاكاة نفسها.
 *
 *   GROQ_API_KEY=… node --import tsx scripts/tasmee-v2-bench-real.ts ~/tasmee-clips
 *   node --import tsx scripts/tasmee-v2-bench-real.ts ~/tasmee-clips --transcripts device.json   # نصوص نوافذ من الجهاز
 *
 * الخصوصية: المقاطع تبقى خارج المستودع؛ تحويل WAV في مجلد مؤقت يُحذف فورًا؛ لا يُطبع المفتاح ولا يُكتب صوت.
 * الزمن هنا = خطوة النافذة + فك الترميز الفعلي (حدّ أعلى لتأخر الكشف بعد نهاية الكلمة).
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { normalizeQuranWord } from "../src/lib/quran-text-normalize";
import { formatTable, scoreWindows, type BenchCase } from "../src/lib/tasmee-v2/engine/tracker-bench";
import { encodeWav } from "../src/lib/tasmee-v2/engine/asr-providers";
import type { SimWindow } from "../src/lib/tasmee-v2/engine/asr-simulate";
import { DEFAULT_WINDOW_PARAMS, SpeechWindower } from "../src/lib/tasmee-v2/engine/vad";

type Clip = { code: string; surah: number; from: number; to: number; errors?: Array<{ ayah: number; word: string }> };

/** المقاطع المطلوبة — الأخطاء المتعمدة بالكلمة المرجعية المقصودة؛ E5 تكرار/تعثّر بلا خطأ متوقع. */
const CLIPS: Clip[] = [
  { code: "C1", surah: 112, from: 1, to: 4 },
  { code: "C2", surah: 113, from: 1, to: 5 },
  { code: "C3", surah: 114, from: 1, to: 6 },
  { code: "C4", surah: 108, from: 1, to: 3 },
  { code: "C5", surah: 67, from: 1, to: 2 },
  { code: "E1", surah: 1, from: 2, to: 4, errors: [{ ayah: 3, word: "الرحيم" }] },
  { code: "E2", surah: 103, from: 1, to: 3, errors: [{ ayah: 3, word: "الصالحات" }] },
  { code: "E3", surah: 110, from: 1, to: 3, errors: [{ ayah: 2, word: "أفواجا" }] },
  { code: "E4", surah: 106, from: 1, to: 4, errors: [{ ayah: 2, word: "الشتاء" }] },
  { code: "E5", surah: 109, from: 1, to: 3 },
];

const root = resolve(import.meta.dirname, "..");
const pagesDir = join(root, "public/data/quran-v2/pages");
type PageVerse = { verse_key: string; words: Array<{ char_type_name: string; position: number; text_uthmani: string; page_number: number; line_number: number }> };
const verses = new Map<string, PageVerse>();
for (const f of readdirSync(pagesDir)) {
  if (!/^page-\d+\.json$/.test(f)) continue;
  const n = Number(f.match(/\d+/)![0]);
  if (n !== 1 && n !== 2 && n !== 562 && n < 600) continue;
  for (const v of JSON.parse(readFileSync(join(pagesDir, f), "utf8")) as PageVerse[]) verses.set(v.verse_key, v);
}

function buildCase(c: Clip): BenchCase {
  const ref: BenchCase["ref"][number][] = [];
  const expected: number[] = [];
  for (let a = c.from; a <= c.to; a++) {
    const v = verses.get(`${c.surah}:${a}`);
    if (!v) throw new Error(`آية غير موجودة ${c.surah}:${a}`);
    for (const w of v.words.filter((x) => x.char_type_name === "word")) {
      const err = c.errors?.find((e) => e.ayah === a && normalizeQuranWord(e.word) === normalizeQuranWord(w.text_uthmani.replace(/ٰ/g, "ا")));
      if (err) expected.push(ref.length);
      ref.push({ id: `${w.page_number}:${w.line_number}:${w.position}`, text: w.text_uthmani });
    }
  }
  if (expected.length !== (c.errors?.length ?? 0)) throw new Error(`${c.code}: لم تُحدَّد كلمة الخطأ في النص المرجعي`);
  return { name: c.code, ref, spoken: [], expectedErrors: expected };
}

function readWavPcm(path: string): { pcm: Float32Array; sampleRate: number } {
  const b = readFileSync(path);
  let o = 12;
  let sampleRate = 16_000;
  while (o + 8 <= b.length) {
    const id = b.toString("ascii", o, o + 4);
    const size = b.readUInt32LE(o + 4);
    if (id === "fmt ") sampleRate = b.readUInt32LE(o + 12);
    if (id === "data") {
      const n = Math.floor(size / 2);
      const pcm = new Float32Array(n);
      for (let i = 0; i < n; i++) pcm[i] = b.readInt16LE(o + 8 + i * 2) / 0x8000;
      return { pcm, sampleRate };
    }
    o += 8 + size + (size % 2);
  }
  throw new Error("WAV بلا data");
}

async function groq(pcm: Float32Array, sr: number, key: string): Promise<{ text: string; ms: number }> {
  const form = new FormData();
  form.append("file", new Blob([encodeWav(pcm, sr)], { type: "audio/wav" }), "w.wav");
  form.append("model", "whisper-large-v3");
  form.append("language", "ar");
  form.append("temperature", "0");
  form.append("response_format", "json");
  const t0 = performance.now();
  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const data = (await res.json()) as { text?: string };
  return { text: (data.text ?? "").trim(), ms: Math.round(performance.now() - t0) };
}

const dir = process.argv[2];
if (!dir) throw new Error("الاستخدام: tasmee-v2-bench-real.ts <مجلد المقاطع> [--transcripts file.json]");
const tIdx = process.argv.indexOf("--transcripts");
const deviceTranscripts = tIdx > 0 ? (JSON.parse(readFileSync(process.argv[tIdx + 1]!, "utf8")) as Record<string, SimWindow[]>) : null;
const key = String(process.env.GROQ_API_KEY || "").trim();
if (!deviceTranscripts && !key) throw new Error("GROQ_API_KEY غير مضبوط (أو مرّر --transcripts)");

const files = readdirSync(dir);
const tmp = mkdtempSync(join(tmpdir(), "tasmee-bench-"));
const results = [];
try {
  for (const clip of CLIPS) {
    const c = buildCase(clip);
    let windows: SimWindow[];
    if (deviceTranscripts) {
      if (!deviceTranscripts[clip.code]) continue;
      windows = deviceTranscripts[clip.code]!;
    } else {
      /* «C1.m4a» أو «C1-p562.m4a» أو «C1_…» أو «C1 …» (تسمية مقاطع يوسف) */
      const src = files.find((f) => f.replace(/\.[^.]+$/, "").trim().toUpperCase().split(/[-_\s]/)[0] === clip.code);
      if (!src) {
        console.log(`${clip.code}: لا تسجيل — تخطٍّ`);
        continue;
      }
      const wav = join(tmp, `${clip.code}.wav`);
      execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16@16000", "-c", "1", join(dir, src), wav]);
      const { pcm, sampleRate } = readWavPcm(wav);
      rmSync(wav);
      const w = new SpeechWindower({ sampleRate });
      const audioWins = [...w.push(pcm), ...w.flush()];
      windows = [];
      for (const aw of audioWins) {
        const r = await groq(aw.pcm, aw.sampleRate, key);
        windows.push({ text: r.text, endMs: aw.endMs, timeMs: aw.endMs + DEFAULT_WINDOW_PARAMS.hopMs + r.ms });
      }
    }
    // بلا محاذاة زمنية للكلمات: الزمن = (لحظة القرار − نهاية النافذة) ≈ الخطوة + فك الترميز
    const timed = windows.map((x, i) => ({ ref: undefined as number | undefined, endMs: x.endMs, i }));
    const r = scoreWindows(c, windows, timed);
    r.latenciesMs = windows.map((x) => x.timeMs - x.endMs);
    results.push(r);
    console.log(`${clip.code}: نوافذ ${windows.length} · إنذار كاذب ${JSON.stringify(r.falseAlarms)} · مفقود ${JSON.stringify(r.missed)}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${formatTable(results)}`);
