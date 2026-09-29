/**
 * إعادة تصدير سلطة سياسة كلمة المرور من تطبيق الويب/Capacitor.
 * المصدر الوحيد: artifacts/majalis/src/lib/password-policy.ts
 */
export {
  EMAIL_SEND_RATE_LIMIT_AR,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MISMATCH_AR,
  PASSWORD_POLICY_ERROR_AR,
  PASSWORD_POLICY_HINT_AR,
  evaluatePassword,
  mapPasswordPolicyServerError,
  passwordsMatch,
  validatePassword,
} from "../../majalis/src/lib/password-policy";
