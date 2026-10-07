/**
 * موافقة المستخدم الصريحة على إرسال تسجيله إلى خدمة تفريغ صوتي خارجية (Groq) — شرط إرشادات Apple للذكاء الاصطناعي.
 * تُحفظ الموافقة محليًا (علامة فقط، لا صوت) ويمكن سحبها؛ لا يُرسَل أي صوت قبلها.
 */
export const RECITATION_CONSENT_KEY = "recitation_ai_consent_v1";
export const RECITATION_PROVIDER_NAME = "Groq";

let memoryConsent = false;

export function hasRecitationConsent(): boolean {
  try {
    if (localStorage.getItem(RECITATION_CONSENT_KEY) === "1") return true;
  } catch {
    /* التخزين غير متاح: نعتمد جلسة الصفحة فقط */
  }
  return memoryConsent;
}

export function grantRecitationConsent(): void {
  memoryConsent = true;
  try {
    localStorage.setItem(RECITATION_CONSENT_KEY, "1");
  } catch {
    /* يبقى في الذاكرة لهذه الجلسة */
  }
}

export function revokeRecitationConsent(): void {
  memoryConsent = false;
  try {
    localStorage.removeItem(RECITATION_CONSENT_KEY);
  } catch {
    /* لا شيء */
  }
}
