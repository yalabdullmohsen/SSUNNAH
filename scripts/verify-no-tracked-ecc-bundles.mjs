#!/usr/bin/env node
/**
 * بوابة: حزم ECC / وكلاء مولَّدة لا تُتتبَّع في git.
 * الملفات تبقى محليًا عبر .gitignore — فشل إذا عادت إلى الفهرس.
 *
 * تشغيل: node scripts/verify-no-tracked-ecc-bundles.mjs
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** أنماط مسار نسبية يجب ألا تظهر في `git ls-files`. */
const FORBIDDEN_PREFIXES = [
  ".claude/ecc-tools.json",
  ".claude/identity.json",
  ".claude/skills/",
  ".claude/homunculus/",
  ".agents/skills/",
  ".codex/",
];

/** مهارات مشروع مختارة يدويًا تُشارَك عبر المستودع (ليست حزم ECC مولَّدة). */
const ALLOWED_PREFIXES = [
  ".claude/skills/graphify/",
  ".claude/skills/sharia-content/",
  ".claude/skills/post-merge-verify/",
  ".claude/skills/pre-merge-self-review/",
  ".claude/skills/rtl-visual-verification/",
  ".claude/skills/session-cost-tuning/",
  ".claude/skills/session-handoff/",
  ".claude/skills/surgical-changes/",
  ".claude/skills/systematic-debugging/",
  ".claude/skills/app-store-readiness/",
  ".claude/skills/arabic-search/",
  ".claude/skills/aso-growth/",
  ".claude/skills/ci-failure-rootcause/",
  ".claude/skills/deep-links-shell/",
  ".claude/skills/final-report-ar/",
  ".claude/skills/i18n-global/",
  ".claude/skills/ios-accessibility/",
  ".claude/skills/ios-audio-session/",
  ".claude/skills/lean-context/",
  ".claude/skills/mushaf-pitfalls/",
  ".claude/skills/native-feel/",
  ".claude/skills/prayer-notifications/",
  ".claude/skills/security-public-repo/",
  ".claude/skills/startup-performance/",
  ".claude/skills/window-protocol/",
  ".claude/skills/ios-native-swiftui/",
  ".claude/skills/ios-widgets/",
  ".claude/skills/tasmee-in-mushaf/",
  ".claude/skills/release-1-1-0/",
];

function trackedFiles() {
  const out = execFileSync("git", ["ls-files", "-z", "--", ".claude", ".agents", ".codex"], {
    cwd: root,
    encoding: "buffer",
    maxBuffer: 8 * 1024 * 1024,
  });
  return out
    .toString("utf8")
    .split("\0")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isForbidden(path) {
  if (ALLOWED_PREFIXES.some((p) => path.startsWith(p))) return false;
  return FORBIDDEN_PREFIXES.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p));
}

console.log("=== verify-no-tracked-ecc-bundles ===\n");

const tracked = trackedFiles().filter(isForbidden);
if (tracked.length) {
  console.error("❌ ملفات ECC/وكلاء مولَّدة ما زالت متتبَّعة في git:\n");
  for (const f of tracked) console.error(`  - ${f}`);
  console.error(`
أزلها من الفهرس دون حذف محلي:
  git rm -r --cached -- ${FORBIDDEN_PREFIXES.join(" ")}

وتأكد أنها في .gitignore (قسم ECC tools).`);
  process.exit(1);
}

console.log("✓ لا حزم ECC/وكلاء مولَّدة متتبَّعة — .gitignore يعمل كما يجب.");
