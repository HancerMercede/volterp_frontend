export interface PaginationParams {
  page: number;
  pageSize: number;
}
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export function getPaginationParams(
  page?: number,
  pageSize?: number,
): PaginationParams {
  return {
    page: page && page > 0 ? page : 1,
    pageSize: pageSize && pageSize > 0 ? pageSize : 10,
  };
}
export function getPaginationInfo(
  total: number,
  page: number,
  pageSize: number,
): PaginationInfo {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }
  let prev = 0;
  for (const i of range) {
    if (prev && i - prev > 1) {
      rangeWithDots.push(-1);
    }
    rangeWithDots.push(i);
    prev = i;
  }
  return rangeWithDots;
}
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}
