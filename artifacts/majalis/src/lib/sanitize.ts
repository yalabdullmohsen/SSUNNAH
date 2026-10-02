const HTML_TAG = /<[^>]*>/g;
const SCRIPTish = /javascript:|data:text\/html|on\w+\s*=/gi;

export function stripHtml(value: string): string {
  return String(value || "")
   .replace(SCRIPTish, "")
    .replace(HTML_TAG, "")
    .replace(/[<>]/g, "")
    .trim();
}

export function sanitizeText(value: unknown, maxLength = 5000): string {
  return stripHtml(String(value ?? "")).slice(0, maxLength);
}

export function sanitizeOptionalUrl(value: unknown, maxLength = 2048): string {
  const raw = stripHtml(String(value ?? "")).slice(0, maxLength);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return "";
  }
  return "";
}

/**
 * Safe public href: relative app paths or http(s) only.
 * Rejects javascript:/data:/protocol-relative // and other schemes.
 */
export function safeHttpHref(value: unknown, maxLength = 2048): string | undefined {
  const raw = stripHtml(String(value ?? "")).trim().slice(0, maxLength);
  if (!raw) return undefined;
  if (/^(javascript|data|vbscript):/i.test(raw)) return undefined;
  if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("://")) {
    if (raw.includes("..")) return undefined;
    return raw;
  }
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return undefined;
  }
  return undefined;
}

export function sanitizeFormRecord(
  record: Record<string, unknown>,
  fields: Record<string, { max?: number; type?: "text" | "url" }>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...record };
  for (const [key, rule] of Object.entries(fields)) {
    if (out[key] === undefined || out[key] === null) continue;
    if (rule.type === "url") {
      out[key] = sanitizeOptionalUrl(out[key], rule.max);
    } else {
      out[key] = sanitizeText(out[key], rule.max ?? 5000);
    }
  }
  return out;
}
