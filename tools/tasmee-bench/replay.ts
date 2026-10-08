/**
 * يعيد تشغيل نتائج التفريغ الجزئية المسجّلة (tasmee-bench) عبر مطابِق الإنتاج `TasmeeMatcher` (TypeScript)،
 * فيُقاس المنطق الذي سيُشحن فعلًا لا نسخة Swift التجريبية.
 * الاستعمال (من artifacts/majalis): node --import tsx ../../tools/tasmee-bench/replay.ts <runsDir/config> <corpusSet> <outDir> [--stable S]
 * الخرج بنفس مخطط tasmee-bench فيُقيَّم بـscore.py.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { HallucinationGuard } from "../../artifacts/majalis/src/lib/tasmee/hallucination-guard.ts";
import { paramsForStrictness, type TasmeeStrictness } from "../../artifacts/majalis/src/lib/tasmee/levels.ts";
import { normalizeQuranWord } from "../../artifacts/majalis/src/lib/quran-text-normalize.ts";
import { bestWordSimilarity, quranWordForms } from "../../artifacts/majalis/src/lib/quran-word-match.ts";
import { TasmeeMatcher } from "../../artifacts/majalis/src/lib/tasmee/matcher.ts";

const [runDir, setDir, outDir, ...rest] = process.argv.slice(2);
const stable = rest.includes("--stable") ? Number(rest[rest.indexOf("--stable") + 1]) : 1;
/** --corrupt K: يزرع الأخطاء نفسها (كل K كلمة) على سجلات بلا أخطاء مزروعة (فك بلا prompt مستقل عن المطابِق) */
/** --no-guard: بلا فلتر الكلمات الوهمية (للمقارنة)؛ --level lenient|normal|strict */
const useGuard = !rest.includes("--no-guard");
const level = (rest.includes("--level") ? rest[rest.indexOf("--level") + 1] : "normal") as TasmeeStrictness;
/** --extra: يفعّل كشف الكلمة الزائدة للقياس؛ --inject-extra K: يحقن كلمة «كثيرا» بين الكلمتين p وp+1 (p مضاعف K) في كل نافذة تحويهما (محاكاة قارئ يزيد كلمة) */
const detectExtra = rest.includes("--extra");
const injectK = rest.includes("--inject-extra") ? Number(rest[rest.indexOf("--inject-extra") + 1]) : 0;
const corruptK = rest.includes("--corrupt") ? Number(rest[rest.indexOf("--corrupt") + 1]) : 0;
mkdirSync(outDir!, { recursive: true });
const ref0 = JSON.parse(readFileSync(join(setDir!, "ref.json"), "utf8")) as Array<{ textUthmani: string; verseKey: string; pos: number }>;

for (const f of readdirSync(runDir!).filter((x) => x.endsWith(".json"))) {
  const run = JSON.parse(readFileSync(join(runDir!, f), "utf8"));
  const texts = ref0.map((r) => r.textUthmani);
  if (corruptK > 0 && !(run.corrupted as number[]).length) {
    run.corrupted = [];
    for (let i = 5; i < texts.length; i += corruptK) (run.corrupted as number[]).push(i);
  }
  for (const i of run.corrupted as number[]) texts[i] = texts[(i + 17) % texts.length]!;
  const matcher = new TasmeeMatcher(texts.map((t, i) => ({ id: `${ref0[i]!.verseKey}:${ref0[i]!.pos}`, text: t })), { ...paramsForStrictness(level), stableHyps: stable, ...(detectExtra ? { detectExtra: true } : {}) });
  const guard = new HallucinationGuard();
  const extras: Array<{ afterIndex: number; heard: string; time: number }> = [];
  const injected = new Set<number>();
  const refForms = texts.map((t) => quranWordForms(t));
  const same = (tok: string | null, p: number) => tok !== null && bestWordSimilarity(normalizeQuranWord(tok), refForms[p]!) >= 0.85;
  const inject = (text: string): string => {
    if (!injectK) return text;
    const toks = text.split(/\s+/).filter(Boolean);
    const out: string[] = [];
    for (let i = 0; i < toks.length; i++) {
      out.push(toks[i]!);
      const nx = i + 1 < toks.length ? toks[i + 1]! : null;
      for (let p = injectK; p + 1 < refForms.length; p += injectK) {
        if (same(toks[i]!, p) && same(nx, p + 1)) { out.push("كثيرا"); injected.add(p); break; }
      }
    }
    return out.join(" ");
  };
  const words: Array<{ index: number; state: string; time: number }> = [];
  for (const d of run.decodes as Array<{ audioEnd: number; computeMs: number; text: string }>) {
    const finish = (d as { finish?: number }).finish ?? d.audioEnd + d.computeMs / 1000;
    const text = inject(d.text);
    if (useGuard && guard.decide(text, finish * 1000) !== "use") continue;
    for (const e of matcher.ingest(text, finish * 1000)) words.push({ index: e.index, state: e.state, time: e.timeMs / 1000 });
    for (const x of matcher.drainExtras()) extras.push({ afterIndex: x.afterIndex, heard: x.heard, time: x.timeMs / 1000 });
  }
  writeFileSync(join(outDir!, f), JSON.stringify({ ...run, words, extras, injected: [...injected] }));
}
console.log("replayed", readdirSync(outDir!).length, "runs ->", outDir);
