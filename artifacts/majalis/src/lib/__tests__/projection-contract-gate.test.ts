/**
 * Projection contracts — prevent select-star regression and admin JSON leak to public.
 * Run: node --import tsx src/lib/__tests__/projection-contract-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AUTO_IMPORTED_CONTENT_COLS,
  AUTO_IMPORTED_CONTENT_PUBLIC_COLS,
  DAWAH_QUEUE_COLS,
  TABLE_COLS,
  USER_NOTES_COLS,
  USER_PROGRESS_COLS,
  USER_SUBMISSIONS_COLS,
} from "@/lib/db-select-columns";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const srcRoot = resolve(majalis, "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.includes(".test.")) out.push(p);
  }
  return out;
}

const files = walk(srcRoot);
const starExact = /\.select\(\s*["']\*["']\s*\)/;
const starNested = /\.select\(\s*["']\*\s*,/;
const adminFetchStar = /adminFetchAll\s*\(\s*[^,]+,\s*["']\*["']/;
const countStar = /\.select\(\s*["']\*["']\s*,\s*\{\s*count/;

let starHits = 0;
const offenders: string[] = [];
for (const f of files) {
  const text = readFileSync(f, "utf8");
  if (starExact.test(text) || starNested.test(text) || adminFetchStar.test(text) || countStar.test(text)) {
    // Allow comments mentioning select('*')
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;
      if (starExact.test(line) || starNested.test(line) || adminFetchStar.test(line) || countStar.test(line)) {
        starHits += 1;
        offenders.push(`${f}:${i + 1}:${line.trim().slice(0, 120)}`);
      }
    }
  }
}
assert.equal(starHits, 0, `select-star must stay 0:\n${offenders.slice(0, 20).join("\n")}`);

assert.ok(existsSync(resolve(majalis, "src/lib/db-select-columns.ts")));
assert.ok(AUTO_IMPORTED_CONTENT_COLS.includes("title"));
assert.ok(AUTO_IMPORTED_CONTENT_COLS.includes("ai_analysis"));
assert.ok(!AUTO_IMPORTED_CONTENT_PUBLIC_COLS.includes("ai_analysis"));
assert.ok(!AUTO_IMPORTED_CONTENT_PUBLIC_COLS.includes("structured_data"));
assert.ok(!AUTO_IMPORTED_CONTENT_PUBLIC_COLS.includes("error_details"));
assert.ok(AUTO_IMPORTED_CONTENT_PUBLIC_COLS.includes("summary"));

// Admin queue cols omit full bodies
assert.ok(!DAWAH_QUEUE_COLS.dawah_shubuhat.includes("detailed_refutation"));
assert.ok(DAWAH_QUEUE_COLS.dawah_shubuhat.includes("short_answer"));

// Account ownership fields present
for (const col of ["user_id", "content_type", "progress_pct"]) {
  assert.ok(USER_PROGRESS_COLS.split(",").map((s) => s.trim()).includes(col), col);
}
assert.ok(USER_SUBMISSIONS_COLS.includes("user_id"));
assert.ok(USER_SUBMISSIONS_COLS.includes("status"));

// Learning path table map covers nested admin tables
for (const t of ["learning_paths", "assessments", "assessment_questions"]) {
  assert.ok(TABLE_COLS[t], t);
}

// Smoke: public library service uses PUBLIC cols
const unified = readFileSync(resolve(majalis, "src/lib/unified-content-service.ts"), "utf8");
assert.match(unified, /AUTO_IMPORTED_CONTENT_PUBLIC_COLS|db-select-columns/);
assert.doesNotMatch(unified, /\.select\(\s*["']\*["']\s*\)/);

const auto = readFileSync(resolve(majalis, "src/lib/auto-content-service.ts"), "utf8");
assert.match(auto, /AUTO_IMPORTED_CONTENT_COLS|db-select-columns/);

const vault = readFileSync(resolve(majalis, "src/lib/vault-service.ts"), "utf8");
assert.match(vault, /USER_NOTES_COLS|db-select-columns|select\(/);
assert.doesNotMatch(vault, /\.select\(\s*["']\*["']\s*\)/);
assert.ok(USER_NOTES_COLS.includes("user_id"));
assert.ok(USER_NOTES_COLS.includes("note_text"));

console.log("projection-contract-gate: ok (SELECT_STAR_ZERO_HELD + PUBLIC_SAFE)");
