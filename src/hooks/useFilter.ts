import { useMemo } from "react";
import { normalizeSearch } from "../utils/normalizeSearch";

interface UseFilterOptions<T> {
  data: T[] | undefined;
  searchTerm: string;
  searchFields: (item: T) => string[];
  filter?: (item: T) => boolean;
}

export function matchesQuery(fields: string[], query: string): boolean {
  const term = normalizeSearch(query);
  return fields
    .filter(Boolean)
    .some((field) => normalizeSearch(field).includes(term));
}

export function useFilter<T>({
  data,
  searchTerm,
  searchFields,
  filter,
}: UseFilterOptions<T>): T[] {
  return useMemo(() => {
    return (data ?? []).filter((item) => {
      const matchSearch = matchesQuery(searchFields(item), searchTerm);
      return matchSearch && (filter ? filter(item) : true);
    });
  }, [data, searchTerm, filter, searchFields]);
}
