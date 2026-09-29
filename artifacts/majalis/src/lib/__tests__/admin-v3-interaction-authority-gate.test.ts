/**
 * Admin v3 interaction authority (Interaction PR-7).
 * node --import tsx src/lib/__tests__/admin-v3-interaction-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

assert.ok(existsSync(resolve(repoRoot, "docs/design/ADMIN_V3_INTERACTION_AUTHORITY.md")));
const authority = readRepo("docs/design/ADMIN_V3_INTERACTION_AUTHORITY.md");
assert.match(authority, /Button/);
assert.match(authority, /AppCard/);
assert.match(authority, /InteractiveCard|StatusCard/);
assert.match(authority, /FormLabel/);
assert.match(authority, /FieldError/);
assert.match(authority, /EmptyStateV2/);
assert.match(authority, /ErrorStateV2/);
assert.match(authority, /LoadingStateV2/);
assert.match(authority, /OfflineStateV2/);
assert.match(authority, /No parallel admin button|لا نظام أزرار|parallel admin button/i);
assert.match(authority, /MUSHAF|UNTOUCHED/);
assert.match(authority, /HOLD/);

const states = read("src/admin-v3/states.tsx");
assert.match(states, /EmptyStateV2/);
assert.match(states, /ErrorStateV2/);
assert.match(states, /LoadingStateV2/);
assert.match(states, /OfflineStateV2/);
assert.doesNotMatch(states, /<button\b/);

const primitives = read("src/admin-v3/ui/primitives.tsx");
assert.match(primitives, /from "@\/components\/ui\/button"/);
assert.match(primitives, /FormLabel/);
assert.match(primitives, /FieldError/);
assert.match(primitives, /FormActions/);
assert.match(primitives, /SearchInput/);
assert.match(primitives, /StatusCard/);
assert.doesNotMatch(primitives, /<button\b/);
assert.doesNotMatch(primitives, /window\.confirm/);

const shell = read("src/admin-v3/AdminV3Shell.tsx");
assert.match(shell, /from "@\/components\/ui\/button"/);
assert.match(shell, /SearchInput/);
assert.match(shell, /FormLabel/);
assert.doesNotMatch(shell, /<button\b/);

const dashboard = read("src/admin-v3/AdminV3Dashboard.tsx");
assert.match(dashboard, /AppCard/);
assert.match(dashboard, /from "@\/components\/ui\/button"/);
assert.doesNotMatch(dashboard, /<button\b/);

const workspace = read("src/admin-v3/centers/AdminV3CenterWorkspace.tsx");
assert.match(workspace, /AppCard/);
assert.match(workspace, /from "@\/components\/ui\/button"/);
assert.match(workspace, /SearchInput|FormLabel/);
assert.doesNotMatch(workspace, /<button\b/);

const review = read("src/admin-v3/domains/reviews/ReviewInboxPage.tsx");
assert.match(review, /from "@\/components\/ui\/button"/);
assert.match(review, /FormLabel|FieldError/);
assert.doesNotMatch(review, /<button\b/);
assert.doesNotMatch(review, /window\.confirm/);

const crud = read("src/admin-v3/domains/content/EntityCrudPage.tsx");
assert.match(crud, /from "@\/components\/ui\/button"/);
assert.doesNotMatch(crud, /<button\b/);
assert.doesNotMatch(crud, /window\.confirm/);

const hub = read("src/admin-v3/domains/content/ContentHubPage.tsx");
assert.match(hub, /AppCard/);
assert.match(hub, /from "@\/components\/ui\/button"/);

function collectTsx(dir: string, out: string[] = []): string[] {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) collectTsx(p, out);
    else if (ent.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const adminV3Tsx = collectTsx(resolve(majalisRoot, "src/admin-v3"));
for (const file of adminV3Tsx) {
  const src = readFileSync(file, "utf8");
  assert.doesNotMatch(
    src,
    /<button\b/,
    `raw <button> still in admin-v3: ${file.replace(majalisRoot + "/", "")}`,
  );
}

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:admin-v3-interaction-authority"] || "", /admin-v3-interaction-authority-gate/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:admin-v3-interaction-authority/);

console.log(
  `admin-v3-interaction-authority-gate.test.ts: ok (files=${adminV3Tsx.length})`,
);
