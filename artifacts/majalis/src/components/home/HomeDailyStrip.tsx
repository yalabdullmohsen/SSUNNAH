/**
 * شريط يومي موحّد — آية · حديث · ذكر · فائدة — بطاقات مضغوطة متساوية.
 */
import { Link } from "wouter";
import { getDailyAyah, getDailyDhikr, getDailyFaida, getDailyHadith } from "@/lib/daily-content";
import { toArabicDigits } from "@/lib/utils";
import "@/styles/components/home-daily-strip.css";

function clip(text: string, max = 96): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function HomeDailyStrip() {
  const ayah = getDailyAyah();
  const hadith = getDailyHadith();
  const dhikr = getDailyDhikr();
  const faida = getDailyFaida();

  const ayahRef =
    ayah.reference ||
    [ayah.surah, ayah.ayahNumber != null ? `آية ${toArabicDigits(ayah.ayahNumber)}` : null]
      .filter(Boolean)
      .join(" · ");

  const cards = [
    {
      id: "ayah",
      kicker: "آية اليوم",
      text: clip(ayah.text || "", 110),
      meta: ayahRef,
      href: "/mushaf",
    },
    {
      id: "hadith",
      kicker: "حديث اليوم",
      text: clip(hadith.text || "", 110),
      meta: [hadith.narrator, hadith.source].filter(Boolean).join(" — "),
      href: "/hadith",
    },
    {
      id: "dhikr",
      kicker: "ذكر اليوم",
      text: clip(dhikr.text || "", 96),
      meta: dhikr.source || "أذكار",
      href: "/adhkar",
    },
    {
      id: "faida",
      kicker: "فائدة اليوم",
      text: clip(faida.text || "", 96),
      meta: faida.author_name || faida.category || "فوائد",
      href: "/fawaid",
    },
  ].filter((c) => c.text);

  if (cards.length === 0) return null;

  return (
    <section className="hds" aria-label="محتوى اليوم" data-testid="home-daily-strip">
      <div className="hds__head">
        <h2 className="hds__title">محتوى اليوم</h2>
      </div>
      <ul className="hds__grid">
        {cards.map((c) => (
          <li key={c.id}>
            <Link href={c.href} className="hds__card">
              <span className="hds__kicker">{c.kicker}</span>
              <span className="hds__text">{c.text}</span>
              {c.meta ? <span className="hds__meta">{c.meta}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
