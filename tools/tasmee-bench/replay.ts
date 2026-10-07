/**
 * يعيد تشغيل نتائج التفريغ الجزئية المسجّلة (tasmee-bench) عبر مطابِق الإنتاج `TasmeeMatcher` (TypeScript)،
 * فيُقاس المنطق الذي سيُشحن فعلًا لا نسخة Swift التجريبية.
 * الاستعمال (من artifacts/majalis): node --import tsx ../../tools/tasmee-bench/replay.ts <runsDir/config> <corpusSet> <outDir> [--stable S]
 * الخرج بنفس مخطط tasmee-bench فيُقيَّم بـscore.py.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TasmeeMatcher } from "../../artifacts/majalis/src/lib/tasmee/matcher.ts";

const [runDir, setDir, outDir, ...rest] = process.argv.slice(2);
const stable = Number(rest[rest.indexOf("--stable") + 1] || 1);
mkdirSync(outDir!, { recursive: true });
const ref0 = JSON.parse(readFileSync(join(setDir!, "ref.json"), "utf8")) as Array<{ textUthmani: string; verseKey: string; pos: number }>;

for (const f of readdirSync(runDir!).filter((x) => x.endsWith(".json"))) {
  const run = JSON.parse(readFileSync(join(runDir!, f), "utf8"));
  const texts = ref0.map((r) => r.textUthmani);
  for (const i of run.corrupted as number[]) texts[i] = texts[(i + 17) % texts.length]!;
  const matcher = new TasmeeMatcher(texts.map((t, i) => ({ id: `${ref0[i]!.verseKey}:${ref0[i]!.pos}`, text: t })), { stableHyps: stable });
  const words: Array<{ index: number; state: string; time: number }> = [];
  for (const d of run.decodes as Array<{ audioEnd: number; computeMs: number; text: string }>) {
    const finish = (d as { finish?: number }).finish ?? d.audioEnd + d.computeMs / 1000;
    for (const e of matcher.ingest(d.text, finish * 1000)) words.push({ index: e.index, state: e.state, time: e.timeMs / 1000 });
  }
  writeFileSync(join(outDir!, f), JSON.stringify({ ...run, words }));
}
console.log("replayed", readdirSync(outDir!).length, "runs ->", outDir);
