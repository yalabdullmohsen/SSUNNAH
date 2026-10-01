/**
 * ADMIN-FINAL-2 — unified reviews inbox gate.
 * node --import tsx src/lib/__tests__/admin-final-2-reviews-inbox-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const inbox = read("src/admin-v3/domains/reviews/ReviewInboxPage.tsx");
assert.match(inbox, /QUEUES/);
assert.match(inbox, /assigned_to_me/);
assert.match(inbox, /urgent/);
assert.match(inbox, /scientific/);
assert.match(inbox, /editorial/);
assert.match(inbox, /published/);
assert.match(inbox, /archived/);
assert.match(inbox, /dedupeRows/);
assert.match(inbox, /expectedUpdatedAt/);
assert.match(inbox, /queue=/);
assert.match(inbox, /data-testid="admin-v3-review-inbox"/);
assert.match(inbox, /LEGACY_KEEP/);
assert.doesNotMatch(inbox, /autoFocus/);
assert.doesNotMatch(inbox, /window\.(confirm|alert|prompt)\s*\(/);

const api = read("lib/api-handlers/admin/submissions.js");
assert.match(api, /QUEUE_STATUS/);
assert.match(api, /assigned_to_me/);
assert.match(api, /already_reviewed/);
assert.match(api, /conflict/);
assert.match(api, /userMessageAr/);

const router = read("src/admin-v3/AdminV3Router.tsx");
assert.match(router, /ReviewInboxPage/);
assert.match(router, /\/admin\/v3\/reviews/);

const routes = read("src/AppRoutes.tsx");
assert.match(routes, /\/admin\/v3\/reviews/);
assert.match(routes, /Redirect to="\/admin\/v3\/reviews"/);

const report = "docs/admin/ADMIN_FINAL_2_REVIEWS_INBOX_CLOSURE_REPORT.md";
assert.ok(existsSync(resolve(repoRoot, report)), report);
assert.match(readRepo(report), /ADMIN_FINAL_2/);
assert.match(readRepo(report), /LEGACY_KEEP/);

const pkg = JSON.parse(read("package.json"));
assert.match(pkg.scripts["test:admin-final-2-reviews"] || "", /admin-final-2-reviews-inbox-gate/);

console.log("admin-final-2-reviews-inbox-gate.test.ts: ok");
