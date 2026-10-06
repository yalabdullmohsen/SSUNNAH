#!/usr/bin/env node
/**
 * يولّد نغمات تذكير الأذكار الأصلية برمجيًا (موجات جيبية + غلاف تلاشٍ) — لا تسجيلات ولا عيّنات خارجية.
 * المخرجات:
 *   public/audio/reminder-tones/<id>.m4a   ← معاينة الويب (AAC؛ بوابة release-lockdown ترفض wav)
 *   ios/App/App/Sounds/<id>.caf            ← صوت إشعار iOS (Linear PCM 16-bit، عبر afconvert إن وُجد)
 * الترخيص: عمل أصلي للمشروع، مُهدى للملك العام (CC0). مسجّل في docs/store-release/LICENSE_DECISION_MATRIX.md.
 * التشغيل: node scripts/generate-reminder-tones.mjs  (من artifacts/majalis)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const RATE = 22050;
const root = resolve(import.meta.dirname, "..");
const webDir = resolve(root, "public/audio/reminder-tones");
const iosDir = resolve(root, "ios/App/App/Sounds");

/** نغمة جرس: مجموع توافقيات بتلاشٍ أُسّي. */
function bell(freq, t, decay = 2.2) {
  const env = Math.exp(-decay * t) * Math.min(1, t / 0.008);
  return env * (Math.sin(2 * Math.PI * freq * t) * 0.6
    + Math.sin(2 * Math.PI * freq * 2.01 * t) * 0.25 * Math.exp(-1.5 * t)
    + Math.sin(2 * Math.PI * freq * 3.02 * t) * 0.1 * Math.exp(-3 * t));
}

/** كل نغمة: [المدة بالثواني، دالة العيّنة]. */
export const TONES = {
  "tone-nada": [3.2, (t) => bell(659.25, t, 1.6)],
  "tone-chime": [3.0, (t) => bell(523.25, t, 2) + (t > 0.35 ? bell(783.99, t - 0.35, 1.8) : 0)],
  "tone-fajr": [3.6, (t) => [0, 0.3, 0.6].reduce((s, d, i) => s + (t > d ? 0.8 * bell([392, 493.88, 587.33][i], t - d, 1.7) : 0), 0)],
  "tone-qatra": [1.6, (t) => Math.exp(-4 * t) * Math.min(1, t / 0.004) * Math.sin(2 * Math.PI * (880 + 500 * Math.exp(-18 * t)) * t)],
  "tone-nasim": [4.0, (t) => {
    const env = Math.sin(Math.PI * Math.min(1, t / 4)) ** 2;
    return env * 0.35 * [261.63, 329.63, 392].reduce((s, f) => s + Math.sin(2 * Math.PI * f * t), 0);
  }],
};

function wav(samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2));
  return buf;
}

function render([seconds, fn]) {
  const n = Math.round(seconds * RATE);
  const raw = Array.from({ length: n }, (_, i) => fn(i / RATE));
  const peak = Math.max(...raw.map(Math.abs)) || 1;
  // تطبيع إلى ‎-3dB‎ مع تلاشٍ أخير 50ms لمنع النقرة.
  return raw.map((s, i) => (s / peak) * 0.7 * Math.min(1, (n - i) / (0.05 * RATE)));
}

if (process.argv[1] === import.meta.filename) {
  mkdirSync(webDir, { recursive: true });
  mkdirSync(iosDir, { recursive: true });
  if (!existsSync("/usr/bin/afconvert")) throw new Error("afconvert مطلوب (macOS) لتوليد caf/m4a.");
  for (const [id, spec] of Object.entries(TONES)) {
    const wavPath = resolve(tmpdir(), `${id}.wav`);
    writeFileSync(wavPath, wav(render(spec)));
    execFileSync("/usr/bin/afconvert", ["-f", "caff", "-d", `LEI16@${RATE}`, wavPath, resolve(iosDir, `${id}.caf`)]);
    execFileSync("/usr/bin/afconvert", ["-f", "m4af", "-d", "aac", "-b", "64000", wavPath, resolve(webDir, `${id}.m4a`)]);
    rmSync(wavPath);
    console.log(`${id}: ${spec[0]}s`);
  }
}
