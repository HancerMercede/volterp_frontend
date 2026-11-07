import { useMemo } from "react";
import { normalizeSearch } from "../utils/normalizeSearch";

interface UseFilterOptions<T> {
  data: T[] | undefined;
  searchTerm: string;
  searchFields: (item: T) => string[];
  filter?: (item: T) => boolean;
}

export function useFilter<T>({
  data,
  searchTerm,
  searchFields,
  filter,
}: UseFilterOptions<T>): T[] {
  return useMemo(() => {
    const term = normalizeSearch(searchTerm);
    return (data ?? []).filter((item) => {
      const matchSearch = searchFields(item)
        .filter(Boolean)
        .some((field) => normalizeSearch(field).includes(term));
      return matchSearch && (filter ? filter(item) : true);
    });
  }, [data, searchTerm, filter, searchFields]);
}
