import {
  getPaginationParams,
  getPaginationInfo,
  getPageNumbers,
  paginate,
} from '../../utils/pagination';

describe('pagination utils', () => {
  describe('getPaginationParams', () => {
    it('returns default values when page and pageSize are undefined', () => {
      const result = getPaginationParams();
      expect(result).toEqual({ page: 1, pageSize: 10 });
    });

    it('returns provided values when page and pageSize are positive', () => {
      const result = getPaginationParams(3, 25);
      expect(result).toEqual({ page: 3, pageSize: 25 });
    });

    it('returns default page when page is 0 or negative', () => {
      const result1 = getPaginationParams(0, 10);
      const result2 = getPaginationParams(-1, 10);
      expect(result1.page).toBe(1);
      expect(result2.page).toBe(1);
    });

    it('returns default pageSize when pageSize is 0 or negative', () => {
      const result1 = getPaginationParams(1, 0);
      const result2 = getPaginationParams(1, -5);
      expect(result1.pageSize).toBe(10);
      expect(result2.pageSize).toBe(10);
    });
  });

  describe('getPaginationInfo', () => {
    it('calculates correct pagination info for 100 total items', () => {
      const result = getPaginationInfo(100, 1, 10);
      expect(result).toEqual({
        total: 100,
        page: 1,
        pageSize: 10,
        totalPages: 10,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('calculates correct pagination info for page 5 of 10', () => {
      const result = getPaginationInfo(100, 5, 10);
      expect(result).toEqual({
        total: 100,
        page: 5,
        pageSize: 10,
        totalPages: 10,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('hasNext is false on last page', () => {
      const result = getPaginationInfo(100, 10, 10);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });

    it('hasPrev is false on first page', () => {
      const result = getPaginationInfo(100, 1, 10);
      expect(result.hasPrev).toBe(false);
    });

    it('handles single page (total less than pageSize)', () => {
      const result = getPaginationInfo(5, 1, 10);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });
  });

  describe('getPageNumbers', () => {
    it('returns all pages when totalPages is small (less than 5)', () => {
      const result = getPageNumbers(1, 3);
      expect(result).toEqual([1, 2, 3]);
    });

    it('returns dots for gap greater than 1', () => {
      const result = getPageNumbers(5, 10);
      expect(result).toContain(-1);
    });

    it('always includes first and last page', () => {
      const result = getPageNumbers(5, 10);
      expect(result[0]).toBe(1);
      expect(result[result.length - 1]).toBe(10);
    });
  });

  describe('paginate', () => {
    it('returns correct slice for page 1', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, 1, 3);
      expect(result).toEqual([1, 2, 3]);
    });

    it('returns correct slice for page 2', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, 2, 3);
      expect(result).toEqual([4, 5, 6]);
    });

    it('returns last page with remaining items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = paginate(items, 4, 3);
      expect(result).toEqual([10]);
    });

    it('returns empty array when page exceeds available pages', () => {
      const items = [1, 2, 3, 4, 5];
      const result = paginate(items, 10, 3);
      expect(result).toEqual([]);
    });

    it('works with any type of array', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = paginate(items, 1, 2);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });
});