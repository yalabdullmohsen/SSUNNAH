import { useEffect, useMemo, useState, useCallback, startTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ShareButtons } from "@/components/ContentActions";
import { Link } from "wouter";
import { navigateTo } from "@/lib/navigation-intent";
import { SectionQuiz } from "@/components/ui/SectionQuiz";
import {
  EmptyStateV2,
  ErrorStateV2,
  NoResultsState,
  OfflineStateV2,
} from "@/components/design-system";
import { FieldLabel } from "@/components/design-system/FormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HarvestFeedPanel } from "@/components/lessons/HarvestFeedPanel";
import { SectionLobby } from "@/components/lobby/SectionLobby";
import { ListScreen } from "@/components/design-system/screens";
import {
  ActiveFilters,
  FilterSheet,
  type ActiveFilterItem,
} from "@/components/filters";
import { PageLoadingGuard } from "@/components/PageLoadingGuard";
import { useAuth } from "@/components/AuthProvider";
import { UnifiedLessonCard } from "@/components/lessons/UnifiedLessonCard";
import {
  LessonFilters,
  DEFAULT_LESSON_QUICK_FILTERS,
  applyLessonQuickFilters,
  type LessonQuickFilters,
} from "@/components/lessons/LessonFilters";
import {
  DEFAULT_KUWAIT_FILTERS,
  extractFilterOptions,
  filterKuwaitLessons,
  sortKuwaitLessons,
  type KuwaitLessonFilters,
  type KuwaitLessonRecord,
} from "@/lib/kuwait-lessons";
import { getUnifiedLessonsSplit } from "@/lib/lessons-service";
import { RequestManager } from "@/lib/request-manager";
import { beginAbortScope, abortScope } from "@/lib/route-abort";
import { regionsForGovernorate } from "@/lib/kuwait-regions";
import { fromKuwaitLesson } from "@/lib/unified-lesson-card";
import "@/styles/pages/lessons.css";
import "@/styles/pages/lessons-sections-v2.css";
import "@/components/sections/section-cards.css";
import { registerForLesson, unregisterFromLesson, getMyRegistrations } from "@/lib/supabase";
import { applyPageSeo } from "@/lib/seo";
import { EMPTY, STATUS } from "@/lib/ui-copy";
import { ExploreAlsoNav } from "@/components/ExploreAlsoNav";
import { formatSheikhName } from "@/lib/sheikh-name";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { isWomenFriendlyLesson } from "@/lib/lesson-women-attendance";
import { SITE_URL } from "@/lib/site-config";

import { Button } from "@/components/ui/button";
type TabId = "all" | "men" | "women" | "courses";

/** أول دفعة بطاقات — الباقي بـ «عرض المزيد» لتجنّب رسم مئات البطاقات دفعة واحدة */
const LESSONS_PAGE_SIZE = 24;

