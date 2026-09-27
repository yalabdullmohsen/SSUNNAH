/**
 * إحصاءات الحديث الظاهرة — مشتقّة من السجل الكانوني.
 * لا تُجمَع هذه الأعداد في مجموع واحد مضلّل.
 */

import {
  REGISTRY_ARBAEEN,
  REGISTRY_CURATED,
  REGISTRY_NETWORK_CATALOG,
  REGISTRY_SAHIHAYN,
  USER_LABELS,
} from "./hadith-collection-registry";

export type HadithDatasetKind =
  | "sahihayn_local"
  | "verified_curated"
  | "arbaeen_learning"
  | "network_catalog";

export type HadithDatasetCard = {
  id: HadithDatasetKind;
  titleAr: string;
  count: number;
  availabilityLabelAr: string;
  descriptionAr: string;
  href: string;
  breakdownAr?: string;
};

export const SAHIHAYN_LOCAL = {
  id: "sahihayn_local" as const,
  bukhari: REGISTRY_SAHIHAYN.bukhari,
  muslim: REGISTRY_SAHIHAYN.muslim,
  total: REGISTRY_SAHIHAYN.total,
  authenticity: REGISTRY_SAHIHAYN.authenticity,
  editionNoteAr: USER_LABELS.bySourceNumbering + " المحلي للمرآة",
  availabilityLabelAr: USER_LABELS.local,
};

export const VERIFIED_CURATED = {
  id: "verified_curated" as const,
  sahih: REGISTRY_CURATED.sahih,
  daif: REGISTRY_CURATED.daif,
  mawdu: REGISTRY_CURATED.mawdu,
  total: REGISTRY_CURATED.total,
  availabilityLabelAr: USER_LABELS.curated,
};

export const ARBAEEN_LEARNING = {
  id: "arbaeen_learning" as const,
  total: REGISTRY_ARBAEEN.total,
  availabilityLabelAr: USER_LABELS.learning,
};

export const NETWORK_CATALOG_COUNTS = REGISTRY_NETWORK_CATALOG;

export const NETWORK_NUMBERING_NOTE_AR = USER_LABELS.bySourceNumbering;
export const NETWORK_ACCESS_NOTE_AR = USER_LABELS.network;

export function getHadithDatasetCards(): HadithDatasetCard[] {
  return [
    {
      id: "sahihayn_local",
      titleAr: "الصحيحان",
      count: SAHIHAYN_LOCAL.total,
      availabilityLabelAr: SAHIHAYN_LOCAL.availabilityLabelAr,
      descriptionAr:
        "أحاديث البخاري ومسلم من المرآة المحلية. الصحة بعضوية الكتاب لا بحكم مستقل لكل سند.",
      href: "/hadith/sahih",
      breakdownAr: `البخاري ${SAHIHAYN_LOCAL.bukhari.toLocaleString("ar-EG")} · مسلم ${SAHIHAYN_LOCAL.muslim.toLocaleString("ar-EG")} · ${SAHIHAYN_LOCAL.editionNoteAr}`,
    },
    {
      id: "verified_curated",
      titleAr: "مجموعة منسّقة",
      count: VERIFIED_CURATED.total,
      availabilityLabelAr: VERIFIED_CURATED.availabilityLabelAr,
      descriptionAr:
        "عيّنة مصنّفة — ليست كل الأحاديث الصحيحة ولا كل الضعيفة ولا كل الموضوعة.",
      href: "/hadith/sahih",
      breakdownAr: `صحيح ${VERIFIED_CURATED.sahih.toLocaleString("ar-EG")} · ضعيف ${VERIFIED_CURATED.daif.toLocaleString("ar-EG")} · موضوع ${VERIFIED_CURATED.mawdu.toLocaleString("ar-EG")}`,
    },
    {
      id: "arbaeen_learning",
      titleAr: "الأربعون النووية",
      count: ARBAEEN_LEARNING.total,
      availabilityLabelAr: ARBAEEN_LEARNING.availabilityLabelAr,
      descriptionAr: "مسار تعلّم مستقل بالمتن والشرح وتقدّم القراءة.",
      href: "/arbaeen-nawawi",
    },
    {
      id: "network_catalog",
      titleAr: "كتب إضافية",
      count: 0,
      availabilityLabelAr: NETWORK_ACCESS_NOTE_AR,
      descriptionAr:
        "مجموعات إضافية عبر الشبكة. أعدادها بحسب ترقيم المصدر وليست مكافئة للمرآة المحلية.",
      href: "/hadith/books",
      breakdownAr: "لا يُعرض مجموع مضلّل — كل كتاب بعدده وترقيمه",
    },
  ];
}

export function formatHadithCount(n: number): string {
  return n.toLocaleString("ar-EG");
}

/** ممنوع في الواجهة: جمع المصادر في رقم واحد */
export const FORBIDDEN_COMBINED_TOTAL =
  SAHIHAYN_LOCAL.total + VERIFIED_CURATED.total + ARBAEEN_LEARNING.total;
