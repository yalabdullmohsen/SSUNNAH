/**
 * بوابة سلطة المودال / التغذية الراجعة / الحالة / الطبقات.
 * Run: node --import tsx src/lib/__tests__/overlay-feedback-authority-gate.test.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalis = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const root = resolve(majalis, "../..");
const readRepo = (rel: string) => readFileSync(resolve(root, rel), "utf8");
const readMaj = (rel: string) => readFileSync(resolve(majalis, rel), "utf8");

const modal = readRepo("docs/design/MODAL_AUTHORITY_MAP.md");
const feedback = readRepo("docs/design/FEEDBACK_AUTHORITY_MAP.md");
const status = readRepo("docs/design/STATUS_AUTHORITY_MAP.md");
const overlay = readRepo("docs/design/OVERLAY_AUTHORITY_MAP.md");
const confirm = readMaj("src/components/design-system/ConfirmDialog.tsx");
const unify = readMaj("src/styles/ssunnah-card-unify.css");
const vault = readMaj("src/views/VaultPage.tsx");
const asmaa = readMaj("src/views/AsmaaHusnaPage.tsx");
const wave5 = readRepo("docs/design/eradication/PR_H_MODALS_FEEDBACK_A11Y.md");

assert.match(modal, /MODAL_AUTHORITY_ONLY/);
assert.match(modal, /AlertDialog/);
assert.match(modal, /AppBottomSheet/);
assert.match(modal, /SPECIAL_CASE/);
assert.match(modal, /VaultPage/);
assert.match(modal, /AsmaaHusnaPage/);

assert.match(feedback, /FEEDBACK_AUTHORITY_ONLY/);
assert.match(feedback, /APPROVED/);

assert.match(status, /STATUS_AUTHORITY_ONLY/);

assert.match(overlay, /OVERLAY_SYSTEM_UNIFIED/);
assert.match(overlay, /FloatingLayerManager/);
assert.match(overlay, /tooltip/);

assert.match(confirm, /AlertDialog/);
assert.match(unify, /\.ss-confirm-dialog/);

/* Wave 5 / PR H */
assert.match(vault, /from ["']@\/components\/ui\/dialog["']/);
assert.match(vault, /DialogContent/);
assert.doesNotMatch(vault, /vault-modal-backdrop/, "Vault note uses Dialog overlay");
assert.match(asmaa, /AppBottomSheet/);
assert.doesNotMatch(asmaa, /ah-modal-backdrop/, "Asmaa detail uses AppBottomSheet");
assert.match(wave5, /TASK_CLASSIFICATION/);
assert.match(wave5, /SHARED_PLATFORM/);

assert.ok(existsSync(resolve(majalis, "src/components/ui/alert-dialog.tsx")));
assert.ok(existsSync(resolve(majalis, "src/components/ui/AppBottomSheet.tsx")));
assert.ok(existsSync(resolve(majalis, "src/components/ui/dialog.tsx")));

console.log("overlay-feedback-authority-gate: ok");
