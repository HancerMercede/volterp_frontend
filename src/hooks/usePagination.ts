import { useState, useCallback } from "react";
import { getPaginationInfo, type PaginationInfo } from "../utils/pagination";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options?: UsePaginationOptions) {
  const [pageNumber, setPageNumber] = useState(options?.initialPage || 1);
  const [pageSize, setPageSize] = useState(options?.initialPageSize || 10);

  const goToPage = useCallback((newPage: number) => {
    setPageNumber(newPage);
  }, []);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const getInfo = useCallback(
    (total: number): PaginationInfo => {
      return getPaginationInfo(total, pageNumber, pageSize);
    },
    [pageNumber, pageSize],
  );

  return {
    pageNumber,
    pageSize,
    goToPage,
    changePageSize,
    nextPage,
    prevPage,
    getInfo,
  };
}
