#!/usr/bin/env node
// يولّد شاشات SwiftUI لكل قسم من القوالب الثمانية حسب ROUTE_TEMPLATE_MAP.json (لا تُكتب الأقسام يدويًا).
// الاستخدام: node scripts/generate-native-screens.mjs [--map path] [--out dir] [--check]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "ios/App/SunnahNative");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const mapPath = resolve(arg("--map", join(root, "../../docs/native/ROUTE_TEMPLATE_MAP.json")));
const owner = arg("--owner", "ن2");
const outDir = resolve(arg("--out", join(pkg, "Sources/SunnahNative/Generated")));
const check = process.argv.includes("--check");
/* شاشات يحلّ محلها تسجيل أصلي بالمعرّف نفسه (registerView): لا تُولَّد، فلا مراجع bundled ميتة. المصدر: overriddenGenerated في docs/native/data-exemptions.json (قيمة «<id> ← ...») */
const exFile = join(root, "../../docs/native/data-exemptions.json");
const nativeOverridden = new Set(existsSync(exFile) ? Object.entries(JSON.parse(readFileSync(exFile, "utf8")).overriddenGenerated ?? {}).filter(([k]) => k[0] !== "_").map(([, v]) => String(v).split(" ←")[0]) : []);

const NEEDS_ID = new Set(["detail", "article", "audio"]);
const TEMPLATES = new Set(["list", "detail", "article", "grid", "quiz", "search", "audio", "sections"]);
const q = (s) => JSON.stringify(s);
const pascal = (s) => s.replace(/(^|[-_.])(\w)/g, (_, __, c) => c.toUpperCase());
const fail = (m) => { console.error("generate-native-screens: " + m); process.exit(1); };

// خريطة ن4: routes مسطّحة {path,section,template(عربي),owner}؛ نولّد مسارات المالك فقط (الخاصة لـن3 تُكتب يدويًا).
const TEMPLATE_AR = { "قائمة": "list", "تفاصيل": "detail", "مقال": "article", "شبكة": "grid", "اختبار": "quiz", "بحث": "search", "صوت": "audio", "أقسام": "sections" };
const SECTION_ID = { "السيرة والتاريخ والأعلام": "sirah", "العقيدة والتزكية": "aqidah", "الفقه والعبادات": "fiqh", "اللغة والمكتبة والبحث": "library", "القرآن": "quran", "الحساب والإعدادات": "account", "الدروس والتعلم": "learn", "الحديث والسنة": "hadith", "الأذكار والأدعية": "adhkar" };
const raw = JSON.parse(readFileSync(mapPath, "utf8"));
if (!Array.isArray(raw.routes) || !raw.routes.length) fail("routes مفقودة في الخريطة");
const bySec = new Map();
for (const r of raw.routes) {
  if (r.owner !== owner || r.template === "خاصة") continue;
  const t = TEMPLATE_AR[r.template];
  if (!t) fail(`قالب غير معروف «${r.template}» في ${r.path}`);
  const id = SECTION_ID[r.section];
  if (!id) fail(`قسم غير معروف «${r.section}»`);
  if (!bySec.has(id)) bySec.set(id, { id, title: r.section, routes: [] });
  bySec.get(id).routes.push({ path: r.path, template: t });
}
const map = { sections: [...bySec.values()] };
if (!map.sections.length) fail(`لا مسارات للمالك ${owner}`);

const CONTENT = { detail: "ContentItem", article: "ContentItem", audio: "ContentItem",  list: "[ContentItem]", grid: "[ContentItem]", search: "[ContentItem]", quiz: "[QuizQuestion]", sections: "[SectionLink]" };

// مصدر البيانات: route.source إن وُجد، وإلا ملف محزوم باسم المقاطع الحرفية قبل أول معامل (قائمة القسم نفسها لمسارات :id)
function sourceName(r) {
  if (r.source) return r.source;
  const lit = r.params.length ? r.segs.slice(0, r.params[0].at) : r.segs;
  return lit.join("-");
}

function templateExpr(r, base) {
  switch (r.template) {
    case "list": return `ListTemplate(items: content, detailBase: ${q(base)})`;
    case "grid": return `CardGridTemplate(items: content, detailBase: ${q(base)})`;
    case "search": return `SearchTemplate(items: content, detailBase: ${q(base)})`;
    case "detail": case "article": case "audio": return `${itemView[r.template]}(item: content)`;
    case "quiz": return "QuizTemplate(questions: content)";
    case "sections": return "SectionsListTemplate(links: content)";
  }
}

