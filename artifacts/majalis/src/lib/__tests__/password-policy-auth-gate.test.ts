/**
 * بوابة: سلطة كلمة المرور مربوطة بنماذج التسجيل/التحديث ورسائل الأخطاء.
 * Run: node --import tsx src/lib/__tests__/password-policy-auth-gate.test.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const majalisRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(resolve(majalisRoot, rel), "utf8");

const policy = read("src/lib/password-policy.ts");
const login = read("src/pages/account/ui/LoginView.tsx");
const update = read("src/views/UpdatePasswordPage.tsx");
const msgs = read("src/lib/auth-messages.ts");
const checklist = read("src/components/auth/PasswordPolicyChecklist.tsx");
const css = read("src/styles/pages/auth.css");
const supabase = read("src/lib/supabase.ts");
const mobileAccount = readFileSync(
  resolve(majalisRoot, "../majalis-mobile/app/(tabs)/account.tsx"),
  "utf8",
);
const mobilePolicy = readFileSync(
  resolve(majalisRoot, "../majalis-mobile/lib/password-policy.ts"),
  "utf8",
);

console.log("=== Authority ===");
assert.match(policy, /PASSWORD_MIN_LENGTH\s*=\s*12/);
assert.match(policy, /evaluatePassword/);
assert.match(policy, /validatePassword/);
assert.match(policy, /mapPasswordPolicyServerError/);
assert.match(policy, /PASSWORD_POLICY_ERROR_AR/);
assert.match(policy, /EMAIL_SEND_RATE_LIMIT_AR/);
assert.doesNotMatch(policy, /minLength\s*=\s*8|length\s*<\s*8/);

console.log("=== Login / Register wiring ===");
assert.match(login, /validatePassword/);
assert.match(login, /PasswordPolicyChecklist/);
assert.match(login, /PASSWORD_MIN_LENGTH/);
assert.match(login, /pendingConfirmEmail|signup-confirm-pending/);
assert.match(login, /resendSignupConfirmation/);
assert.match(login, /logSupabaseError/);
assert.doesNotMatch(login, /password\.length\s*<\s*8/);
assert.doesNotMatch(login, /٨ أحرف على الأقل/);
assert.doesNotMatch(login, /minLength=\{tab === "register" \? 8/);

console.log("=== Update password ===");
assert.match(update, /validatePassword/);
assert.match(update, /PasswordPolicyChecklist/);
assert.match(update, /PASSWORD_MIN_LENGTH/);
assert.doesNotMatch(update, /password\.length\s*<\s*8/);

console.log("=== Messages ===");
assert.match(msgs, /mapPasswordPolicyServerError/);
assert.match(msgs, /EMAIL_SEND_RATE_LIMIT_AR|mapPasswordPolicyServerError/);
assert.doesNotMatch(msgs, /return "كلمة المرور قصيرة"/);

console.log("=== Checklist + CSS ===");
assert.match(checklist, /password-policy-checklist/);
assert.match(css, /\.password-policy\b/);
assert.match(css, /\.signup-confirm\b/);

console.log("=== Resend API ===");
assert.match(supabase, /resendSignupConfirmation/);
assert.match(supabase, /type:\s*["']signup["']/);

console.log("=== Mobile re-exports authority (no duplicate policy) ===");
assert.match(mobilePolicy, /majalis\/src\/lib\/password-policy/);
assert.match(mobileAccount, /validatePassword/);

console.log("password-policy-auth-gate.test.ts: ok");
