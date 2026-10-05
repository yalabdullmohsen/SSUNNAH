/**
 * بوابة ثابتة: توافق الأجهزة في كل الأحجام (Fold 280 → 1920، iPad Split View، أفقي).
 * تشغيل: node --import tsx src/lib/__tests__/device-compat-gate.test.ts
 * المصفوفة الحية (خارج المسار الإلزامي): tests/device-compat-matrix.spec.ts
 * التقرير: docs/qa/DEVICE_COMPAT_MATRIX.md
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "node_modules" || name === "__tests__") continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");

// ── 1) viewport meta ─────────────────────────────────────────────────
const html = read("index.html");
const meta = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/)?.[1] ?? "";
assert.match(meta, /width=device-width/, "viewport: width=device-width");
assert.match(meta, /initial-scale=1/, "viewport: initial-scale=1");
assert.match(meta, /viewport-fit=cover/, "viewport: viewport-fit=cover (الحواف الآمنة)");
assert.doesNotMatch(meta, /maximum-scale\s*=\s*1(?![.\d])|user-scalable\s*=\s*(no|0)/, "viewport: لا تمنع تكبير المستخدم (WCAG 1.4.4)");

// ── 2) iPad multitasking: الاتجاهات الأربعة، ولا UIRequiresFullScreen ──
const plistPath = "ios/App/App/Info.plist";
if (existsSync(resolve(root, plistPath))) {
  const plist = read(plistPath);
  const ipad = plist.match(/<key>UISupportedInterfaceOrientations~ipad<\/key>\s*<array>([\s\S]*?)<\/array>/)?.[1] ?? "";
  for (const o of ["Portrait", "PortraitUpsideDown", "LandscapeLeft", "LandscapeRight"]) {
    assert.ok(ipad.includes(`UIInterfaceOrientation${o}<`), `Info.plist iPad: UIInterfaceOrientation${o} مطلوب لـ Split View`);
  }
  assert.doesNotMatch(plist, /<key>UIRequiresFullScreen<\/key>\s*<true\/>/, "Info.plist: UIRequiresFullScreen يعطّل Split View");
}
// Android: لا مجلد android/ حاليًا؛ إن أُضيف يجب ألا يقفل الاتجاه.
for (const manifest of ["android/app/src/main/AndroidManifest.xml", "../../android/app/src/main/AndroidManifest.xml"]) {
  if (existsSync(resolve(root, manifest))) {
    assert.doesNotMatch(read(manifest), /android:screenOrientation="(portrait|landscape)"/, `${manifest}: لا تقفل الاتجاه`);
    assert.doesNotMatch(read(manifest), /android:resizeableActivity="false"/, `${manifest}: يجب دعم تعدد النوافذ`);
  }
}

// ── 3) CSS: لا ارتفاع شاشة كاملة بوحدة vh الخام، لا max-height بـvh (شريط Safari)، لا min-width للجسم ──
const cssFiles = walk(resolve(root, "src"), [".css"]).filter((f) => !/admin/.test(f));
const tsxFiles = walk(resolve(root, "src"), [".tsx"]);
const violations: string[] = [];
// يُبنى ديناميكيًا كي لا يلتقطه verify-ios-edge-gate كاستخدام فعلي.
const RAW_FULL_VH = new RegExp("(^|[^.\\d])100" + "vh\\b");
for (const f of [...cssFiles, ...tsxFiles]) {
  const src = stripComments(readFileSync(f, "utf8"));
  const rel = relative(root, f);
  if (RAW_FULL_VH.test(src)) violations.push(`${rel}: ارتفاع شاشة كاملة بوحدة vh الخام — استخدم dvh/svh أو var(--app-vh)`);
  if (f.endsWith(".css")) {
    for (const m of src.matchAll(/max-height:\s*\d+vh\s*;/g)) violations.push(`${rel}: ${m[0]} — استخدم dvh`);
    // شبكات auto-fill/auto-fit بحدّ أدنى ثابت كبير تكسر 280–320px
    if (!/mushaf|card-system|\/cards\.css|lesson-import/.test(f)) {
      for (const m of src.matchAll(/repeat\(auto-(?:fill|fit),\s*minmax\((\d+(?:\.\d+)?)(px|rem),/g)) {
        const n = Number(m[1]);
        if ((m[2] === "px" && n >= 240) || (m[2] === "rem" && n >= 15)) {
          violations.push(`${rel}: ${m[0]} — لُفّ الحد الأدنى بـ min(…, 100%)`);
        }
      }
    }
  }
}
const finalRelease = stripComments(read("src/styles/final-release.css"));
const breakpoints = stripComments(read("src/styles/breakpoints.css"));
for (const [name, src] of [["final-release.css", finalRelease], ["breakpoints.css", breakpoints]] as const) {
  for (const m of src.matchAll(/(?:^|\})\s*(?:html|body)\s*\{([^}]*)\}/g)) {
    const mw = m[1].match(/min-width:\s*(\d+)px/);
    if (mw && Number(mw[1]) > 280) violations.push(`${name}: html/body min-width ${mw[1]}px يكسر Galaxy Fold 280px`);
  }
}
assert.deepEqual(violations, [], `مخالفات توافق الأجهزة:\n${violations.join("\n")}`);

// ── 4) المصفوفة الحية موجودة وتغطي الحالات المطلوبة ────────────────────
const spec = read("tests/device-compat-matrix.spec.ts");
for (const size of ["280", "320", "360", "375", "393", "430", "507", "678", "768", "1024", "1366", "852", "1280", "1920"]) {
  assert.ok(new RegExp(`(?:width|height):\\s*${size}\\b`).test(spec), `المصفوفة تغطي العرض ${size}`);
}
assert.match(spec, /"dark"/, "المصفوفة تغطي الوضع الداكن");
assert.match(spec, /textScale:\s*2/, "المصفوفة تغطي تكبير النص 200%");
assert.match(spec, /sections\.registry\.ts/, "المسارات مشتقة من سجل الأقسام");
assert.ok(existsSync(resolve(root, "../../docs/qa/DEVICE_COMPAT_MATRIX.md")), "توثيق المصفوفة docs/qa/DEVICE_COMPAT_MATRIX.md");

const pkg = JSON.parse(read("package.json"));
assert.ok(pkg.scripts["test:device-compat"], "سكربت test:device-compat");

console.log("device-compat-gate: OK");
