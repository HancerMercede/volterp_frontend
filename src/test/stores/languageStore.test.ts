import { useLanguageStore } from '../../stores/languageStore';

beforeEach(() => {
  useLanguageStore.setState({ language: 'es' });
});

describe('languageStore', () => {
  it('has initial language set to Spanish', () => {
    expect(useLanguageStore.getState().language).toBe('es');
  });

  it('setLanguage updates the language state', () => {
    useLanguageStore.getState().setLanguage('en');
    expect(useLanguageStore.getState().language).toBe('en');
  });

  it('setLanguage can switch back to Spanish', () => {
    useLanguageStore.getState().setLanguage('en');
    useLanguageStore.getState().setLanguage('es');
    expect(useLanguageStore.getState().language).toBe('es');
  });
});