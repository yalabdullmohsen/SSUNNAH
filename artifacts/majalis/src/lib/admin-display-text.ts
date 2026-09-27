/**
 * تطبيع نص عرض لوحة التحكم — يمنع ظهور تسلسلات `\uXXXX` حرفية للمشرف.
 *
 * الجذر الشائع: تسلسلات Unicode مكتوبة داخل نص JSX (ليست string literal)،
 * فيُعرَض الشرطة المائلة ع حرفيًا. كذلك JSON مزدوج التهريب من مصادر خارجية.
 */

const LITERAL_UNICODE_ESCAPE = /\\u([0-9a-fA-F]{4})/g;
const LITERAL_UNICODE_BRACE = /\\u\{([0-9a-fA-F]{1,6})\}/g;

/** هل السلسلة تحتوي تسلسل `\uXXXX` حرفيًا (لم يُفسَّر بعد)؟ */
export function hasLiteralUnicodeEscapes(value: string): boolean {
  return /\\u[0-9a-fA-F]{4}/.test(value) || /\\u\{[0-9a-fA-F]{1,6}\}/.test(value);
}

/**
 * يحوّل تسلسلات `\uXXXX` / `\u{...}` الحرفية إلى محارف Unicode حقيقية.
 * آمن للتكرار: النص العربي الصريح يُعاد كما هو.
 */
export function decodeLiteralUnicodeEscapes(input: string): string {
  if (!input || typeof input !== "string") return input;
  if (!input.includes("\\u")) return input;

  let out = input.replace(LITERAL_UNICODE_ESCAPE, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  out = out.replace(LITERAL_UNICODE_BRACE, (_, hex: string) => {
    const cp = Number.parseInt(hex, 16);
    if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return _;
    return String.fromCodePoint(cp);
  });
  // طبقات تهريب مزدوجة شائعة في استجابات JSON المسلسلة مرتين
  if (out.includes("\\u")) {
    out = out.replace(LITERAL_UNICODE_ESCAPE, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );
  }
  return out;
}

/** تطبيع عرض إداري: فك التهريب + تقليم مسافات زائدة غير كاسرة. */
export function normalizeAdminDisplayText(input: unknown): string {
  if (input == null) return "";
  if (typeof input === "number" || typeof input === "boolean") return String(input);
  if (typeof input !== "string") {
    try {
      return normalizeAdminDisplayText(JSON.stringify(input));
    } catch {
      return String(input);
    }
  }
  return decodeLiteralUnicodeEscapes(input);
}

/** يطبّق التطبيع على قيم نصية داخل كائن/مصفوفة (عمق محدود). */
export function normalizeAdminDisplayTree<T>(value: T, depth = 0): T {
  if (depth > 6 || value == null) return value;
  if (typeof value === "string") return normalizeAdminDisplayText(value) as T;
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAdminDisplayTree(item, depth + 1)) as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = normalizeAdminDisplayTree(v, depth + 1);
    }
    return out as T;
  }
  return value;
}
