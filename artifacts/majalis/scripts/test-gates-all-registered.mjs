#!/usr/bin/env node
// يفشل إن وُجد سكربت بوابة (test|verify|check-*) غير مسجّل في gate-registry.json
// وغير مُشار إليه في package.json أو .github/workflows. سقف knownBroken لا يزيد.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const KNOWN_BROKEN_MAX = 21;

const reg = JSON.parse(readFileSync(join(here, "gate-registry.json"), "utf8"));
const registered = new Set([
  ...reg.fast,
  ...reg.heavy,
  ...reg.knownBroken.map((x) => x.script),
  ...reg.excluded.map((x) => x.script),
]);
let refs = readFileSync(join(root, "package.json"), "utf8");
const wf = join(root, "../../.github/workflows");
if (existsSync(wf)) for (const f of readdirSync(wf)) refs += readFileSync(join(wf, f), "utf8");

const errors = [];
for (const f of readdirSync(here)) {
  if (!/^(test|verify|check)-.*\.(mjs|js)$/.test(f)) continue;
  if (!registered.has(f) && !refs.includes(f)) errors.push(`غير مسجّل: scripts/${f} — أضفه إلى gate-registry.json أو اربطه في package.json`);
}
for (const s of registered) if (!existsSync(join(here, s))) errors.push(`مسجّل لكنه محذوف: ${s}`);
if (reg.knownBroken.length > KNOWN_BROKEN_MAX) errors.push(`knownBroken تجاوز السقف ${KNOWN_BROKEN_MAX} (الحالي ${reg.knownBroken.length}) — أصلح بوابة بدل إضافة أخرى`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`✓ كل البوابات مسجّلة (${registered.size} مسجّل)`);
