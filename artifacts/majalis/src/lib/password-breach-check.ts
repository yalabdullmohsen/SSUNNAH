/**
 * فحص كلمة المرور ضد تسريبات معروفة (Have I Been Pwned — Pwned Passwords) بـk-anonymity.
 * يُرسَل أول 5 محارف فقط من SHA-1 (لا كلمة المرور ولا تجزئتها الكاملة) ويُطابَق الباقي محليًا.
 * يُستعمل عند التسجيل وتغيير كلمة المرور فقط — لا أثر على تسجيل دخول المستخدمين الحاليين.
 * بديل لميزة Supabase «Prevent leaked passwords» غير المتاحة في الخطة المجانية.
 * فشل الشبكة أو انتهاء المهلة لا يمنع المستخدم (fail-open) — الفحص إرشادي إضافي لا بوابة وحيدة.
 */

export const PASSWORD_BREACHED_AR =
  "كلمة المرور هذه ظهرت في تسريبات بيانات معروفة، فلا تصلح للاستعمال. اختر كلمة مرور أخرى لم تستعملها في مكان آخر.";

const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/";
const TIMEOUT_MS = 4000;

export type PasswordBreachResult = { breached: boolean; count: number; checked: boolean };

export async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** يقتطع المدى: (البادئة المُرسلة، اللاحقة المحلية). */
export function splitHibpHash(hash: string): { prefix: string; suffix: string } {
  const h = hash.toUpperCase();
  return { prefix: h.slice(0, 5), suffix: h.slice(5) };
}

/** يقرأ ردّ المدى (سطور `SUFFIX:COUNT`) ويُرجع عدد ظهور اللاحقة؛ يتجاهل سطور الحشو (count=0). */
export function countInHibpRange(body: string, suffix: string): number {
  const want = suffix.toUpperCase();
  for (const line of body.split(/\r?\n/)) {
    const [sfx, cnt] = line.trim().split(":");
    if (sfx && sfx.toUpperCase() === want) {
      const n = Number(cnt);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return 0;
}

export async function checkPasswordBreached(
  password: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PasswordBreachResult> {
  try {
    if (!password || typeof crypto === "undefined" || !crypto.subtle) {
      return { breached: false, count: 0, checked: false };
    }
    const { prefix, suffix } = splitHibpHash(await sha1Hex(password));
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null;
    try {
      const res = await fetchImpl(`${HIBP_RANGE_URL}${prefix}`, {
        headers: { "Add-Padding": "true" },
        signal: ctrl?.signal,
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!res.ok) return { breached: false, count: 0, checked: false };
      const count = countInHibpRange(await res.text(), suffix);
      return { breached: count > 0, count, checked: true };
    } finally {
      if (timer) clearTimeout(timer);
    }
  } catch {
    return { breached: false, count: 0, checked: false };
  }
}
