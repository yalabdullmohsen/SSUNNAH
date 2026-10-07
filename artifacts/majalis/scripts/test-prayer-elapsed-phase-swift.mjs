/**
 * حدود «مضى على الأذان» في Swift (PrayerElapsedPhase) تطابق lib/prayer-phase.ts:
 * عند الأذان elapsed، وعند adhan + النافذة تنتهي. يُجمَّع الكود الفعلي بـswiftc (macOS فقط؛ يُتخطّى بلا swiftc).
 * تشغيل: node scripts/test-prayer-elapsed-phase-swift.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// ملفات Shared تستورد `os` (Apple فقط) فلا تُجمَّع على لينكس حتى لو وُجد swiftc (مشغّلات ubuntu تحمله) → macOS فقط.
if (process.platform !== "darwin") {
  console.log("test-prayer-elapsed-phase-swift: skipped (غير macOS)");
  process.exit(0);
}
if (spawnSync("swiftc", ["--version"], { stdio: "ignore" }).status !== 0) {
  console.log("test-prayer-elapsed-phase-swift: skipped (no swiftc)");
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), "elapsed-phase-"));
const main = join(dir, "main.swift");
writeFileSync(
  main,
  `import Foundation
func check(_ c: Bool, _ m: String) { if !c { print("FAIL: \\(m)"); exit(1) } }
let t0 = Date(timeIntervalSince1970: 1_800_000_000)
check(PrayerElapsedPhase.windowMinutes(nil) == 30, "default 30")
check(PrayerElapsedPhase.window(adhan: t0, now: t0, windowMinutes: 30) != nil, "at adhan: elapsed")
check(PrayerElapsedPhase.window(adhan: t0, now: t0.addingTimeInterval(-0.001), windowMinutes: 30) == nil, "before adhan")
check(PrayerElapsedPhase.window(adhan: t0, now: t0.addingTimeInterval(30 * 60 - 0.001), windowMinutes: 30) != nil, "just before end")
check(PrayerElapsedPhase.window(adhan: t0, now: t0.addingTimeInterval(30 * 60), windowMinutes: 30) == nil, "at end: countdown")
check(PrayerElapsedPhase.window(adhan: t0, now: t0.addingTimeInterval(10 * 60 - 1), windowMinutes: 10) != nil, "iqama 10: before")
check(PrayerElapsedPhase.window(adhan: t0, now: t0.addingTimeInterval(10 * 60), windowMinutes: 10) == nil, "iqama 10: at")
check(PrayerElapsedPhase.window(adhan: nil, now: t0, windowMinutes: 30) == nil, "no adhan")
print("ok")
`,
);
const shared = join(root, "ios/App/Shared");
const out = join(dir, "t");
execFileSync("swiftc", [join(shared, "SunnahSharedData.swift"), join(shared, "SunnahWidgetEnvelope.swift"), main, "-o", out], { stdio: "inherit" });
const res = spawnSync(out, { encoding: "utf8" });
if (res.status !== 0 || !/ok/.test(res.stdout)) {
  console.error(res.stdout, res.stderr);
  process.exit(1);
}
console.log("test-prayer-elapsed-phase-swift: ok");
