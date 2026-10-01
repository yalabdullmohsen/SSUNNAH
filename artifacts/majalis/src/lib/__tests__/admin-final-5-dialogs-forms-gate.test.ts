/**
 * ADMIN-FINAL-5 — Browser dialogs banned in live Admin; authority hooks present.
 * Run: node --import tsx src/lib/__tests__/admin-final-5-dialogs-forms-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const src = join(root, "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(name) && !name.includes(".test.")) acc.push(p);
  }
  return acc;
}


const scopes = [join(src, "views/admin"), join(src, "admin-v3")];
const offenders: string[] = [];
for (const scope of scopes) {
  if (!existsSync(scope)) continue;
  for (const file of walk(scope)) {
    const text = readFileSync(file, "utf8");
    // PCRE-like: Node doesn't support lookbehind in all engines the same way — use simpler scans
    if (/\bwindow\.(confirm|prompt|alert)\s*\(/.test(text)) {
      offenders.push(`${file}: window.*`);
      continue;
    }
    if (/(^|[^.\w$])confirm\s*\(\s*[`"']/.test(text)) {
      offenders.push(`${file}: confirm(string)`);
      continue;
    }
    if (/(^|[^.\w$])prompt\s*\(\s*[`"']/.test(text)) {
      offenders.push(`${file}: prompt(string)`);
      continue;
    }
    // bare alert( — allow await alert( from useAdminAlert
    const alertHits = [...text.matchAll(/(^|[^.\w$])alert\s*\(/g)];
    for (const m of alertHits) {
      const idx = m.index ?? 0;
      // match may start at a boundary char before `alert`
      const alertAt = text.indexOf("alert", idx);
      const before = text.slice(Math.max(0, alertAt - 6), alertAt);
      if (before !== "await ") {
        offenders.push(`${file}: bare alert(`);
        break;
      }
    }
  }
}

assert.equal(offenders.length, 0, `browser dialogs remain:\n${offenders.join("\n")}`);

const authority = readFileSync(join(src, "components/admin/AdminConfirmDialog.tsx"), "utf8");
assert.match(authority, /export function useAdminConfirm/);
assert.match(authority, /export function useAdminAlert/);
assert.match(authority, /export function useAdminPrompt/);
assert.match(authority, /role="alertdialog"/);
assert.match(authority, /adm-prompt-input|adm-prompt-title/);
assert.doesNotMatch(authority, /window\.(confirm|prompt|alert)\s*\(/);

// Sample live consumers must use authority
for (const rel of [
  "views/admin/FawaidSection.tsx",
  "views/admin/LessonsSection.tsx",
  "views/admin/CategoriesSection.tsx",
  "views/admin/TelegramSection.tsx",
  "admin-v3/domains/content/EntityCrudPage.tsx",
]) {
  const text = readFileSync(join(src, rel), "utf8");
  assert.match(text, /useAdminConfirm|AdminConfirmDialog/);
}

const report = readFileSync(
  join(root, "../../docs/admin/ADMIN_FINAL_5_DIALOGS_AND_FORMS_REPORT.md"),
  "utf8",
);
assert.match(report, /ADMIN_FINAL_5/);
assert.match(report, /useAdminConfirm|AdminConfirmDialog/);
assert.match(report, /Gate|بوابة/);

console.log("admin-final-5-dialogs-forms-gate.test.ts: ok");
