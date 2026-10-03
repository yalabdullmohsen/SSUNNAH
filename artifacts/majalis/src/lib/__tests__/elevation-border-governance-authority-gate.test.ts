/**
 * بوابة سلطة الارتفاع / الحدود / حوكمة التصميم.
 * Run: node --import tsx src/lib/__tests__/elevation-border-governance-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const elevMap = readRepo("docs/design/ELEVATION_AUTHORITY_MAP.md");
const borderMap = readRepo("docs/design/BORDER_AUTHORITY_MAP.md");
const govDoc = readRepo("docs/design/DESIGN_GOVERNANCE_AUTOMATION.md");
const elevTs = readMaj("src/lib/elevation-authority.ts");
const borderTs = readMaj("src/lib/border-authority.ts");
const unify = readMaj("src/styles/ssunnah-card-unify.css");
const govScript = readMaj("scripts/design-governance-report.mjs");
const pkg = JSON.parse(readMaj("package.json"));

assert.match(elevMap, /ELEVATION_AUTHORITY_ONLY/);
assert.match(elevMap, /LEVEL_0/);
assert.match(elevMap, /LEVEL_4/);
assert.match(elevMap, /--sf2-shadow-card/);
assert.match(elevMap, /boxShadowDecls/);

assert.match(borderMap, /BORDER_AUTHORITY_ONLY/);
assert.match(borderMap, /PRIMARY/);
assert.match(borderMap, /SUBTLE/);
assert.match(borderMap, /DIVIDER/);
assert.match(borderMap, /FOCUS/);
assert.match(borderMap, /--mj-hairline/);

assert.match(govDoc, /DESIGN_GOVERNANCE_AUTOMATED/);
assert.match(govDoc, /DESIGN_DRIFT_DETECTED_AUTOMATICALLY/);
assert.match(govDoc, /DESIGN_AUTHORITY_REPORT/);
assert.match(govDoc, /DESIGN_CONSISTENCY_SCORE/);

assert.match(elevTs, /LEVEL_0/);
assert.match(elevTs, /LEVEL_1/);
assert.match(elevTs, /--sf2-shadow-card/);
assert.match(borderTs, /SUBTLE:\s*"--mj-hairline"/);
assert.match(borderTs, /FOCUS:\s*"--sf2-focus-ring"/);

assert.match(unify, /--sf2-elevation-0/);
assert.match(unify, /--sf2-elevation-4/);
assert.match(unify, /--ss-border-subtle/);
assert.match(unify, /--ss-border-focus/);

assert.match(govScript, /DESIGN_AUTHORITY_REPORT/);
assert.match(govScript, /DESIGN_DRIFT_REPORT/);
assert.match(govScript, /DESIGN_CONSISTENCY_SCORE/);
assert.match(govScript, /visual-system-inventory/);

assert.match(pkg.scripts["test:design-governance"] || "", /design-governance-report/);
assert.match(pkg.scripts["test:sunnah-ui-refinement"] || "", /test:design-governance|test:elevation-border/);

assert.ok(existsSync(resolve(root, "scripts/design-governance-preflight.mjs")));
assert.ok(existsSync(resolve(majalis, "src/lib/elevation-authority.ts")));

console.log("elevation-border-governance-authority-gate: ok");
