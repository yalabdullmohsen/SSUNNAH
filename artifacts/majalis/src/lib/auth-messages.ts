import { formatSupabaseError, isSupabaseConfigured } from "./supabase-config";
import {
  EMAIL_SEND_RATE_LIMIT_AR,
  mapPasswordPolicyServerError,
  PASSWORD_MISMATCH_AR,
} from "./password-policy";

export function mapAuthError(error: unknown): string {
  if (!isSupabaseConfigured()) {
    return "إنشاء الحساب وتسجيل الدخول غير متاحين حالياً. يرجى التواصل مع إدارة الموقع.";
  }

  if (!error) return "تعذّر إتمام العملية. تحقق من البيانات وحاول مجدداً.";

  const policyMapped = mapPasswordPolicyServerError(error);
  if (policyMapped) return policyMapped;

  const msg = String((error as { message?: string }).message || "").toLowerCase();
  const code = String(
    (error as { code?: string; error_code?: string }).code ||
      (error as { error_code?: string }).error_code ||
      "",
  ).toLowerCase();

  if (
    code === "over_email_send_rate_limit" ||
    msg.includes("over_email_send_rate_limit") ||
    (msg.includes("email") && msg.includes("rate limit"))
  ) {
    return EMAIL_SEND_RATE_LIMIT_AR;
  }

  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid_credentials") ||
    msg.includes("user not found") ||
    msg.includes("no user found")
  ) {
    return "الحساب غير موجود أو البيانات غير صحيحة";
  }
  if (msg.includes("email not confirmed")) {
    return "يرجى تأكيد بريدك الإلكتروني أولاً من الرابط المرسل إليك.";
  }
  if (msg.includes("too many requests") || msg.includes("rate limit")) {
    return "محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً.";
  }
  if (
    msg.includes("user already registered") ||
    msg.includes("already been registered") ||
    code === "user_already_exists"
  ) {
    return "هذا البريد مسجّل مسبقاً.";
  }
  if (msg.includes("valid email") || msg.includes("invalid email") || msg.includes("email address")) {
    return "البريد غير صحيح";
  }
  if (msg.includes("passwords do not match") || msg.includes("password mismatch")) {
    return PASSWORD_MISMATCH_AR;
  }
  if (msg.includes("auth not ready")) {
    return "خدمة الحساب لم تكتمل تهيئتها بعد. أعد المحاولة بعد لحظات.";
  }

  const friendly = formatSupabaseError(error);
  if (/supabase|postgres|jwt|fetch|networkerror|failed to fetch/i.test(friendly)) {
    return "تعذّر إتمام العملية. تحقق من الاتصال وحاول مجدداً.";
  }
  return friendly;
}

export const ADMIN_ACCESS_DENIED_MESSAGE = "ليس لديك صلاحية دخول لوحة التحكم";
