#!/usr/bin/env node
/**
 * تدقيق شبكي لقابلية تشغيل تلاوات القرّاء (ليس ضمن مسار CI الإلزامي).
 *
 * يبني الروابط الفعلية التي يطلبها التطبيق من كتالوج `src/lib/quran-audio.ts`:
 *   - آية-بآية: everyayah.com/data/{folder}/{SSS}{AAA}.mp3
 *   - احتياط آية-بآية: cdn.islamic.network/quran/audio/{bitrate}/{edition}/{global}.mp3
 *   - سورة كاملة: {surahBaseUrl}/{SSS}.mp3 (mp3quran)
 * لكل رابط: GET مع Range: bytes=0-1023 (مهلة 10ث، محاولتان إضافيتان)، ويتحقق من
 * الحالة 200/206 ونوع المحتوى audio/* وبصمة MP3 (ID3 أو frame sync) وترويسة CORS وhttps.
 *
 * الاستخدام:
 *   node scripts/audit-reciters-playability.mjs            # عيّنة معالم
 *   node scripts/audit-reciters-playability.mjs --deep     # + أول/آخر آية لكل سورة + كل السور الـ114
 *   node scripts/audit-reciters-playability.mjs --json out.json
 * رمز الخروج 1 إن وُجد مصدر يبنيه التطبيق بحالة BROKEN/PARTIAL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = fs.readFileSync(path.join(ROOT, "src/lib/quran-audio.ts"), "utf8");
const args = process.argv.slice(2);
const DEEP = args.includes("--deep");
const jsonIdx = args.indexOf("--json");
const JSON_OUT = jsonIdx >= 0 ? args[jsonIdx + 1] : null;
const ORIGIN = "https://www.ssunnah.com";
const TIMEOUT_MS = 10_000;
const RETRIES = 2;
const CONCURRENCY = 12;

/* ── استخراج الكتالوج من المصدر ─────────────────────────────────────────── */
function parseReciters(src) {
  const block = src.slice(src.indexOf("export const RECITERS"), src.indexOf("export type ReciterSelectMode"));
  const out = [];
  const re = /\{\s*id:\s*"([^"]+)",\s*nameAr:\s*"([^"]+)",[\s\S]*?everyayahFolder:\s*(null|"[^"]*"),\s*surahBaseUrl:\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(block))) {
    out.push({
      id: m[1],
      nameAr: m[2],
      everyayahFolder: m[3] === "null" ? null : m[3].slice(1, -1),
      surahBaseUrl: m[4],
    });
  }
  return out;
}
function parseEditions(src) {
  const block = src.slice(src.indexOf("const ISLAMIC_NETWORK_EDITION"));
  const body = block.slice(0, block.indexOf("};"));
  return Object.fromEntries([...body.matchAll(/(\w+):\s*"(\d+\/[^"]+)"/g)].map((m) => [m[1], m[2]]));
}
function parseAyahCounts(src) {
  const block = src.slice(src.indexOf("const SURAH_AYAH_COUNTS"));
  return block.slice(block.indexOf("["), block.indexOf("];")).match(/\d+/g).map(Number);
}

const RECITERS = parseReciters(SRC);
const EDITIONS = parseEditions(SRC);
const COUNTS = parseAyahCounts(SRC);
if (RECITERS.length === 0 || COUNTS.length !== 114) {
  console.error("تعذّر تحليل الكتالوج من src/lib/quran-audio.ts");
  process.exit(2);
}
const VERIFIED = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/audio/audio-registry.json"), "utf8"))
    .reciters.filter((r) => r.verified)
    .map((r) => r.id),
);

const pad = (n) => String(n).padStart(3, "0");
const globalAyah = (s, a) => COUNTS.slice(0, s - 1).reduce((x, y) => x + y, 0) + a;

const AYAH_SAMPLE = [
  [1, 1], [1, 7], [2, 255], [2, 286], [18, 1], [112, 1], [114, 6],
];
const SURAH_SAMPLE = [1, 2, 18, 112, 114];

function ayahSample() {
  if (!DEEP) return AYAH_SAMPLE;
  const set = new Map(AYAH_SAMPLE.map((p) => [p.join(":"), p]));
  for (let s = 1; s <= 114; s++) {
    set.set(`${s}:1`, [s, 1]);
    set.set(`${s}:${COUNTS[s - 1]}`, [s, COUNTS[s - 1]]);
  }
  return [...set.values()];
}
const surahSample = () => (DEEP ? Array.from({ length: 114 }, (_, i) => i + 1) : SURAH_SAMPLE);

/* ── فحص رابط واحد ─────────────────────────────────────────────────────── */
function looksLikeAudio(buf) {
  if (buf.length < 3) return false;
  if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return true; // ID3
  for (let i = 0; i + 1 < buf.length; i++) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) return true; // MPEG/AAC frame sync
  }
  return false;
}

