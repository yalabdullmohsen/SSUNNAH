/**
 * سلطة سياسة كلمة المرور — مطابقة إنتاج Supabase.
 * Run: node --import tsx src/lib/__tests__/password-policy.test.ts
 */
import assert from "node:assert/strict";
import {
  EMAIL_SEND_RATE_LIMIT_AR,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_ERROR_AR,
  evaluatePassword,
  mapPasswordPolicyServerError,
  validatePassword,
} from "@/lib/password-policy";
import { mapAuthError } from "@/lib/auth-messages";
import { setRuntimeSupabaseConfig } from "@/lib/supabase-env";

/* فعّل إعدادًا شكليًا حتى لا يقصر mapAuthError على رسالة «غير متاح» */
setRuntimeSupabaseConfig(
  "https://ngmvmlulzacrlicuagyp.supabase.co",
  "sb_publishable_qfKajKYv3i7Uk6v8UijSMA_wQjn2sA4",
);

assert.equal(PASSWORD_MIN_LENGTH, 12);

console.log("=== 1) 8 characters => local fail ===");
{
  const r = evaluatePassword("Pass12!a");
  assert.equal(r.ok, false);
  assert.equal(r.checks.find((c) => c.id === "length")?.ok, false);
  assert.equal(validatePassword("Pass12!a"), PASSWORD_POLICY_ERROR_AR);
}

console.log("=== 2) 11 characters => local fail ===");
{
  const r = evaluatePassword("Pass1234!ab");
  assert.equal(r.ok, false);
  assert.equal(r.checks.find((c) => c.id === "length")?.ok, false);
}

console.log("=== 3) 12 weak (no special) => local fail ===");
{
  const r = evaluatePassword("Pass1234abcd");
  assert.equal(r.ok, false);
  assert.equal(r.checks.find((c) => c.id === "special")?.ok, false);
}

console.log("=== 4) 12 compliant => local pass ===");
{
  const r = evaluatePassword("Pass1234!abc");
  assert.equal(r.ok, true);
  assert.equal(validatePassword("Pass1234!abc"), null);
  assert.ok(r.checks.every((c) => c.ok));
}

console.log("=== 6) over_email_send_rate_limit ===");
{
  const mapped = mapPasswordPolicyServerError({
    message: "email rate limit exceeded",
    code: "over_email_send_rate_limit",
  });
  assert.equal(mapped, EMAIL_SEND_RATE_LIMIT_AR);
  assert.equal(
    mapAuthError({ message: "email rate limit exceeded", code: "over_email_send_rate_limit" }),
    EMAIL_SEND_RATE_LIMIT_AR,
  );
}

console.log("=== 7) already registered ===");
assert.match(mapAuthError({ message: "User already registered" }), /مسجّل مسبقاً/);

console.log("=== 8) email not confirmed ===");
assert.match(mapAuthError({ message: "Email not confirmed" }), /تأكيد بريدك/);

console.log("=== 9) invalid email ===");
assert.match(mapAuthError({ message: "Email address is invalid" }), /البريد غير صحيح/);

console.log("=== weak_password server message is precise (not «قصيرة») ===");
{
  const msg = mapAuthError({
    message:
      "Password should be at least 12 characters. Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%",
  });
  assert.doesNotMatch(msg, /كلمة المرور قصيرة/);
  assert.match(msg, /١٢|12|كبير|صغير|رقم|رمز/);
}

console.log("password-policy.test.ts: ok");
