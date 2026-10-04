/**
 * PR S7 — منع تكبير iOS التلقائي على حقول النص عبر Form Authority.
 * تشغيل: node --import tsx src/lib/__tests__/startup-ios-input-zoom-s7-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const doc = readRepo("docs/performance/STARTUP_IOS_INPUT_ZOOM_S7.md");
assert.match(doc, /IOS_INPUT_AUTO_ZOOM_RISK_ZERO_IN_REPOSITORY|STARTUP_IOS_INPUT_ZOOM_S7/);
assert.match(doc, /NO_USER_ZOOM_DISABLED/);
assert.match(doc, /FORM_AUTHORITY_HELD/);

const authority = readRepo("docs/design/FORM_FEEDBACK_AUTHORITY.md");
assert.match(authority, /≥ 16px|16px/);

const input = readPkg("src/components/ui/input.tsx");
assert.match(input, /text-base/);
assert.match(input, /md:text-sm/);

const textarea = readPkg("src/components/ui/textarea.tsx");
assert.match(textarea, /text-base/);
assert.match(textarea, /md:text-sm/);

const select = readPkg("src/components/ui/select.tsx");
assert.match(select, /text-base/);
assert.match(select, /md:text-sm/);

const forms = readPkg("src/styles/sunnah-identity-forms-filters.css");
assert.match(forms, /max\(1rem,\s*16px\)/);
assert.match(forms, /max-width:\s*879px/);

const rp = readPkg("src/styles/pages/reading-plans.css");
assert.match(rp, /\.rp-log-input[^{]*\{[^}]*font-size:\s*1rem/);
assert.match(rp, /\.rp-text-input[^{]*\{[^}]*font-size:\s*1rem/);

const indexHtml = readPkg("index.html");
assert.doesNotMatch(indexHtml, /user-scalable\s*=\s*no/i);
assert.doesNotMatch(indexHtml, /maximum-scale\s*=\s*1/i);

const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-ios-input-zoom-s7"/);

console.log("IOS_INPUT_AUTO_ZOOM_RISK_ZERO_IN_REPOSITORY");
console.log("NO_USER_ZOOM_DISABLED");
console.log("FORM_AUTHORITY_HELD");
console.log("startup-ios-input-zoom-s7-gate: ok");
