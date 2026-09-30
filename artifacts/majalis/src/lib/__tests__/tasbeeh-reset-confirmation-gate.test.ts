/**
 * عقد تصفير التسبيح — تأكيد داخل الصفحة (PR5) + Escape/focus/regression.
 * Run: node --import tsx src/lib/__tests__/tasbeeh-reset-confirmation-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

const tasbeeh = read("src/components/reading/TasbeehCounter.tsx");
const gate = read("src/lib/__tests__/directories-maps-ux-p0-gate.test.ts");
const pr5Gate = read("src/lib/__tests__/closure-pr5-forms-feedback-gate.test.ts");
const rca = readFileSync(
  resolve(root, "../../docs/remediation/PR5_TASBEEH_CONFIRMATION_VISUAL_GATE_ROOT_CAUSE.md"),
  "utf8",
);

/* ── Contract: in-page confirmation, not browser dialog ── */
assert.doesNotMatch(tasbeeh, /window\.confirm/);
assert.doesNotMatch(tasbeeh, /window\.alert/);
assert.match(tasbeeh, /role="alertdialog"/);
assert.match(tasbeeh, /aria-modal="true"/);
assert.match(tasbeeh, /aria-label="تأكيد التصفير"/);

/* ── Contract: two-step reset (open → confirm/cancel) ── */
assert.match(tasbeeh, /openResetConfirm/);
assert.match(tasbeeh, /confirmAndReset/);
assert.match(tasbeeh, /cancelResetConfirm/);
assert.match(tasbeeh, /onClick=\{openResetConfirm\}/);
assert.match(tasbeeh, /onClick=\{confirmAndReset\}/);
assert.match(tasbeeh, /onClick=\{cancelResetConfirm\}/);
assert.doesNotMatch(
  tasbeeh,
  /onClick=\{\(\) => \{\s*reset\(\)/,
  "لا reset مضمّن مباشرة في onClick التصفير",
);
/* confirmAndReset calls reset once then clears confirm state */
assert.match(
  tasbeeh,
  /const confirmAndReset = \(\) => \{\s*reset\(\);\s*setConfirmReset\(false\)/,
);

/* ── Contract: cancel restores UI without reset ── */
const cancelFn = tasbeeh.match(
  /const cancelResetConfirm = \(\) => \{[\s\S]*?\n {2}\};/,
)?.[0];
assert.ok(cancelFn, "cancelResetConfirm معرّف");
assert.match(cancelFn!, /setConfirmReset\(false\)/);
assert.doesNotMatch(cancelFn!, /\breset\(\)/, "الإلغاء لا يستدعي reset");

/* ── Contract: keyboard Escape cancels ── */
assert.match(tasbeeh, /e\.code === ["']Escape["']/);
assert.match(tasbeeh, /cancelResetConfirm\(\)/);
assert.match(tasbeeh, /Escape لإلغاء التأكيد/);

/* ── Contract: focus management ── */
assert.match(tasbeeh, /confirmActionRef/);
assert.match(tasbeeh, /resetTriggerRef/);
assert.match(tasbeeh, /confirmActionRef\.current\?\.focus/);
assert.match(tasbeeh, /resetTriggerRef\.current\?\.focus/);

/* ── Contract: Button authority + labels ── */
assert.match(tasbeeh, /from ["']@\/components\/ui\/button["']/);
assert.match(tasbeeh, /variant="destructive"/);
assert.match(tasbeeh, /type="button"/);
assert.match(tasbeeh, /إلغاء/);
assert.match(tasbeeh, /تصفير/);
assert.match(tasbeeh, /تأكيد التصفير|تأكيد/);
assert.match(tasbeeh, /aria-label="تصفير العداد"/);

/* ── Compact + pro both use alertdialog ── */
const alertDialogCount = (tasbeeh.match(/role="alertdialog"/g) || []).length;
assert.ok(alertDialogCount >= 2, `alertdialog in compact+pro (got ${alertDialogCount})`);

/* ── Listener cleanup (no leak) ── */
assert.match(tasbeeh, /addEventListener\(["']keydown["']/);
assert.match(tasbeeh, /removeEventListener\(["']keydown["']/);

/* ── Upstream gates aligned ── */
assert.match(gate, /alertdialog/);
assert.doesNotMatch(gate, /window\.confirm\([\s\S]*تصفير/);
assert.match(gate, /doesNotMatch\(tasbeeh, \/window\\.confirm/);
assert.match(pr5Gate, /TasbeehCounter/);
assert.match(pr5Gate, /doesNotMatch\(text, \/window\\.confirm/);
assert.match(rca, /STALE_IMPLEMENTATION_ASSERTION/);

console.log("tasbeeh-reset-confirmation-gate.test.ts: ok");
