import { useLanguageStore } from '../../stores/languageStore';
import styles from './LanguageSwitcher.module.css';

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className={styles.container}>
      <label className={styles.label}>Idioma</label>
      <select
        className={styles.select}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}