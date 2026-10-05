/**
 * سلطة حالة لوحة التحكم — مصدر واحد لتحويل حالة المحتوى إلى (نبرة + تسمية عربية).
 * تستهلكه شارة الحالة في اللوحة القديمة (AdminUI.StatusBadge) وفي v3 (AdminStatusBadge)
 * وبطاقات الإحصاء (AdminStatCard) — النبرات تُرسم بتوكنات --mj-* لا بألوان حرفية.
 */

export type AdminTone = "neutral" | "success" | "warning" | "danger" | "info" | "accent";

export const ADMIN_TONES: readonly AdminTone[] = ["neutral", "success", "warning", "danger", "info", "accent"];

type Entry = { tone: AdminTone; label: string };

const STATUS_MAP: Record<string, Entry> = {
  pending: { tone: "warning", label: "بانتظار المراجعة" },
  pending_review: { tone: "warning", label: "بانتظار المراجعة" },
  needs_review: { tone: "warning", label: "يحتاج مراجعة" },
  in_review: { tone: "warning", label: "قيد المراجعة" },
  under_review: { tone: "warning", label: "قيد المراجعة" },
  review_pending: { tone: "warning", label: "قيد المراجعة" },
  approved: { tone: "success", label: "موثّق" },
  verified: { tone: "success", label: "موثّق" },
  published: { tone: "info", label: "منشور" },
  featured: { tone: "success", label: "مميّز" },
  completed: { tone: "success", label: "اكتمل" },
  healthy: { tone: "success", label: "سليم" },
  active: { tone: "success", label: "نشط" },
  running: { tone: "info", label: "قيد التشغيل" },
  rejected: { tone: "danger", label: "مرفوض" },
  failed: { tone: "danger", label: "فشل" },
  down: { tone: "danger", label: "متوقف" },
  archived: { tone: "neutral", label: "مؤرشف" },
  draft: { tone: "neutral", label: "مسودة" },
  hidden: { tone: "neutral", label: "مخفي" },
  unpublished: { tone: "neutral", label: "مخفي" },
  degraded: { tone: "warning", label: "متراجع" },
};

/** حالة → نبرة + تسمية. الحالة المجهولة تُعرض كما هي بنبرة محايدة. */
export function resolveAdminStatus(status: string | null | undefined): Entry {
  const key = (status ?? "").toString().trim().toLowerCase();
  return STATUS_MAP[key] ?? { tone: "neutral", label: status ? String(status) : "—" };
}

/** نبرة ← متغيّر لون CSS (توكن) لاستخدامه داخل متغيّرات مخصّصة بدل hex. */
export function adminToneColor(tone: AdminTone): string {
  switch (tone) {
    case "success":
      return "var(--mj-brand-deep)";
    case "warning":
      return "var(--mj-warning)";
    case "danger":
      return "var(--mj-danger)";
    case "info":
      return "var(--mj-info)";
    case "accent":
      return "var(--mj-accent)";
    default:
      return "var(--mj-ink-2)";
  }
}