async function probeOnce(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { Range: "bytes=0-1023", Origin: ORIGIN, "User-Agent": "Mozilla/5.0 majalis-audit" },
    });
    const buf = new Uint8Array(await res.arrayBuffer()).slice(0, 1024);
    return {
      status: res.status,
      contentType: res.headers.get("content-type") || "",
      cors: res.headers.get("access-control-allow-origin") || "",
      finalUrl: res.url,
      magic: looksLikeAudio(buf),
    };
  } finally {
    clearTimeout(t);
  }
}

async function probe(url) {
  let last = null;
  for (let i = 0; i <= RETRIES; i++) {
    try {
      const r = await probeOnce(url);
      if (r.status < 500) {
        last = r;
        break;
      }
      last = r;
    } catch (e) {
      last = { status: 0, contentType: "", cors: "", finalUrl: url, magic: false, error: String(e?.name || e) };
    }
  }
  const ok =
    (last.status === 200 || last.status === 206) &&
    (/^audio\//i.test(last.contentType) || last.contentType === "application/octet-stream") &&
    last.magic &&
    last.finalUrl.startsWith("https://");
  return { url, ok, ...last };
}

async function pool(tasks, n) {
  const out = new Array(tasks.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < tasks.length) {
        const k = i++;
        out[k] = await tasks[k]();
      }
    }),
  );
  return out;
}

function classify(results) {
  if (results.length === 0) return "N/A";
  const ok = results.filter((r) => r.ok).length;
  if (ok === results.length) return "WORKS";
  if (ok === 0) return "BROKEN";
  return "PARTIAL";
}

/* ── التشغيل ───────────────────────────────────────────────────────────── */
const report = [];
for (const r of RECITERS) {
  const ayahUrls = r.everyayahFolder
    ? ayahSample().map(([s, a]) => `https://everyayah.com/data/${r.everyayahFolder}/${pad(s)}${pad(a)}.mp3`)
    : [];
  const edition = EDITIONS[r.id];
  const inUrls = edition
    ? AYAH_SAMPLE.map(([s, a]) => `https://cdn.islamic.network/quran/audio/${edition}/${globalAyah(s, a)}.mp3`)
    : [];
  const surahUrls = r.surahBaseUrl ? surahSample().map((s) => `${r.surahBaseUrl}/${pad(s)}.mp3`) : [];

  const [ayah, inet, surah] = await Promise.all(
    [ayahUrls, inUrls, surahUrls].map((list) => pool(list.map((u) => () => probe(u)), CONCURRENCY)),
  );
  const row = {
    id: r.id,
    nameAr: r.nameAr,
    visible: VERIFIED.has(r.id),
    ayah: { status: classify(ayah), failures: ayah.filter((x) => !x.ok), sample: ayah[0] ?? null, n: ayah.length },
    islamicNetwork: { status: classify(inet), failures: inet.filter((x) => !x.ok), sample: inet[0] ?? null, n: inet.length },
    surah: { status: classify(surah), failures: surah.filter((x) => !x.ok), sample: surah[0] ?? null, n: surah.length },
  };
  report.push(row);
  const f = (k) => `${row[k].status}(${row[k].n - row[k].failures.length}/${row[k].n})`;
  const cors = row.ayah.sample?.cors || row.surah.sample?.cors || "-";
  console.log(
    `${row.visible ? "V" : " "} ${r.id.padEnd(16)} ayah=${f("ayah").padEnd(16)} inet=${f("islamicNetwork").padEnd(14)} surah=${f("surah").padEnd(16)} cors=${cors}`,
  );
  for (const k of ["ayah", "islamicNetwork", "surah"]) {
    for (const x of row[k].failures.slice(0, 4)) {
      console.log(`     ✗ ${k}: ${x.status} ${x.contentType || x.error || ""} ${x.url}`);
    }
  }
}

if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ at: new Date().toISOString(), deep: DEEP, report }, null, 2));

const ok = (st) => st === "WORKS" || st === "N/A";
/* كل مصدر يبنيه التطبيق يجب أن يعمل كاملًا (getSelectableReciters يعرض أي قارئ له مجلد everyayah). */
const bad = report.filter((r) => !ok(r.ayah.status) || !ok(r.islamicNetwork.status) || !ok(r.surah.status));
if (bad.length) {
  console.error(`\n${bad.length} قارئ بمصدر غير سليم: ${bad.map((r) => r.id).join(", ")}`);
  process.exit(1);
}
console.log(`\n✓ ${report.length} قارئ مفحوص — كل المصادر المبنية سليمة.`);
