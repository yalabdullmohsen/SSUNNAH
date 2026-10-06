/**
 * بوابة Startup PR-4: هيكل هيدر/تذييل ثابت من أول إطار.
 * تشغيل: node --import tsx src/lib/__tests__/startup-pr4-stable-chrome-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");

const app = readPkg("src/App.tsx");
assert.doesNotMatch(
  app,
  /function ChromeBottomFallback\(\) \{\s*return <div className="bottom-nav chrome-boot-ph"/,
);

const critical = readPkg("src/styles/critical-first-paint.css");
assert.match(critical, /\.chrome-boot-ph\.navbar-v3/);
assert.match(critical, /\.chrome-boot-ph\.bottom-nav/);

const bootPh = readPkg("src/styles/components/chrome-boot-ph.css");
assert.match(bootPh, /\.chrome-boot-ph__slot/);
assert.match(bootPh, /min-width:\s*44px/);
assert.match(bootPh, /min-height:\s*44px/);
assert.match(app, /chrome-boot-ph\.css/);


const pkg = readPkg("package.json");
assert.match(pkg, /"test:startup-pr4"/);

assert.match(readRepo("docs/REPO_INDEX.md"), /Startup PR-4|startup-pr4|ChromeNavFallback/);

console.log("startup-pr4-stable-chrome-gate.test.ts: ok");
