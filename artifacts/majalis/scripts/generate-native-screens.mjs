#!/usr/bin/env node
// يولّد شاشات SwiftUI لكل قسم من القوالب الثمانية حسب ROUTE_TEMPLATE_MAP.json (لا تُكتب الأقسام يدويًا).
// الاستخدام: node scripts/generate-native-screens.mjs [--map path] [--out dir] [--check]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "ios/App/SunnahNative");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const mapPath = resolve(arg("--map", join(pkg, "ROUTE_TEMPLATE_MAP.json")));
const outDir = resolve(arg("--out", join(pkg, "Sources/SunnahNative/Generated")));
const check = process.argv.includes("--check");

const NEEDS_ID = new Set(["detail", "article", "audio"]);
const TEMPLATES = new Set(["list", "detail", "article", "grid", "quiz", "search", "audio", "sections"]);
const q = (s) => JSON.stringify(s);
const pascal = (s) => s.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
const fail = (m) => { console.error("generate-native-screens: " + m); process.exit(1); };

const map = JSON.parse(readFileSync(mapPath, "utf8"));
if (!Array.isArray(map.sections) || !map.sections.length) fail("sections مفقودة في الخريطة");

function expr(sec, route, base) {
  const t = route.template, s = q(sec.id), title = q(sec.title);
  const idArg = () => `id: c[${route.params[0].at}]`;
  const openItem = `{ open($0.route ?? ${q(base)} + "/" + $0.id) }`;
  switch (t) {
    case "list": return `ListTemplate(section: ${s}, title: ${title}, open: ${openItem})`;
    case "grid": return `CardGridTemplate(section: ${s}, title: ${title}, open: ${openItem})`;
    case "detail": return `DetailTemplate(section: ${s}, ${idArg()})`;
    case "article": return `ArticleTemplate(section: ${s}, ${idArg()})`;
    case "audio": return `AudioPlayerTemplate(section: ${s}, ${idArg()})`;
    case "quiz": return `QuizTemplate(section: ${s}, title: ${title})`;
    case "search": return `SearchTemplate(section: ${sec.id === "search" ? "nil" : s}, title: ${title}, open: ${openItem})`;
    case "sections": return `SectionsListTemplate(section: ${s}, title: ${title}, open: { open($0.route) })`;
  }
}

function parseRoute(r, secId) {
  if (!r.path?.startsWith("/")) fail(`مسار غير صالح في ${secId}: ${r.path}`);
  if (!TEMPLATES.has(r.template)) fail(`قالب غير معروف «${r.template}» في ${r.path}`);
  const segs = r.path.split("/").filter(Boolean);
  const params = segs.flatMap((x, at) => (x.startsWith(":") ? [{ name: x.slice(1), at }] : []));
  if (NEEDS_ID.has(r.template) && !params.length) fail(`${r.path}: القالب ${r.template} يحتاج معاملًا :id`);
  return { ...r, segs, params };
}

const header = "// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.\nimport SwiftUI\n\n";
const files = new Map();
const sectionTypes = [];
const seen = new Set();

for (const sec of map.sections) {
  if (!/^[a-z][a-z0-9-]*$/.test(sec.id)) fail(`معرّف قسم غير صالح: ${sec.id}`);
  const routes = sec.routes.map((r) => parseRoute(r, sec.id));
  for (const r of routes) { if (seen.has(r.path)) fail(`مسار مكرر: ${r.path}`); seen.add(r.path); }
  // الأكثر حرفية أولًا حتى لا يبتلع :id المسارات الثابتة
  routes.sort((a, b) => a.params.length - b.params.length || b.segs.length - a.segs.length);
  const detail = routes.find((r) => r.params.length && !NEEDS_ID.has(r.template) === false);
  const base = detail ? "/" + detail.segs.slice(0, detail.params[0].at).join("/") : "/" + sec.id;
  const name = pascal(sec.id) + "Screens";
  sectionTypes.push(name);
  const body = routes.map((r) => {
    const conds = [`c.count == ${r.segs.length}`, ...r.segs.flatMap((x, i) => (x.startsWith(":") ? [] : [`c[${i}] == ${q(x)}`]))];
    return `        if ${conds.join(", ")} { return AnyView(${expr(sec, r, base)}) }`;
  }).join("\n");
  files.set(`${name}.swift`, `${header}/// قسم «${sec.title}».\npublic enum ${name} {\n    public static let title = ${q(sec.title)}\n    public static func resolve(_ c: [String], open: @escaping (String) -> Void) -> AnyView? {\n${body}\n        return nil\n    }\n}\n`);
}

const reg = sectionTypes.map((n) => `        if let v = ${n}.resolve(c, open: open) { return v }`).join("\n");
files.set("GeneratedScreens.swift", `${header}public enum GeneratedScreens {\n    /// يحوّل مسارًا أصليًا إلى شاشته، أو nil إن لم يكن له قالب.\n    public static func resolve(path: String, open: @escaping (String) -> Void) -> AnyView? {\n        let c = path.split(separator: "/").map(String.init)\n${reg}\n        return nil\n    }\n}\n`);

let stale = false;
if (!check) mkdirSync(outDir, { recursive: true });
for (const [f, text] of files) {
  const p = join(outDir, f);
  const cur = existsSync(p) ? readFileSync(p, "utf8") : null;
  if (cur !== text) { stale = true; if (!check) writeFileSync(p, text); }
}
if (existsSync(outDir)) for (const f of readdirSync(outDir)) if (!files.has(f) && f.endsWith(".swift")) { stale = true; if (!check) rmSync(join(outDir, f)); }
if (check && stale) fail("الملفات المولّدة قديمة — شغّل المولّد");
console.log(`${check ? "ok" : "generated"}: ${map.sections.map((s) => s.id).join(", ")}`);
