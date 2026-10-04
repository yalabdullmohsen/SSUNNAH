/**
 * PR S1 — آلة إقلاع واحدة + ملكية إخفاء الدخولية.
 * تشغيل: node --import tsx src/lib/__tests__/startup-state-machine-s1-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoRoot = resolve(majalisRoot, "../..");
const readRepo = (rel: string) => readFileSync(resolve(repoRoot, rel), "utf8");
const readPkg = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const machine = readRepo("docs/performance/STARTUP_STATE_MACHINE_SINGLE.md");
assert.match(machine, /STARTUP_STATE_MACHINE_SINGLE/);
assert.match(machine, /VISUALLY_STABLE/);
assert.match(machine, /WEB_SPLASH_EXITED/);
assert.match(machine, /NATIVE_SPLASH_EXITED/);
assert.match(machine, /mj:shell-stable/);
assert.match(machine, /safety exit|مخرج أمان|Timeout/i);
assert.doesNotMatch(machine, /UNKNOWN/);

const splash = readPkg("src/lib/splash-screen.ts");
assert.match(splash, /armNativeSplashController/);
assert.match(splash, /__mjDismissSplash/);
assert.match(splash, /dismissHtmlLaunchSplash\(false,\s*["']shell-stable["']\)/);
assert.match(splash, /hideNativeSplash\(false,\s*["']timeout["']\)/);
assert.match(splash, /addEventListener\(\s*["']mj:shell-stable["']/);
assert.match(splash, /السقف زمني = مخرج أمان فقط|timeout["']\)/);

const boot = readPkg("public/mj-launch-splash-boot.js");
assert.match(boot, /MIN_MS\s*=\s*0/, "NO artificial minimum delay");
assert.match(boot, /MAX_MS\s*=\s*1400/);
assert.match(boot, /__mjDismissSplash/);

const main = readPkg("src/main.tsx");
assert.match(main, /armNativeSplashController/);
assert.doesNotMatch(main, /__mjDismissSplash\?\.\(true\)/);

console.log("STARTUP_STATE_MACHINE_SINGLE");
console.log("SPLASH_HIDE_OWNERSHIP_SINGLE");
console.log("NO_TIMEOUT_ONLY_NORMAL_PATH");
console.log("startup-state-machine-s1-gate: ok");
