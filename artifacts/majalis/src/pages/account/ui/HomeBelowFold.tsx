/**
 * تحت الطية — دروس + مقترحات + تخصيص · بلا تكرار متابعة/بوابات عملاقة.
 */
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Wrench } from "lucide-react";
import contentCounts from "@/data/content-counts.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { SectionErrorBoundary } from "@/components/ErrorBoundary";
import { HomeDailyProgress } from "@/components/home/HomeDailyProgress";
import { FridayBanner } from "@/components/FridayBanner";
import { toArabicDigits } from "@/lib/utils";
import { HomeCustomizeSheet } from "@/components/home/HomeCustomizeSheet";
import { HomeRecentPagesBar } from "@/components/home/HomeRecentPagesBar";
import { HomeRecommended } from "@/components/home/HomeRecommended";
import { HomeContentHub } from "@/components/home/HomeContentHub";
import { HomeSectionsGrid } from "@/components/home/HomeSectionsGrid";
import { HomeContinueLearning } from "@/components/home/HomeContinueLearning";
import { HomeDailyStrip } from "@/components/home/HomeDailyStrip";
import { lazyWithRetry } from "@/lib/lazy-with-retry";
import { ShareFaida } from "@/components/ShareFaida";
import { prefetchHomeWarmRoutes, prefetchRoute } from "@/lib/prefetch-route";
import { IA_HOME_PRIMARY } from "@/lib/ia-final-structure";
import {
  HOME_WIDGET_DEFS,
  getLocalHomepagePrefs,
  saveLocalHomepagePrefs,
  fetchRemoteHomepagePrefs,
  visibleWidgetOrder,
  type HomepagePrefs,
  type HomeWidgetId,
} from "@/lib/homepage-layout";
import "@/styles/pages/home-legacy.css";
import "@/styles/components/home-daily-strip.css";
import "@/styles/components/home-continue-learning.css";
import "@/styles/components/home-sections-grid.css";
import "@/styles/components/home-recommended.css";
import "@/styles/components/home-recent-rail.css";

const HomeUpcomingLessons = lazyWithRetry(
  () => import("@/components/home/HomeUpcomingLessons").then((m) => ({ default: m.HomeUpcomingLessons })),
  "HomeUpcomingLessons",
);
const HomeCompactPrayer = lazyWithRetry(
  () => import("@/components/home/HomeCompactPrayer").then((m) => ({ default: m.HomeCompactPrayer })),
  "HomeCompactPrayer",
);
const HomeDailyBenefits = lazyWithRetry(
  () => import("@/components/home/HomeDailyBenefits").then((m) => ({ default: m.HomeDailyBenefits })),
  "HomeDailyBenefits",
);
const HomeUpcomingEvents = lazyWithRetry(
  () => import("@/components/home/HomeUpcomingEvents").then((m) => ({ default: m.HomeUpcomingEvents })),
  "HomeUpcomingEvents",
);
const HomeSunnahByTime = lazyWithRetry(
  () => import("@/components/home/HomeSunnahByTime").then((m) => ({ default: m.HomeSunnahByTime })),
  "HomeSunnahByTime",
);
const HomeIslamicOccasions = lazyWithRetry(
  () => import("@/components/home/HomeIslamicOccasions").then((m) => ({ default: m.HomeIslamicOccasions })),
  "HomeIslamicOccasions",
);
const HomePrayerRanks = lazyWithRetry(
  () => import("@/components/home/HomePrayerRanks").then((m) => ({ default: m.HomePrayerRanks })),
  "HomePrayerRanks",
);
const HomeQuizCard = lazyWithRetry(
  () => import("@/components/home/HomeQuizCard").then((m) => ({ default: m.HomeQuizCard })),
  "HomeQuizCard",
);
const HomeWeekStreak = lazyWithRetry(
  () => import("@/components/home/HomeWeekStreak").then((m) => ({ default: m.HomeWeekStreak })),
  "HomeWeekStreak",
);
const HomeInterestingTopics = lazyWithRetry(
  () => import("@/components/home/HomeInterestingTopics").then((m) => ({ default: m.HomeInterestingTopics })),
  "HomeInterestingTopics",
);
const HomeMindMapSection = lazyWithRetry(
  () => import("@/components/home/HomeMindMapSection").then((m) => ({ default: m.HomeMindMapSection })),
  "HomeMindMapSection",
);

function SafeHomeSection({ name, children }: { name: string; children: ReactNode }) {
  return (
    <SectionErrorBoundary name={name}>
      <Suspense fallback={<div className="skeleton-base hp-skel" aria-label={`تحميل ${name}`} />}>
        {children}
      </Suspense>
    </SectionErrorBoundary>
  );
}