function useTabFromUrl(): [TabId, (tab: TabId) => void] {
  const [tab, setTabState] = useState<TabId>(() => readTabFromUrl());

  useEffect(() => {
    const sync = () => setTabState(readTabFromUrl());
    sync();
    const params = new URLSearchParams(window.location.search);
    const legacyTab = params.get("tab");
    if (legacyTab === "courses" || legacyTab === "men" || legacyTab === "women") {
      params.delete("tab");
      const q = params.toString();
      const base = q ? `/lessons?${q}` : "/lessons";
      window.history.replaceState(null, "", `${base}#${legacyTab}`);
      setTabState(legacyTab);
    }
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const setTab = useCallback(
    (next: TabId) => {
      writeTabToUrl(next);
      setTabState(next);
    },
    [],
  );

  return [tab, setTab];
}

function readTabFromUrl(): TabId {
  if (typeof window === "undefined") return "all";
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "courses" || hash === "men" || hash === "women") return hash;
  const legacy = new URLSearchParams(window.location.search).get("tab");
  if (legacy === "courses" || legacy === "men" || legacy === "women") return legacy;
  return "all";
}

function writeTabToUrl(next: TabId) {
  const hash = next === "all" ? "" : `#${next}`;
  navigateTo(`/lessons${hash}`, { mode: "state" });
}

function filterByTab(lessons: KuwaitLessonRecord[], tab: TabId): KuwaitLessonRecord[] {
  if (tab === "courses") return lessons.filter((l) => l.isCourse || l.activityType === "دورة");
  if (tab === "men") return lessons.filter((l) => !isWomenFriendlyLesson(l));
  if (tab === "women") return lessons.filter((l) => isWomenFriendlyLesson(l));
  return lessons;
}

function countActiveFacetFilters(filters: KuwaitLessonFilters): number {
  let n = 0;
  if (filters.search.trim()) n++;
  if (filters.governorate !== DEFAULT_KUWAIT_FILTERS.governorate) n++;
  if (filters.region !== DEFAULT_KUWAIT_FILTERS.region) n++;
  if (filters.mosque !== DEFAULT_KUWAIT_FILTERS.mosque) n++;
  if (filters.sheikh !== DEFAULT_KUWAIT_FILTERS.sheikh) n++;
  if (filters.day !== DEFAULT_KUWAIT_FILTERS.day) n++;
  if (filters.category !== DEFAULT_KUWAIT_FILTERS.category) n++;
  if (filters.timeSlot !== DEFAULT_KUWAIT_FILTERS.timeSlot) n++;
  if (filters.activityType !== DEFAULT_KUWAIT_FILTERS.activityType) n++;
  if (filters.hasLiveStream !== DEFAULT_KUWAIT_FILTERS.hasLiveStream) n++;
  return n;
}

function LessonsFilterFields({
  filters,
  setFilter,
  options,
  regionOptions,
}: {
  filters: KuwaitLessonFilters;
  setFilter: <K extends keyof KuwaitLessonFilters>(key: K, value: KuwaitLessonFilters[K]) => void;
  options: ReturnType<typeof extractFilterOptions>;
  regionOptions: string[];
}) {
  const liveValue = filters.hasLiveStream === null ? "الكل" : filters.hasLiveStream ? "نعم" : "لا";
  return (
    <div className="mj-filter-fields">
      <div className="mj-filter-field">
        <FieldLabel>المحافظة</FieldLabel>
        <Select value={filters.governorate} onValueChange={(v) => setFilter("governorate", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب المحافظة">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.governorates.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>المنطقة</FieldLabel>
        <Select value={filters.region} onValueChange={(v) => setFilter("region", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب المنطقة">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regionOptions.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>الشيخ</FieldLabel>
        <Select value={filters.sheikh} onValueChange={(v) => setFilter("sheikh", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب الشيخ">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.sheikhs.map((v) => (
              <SelectItem key={v} value={v}>
                {v === "كل المشايخ" ? v : (formatSheikhName(v) || v)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>التصنيف</FieldLabel>
        <Select value={filters.category} onValueChange={(v) => setFilter("category", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب التصنيف">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.categories.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>اليوم</FieldLabel>
        <Select value={filters.day} onValueChange={(v) => setFilter("day", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب اليوم">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.days.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>الوقت</FieldLabel>
        <Select value={filters.timeSlot} onValueChange={(v) => setFilter("timeSlot", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب الوقت">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.timeSlots.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>نوع النشاط</FieldLabel>
        <Select value={filters.activityType} onValueChange={(v) => setFilter("activityType", v)}>
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب نوع النشاط">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.activityTypes.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mj-filter-field">
        <FieldLabel>بث مباشر</FieldLabel>
        <Select
          value={liveValue}
          onValueChange={(v) => setFilter("hasLiveStream", v === "الكل" ? null : v === "نعم")}
        >
          <SelectTrigger className="min-h-11 text-base" aria-label="تصفية حسب البث المباشر">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">الكل</SelectItem>
            <SelectItem value="نعم">يوجد بث</SelectItem>
            <SelectItem value="لا">بدون بث</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default function LessonsPage({
  initialActive,
  initialArchived,
}: {
  initialActive?: KuwaitLessonRecord[];
  initialArchived?: KuwaitLessonRecord[];
} = {}) {
  const [activeLessons, setActiveLessons] = useState<KuwaitLessonRecord[]>(initialActive ?? []);
  const [archivedLessons, setArchivedLessons] = useState<KuwaitLessonRecord[]>(initialArchived ?? []);
  const [loading, setLoading] = useState(!initialActive);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filters, setFilters] = useState<KuwaitLessonFilters>(() => {
    const base = { ...DEFAULT_KUWAIT_FILTERS };
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("search");
      if (q) base.search = q;
    }
    return base;
  });
  const [searchDraft, setSearchDraft] = useState(() => filters.search);
  const debouncedSearch = useDebouncedValue(searchDraft, 250);
  const [quickFilters, setQuickFilters] = useState<LessonQuickFilters>(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (hash === "courses") return { ...DEFAULT_LESSON_QUICK_FILTERS, schedule: "courses" };
    if (hash === "women") return { ...DEFAULT_LESSON_QUICK_FILTERS, schedule: "women" };
    return DEFAULT_LESSON_QUICK_FILTERS;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(() => Boolean(filters.search.trim()));
  const [myReg, setMyReg] = useState<string[]>([]);
  const [, setTab] = useTabFromUrl();
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    setFilters((prev) => (prev.search === debouncedSearch ? prev : { ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const current = params.get("search") || "";
    if ((debouncedSearch || "") === current) return;
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    else params.delete("search");
    const q = params.toString();
    const hash = window.location.hash;
    const next = q ? `/lessons?${q}${hash}` : `/lessons${hash}`;
    window.history.replaceState(window.history.state, "", next);
  }, [debouncedSearch]);

  useEffect(() => {
    applyPageSeo({
      path: "/lessons",
      canonicalPath: "/lessons",
      title: "الدروس الشرعية والعلمية | سُنّة",
      description:
        "دروس شرعية وعلمية من أئمة وعلماء الكويت في الفقه والعقيدة والقرآن والسيرة واللغة.",
      keywords: ["دروس شرعية", "دروس دينية", "دروس علمية", "علماء الكويت", "حلقات علمية"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "الدروس الشرعية والدورات العلمية",
          description:
            "فهرس الدروس والدورات العلمية من مشايخ الكويت.",
          numberOfItems: Math.max(1, activeLessons.length || 1),
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الدروس الشرعية والدورات العلمية", url: `${SITE_URL}/lessons` },
          ],
        },
      ],
    });
  }, [activeLessons.length]);

  useEffect(() => {
    if (initialActive && reloadKey === 0) return;
    let cancelled = false;
    const signal = beginAbortScope("lessons:page");
    setLoading(true);
    setLoadError(null);
    RequestManager.run(
      "lessons:unified-split",
      async () => getUnifiedLessonsSplit(),
      { signal, dedupeKey: "lessons:unified-split" },
    )
      .then(({ active, archived }) => {
        if (cancelled) return;
        setActiveLessons(active);
        setArchivedLessons(archived);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled || (err as Error)?.name === "AbortError") return;
        const offline = typeof navigator !== "undefined" && navigator.onLine === false;
        setLoadError(offline ? STATUS.networkError : STATUS.loadError);
        // أبقِ الدروس السابقة إن وُجدت (بلا وميض فراغ)
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      abortScope("lessons:page");
      RequestManager.cancel("lessons:unified-split");
    };
  }, [initialActive, reloadKey]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !user?.id) {
      setMyReg([]);
      return;
    }
    let cancelled = false;
    getMyRegistrations(user.id)
      .then((rows) => {
        if (!cancelled) setMyReg(rows);
      })
      .catch(() => {
        if (!cancelled) setMyReg([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, isLoggedIn, user]);

  useEffect(() => {
    const scrollToList = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash !== "lessons-list") return;
      document.getElementById("lessons-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToList();
    window.addEventListener("hashchange", scrollToList);
    return () => window.removeEventListener("hashchange", scrollToList);
  }, []);

  const tabLessons = useMemo(() => {
    if (quickFilters.schedule === "archive") return archivedLessons;
    if (quickFilters.schedule === "courses") return filterByTab(activeLessons, "courses");
    if (quickFilters.schedule === "women") return filterByTab(activeLessons, "women");
    return filterByTab(activeLessons, "all");
  }, [activeLessons, archivedLessons, quickFilters.schedule]);
  const options = useMemo(() => extractFilterOptions(tabLessons), [tabLessons]);
  const regionOptions = useMemo(() => {
    if (filters.governorate === "كل المحافظات") return options.regions;
    return ["كل المناطق", ...regionsForGovernorate(filters.governorate)];
  }, [filters.governorate, options.regions]);

  const filtered = useMemo(
    () => sortKuwaitLessons(filterKuwaitLessons(tabLessons, filters)),
    [tabLessons, filters],
  );

  const quickFiltered = useMemo(() => {
    if (quickFilters.schedule === "archive") {
      return sortKuwaitLessons(filterKuwaitLessons(archivedLessons, filters));
    }
    return applyLessonQuickFilters(filtered, quickFilters);
  }, [archivedLessons, filtered, filters, quickFilters]);

  const pageTitle =
    quickFilters.schedule === "archive"
      ? "أرشيف الدروس"
      : quickFilters.schedule === "today"
        ? "دروس اليوم"
        : "الدروس";

  /** قائمة واحدة مرتّبة من الأقرب إلى الأبعد — بطاقة موحّدة فقط */
  const listLessons = quickFiltered;
  const [visibleCount, setVisibleCount] = useState(LESSONS_PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(LESSONS_PAGE_SIZE);
  }, [quickFilters, filters]);
  const visibleLessons = useMemo(
    () => listLessons.slice(0, visibleCount),
    [listLessons, visibleCount],
  );
  const hasMoreLessons = listLessons.length > visibleCount;

  const setFilter = <K extends keyof KuwaitLessonFilters>(key: K, value: KuwaitLessonFilters[K]) => {
    startTransition(() => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "governorate") next.region = "كل المناطق";
        return next;
      });
    });
  };

  const clearAllFilters = useCallback(() => {
    setSearchDraft("");
    setSearchOpen(false);
    setFilters(DEFAULT_KUWAIT_FILTERS);
    setQuickFilters(DEFAULT_LESSON_QUICK_FILTERS);
    setTab("all");
  }, [setTab]);

  const activeFilterCount = useMemo(() => countActiveFacetFilters(filters), [filters]);

  const activeFilterItems = useMemo<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];
    if (filters.search.trim()) {
      items.push({
        id: "search",
        label: `بحث: ${filters.search.trim()}`,
        onRemove: () => {
          setSearchDraft("");
          setFilter("search", "");
        },
      });
    }
    if (filters.governorate !== DEFAULT_KUWAIT_FILTERS.governorate) {
      items.push({
        id: "gov",
        label: filters.governorate,
        onRemove: () => setFilter("governorate", DEFAULT_KUWAIT_FILTERS.governorate),
      });
    }
    if (filters.region !== DEFAULT_KUWAIT_FILTERS.region) {
      items.push({
        id: "region",
        label: filters.region,
        onRemove: () => setFilter("region", DEFAULT_KUWAIT_FILTERS.region),
      });
    }
    if (filters.sheikh !== DEFAULT_KUWAIT_FILTERS.sheikh) {
      items.push({
        id: "sheikh",
        label: formatSheikhName(filters.sheikh) || filters.sheikh,
        onRemove: () => setFilter("sheikh", DEFAULT_KUWAIT_FILTERS.sheikh),
      });
    }
    if (filters.category !== DEFAULT_KUWAIT_FILTERS.category) {
      items.push({
        id: "cat",
        label: filters.category,
        onRemove: () => setFilter("category", DEFAULT_KUWAIT_FILTERS.category),
      });
    }
    if (filters.day !== DEFAULT_KUWAIT_FILTERS.day) {
      items.push({
        id: "day",
        label: filters.day,
        onRemove: () => setFilter("day", DEFAULT_KUWAIT_FILTERS.day),
      });
    }
    if (filters.timeSlot !== DEFAULT_KUWAIT_FILTERS.timeSlot) {
      items.push({
        id: "time",
        label: filters.timeSlot,
        onRemove: () => setFilter("timeSlot", DEFAULT_KUWAIT_FILTERS.timeSlot),
      });
    }
    if (filters.activityType !== DEFAULT_KUWAIT_FILTERS.activityType) {
      items.push({
        id: "activity",
        label: filters.activityType,
        onRemove: () => setFilter("activityType", DEFAULT_KUWAIT_FILTERS.activityType),
      });
    }
    if (filters.hasLiveStream !== null) {
      items.push({
        id: "live",
        label: filters.hasLiveStream ? "بث مباشر" : "بدون بث",
        onRemove: () => setFilter("hasLiveStream", null),
      });
    }
    return items;
  }, [filters]);

  const toggleReg = async (lessonId: string) => {
    if (!isLoggedIn || !user) {
      navigateTo(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      if (myReg.includes(lessonId)) {
        setMyReg(myReg.filter((id) => id !== lessonId));
        await unregisterFromLesson(user.id, lessonId);
      } else {
        setMyReg([...myReg, lessonId]);
        await registerForLesson(user.id, lessonId);
      }
    } catch {
      /* silent */
    }
  };

  const renderGrid = (lessons: KuwaitLessonRecord[], prefix = "", featuredHome = false) => (
    <div className="page-card-grid lesson-unified-grid">
      {lessons.map((lesson) => (
        <div key={`${prefix}${lesson.id}`}>
          <UnifiedLessonCard
            lesson={fromKuwaitLesson(lesson, prefix.startsWith("archived"), { featuredHome })}
            compact
            showRegister={isLoggedIn && !lesson.id.startsWith("kw-")}
            registered={myReg.includes(lesson.id)}
            onToggleRegister={() => toggleReg(lesson.id)}
          />
        </div>
      ))}
    </div>
  );

  const handleQuickChange = useCallback(
    (next: LessonQuickFilters) => {
      setQuickFilters(next);
      if (next.schedule === "courses") setTab("courses");
      else if (next.schedule === "women") setTab("women");
      else setTab("all");
    },
    [setTab],
  );

  return (
    <ListScreen compose="mark">
    <SectionLobby
      lobbyId="lessons"
      title={pageTitle}
      className="lessons-page-v2 lessons-page-v3 ds-page mj-page lessons-compact-header"
      chips={[]}
      groups={[]}
      filterSlot={
        <div className="lessons-v3-sticky">
          <LessonFilters
            lessons={tabLessons}
            filters={quickFilters}
            onChange={handleQuickChange}
            searchSlot={
              searchOpen || searchDraft.trim() ? (
                <label className="lesson-filters__search-field">
                  <span className="sr-only">بحث في الدروس</span>
                  <input
                    type="text"
                    inputMode="search"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    placeholder="ابحث في الدروس…"
                    dir="rtl"
                    enterKeyHint="search"
                  />
                  <Button
                    type="button"
                    className="lesson-filters__icon-btn"
                    aria-label="إغلاق البحث"
                    onClick={() => {
                      setSearchDraft("");
                      setSearchOpen(false);
                    }} variant="ghost">
                    <X size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </label>
              ) : (
                <Button
                  type="button"
                  className="lesson-filters__icon-btn"
                  aria-label="بحث"
                  onClick={() => setSearchOpen(true)} variant="ghost">
                  <Search size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              )
            }
            filterSlot={
              <Button
                type="button"
                className="lesson-filters__icon-btn"
                aria-label="تصفية"
                aria-expanded={filtersOpen}
                aria-haspopup="dialog"
                onClick={() => setFiltersOpen(true)} variant="ghost">
                <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
                {activeFilterCount > 0 ? (
                  <span className="lesson-filters__badge">{activeFilterCount}</span>
                ) : null}
              </Button>
            }
          />
          <ActiveFilters
            items={activeFilterItems}
            onClearAll={clearAllFilters}
            resultCount={activeFilterCount > 0 && !loading ? quickFiltered.length : null}
          />
        </div>
      }
    >
      <div className="lessons-v2-layout lessons-v3-layout">
        <main className="lessons-v2-main" id="lessons-list" aria-busy={loading}>
          {loadError && !loading && activeLessons.length === 0 && archivedLessons.length === 0 ? (
            typeof navigator !== "undefined" && navigator.onLine === false ? (
              <OfflineStateV2
                title="تعذّر تحميل الدروس دون اتصال"
                description={loadError}
                availableHint="عند عودة الشبكة أعد المحاولة. إن وُجدت دروس محفوظة سابقًا فقد تظهر أعلاه."
                onRetry={() => setReloadKey((k) => k + 1)}
              />
            ) : (
              <ErrorStateV2
                title="تعذّر تحميل الدروس"
                description={loadError}
                onRetry={() => setReloadKey((k) => k + 1)}
              />
            )
          ) : null}

          {!(loadError && activeLessons.length === 0 && archivedLessons.length === 0) ? (
          <PageLoadingGuard
            loading={loading}
            error={null}
            empty={false}
            onRetry={() => setReloadKey((k) => k + 1)}
          >
            <>
              <section className="lessons-v2-section lessons-v2-section--first">
                {listLessons.length === 0 ? (
                  activeFilterCount > 0 || Boolean(filters.search.trim()) ? (
                    <NoResultsState
                      title="لا دروس مطابقة"
                      description={EMPTY.search}
                      queryHint={filters.search.trim() ? `البحث: ${filters.search.trim()}` : undefined}
                      clearLabel="مسح التصفية"
                      onClear={clearAllFilters}
                    />
                  ) : (
                    <EmptyStateV2
                      title="لا دروس منشورة بعد"
                      description={EMPTY.data}
                      href="/"
                      ctaLabel="الرئيسية"
                    />
                  )
                ) : (
                  <>
                    {renderGrid(
                      visibleLessons,
                      quickFilters.schedule === "archive" ? "archived-" : "",
                      false,
                    )}
                    {hasMoreLessons ? (
                      <div className="lessons-v2-more">
                        <Button
                          type="button"
                          className="mj-btn mj-btn--ghost"
                          onClick={() =>
                            setVisibleCount((n) => Math.min(n + LESSONS_PAGE_SIZE, listLessons.length))
                          } variant="ghost">
                          عرض المزيد ({listLessons.length - visibleCount})
                        </Button>
                      </div>
                    ) : null}
                  </>
                )}
              </section>

              {!loading && quickFilters.schedule !== "archive" ? (
                <section className="lessons-past-section" aria-labelledby="past-lessons-heading">
                  <h2 id="past-lessons-heading" className="lessons-past-section__title">الدروس السابقة</h2>
                  <p className="lessons-empty-state">
                    الدروس المنتهية في{""}
                    <Link href="/lessons/archive">الأرشيف</Link>
                    {archivedLessons.length > 0 ? ` (${archivedLessons.length})` : ` — ${EMPTY.data}`}
                    .
                  </p>
                </section>
              ) : null}
            </>
          </PageLoadingGuard>
          ) : null}
          <HarvestFeedPanel />
        </main>

        <aside className="lessons-v2-sidebar" aria-label="تصفية سطح المكتب">
          <div className="lessons-v2-filters">
            <div className="lessons-v2-filters__head">
              <h2>تصفية الدروس</h2>
            </div>
            <LessonsFilterFields
              filters={filters}
              setFilter={setFilter}
              options={options}
              regionOptions={regionOptions}
            />
          </div>
        </aside>
      </div>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="تصفية الدروس">
        <LessonsFilterFields
          filters={filters}
          setFilter={setFilter}
          options={options}
          regionOptions={regionOptions}
        />
      </FilterSheet>

      <div className="twh-share">
        <ShareButtons title="الدروس العلمية — سُنّة" url={`${SITE_URL}/lessons`} />
      </div>
      <ExploreAlsoNav
        title="استكشف أيضًا"
        links={[
          { href: "/tarikh-islami", label: "التاريخ الإسلامي" },
          { href: "/quran-hub", label: "مركز القرآن الكريم" },
          { href: "/hadith", label: "الحديث وعلومه" },
          { href: "/fiqh", label: "الفقه والأحكام" },
        ]}
      />
      <section className="lessons-page-stats" aria-label="إحصاءات الدروس">
        <p className="lessons-page-stats__item">{listLessons.length} بطاقة معروضة</p>
        <p className="lessons-page-stats__item">{activeLessons.length} جلسة نشطة</p>
        {archivedLessons.length > 0 ? (
          <p className="lessons-page-stats__item">{archivedLessons.length} في الأرشيف</p>
        ) : null}
      </section>
      <div className="lessons-v3-footer-pad">
        <SectionQuiz route="/lessons" aria-label="اختبر معلوماتك في الدروس الشرعية" count={4} />
      </div>
    </SectionLobby>
    </ListScreen>
  );
}
