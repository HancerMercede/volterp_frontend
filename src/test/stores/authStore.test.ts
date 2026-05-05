import { useAuthStore } from '../../stores/authStore';

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('authStore', () => {
  describe('initial state', () => {
    it('starts with no user', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('starts not authenticated', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('sets user and isAuthenticated to true on login', () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@test.com' };
      useAuthStore.getState().login(mockUser);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('overwrites previous user on new login', () => {
      const user1 = { id: '1', name: 'User One', email: 'one@test.com' };
      const user2 = { id: '2', name: 'User Two', email: 'two@test.com' };
      useAuthStore.getState().login(user1);
      useAuthStore.getState().login(user2);
      expect(useAuthStore.getState().user).toEqual(user2);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears user and sets isAuthenticated to false', () => {
      const mockUser = { id: '1', name: 'John', email: 'john@test.com' };
      useAuthStore.getState().login(mockUser);
      useAuthStore.getState().logout();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('works when already logged out', () => {
      expect(() => useAuthStore.getState().logout()).not.toThrow();
    });
  });
});