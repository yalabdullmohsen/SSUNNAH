/**
 * قائمة النظام القديم الوحيدة (مصدر واحد): تقرؤها ui-ratchet والاختبار التعاقدي.
 * الأسماء تُستنتج من تصديرات مجلدات النظام القديم نفسها فلا تُكتب يدويًا في أي اختبار.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const OLD_IMPORT = /(?:from|import)\s*\(?\s*["']@\/components\/(?:design-system|ui-common|ui\/mj)(?:\/[^"']*)?["']/g;

const LEGACY_DIRS = ["src/components/design-system", "src/components/ui/mj"];
const LEGACY_FILES = ["src/components/ui-common.tsx"];
const EXPORT_RE = /export (?:function|const) ([A-Z][A-Za-z0-9]+)/g;

const exportsOf = (file) => [...readFileSync(file, "utf8").matchAll(EXPORT_RE)].map((m) => m[1]);
const tsFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? tsFiles(p) : /\.tsx?$/.test(e.name) ? [p] : [];
  });

/** أسماء مكوّنات النظام القديم التي لا يملك النظام الجديد مثلها (≥6 أحرف). */
export function legacyComponentNames() {
  const legacy = new Set();
  for (const d of LEGACY_DIRS) if (existsSync(join(root, d))) tsFiles(join(root, d)).forEach((f) => exportsOf(f).forEach((n) => legacy.add(n)));
  for (const f of LEGACY_FILES) if (existsSync(join(root, f))) exportsOf(join(root, f)).forEach((n) => legacy.add(n));
  const current = new Set(tsFiles(join(root, "src/design-system")).flatMap(exportsOf));
  return [...legacy].filter((n) => !current.has(n) && n.length >= 6).sort();
}