const itemView = { detail: "DetailTemplate", article: "ArticleTemplate", audio: "AudioPlayerTemplate" };

function parseRoute(r, secId) {
  if (!r.path?.startsWith("/")) fail(`مسار غير صالح في ${secId}: ${r.path}`);
  if (!TEMPLATES.has(r.template)) fail(`قالب غير معروف «${r.template}» في ${r.path}`);
  const segs = r.path.split("/").filter(Boolean);
  const params = segs.flatMap((x, at) => (x.startsWith(":") ? [{ name: x.slice(1), at }] : []));
  return { ...r, segs, params };
}

const header = "// مُولَّد بـ scripts/generate-native-screens.mjs من ROUTE_TEMPLATE_MAP.json — لا تعدّل يدويًا.\nimport SwiftUI\n\n";
const files = new Map();
const sectionTypes = [];
const seen = new Set(), seenIds = new Set(), seenNames = new Set();

for (const sec of map.sections) {
  if (!/^[a-z][a-z0-9-]*$/.test(sec.id)) fail(`معرّف قسم غير صالح: ${sec.id}`);
  const routes = sec.routes.map((r) => parseRoute(r, sec.id));
  for (const r of routes) { if (seen.has(r.path)) fail(`مسار مكرر: ${r.path}`); seen.add(r.path); }
  const name = pascal(sec.id) + "Screens";
  sectionTypes.push(name);
  const structs = [], regs = [], param = [];
  for (const r of routes) {
    if (r.params.length) {
      const conds = [`c.count == ${r.segs.length}`, ...r.segs.flatMap((x, i) => (x.startsWith(":") ? [] : [`c[${i}] == ${q(x)}`]))];
      const src = `.bundled(name: ${q(sourceName(r))})`;
      const body = itemView[r.template]
        ? `ItemHost(source: ${src}, id: c[${r.params[0].at}]) { ${itemView[r.template]}(item: $0) }`
        : `CollectionHost(source: ${src}) { ${templateExpr(r, "/" + r.segs.slice(0, r.params[0].at).join("/")).replace("content", "$0")} }`;
      param.push({ r, line: `        if ${conds.join(", ")} { return AnyView(${body}) }` });
      continue;
    }
    const id = r.segs.join(".");
    const sname = pascal(sec.id) + pascal(r.segs.join("-")) + "Screen";
    if (seenIds.has(id) || seenNames.has(sname)) fail(`تعارض اسم/معرّف شاشة: ${r.path}`);
    seenIds.add(id); seenNames.add(sname);
    if (sec.id === "sirah" && nativeOverridden.has(id)) continue;
    structs.push(`struct ${sname}: ScreenTemplate {\n    static let id = ${q(id)}\n    static let title = ${q(sec.title)}\n    static let source = ContentSource.bundled(name: ${q(sourceName(r))})\n    typealias Content = ${CONTENT[r.template]}\n    let content: Content\n    init(content: Content) { self.content = content }\n    var body: some View { ${templateExpr(r, "/" + r.segs.join("/"))} }\n}\n`);
    regs.push(`        registry.register(${sname}.self)`);
  }
  param.sort((a, b) => b.r.segs.length - a.r.segs.length);
  const resolveBody = param.map((x) => x.line).join("\n");
  files.set(`${name}.swift`, `${header}${structs.join("\n")}\n/// قسم «${sec.title}». المسارات بلا معاملات تُسجَّل في TemplateRegistry (Route.native(id:))، وذات :id تُحلّ بـresolve.\npublic enum ${name} {\n    @MainActor public static func register(in registry: TemplateRegistry) {\n${regs.join("\n") || "        _ = registry"}\n    }\n\n    static func resolve(_ c: [String]) -> AnyView? {\n${resolveBody ? resolveBody + "\n" : ""}        return nil\n    }\n}\n`);
}

const regAll = sectionTypes.map((n) => `        ${n}.register(in: registry)`).join("\n");
const resAll = sectionTypes.map((n) => `        if let v = ${n}.resolve(c) { return v }`).join("\n");
files.set("GeneratedScreens.swift", `${header}public enum GeneratedScreens {\n    /// يسجّل كل القوالب بلا معاملات؛ يُستدعى مرة من نقطة الدخول.\n    @MainActor public static func registerAll(in registry: TemplateRegistry) {\n${regAll}\n    }\n\n    /// يحوّل مسار /section/:id إلى شاشته، أو nil.\n    public static func resolve(path: String) -> AnyView? {\n        let c = path.split(separator: "/").map(String.init)\n${resAll}\n        return nil\n    }\n}\n`);

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
