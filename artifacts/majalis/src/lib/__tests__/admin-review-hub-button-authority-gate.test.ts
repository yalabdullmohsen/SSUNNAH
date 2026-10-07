/**
 * ADMIN review-hub — raw <button> → official Button (Interaction System).
 * node --import tsx src/lib/__tests__/admin-review-hub-button-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const dir = "src/components/admin/review-hub";
const migrated = [
  `${dir}/RecitationReviewCard.tsx`,
  `${dir}/ReviewHubWorkspace.tsx`,
  `${dir}/ContentModerationCard.tsx`,
  `${dir}/LinearAudioReviewPlayer.tsx`,
  `${dir}/ReviewHubHeaderBar.tsx`,
  `${dir}/ReviewHubSidebar.tsx`,
] as const;

let buttons = 0;
for (const rel of migrated) {
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: no raw <button>`);
  assert.match(
    text,
    /from ["']@\/components\/ui\/button["']/,
    `${rel}: official Button import`,
  );
  const count = (text.match(/<Button\b/g) ?? []).length;
  assert.ok(count > 0, `${rel}: uses <Button>`);
  buttons += count;
}

// Semantic variants for decisions.
assert.match(read(`${dir}/RecitationReviewCard.tsx`), /variant="destructive"/);
assert.match(read(`${dir}/ContentModerationCard.tsx`), /variant="destructive"/);
assert.match(read(`${dir}/ReviewHubWorkspace.tsx`), /role="tab"/);

// Icon-only buttons keep an accessible name.
for (const rel of [
  `${dir}/ReviewHubHeaderBar.tsx`,
  `${dir}/LinearAudioReviewPlayer.tsx`,
]) {
  const text = read(rel);
  // Opening tag spans until the standalone `>` line (handlers contain `=>`).
  const iconButtons = (text.match(/<Button\b[\s\S]*?\n\s*>\n/g) ?? []).filter((tag) =>
    tag.includes('size="icon"'),
  );
  assert.ok(iconButtons.length > 0, `${rel}: icon button present`);
  for (const tag of iconButtons) {
    assert.match(tag, /aria-label=/, `${rel}: icon Button keeps aria-label`);
  }
}

// Sidebar rows keep list-row layout (start-aligned, wrapping).
const sidebar = read(`${dir}/ReviewHubSidebar.tsx`);
assert.match(sidebar, /justify-start/);
assert.match(sidebar, /whitespace-normal/);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(
  `admin-review-hub-button-authority-gate: ok (files=${migrated.length}, buttons=${buttons})`,
);
