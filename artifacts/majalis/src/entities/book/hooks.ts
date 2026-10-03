import { useQuery } from "@tanstack/react-query";
import { timedQueryFn } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { bookRepository, type BookEntity } from "@/entities/book/api";

/** فهرس الكتب ثابت من الكتالوج — بلا انتهاء صلاحية */
export const BOOKS_STALE_TIME = Number.POSITIVE_INFINITY;

export function useBooksQuery() {
  return useQuery({
    queryKey: queryKeys.books.all,
    queryFn: () =>
      timedQueryFn("entities:book:all", () => bookRepository.getAll()),
    staleTime: BOOKS_STALE_TIME,
  });
}

export function useBookQuery(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.books.bySlug(slug ?? ""),
    queryFn: () =>
      timedQueryFn(`entities:book:${slug}`, () =>
        bookRepository.getBySlug(slug!),
      ),
    enabled: Boolean(slug),
    staleTime: BOOKS_STALE_TIME,
  });
}

export type { BookEntity };
