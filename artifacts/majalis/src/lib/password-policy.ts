/**
 * Password Policy Authority — مطابقة سياسة Supabase Auth الإنتاجية.
 * المصدر الوحيد لطول/تعقيد كلمة المرور في الواجهة والتحقق المحلي.
 *
 * سياسة الإنتاج المثبتة (2026-09-29) عبر /auth/v1/signup:
 * - length >= 12
 * - lowercase + uppercase + digit + special
 */

export const PASSWORD_MIN_LENGTH = 12;

const HAS_LOWER = /[a-z]/;
const HAS_UPPER = /[A-Z]/;
const HAS_DIGIT = /[0-9]/;
/* رموز خاصة متوافقة مع رسالة weak_password من Supabase */
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export type PasswordPolicyCheckId =
  | "length"
  | "lowercase"
  | "uppercase"
  | "digit"
  | "special";

export type PasswordPolicyCheck = {
  id: PasswordPolicyCheckId;
  labelAr: string;
  labelEn: string;
  ok: boolean;
};

export type PasswordPolicyResult = {
  ok: boolean;
  checks: PasswordPolicyCheck[];
  /** رسالة عربية واحدة عند الفشل — null عند النجاح */
  message: string | null;
};

export const PASSWORD_POLICY_HINT_AR =
  "١٢ حرفًا على الأقل وتشمل: حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا";

export const PASSWORD_POLICY_ERROR_AR =
  "يجب أن تتكون كلمة المرور من ١٢ حرفًا على الأقل، وتحتوي على حرف كبير وصغير ورقم ورمز خاص.";

export const EMAIL_SEND_RATE_LIMIT_AR =
  "تم إرسال عدد كبير من الرسائل مؤخرًا. يرجى الانتظار قبل إعادة المحاولة.";

export function evaluatePassword(password: string): PasswordPolicyResult {
  const value = String(password ?? "");
  const checks: PasswordPolicyCheck[] = [
    {
      id: "length",
      labelAr: "١٢ حرفًا",
      labelEn: "12 characters",
      ok: value.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: "uppercase",
      labelAr: "حرف كبير",
      labelEn: "uppercase",
      ok: HAS_UPPER.test(value),
    },
    {
      id: "lowercase",
      labelAr: "حرف صغير",
      labelEn: "lowercase",
      ok: HAS_LOWER.test(value),
    },
    {
      id: "digit",
      labelAr: "رقم",
      labelEn: "number",
      ok: HAS_DIGIT.test(value),
    },
    {
      id: "special",
      labelAr: "رمز خاص",
      labelEn: "special char",
      ok: HAS_SPECIAL.test(value),
    },
  ];
  const ok = checks.every((c) => c.ok);
  return {
    ok,
    checks,
    message: ok ? null : PASSWORD_POLICY_ERROR_AR,
  };
}

/** يعيد رسالة عربية عند الفشل، أو null عند المطابقة. */
export function validatePassword(password: string): string | null {
  return evaluatePassword(password).message;
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password === confirm;
}

export const PASSWORD_MISMATCH_AR = "كلمة المرور غير متطابقة";

/**
 * يحوّل أخطاء weak_password / سياسة الخادم إلى نص عربي دقيق.
 * لا يُرجع «كلمة المرور قصيرة» كغطاء عام.
 */
export function mapPasswordPolicyServerError(error: unknown): string | null {
  const msg = String(
    (error as { message?: string; msg?: string })?.message ||
      (error as { msg?: string })?.msg ||
      error ||
      "",
  ).toLowerCase();
  if (!msg) return null;

  if (
    msg.includes("over_email_send_rate_limit") ||
    (msg.includes("email") && msg.includes("rate limit")) ||
    msg.includes("email rate limit")
  ) {
    return EMAIL_SEND_RATE_LIMIT_AR;
  }

  const isWeak =
    msg.includes("weak_password") ||
    msg.includes("password should be") ||
    (msg.includes("password") &&
      (msg.includes("least") ||
        msg.includes("weak") ||
        msg.includes("short") ||
        msg.includes("characters") ||
        msg.includes("uppercase") ||
        msg.includes("lowercase") ||
        msg.includes("digit") ||
        msg.includes("special")));

  if (!isWeak) return null;

  const missing: string[] = [];
  if (msg.includes("12") || msg.includes("at least") || msg.includes("length")) {
    missing.push("١٢ حرفًا على الأقل");
  }
  if (msg.includes("uppercase") || msg.includes("ABCDEFGHIJKLMNOPQRSTUVWXYZ")) {
    missing.push("حرفًا كبيرًا");
  }
  if (msg.includes("lowercase") || msg.includes("abcdefghijklmnopqrstuvwxyz")) {
    missing.push("حرفًا صغيرًا");
  }
  if (msg.includes("digit") || msg.includes("0123456789") || msg.includes("number")) {
    missing.push("رقمًا");
  }
  if (msg.includes("special") || msg.includes("!@#")) {
    missing.push("رمزًا خاصًا");
  }

  if (missing.length >= 2) {
    return `يجب أن تتكون كلمة المرور من ${missing.join("، و")}.`;
  }
  return PASSWORD_POLICY_ERROR_AR;
}
