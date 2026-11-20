import { API_CONFIG } from '../api/config';
import { fetchWithAuthJson } from './fetchWithAuth';
import type { MePermissionsDto } from '../../domain/types';

export const permissionService = {
  // What the caller may do. The server resolves the union of the permissions
  // of the roles it holds, so the front does not keep a matrix of its own.
  async getMyPermissions(): Promise<MePermissionsDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERMISSIONS}/me`,
    );
  },
};
