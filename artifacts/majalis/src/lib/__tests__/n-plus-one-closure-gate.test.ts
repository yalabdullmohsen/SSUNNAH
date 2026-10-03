/**
 * N+1 closure regression — confirmed fixes must stay batched.
 * Run: node --import tsx src/lib/__tests__/n-plus-one-closure-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

// flashcard: batch upsert of mapped chunk
const flash = read("src/lib/flashcard-service.ts");
assert.match(flash, /syncDirtyFlashcardReviews/);
assert.match(flash, /chunk\.map/);
assert.match(flash, /onConflict:\s*["']user_id,card_type,card_id["']/);
assert.doesNotMatch(
  flash,
  /for \(const row of dirty\) \{\s*try \{\s*await supabase\.from\("flashcard_reviews"\)\.upsert/,
);

// guest merge: batch bookmark insert
const guest = read("src/lib/guest-cloud-merge.ts");
assert.match(guest, /from\("bookmarks"\)\.insert\(toInsert\)/);
assert.match(guest, /from\("user_notes"\)\.insert\(noteRows\)/);

// learning paths: batch assessment + questions
const lp = read("src/lib/learning-paths-admin-service.ts");
assert.match(lp, /adminValidateCourseForPublish/);
assert.match(lp, /\.in\("id", assessmentIds\)/);
assert.match(lp, /\.in\("assessment_id", assessmentIds\)/);
assert.doesNotMatch(
  lp,
  /for \(const item of requiredAssessmentItems\) \{\s*const \{ data: assessment \} = await supabase/,
);

// cms: buffered import_job_rows
const cms = read("src/lib/cms/cms-service.ts");
assert.match(cms, /jobRowBuffer/);
assert.match(cms, /from\("import_job_rows"\)\.insert\(jobRowBuffer\.slice/);

// categories bulk: prefetch lessons/series
const cats = read("src/lib/categories-admin-service.ts");
assert.match(cats, /adminBulkPublishCategories/);
assert.match(cats, /\.in\("category_id", ids\)/);
assert.match(cats, /withContent/);

console.log("n-plus-one-closure-gate: ok (CONFIRMED batches held)");
