/**
 * مصدر واحد لخطة ci:local: تُشتق من وظيفة repo-gates في .github/workflows/ci.yml
 * وتُفكَّك سلاسل package.json إلى أوامر ورقية. لا قائمة يدوية تنحرف عن CI.
 */
import { readFileSync } from "node:fs";
import { basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => JSON.parse(readFileSync(resolve(ROOT, p), "utf8"));

/** خطوات repo-gates: [{ name, cmds[], optional }] */
export function repoGatesSteps(yml = readFileSync(resolve(ROOT, ".github/workflows/ci.yml"), "utf8")) {
  const lines = yml.split("\n");
  const start = lines.findIndex((l) => /^  repo-gates:\s*$/.test(l));
  if (start < 0) throw new Error("repo-gates غير موجودة في ci.yml");
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) if (/^  [A-Za-z0-9_-]+:\s*$/.test(lines[i])) { end = i; break; }
  const body = lines.slice(start + 1, end);
  const steps = [];
  let cur = null;
  for (let i = 0; i < body.length; i++) {
    const l = body[i];
    if (/^      - /.test(l)) { cur = { name: (l.match(/name:\s*(.+)$/) ?? [])[1] ?? "", cmds: [], optional: false }; steps.push(cur); }
    if (!cur) continue;
    if (/^\s+continue-on-error:\s*true/.test(l)) cur.optional = true;
    const m = l.match(/^\s+run:\s*(.*)$/);
    if (!m) continue;
    if (/^[|>]-?$/.test(m[1])) {
      const indent = (body[i + 1].match(/^\s*/) ?? [""])[0].length;
      for (let j = i + 1; j < body.length && (body[j].trim() === "" || body[j].match(/^\s*/)[0].length >= indent); j++) if (body[j].trim()) cur.cmds.push(body[j].trim());
    } else cur.cmds.push(m[1].trim());
  }
  return steps.filter((s) => s.cmds.length);
}

/** يفكّك أمر pnpm إلى أوامر ورقية { cmd, cwd } عبر scripts في package.json (الجذر أو التطبيق). */
export function expandCommand(raw, seen = new Set()) {
  const scriptsOf = { root: readJson("package.json").scripts ?? {}, app: readJson("artifacts/majalis/package.json").scripts ?? {} };
  const out = [];
  const visit = (cmd, scope) => {
    for (const part of cmd.split(/\s*&&\s*/)) {
      const app = part.match(/^pnpm --filter @workspace\/majalis run ([\w:.-]+)$/);
      const run = part.match(/^pnpm (?:run )?([\w:.-]+)$/);
      const target = app ? ["app", app[1]] : run ? [scope, run[1]] : null;
      const body = target && scriptsOf[target[0]][target[1]];
      if (body != null) {
        const key = `${target[0]}:${target[1]}`;
        if (!seen.has(key)) { seen.add(key); visit(body, target[0]); }
      } else out.push({ cmd: part, cwd: scope === "app" ? "artifacts/majalis" : "." });
    }
  };
  visit(raw, "root");
  return out;
}

export function repoGatesLeaves() {
  const seen = new Set();
  return repoGatesSteps().flatMap((s) => s.cmds.flatMap((c) => expandCommand(c, seen).map((x) => ({ ...x, step: s.name, optional: s.optional }))));
}

/** بوابات رخيصة عامة (سقوف/عدّادات) تعمل دائمًا محليًا لأنها لا تتبع نطاق الملفات المتغيّرة. */
export const isBudgetGate = (leaf) => /--check\b|budget|ratchet|inventory/.test(leaf.cmd);

/**
 * إبر انتقاء الاختبارات من الملفات المتغيّرة (مسارات نسبةً إلى artifacts/majalis).
 * package.json يقرؤه أكثر من مئة اختبار، فاسمه إبرة عامة تختار كل ما يذكره. بدلها تُشتق إبره من أسطره
 * المتغيّرة فقط (`pkgDiff`): المفاتيح (أسماء السكربتات والاعتماديات) والمسارات داخل القيم — فيُختار كل اختبار
 * يذكر ما تغيّر فعلًا، ولا تتغيّر إبر أي ملف آخر.
 */
export function selectionNeedles(appFiles, pkgDiff = "") {
  const needles = appFiles
    .filter((f) => f !== "package.json" && /\.(tsx?|css|mjs|json)$/.test(f))
    .flatMap((f) => [f, basename(f).replace(/\.[^.]+$/, "")])
    .filter((n) => n.length >= 6);
  if (appFiles.includes("package.json")) {
    for (const line of pkgDiff.split("\n")) {
      if (!/^[+-](?![+-]{2})/.test(line)) continue;
      const key = line.match(/^[+-]\s*"([^"]+)"\s*:/)?.[1];
      if (key && key.length >= 3) needles.push(key);
      for (const tok of line.slice(1).split(/[\s"&|;,()]+/)) {
        if (/[\w-]+\/[\w./-]+\.\w+$/.test(tok)) needles.push(tok, basename(tok).replace(/\.[^.]+$/, ""));
      }
    }
  }
  return [...new Set(needles)].filter((n) => n.length >= 3);
}
