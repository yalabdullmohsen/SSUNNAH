/**
 * تمييز عضوية الصحيحين عن الحكم المنقول/التخريج المنسّق —
 * شفافية نموذج البيانات دون إعادة تقييم شرعي.
 */

import { USER_LABELS } from "./hadith-collection-registry";

export type HadithAuthenticitySource = {
  collection?: string | null;
  grade?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
};

export type HadithAuthenticityPresentation = {
  /** من صحيح البخاري / مسلم / الصحيحين */
  membershipLabel: string | null;
  /** تخريج منسّق / حكم منقول — عند وجود metadata */
  curatedLabel: string | null;
  /** نص مساعدة مختصر */
  helpText: string | null;
  /** هل الدرجة المعروضة عضوية كتاب وليست حكمًا مستقلًا مخزّنًا لكل سند؟ */
  gradeIsMembershipOnly: boolean;
};

function membershipFromCollection(collection: string | null | undefined): string | null {
  const c = (collection || "").toLowerCase();
  if (c === "bukhari") return USER_LABELS.membershipBukhari;
  if (c === "muslim") return USER_LABELS.membershipMuslim;
  if (c === "mutafaq") return USER_LABELS.membershipBoth;
  return null;
}

export function presentHadithAuthenticity(
  item: HadithAuthenticitySource,
): HadithAuthenticityPresentation {
  const meta = item.metadata ?? {};
  const method = String(meta.takhrij_method ?? "");
  const membershipLabel = membershipFromCollection(item.collection);

  const isMembershipOnly =
    method === "membership" || (method === "" && !!membershipLabel && !meta.muhaddith);
  const isCurated =
    method === "curated+membership" ||
    method === "curated" ||
    Boolean(meta.muhaddith) ||
    (Boolean(meta.takhrij) && method !== "membership");

  let curatedLabel: string | null = null;
  if (isCurated) {
    const muhaddith = meta.muhaddith != null ? String(meta.muhaddith).trim() : "";
    // لا نخترع اسم محدّث — نعرضه فقط إن وُجد في البيانات
    if (muhaddith) {
      curatedLabel = `${USER_LABELS.sourcedGrade} · ${muhaddith}`;
    } else if (item.grade) {
      curatedLabel = USER_LABELS.sourcedGrade;
    } else {
      curatedLabel = USER_LABELS.curatedTakhrij;
    }
  }

  let helpText: string | null = null;
  if (isMembershipOnly && membershipLabel) {
    helpText =
      "الإدراج في الصحيحين معيار الصحة هنا — وليس حكمًا مستقلًا مخزّنًا لكل سند على حدة.";
  } else if (membershipLabel && curatedLabel) {
    helpText = "من الصحيحين مع حكم/تخريج منقول إضافي عند توفّره في البيانات.";
  } else if (curatedLabel) {
    helpText = "حكم منقول من المصدر المنسّق كما هو مخزّن — دون إضافة أحكام جديدة.";
  }

  return {
    membershipLabel,
    curatedLabel,
    helpText,
    gradeIsMembershipOnly: Boolean(isMembershipOnly && membershipLabel),
  };
}

/** شارة قصيرة للبطاقة: عضوية أولًا، ثم تخريج/حكم منقول إن وُجد */
export function shortAuthenticityBadge(item: HadithAuthenticitySource): string | null {
  const p = presentHadithAuthenticity(item);
  if (p.membershipLabel && p.curatedLabel) {
    return `${p.membershipLabel} · ${USER_LABELS.curatedTakhrij}`;
  }
  return p.membershipLabel ?? p.curatedLabel;
}
