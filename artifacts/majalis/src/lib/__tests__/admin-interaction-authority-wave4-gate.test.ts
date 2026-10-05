/**
 * ADMIN interaction wave 4 — 24 admin sections/pages → official Button.
 * node --import tsx src/lib/__tests__/admin-interaction-authority-wave4-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const migrated = [
  "AdminShell",
  "InstagramManualAssistPanel",
  "IslamicIntelligenceSection",
  "KnowledgeReasoningSection",
  "LessonsSection",
  "Phase2TrialImport",
  "QaSection",
  "TelegramSection",
  "ArbaeenLoveSection",
  "AutonomousAiSection",
  "ClientErrorLogsSection",
  "GlobalReferenceSection",
  "ResearchesSection",
  "ScholarlyVerificationSection",
  "SubmissionsSection",
  "VerifiedKnowledgeSection",
  "InstagramIntegrationPage",
  "KnowledgeEngineSection",
  "AggregatorSection",
  "AutomationCenterPage",
  "ContentProductionDashboardPage",
  "LessonImportUrlPage",
  "MajlisKnowledgeEnginePage",
  "SearchAnalyticsSection",
].map((name) => `src/views/admin/${name}.tsx`);

for (const rel of migrated) {
  const text = read(rel);
  assert.doesNotMatch(text, /<button\b/, `${rel}: no raw <button>`);
  assert.match(
    text,
    /from ["']@\/components\/ui\/button["']/,
    `${rel}: official Button import`,
  );
}

// Semantic variants on representative actions.
assert.match(read("src/views/admin/LessonsSection.tsx"), /variant="destructive"/);
assert.match(read("src/views/admin/QaSection.tsx"), /variant="destructive"/);
assert.match(read("src/views/admin/SubmissionsSection.tsx"), /variant="primary"/);
assert.match(read("src/views/admin/SubmissionsSection.tsx"), /variant="destructive"/);
// Sidebar nav keeps aria-current and start-aligned row layout.
const shell = read("src/views/admin/AdminShell.tsx");
assert.match(shell, /aria-current=\{section === item\.key \? "page" : undefined\}/);
assert.match(shell, /admin-nav__item justify-start/);
// Telegram Btn maps its local variants onto official ones.
assert.match(read("src/views/admin/TelegramSection.tsx"), /variant === "danger" \? "destructive"/);

const check = spawnSync(process.execPath, ["scripts/interaction-system-inventory.mjs", "--check"], {
  cwd: majalisRoot,
  encoding: "utf8",
});
assert.equal(check.status, 0, check.stderr || check.stdout);

console.log(`admin-interaction-authority-wave4-gate: ok (files=${migrated.length})`);
