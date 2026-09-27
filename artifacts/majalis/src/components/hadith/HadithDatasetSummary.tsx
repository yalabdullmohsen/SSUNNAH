import { Link } from "wouter";
import {
  formatHadithCount,
  getHadithDatasetCards,
  type HadithDatasetCard,
} from "@/lib/hadith/hadith-dataset-stats";

type Props = {
  className?: string;
};

function DatasetCard({ card }: { card: HadithDatasetCard }) {
  const showCount = card.id !== "network_catalog";
  return (
    <Link
      href={card.href}
      className="hadith-dataset-card"
      data-hadith-dataset={card.id}
    >
      <span className="hadith-dataset-card__avail">{card.availabilityLabelAr}</span>
      <span className="hadith-dataset-card__title">{card.titleAr}</span>
      {showCount ? (
        <span className="hadith-dataset-card__count" data-hadith-count={card.count}>
          {formatHadithCount(card.count)}
        </span>
      ) : (
        <span className="hadith-dataset-card__count hadith-dataset-card__count--note">كتالوج</span>
      )}
      <span className="hadith-dataset-card__desc">{card.descriptionAr}</span>
      {card.breakdownAr ? (
        <span className="hadith-dataset-card__break">{card.breakdownAr}</span>
      ) : null}
    </Link>
  );
}

/**
 * ملخص مجموعات الحديث في المحور — أعداد منفصلة بلا مجموع موحّد مضلّل.
 * الاسم متعمّد لتجنّب HadithStatsPanel المحظور في البوابة القديمة.
 */
export function HadithDatasetSummary({ className = "" }: Props) {
  const cards = getHadithDatasetCards();
  return (
    <section
      className={`hadith-dataset-summary${className ? ` ${className}` : ""}`}
      data-hadith-dataset-summary="1"
      aria-labelledby="hadith-dataset-summary-title"
    >
      <h2 id="hadith-dataset-summary-title" className="hadith-dataset-summary__title">
        مصادر الحديث في سُنّة
      </h2>
      <p className="hadith-dataset-summary__lead" role="note">
        كل مصدر بعدده وسياقه — لا يُجمَع الصحيحان مع المنسّق أو الأربعين في رقم واحد.
      </p>
      <div className="hadith-dataset-summary__grid">
        {cards.map((card) => (
          <DatasetCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
