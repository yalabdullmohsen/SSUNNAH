import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(__dirname, "../../..");
const styles = join(root, "src/styles");

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? cssFiles(p) : p.endsWith(".css") ? [p] : [];
  });
}

/** تنسيق .hs-card (بطاقة مصطلح الحديث) في ملف واحد، ولا تحمل البطاقة صنف hdl-entry-card (grid auto 1fr auto) فتضيّق الفقرات. */
describe("hs-card layout gate", () => {
  it("المصدر الوحيد لـ.hs-card هو pages/hadith-mustalah.css", () => {
    const offenders = cssFiles(styles)
      .filter((f) => !f.endsWith("pages/hadith-mustalah.css"))
      .filter((f) => /(^|[\s,}])(?:html[^{,]*\s)?(?:\.hs-page\s)?\.hs-card\s*[,{]/m.test(readFileSync(f, "utf8")))
      .map((f) => f.replace(styles, ""));
    expect(offenders).toEqual([]);
  });

  it("البطاقة بعرض كامل وبلا margin تلقائي يقلّصها", () => {
    const css = readFileSync(join(styles, "pages/hadith-mustalah.css"), "utf8");
    const block = css.match(/\n\.hs-card \{([^}]*)\}/)?.[1] ?? "";
    expect(block).toMatch(/width:\s*100%/);
    expect(block).toMatch(/margin-inline:\s*0/);
    expect(block).toMatch(/display:\s*block/);
  });

  it("وسم البطاقة لا يحمل hdl-entry-card", () => {
    const tsx = readFileSync(join(root, "src/pages/hadith/ui/HadithScienceView.tsx"), "utf8");
    expect(tsx).not.toMatch(/hs-card[^`"]*hdl-entry-card/);
  });
});
