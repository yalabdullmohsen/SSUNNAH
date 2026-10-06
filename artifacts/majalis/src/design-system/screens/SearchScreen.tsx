import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "wouter";
import { Chip, EmptyState, ErrorState, ListGroup, ListRow, NavigationBar, SearchField, SectionHeader, SkeletonCard } from "@/design-system";
import type { DsIconName } from "@/design-system";
import { runAppSearch, type AppSearchResult } from "@/features/search/app-search";
import { SEARCH_SCOPE_DEFS, isSearchScopeId, type SearchScopeId } from "@/features/search/search-scopes";
import { groupSearchResultsBySection } from "@/features/search/search-result-sections";
import { isBlockedSearchHref } from "@/components/search/SearchResultCards";
import { addSearchHistory, clearSearchHistory, getSearchHistory } from "@/lib/search-history";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const SCOPE_ICON: Record<string, DsIconName> = {
  quran: "quran", tafsir: "tafsir", hadith: "hadith", fiqh: "fiqh", adhkar: "adhkar", lesson: "lessons",
  fawaid: "lightbulb", seerah: "seerah", history: "calendar", prophet: "stories", discover: "info", knowledge: "lightbulb",
};

/** البحث الشامل: حقل كبير · عمليات سابقة · أقسام للتصفّح · نتائج مجمّعة حسب النوع (العنوان والوصف في سطرين). */
export default function SearchScreen() {
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const [term, setTerm] = useState(params.get("q") || "");
  const scopeRaw = params.get("scope") || "all";
  const [scope, setScope] = useState<SearchScopeId>(isSearchScopeId(scopeRaw) ? scopeRaw : "all");
  const [state, setState] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [results, setResults] = useState<AppSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>(() => getSearchHistory().slice(0, 8));
  const q = useDebouncedValue(term, 280);
  const seq = useRef(0);

  useEffect(() => {
    const query = q.trim();
    if (!query) { setState("idle"); setResults([]); return; }
    const id = ++seq.current;
    const ctrl = new AbortController();
    setState("loading");
    runAppSearch(query, { scope, signal: ctrl.signal })
      .then((res) => {
        if (id !== seq.current) return;
        setResults(res.results.filter((r) => !isBlockedSearchHref(r.href)));
        setSuggestions(res.suggestions ?? []);
        setState("ready");
        addSearchHistory(query);
        setRecent(getSearchHistory().slice(0, 8));
        const url = new URL(window.location.href);
        url.searchParams.set("q", query);
        window.history.replaceState(null, "", url);
      })
      .catch((e) => { if ((e as Error)?.name !== "AbortError" && id === seq.current) setState("error"); });
    return () => ctrl.abort();
  }, [q, scope]);

  const groups = useMemo(() => groupSearchResultsBySection(results), [results]);
  return (
    <div className="sn-screen" data-testid="search-screen">
      <NavigationBar title="البحث" subtitle="القرآن والحديث والدروس والأقسام" />
      <div className="sn-container sn-stack sn-stack--lg">
        <SearchField large value={term} onChange={setTerm} label="بحث شامل" />
        <div className="sn-chip-scroller" role="group" aria-label="نطاق البحث">
          <Chip selected={scope === "all"} onClick={() => setScope("all")}>الكل</Chip>
          {SEARCH_SCOPE_DEFS.slice(0, 8).map((s) => (
            <Chip key={s.id} selected={scope === s.id} onClick={() => setScope(s.id)}>{s.title}</Chip>
          ))}
        </div>

        {state === "idle" && recent.length > 0 ? (
          <section className="sn-stack" aria-label="عمليات بحث سابقة">
            <SectionHeader title="عمليات سابقة" actionLabel="مسح" onAction={() => { clearSearchHistory(); setRecent([]); }} />
            <div className="sn-chip-scroller">
              {recent.map((r) => (<Chip key={r} onClick={() => setTerm(r)}>{r}</Chip>))}
            </div>
          </section>
        ) : null}

        {state === "idle" ? (
          <section className="sn-stack" aria-label="تصفّح الأقسام">
            <SectionHeader title="تصفّح الأقسام" />
            <ListGroup>
              {SEARCH_SCOPE_DEFS.map((s) => (<ListRow key={s.id} icon={SCOPE_ICON[s.id] ?? "search"} title={s.title} description={s.desc} href={s.href} />))}
            </ListGroup>
          </section>
        ) : null}

        {state === "loading" ? <><SkeletonCard /><SkeletonCard /></> : null}
        {state === "error" ? <ErrorState title="تعذّر البحث" onRetry={() => setTerm((t) => t + " ")} /> : null}
        {state === "ready" && results.length === 0 ? (
          <EmptyState icon="search" title="لا نتائج مطابقة" description={suggestions.length ? `ربما تقصد: ${suggestions.slice(0, 3).join("، ")}` : "جرّب كلمات أخرى أو غيّر نطاق البحث."} />
        ) : null}
        {state === "ready" ? groups.map((g) => (
          <section key={g.id} className="sn-stack" aria-label={g.label}>
            <SectionHeader title={g.label} />
            <ListGroup>
              {g.items.slice(0, 12).map((r) => (<ListRow key={r.id} title={r.title} description={r.summary} href={r.href} />))}
            </ListGroup>
          </section>
        )) : null}
      </div>
    </div>
  );
}
