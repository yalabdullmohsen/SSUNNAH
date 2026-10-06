/**
 * بطاقة متابعة محلية — مصحف / دروس / أنبياء / أذكار / علماء.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen, Headphones } from "lucide-react";
import { getSurahMeta } from "@/lib/quran-api";
import { normalizeSurahAyah } from "@/lib/ayah-ref-normalize";
import { AUDIO_RESUME_CHANGED_EVENT, loadAudioResumeState } from "@/lib/quran-audio-resume";
import { getContinueReadingEntries, type ContinueSection } from "@/lib/continue-reading";
import { ayahKeyToPage } from "@/lib/quran-ayah-page";
import { toArabicDigits } from "@/lib/utils";
import { FEATURE_TOUR_HYDRATED_EVENT } from "@/lib/feature-tour-state";
import "@/styles/components/home-local-resume.css";

type ResumeItem = {
  id: string;
  kind: ContinueSection | "listen";
  href: string;
  sectionLabel: string;
  title: string;
};

const SECTION_LABEL: Record<ContinueSection | "listen", string> = {
  mushaf: "القرآن الكريم",
  lessons: "الدروس",
  prophets: "قصص الأنبياء",
  adhkar: "الأذكار",
  library: "مرجع",
  tarikh: "التاريخ الإسلامي",
  listen: "الاستماع",
};

function buildItems(): ResumeItem[] {
  const items: ResumeItem[] = [];
  const seen = new Set<string>();
  const audio = loadAudioResumeState();

  /* موضع المصحف تعرضه بطاقة «متابعة القراءة» (LastReadingBookmarkCard) فوق القائمة —
     تكراره هنا كان يُظهر نفس الصفحة مرتين على الرئيسية. */
  seen.add("mushaf");
  if (audio && audio.surah >= 1 && audio.ayah >= 1) {
    const n = normalizeSurahAyah(audio.surah, audio.ayah);
    const name = getSurahMeta(n.surah).name.replace(/^سُورَةُ\s*/u, "");
    const p = ayahKeyToPage(`${n.surah}:${n.ayah}`);
    items.push({
      id: "listen",
      kind: "listen",
      href: `/mushaf/page/${p}?ayah=${n.surah}:${n.ayah}`,
      sectionLabel: SECTION_LABEL.listen,
      title: `${name} · آية ${toArabicDigits(n.ayah)}`,
    });
  }

  for (const entry of getContinueReadingEntries(8)) {
    if (entry.section === "library") continue;
    if (seen.has(entry.section)) continue;
    if (entry.section === "mushaf" && seen.has("mushaf")) continue;
    seen.add(entry.section);
    items.push({
      id: `cont-${entry.section}`,
      kind: entry.section,
      href: entry.route,
      sectionLabel: SECTION_LABEL[entry.section],
      title: entry.title,
    });
  }

  return items.slice(0, 5);
}

export function HomeLocalResumeCard() {
  const [items, setItems] = useState<ResumeItem[]>(() => buildItems());

  useEffect(() => {
    const refresh = () => setItems(buildItems());
    window.addEventListener(FEATURE_TOUR_HYDRATED_EVENT, refresh);
    window.addEventListener(AUDIO_RESUME_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FEATURE_TOUR_HYDRATED_EVENT, refresh);
      window.removeEventListener(AUDIO_RESUME_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="hlr" dir="rtl" aria-label="أكمل من حيث توقفت" data-testid="continue-where-left">
      <ul className="hlr__list">
        {items.map((item) => {
          const Icon = item.kind === "listen" ? Headphones : BookOpen;
          return (
            <li key={item.id}>
              <Link href={item.href} className="hlr__card">
                <span className="hlr__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="hlr__body">
                  <span className="hlr__section">{item.sectionLabel}</span>
                  <strong>{item.title}</strong>
                </span>
                <span className="hlr__cta">متابعة</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default HomeLocalResumeCard;
