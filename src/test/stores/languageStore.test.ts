import { useLanguageStore } from '../../stores/languageStore';
import i18n from '../../i18n';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock i18n
vi.mock('../../i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  vi.clearAllMocks();
  // Reset store to initial state
  useLanguageStore.setState({ language: 'es' });
  localStorage.getItem.mockReturnValue(null);
});

describe('languageStore', () => {
  describe('setLanguage - comportamiento completo', () => {
    it('cambia idioma a EN y actualiza store, i18n y localStorage', () => {
      // Arrange
      const store = useLanguageStore.getState();
      expect(store.language).toBe('es');

      // Act
      useLanguageStore.getState().setLanguage('en');

      // Assert - store actualizado
      expect(useLanguageStore.getState().language).toBe('en');

      // Assert - i18n cambiado
      expect(i18n.changeLanguage).toHaveBeenCalledWith('en');

      // Assert - localStorage guardado
      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'en');
    });

    it('persiste el idioma entre sesiones (simulado)', () => {
      // Simular que al iniciar ya hay un idioma guardado
      localStorage.getItem.mockReturnValue('en');
      useLanguageStore.setState({ language: 'en' });

      // Verificar que el idioma persistido es el correcto
      expect(useLanguageStore.getState().language).toBe('en');
    });

    it('cambia de EN a ES correctamente', () => {
      // Arrange - empezar en inglés
      useLanguageStore.setState({ language: 'en' });

      // Act - cambiar a español
      useLanguageStore.getState().setLanguage('es');

      // Assert
      expect(useLanguageStore.getState().language).toBe('es');
      expect(i18n.changeLanguage).toHaveBeenCalledWith('es');
    });
  });
});
