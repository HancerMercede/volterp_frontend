import { useState, useCallback } from 'react';
import { getPaginationInfo, type PaginationInfo } from '../utils/pagination';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options?: UsePaginationOptions) {
  const [page, setPage] = useState(options?.initialPage || 1);
  const [pageSize, setPageSize] = useState(options?.initialPageSize || 10);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage(p => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);

  const getInfo = useCallback((total: number): PaginationInfo => {
    return getPaginationInfo(total, page, pageSize);
  }, [page, pageSize]);

  return {
    page,
    pageSize,
    goToPage,
    changePageSize,
    nextPage,
    prevPage,
    getInfo,
  };
}