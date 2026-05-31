import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCompanyStore } from '../../stores/companyStore';
import { useAuthStore } from '../../stores/authStore';

// Mock companyService
vi.mock('../../infrastructure/api/companyService', () => ({
  companyService: {
    getCompanies: vi.fn(),
    getCompany: vi.fn(),
    createCompany: vi.fn(),
    updateCompany: vi.fn(),
    deleteCompany: vi.fn(),
  },
}));

// Mock authStore
vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ token: 'mock-token' })),
  },
}));

import { companyService } from '../../infrastructure/api/companyService';

const mockCompanyService = companyService as ReturnType<typeof vi.fn>;

beforeEach(() => {
  useCompanyStore.setState({
    companies: [],
    currentCompany: null,
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
});

describe('useCompanyStore', () => {
  describe('initial state', () => {
    it('starts with empty companies array', () => {
      expect(useCompanyStore.getState().companies).toEqual([]);
    });

    it('starts with null currentCompany', () => {
      expect(useCompanyStore.getState().currentCompany).toBeNull();
    });

    it('starts with loading false', () => {
      expect(useCompanyStore.getState().loading).toBe(false);
    });

    it('starts with null error', () => {
      expect(useCompanyStore.getState().error).toBeNull();
    });
  });

  describe('fetchCompanies', () => {
    it('loads companies successfully from API', async () => {
      const mockResponse = {
        items: [
          { id: 1, name: 'Company A', taxId: '123', logoUrl: null, isActive: true, address: 'Address A', legalName: 'Legal A', phone: '8091111111', email: 'a@company.com' },
          { id: 2, name: 'Company B', taxId: '456', logoUrl: null, isActive: true, address: 'Address B', legalName: 'Legal B', phone: '8092222222', email: 'b@company.com' },
        ],
        rowCount: 2,
        pageCount: 1,
      };
      mockCompanyService.getCompanies.mockResolvedValue(mockResponse);

      await useCompanyStore.getState().fetchCompanies(1, 10);

      expect(useCompanyStore.getState().companies).toEqual(mockResponse.items);
      expect(useCompanyStore.getState().totalCount).toBe(2);
      expect(useCompanyStore.getState().pageCount).toBe(1);
      expect(useCompanyStore.getState().loading).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockCompanyService.getCompanies.mockRejectedValue(new Error('Network error'));

      await useCompanyStore.getState().fetchCompanies(1, 10);

      expect(useCompanyStore.getState().error).toBe('Network error');
      expect(useCompanyStore.getState().loading).toBe(false);
    });

    it('sets error when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({ token: null });

      await useCompanyStore.getState().fetchCompanies(1, 10);

      expect(useCompanyStore.getState().error).toBe('No authenticated');
    });
  });

  describe('fetchCurrentCompany', () => {
    it('loads single company successfully', async () => {
      const mockCompany = { id: 1, name: 'Company A', taxId: '123', logoUrl: null, isActive: true, address: 'Address A', legalName: 'Legal A', phone: '8091111111', email: 'a@company.com' };
      mockCompanyService.getCompany.mockResolvedValue(mockCompany);

      await useCompanyStore.getState().fetchCurrentCompany(1);

      expect(useCompanyStore.getState().currentCompany).toEqual(mockCompany);
      expect(useCompanyStore.getState().loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockCompanyService.getCompany.mockRejectedValue(new Error('Not found'));

      await useCompanyStore.getState().fetchCurrentCompany(999);

      expect(useCompanyStore.getState().error).toBe('Not found');
    });
  });

  describe('addCompany', () => {
    it('adds company to list on success', async () => {
      const newCompany = { id: 1, name: 'New Company', taxId: '999', logoUrl: null, isActive: true, address: 'New Address', legalName: 'New Legal', phone: '8099999999', email: 'new@company.com' };
      mockCompanyService.createCompany.mockResolvedValue(newCompany);

      const data = { name: 'New Company', taxId: '999', logoUrl: null, address: 'New Address', legalName: 'New Legal', phone: '8099999999', email: 'new@company.com' };

      await useCompanyStore.getState().addCompany(data);

      expect(useCompanyStore.getState().companies).toContainEqual(newCompany);
    });

    it('sets error on failure and throws', async () => {
      mockCompanyService.createCompany.mockRejectedValue(new Error('Creation failed'));

      await expect(useCompanyStore.getState().addCompany({ name: 'Fail', taxId: '1', logoUrl: null, address: 'a', legalName: 'b', phone: '1', email: 'a@b.com' })).rejects.toThrow('Creation failed');
    });
  });

  describe('updateCompany', () => {
    it('updates company in list on success', async () => {
      const updatedCompany = { id: 1, name: 'Updated', taxId: '123', logoUrl: null, isActive: true, address: 'Updated', legalName: 'Updated', phone: '8091111111', email: 'updated@company.com' };
      mockCompanyService.updateCompany.mockResolvedValue(updatedCompany);

      useCompanyStore.setState({
        companies: [{ id: 1, name: 'Old', taxId: '123', logoUrl: null, isActive: true, address: 'Old', legalName: 'Old', phone: '8091111111', email: 'old@company.com' }],
      });

      await useCompanyStore.getState().updateCompany(1, { name: 'Updated', taxId: '123', logoUrl: null, address: 'Updated', legalName: 'Updated', phone: '8091111111', email: 'updated@company.com' });

      expect(useCompanyStore.getState().companies[0].name).toBe('Updated');
    });
  });

  describe('deleteCompany', () => {
    it('removes company from list on success', async () => {
      mockCompanyService.deleteCompany.mockResolvedValue(undefined);

      useCompanyStore.setState({
        companies: [
          { id: 1, name: 'Company A', taxId: '123', logoUrl: null, isActive: true, address: 'A', legalName: 'A', phone: '1', email: 'a@a.com' },
          { id: 2, name: 'Company B', taxId: '456', logoUrl: null, isActive: true, address: 'B', legalName: 'B', phone: '2', email: 'b@b.com' },
        ],
      });

      await useCompanyStore.getState().deleteCompany(1);

      expect(useCompanyStore.getState().companies).toHaveLength(1);
      expect(useCompanyStore.getState().companies[0].id).toBe(2);
    });

    it('sets error on failure', async () => {
      mockCompanyService.deleteCompany.mockRejectedValue(new Error('Delete failed'));

      await expect(useCompanyStore.getState().deleteCompany(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      useCompanyStore.setState({ error: 'Some error' });
      useCompanyStore.getState().clearError();
      expect(useCompanyStore.getState().error).toBeNull();
    });
  });

  describe('clearCurrentCompany', () => {
    it('clears current company', () => {
      useCompanyStore.setState({ currentCompany: { id: 1, name: 'Test', taxId: '1', logoUrl: null, isActive: true, address: 'a', legalName: 'b', phone: '1', email: 'a@b.com' } });
      useCompanyStore.getState().clearCurrentCompany();
      expect(useCompanyStore.getState().currentCompany).toBeNull();
    });
  });
});
