/**
 * بوابة: تنسيق .hs-card (بطاقة مصطلح الحديث) في ملف واحد، والبطاقة لا تحمل hdl-entry-card
 * (grid auto 1fr auto) الذي كان يضيّق فقرات التعريف/التنبيه/المثال.
 * تشغيل: node --import tsx src/lib/__tests__/hs-card-layout-gate.test.ts
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const styles = join(root, "src/styles");
const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? cssFiles(p) : p.endsWith(".css") ? [p] : [];
  });

const offenders = cssFiles(styles)
  .filter((f) => !f.endsWith("pages/hadith-mustalah.css"))
  .filter((f) => /(^|[\s,}])(?:html[^{,]*\s)?(?:\.hs-page\s)?\.hs-card\s*[,{]/m.test(readFileSync(f, "utf8")))
  .map((f) => f.replace(styles, ""));
assert.deepEqual(offenders, [], `.hs-card مُنسَّق خارج hadith-mustalah.css: ${offenders.join(", ")}`);

const css = readFileSync(join(styles, "pages/hadith-mustalah.css"), "utf8");
const block = css.match(/\n\.hs-card \{([^}]*)\}/)?.[1] ?? "";
assert.match(block, /width:\s*100%/, "البطاقة بعرض كامل");
assert.match(block, /margin-inline:\s*0/, "بلا margin تلقائي (article{margin-inline:auto})");
assert.match(block, /display:\s*block/, "البطاقة block لا grid");

const tsx = readFileSync(join(root, "src/pages/hadith/ui/HadithScienceView.tsx"), "utf8");
assert.doesNotMatch(tsx, /hs-card[^`"]*hdl-entry-card/, "وسم البطاقة لا يحمل hdl-entry-card");

console.log("hs-card-layout-gate.test.ts: ok");
