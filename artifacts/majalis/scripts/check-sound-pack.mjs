#!/usr/bin/env node
// بوابة SoundPack: تفشل عند ملف صوتي متتبَّع خارج المانيفست، أو «معتمد» بلا مصدر مرخّص في السجل،
// أو زيادة المحجور عن السقف، أو صوت إشعار أصلي في Swift غير معتمد.
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
// سقف تنازلي فقط: يُخفَّض عند ترخيص ملف أو حذفه، ولا يُرفع.
const QUARANTINE_CEILING = 72;
const AUDIO = /\.(caf|mp3|m4a|wav|aiff?|aac|ogg|opus|flac)$/i;

const errors = [];
const registry = JSON.parse(read("docs/audio-rights/approved-sources-registry.json"));
const licensed = new Map();
for (const s of registry.sources ?? []) {
  if (s.approvedForProduction !== true) continue;
  for (const p of [...(s.bundledPaths ?? []), s.originalPath].filter(Boolean)) licensed.set(p, s.id);
}

const manifest = JSON.parse(read("docs/audio-rights/sound-pack.manifest.json"));
const byPath = new Map();
for (const e of manifest.entries) {
  if (byPath.has(e.path)) errors.push(`مكرر في المانيفست: ${e.path}`);
  byPath.set(e.path, e);
  if (!existsSync(join(root, e.path))) errors.push(`في المانيفست وغير موجود: ${e.path}`);
  if (e.status === "approved") {
    if (licensed.get(e.path) !== e.sourceId) errors.push(`معتمد بلا مصدر مرخّص في السجل: ${e.path}`);
  } else if (e.status !== "quarantined") {
    errors.push(`حالة غير معروفة (${e.status}): ${e.path}`);
  }
}

const tracked = execSync("git ls-files", { cwd: root, encoding: "utf8" }).split("\n").filter((f) => AUDIO.test(f));
for (const f of tracked) if (!byPath.has(f)) errors.push(`ملف صوتي غير مُدرج في المانيفست (غير مرخّص): ${f}`);

const quarantined = manifest.entries.filter((e) => e.status === "quarantined").length;
if (quarantined > QUARANTINE_CEILING) errors.push(`المحجور ${quarantined} > السقف ${QUARANTINE_CEILING}`);

const swift = read("ios/App/SunnahPrayer/Sources/SunnahPrayer/NotificationSoundPack.swift");
const list = swift.match(/approvedNotificationSounds:\s*Set<String>\s*=\s*\[([^\]]*)\]/);
if (!list) errors.push("تعذّر قراءة approvedNotificationSounds");
const approvedIos = new Set(manifest.entries.filter((e) => e.status === "approved" && e.path.startsWith("ios/")).map((e) => basename(e.path)));
for (const [, name] of (list?.[1] ?? "").matchAll(/"([^"]+)"/g)) {
  if (!approvedIos.has(name)) errors.push(`صوت إشعار أصلي غير معتمد: ${name}`);
}

if (errors.length) {
  console.error(`check-sound-pack: ${errors.length} خطأ\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`check-sound-pack: ok (${tracked.length} ملف، معتمد ${tracked.length - quarantined}، محجور ${quarantined}/${QUARANTINE_CEILING})`);
