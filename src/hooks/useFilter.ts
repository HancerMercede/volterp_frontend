import { useMemo } from "react";

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
    return (data ?? []).filter((item) => {
      const matchSearch = searchFields(item)
        .filter(Boolean)
        .some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return matchSearch && (filter ? filter(item) : true);
    });
  }, [data, searchTerm, filter, searchFields]);
}
