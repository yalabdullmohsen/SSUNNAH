/**
 * Canonical React Query keys — shared ownership + scoped invalidation.
 * Keep staleTime contracts in sync with createAppQueryClient defaults.
 *
 * New useQuery / invalidateQueries call sites MUST import from here
 * (enforced by query-key-authority-gate). Justified exceptions: LOCAL_JUSTIFIED
 * documented in QUERY_KEY_ADOPTION_REPORT.
 */

export const queryKeys = {
  scholars: {
    all: ["entities", "scholar", "all"] as const,
    bySlug: (slug: string) => ["entities", "scholar", "bySlug", slug] as const,
  },
  books: {
    all: ["entities", "book", "all"] as const,
    bySlug: (slug: string) => ["entities", "book", "bySlug", slug] as const,
  },
  adhkar: {
    /** Prefix root — invalidateQueries({ queryKey: queryKeys.adhkar.root }) */
    root: ["adhkar"] as const,
    published: ["adhkar", "published", "no-daif"] as const,
  },
  fawaid: {
    root: ["fawaid"] as const,
    all: ["fawaid"] as const,
  },
  account: {
    root: ["account"] as const,
    progress: (userId: string) => ["account", "progress", userId] as const,
    submissions: (userId: string) => ["account", "submissions", userId] as const,
    vault: (userId: string) => ["account", "vault", userId] as const,
    profile: (userId: string) => ["account", "profile", userId] as const,
    sessions: (userId: string) => ["account", "sessions", userId] as const,
  },
  library: {
    root: ["library"] as const,
    autoContent: (filters: string) => ["library", "auto_content", filters] as const,
    list: (page: string) => ["library", "list", page] as const,
  },
  search: {
    root: ["search"] as const,
    unified: (qNorm: string, facet: string) => ["search", "unified", facet, qNorm] as const,
    hadithRpc: (qNorm: string, cursor: string) => ["search", "hadith_rpc", qNorm, cursor] as const,
    sourceRpc: (qNorm: string, cursor: string) => ["search", "source_rpc", qNorm, cursor] as const,
  },
  admin: {
    root: ["admin"] as const,
    categories: ["admin", "categories"] as const,
    learningPaths: ["admin", "learning_paths"] as const,
    importJobs: ["admin", "import_jobs"] as const,
  },
} as const;

/** Short cache for search results — mutable relevance; do not use catalog staleTime. */
export const SEARCH_STALE_MS = 60_000;
export const ACCOUNT_STALE_MS = 120_000;
export const ADMIN_STALE_MS = 30_000;
/** Adhkar list: shorter than catalog; seed provides initialData. */
export const ADHKAR_STALE_MS = 30_000;