const OPTIONAL_WIDGET_RENDERERS: Partial<Record<HomeWidgetId, () => ReactNode>> = {
  prayer: () => <HomeCompactPrayer />,
  "week-streak": () => <HomeWeekStreak />,
  "sunnah-time": () => <HomeSunnahByTime />,
  occasions: () => <HomeIslamicOccasions />,
  quiz: () => <HomeQuizCard />,
  "daily-benefits": () => <HomeDailyBenefits />,
  "upcoming-events": () => <HomeUpcomingEvents />,
  "prayer-ranks": () => <HomePrayerRanks />,
  "interesting-topics": () => <HomeInterestingTopics />,
  "mind-map": () => <HomeMindMapSection />,
};

const WIDGET_LABEL: Record<string, string> = Object.fromEntries(
  HOME_WIDGET_DEFS.map((w) => [w.id, w.label]),
);

const PINNED: ReadonlySet<HomeWidgetId> = new Set(["lessons", "daily-progress"]);

/** اكتشاف أساسي فوق الطية: متابعة → يومي → أقسام → محتوى */
export function HomePrimaryDiscovery() {
  useEffect(() => {
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      prefetchHomeWarmRoutes();
      for (const { href } of IA_HOME_PRIMARY) prefetchRoute(href);
    };
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(warm, { timeout: 4_000 })
        : window.setTimeout(warm, 2_200);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function" && typeof idle === "number") {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle as number);
      }
    };
  }, []);

  return (
    <>
      <HomeContinueLearning />
      <HomeDailyStrip />
      <HomeSectionsGrid />
      <section className="m2030-band" aria-label="المحتوى الأساسي">
        <HomeContentHub />
      </section>
    </>
  );
}

export default function HomeBelowFold() {
  const { isAdmin, user } = useAuth();
  const [homePrefs, setHomePrefs] = useState<HomepagePrefs>(() => getLocalHomepagePrefs());
  const [customizeOpen, setCustomizeOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    void fetchRemoteHomepagePrefs(user.id).then((remote) => {
      if (!remote) return;
      setHomePrefs(remote);
      saveLocalHomepagePrefs(remote);
    });
  }, [user?.id]);

  const visibleWidgets = visibleWidgetOrder(homePrefs);
  const optionalWidgets = visibleWidgets.filter(
    (id) => !PINNED.has(id) && id !== "continue" && id !== "explore",
  );

  return (
    <>
      <HomeRecentPagesBar />
      <HomeRecommended />

      {visibleWidgets.includes("daily-progress") ? (
        <section
          className="m2030-band home-daily-progress-band home-daily-progress-band--compact"
          aria-label="تقدمك اليومي"
        >
          <SafeHomeSection name="daily-progress">
            <HomeDailyProgress compact />
          </SafeHomeSection>
        </section>
      ) : null}

      {visibleWidgets.includes("lessons") ? (
        <section className="m2030-band m2030-band--sage m2030-band--defer" aria-label="آخر الدروس">
          <div className="m2030-band__head">
            <h2 className="m2030-band__title">آخر الدروس</h2>
            <Link href="/lessons" className="m2030-band__link">
              كل الدروس
            </Link>
          </div>
          <SafeHomeSection name="lessons">
            <HomeUpcomingLessons />
          </SafeHomeSection>
        </section>
      ) : null}

      <div className="m2030-band home-friday-slim">
        <SafeHomeSection name="FridayBanner">
          <FridayBanner />
        </SafeHomeSection>
      </div>

      <section className="m2030-band home-share-slim" aria-label="شارك الموقع">
        <ShareFaida title="سُنّة — منصة تعليمية إسلامية" url="https://www.ssunnah.com/" />
      </section>

      <div className="m2030-band" style={{ textAlign: "center" }}>
        <Button type="button" variant="ghost" size="small" className="m2030-customize" onClick={() => setCustomizeOpen(true)}>
          <Wrench size={13} strokeWidth={2} aria-hidden="true" /> تخصيص الصفحة
        </Button>
      </div>

      {optionalWidgets.length > 0 ? (
        <div className="home-container home-main home-optional-widgets">
          {optionalWidgets.map((id) => {
            const render = OPTIONAL_WIDGET_RENDERERS[id];
            if (!render) return null;
            return (
              <SafeHomeSection key={id} name={WIDGET_LABEL[id] ?? id}>
                {render()}
              </SafeHomeSection>
            );
          })}
        </div>
      ) : null}

      {isAdmin ? (
        <p className="m2030-band__sub" style={{ textAlign: "center" }}>
          محتوى مرجعي: {toArabicDigits(contentCounts.islamicHistory)} عنصر تاريخ ·{" "}
          {toArabicDigits(contentCounts.quizQuestions)} سؤال
        </p>
      ) : null}

      <HomeCustomizeSheet
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        onChange={setHomePrefs}
      />
    </>
  );
}
