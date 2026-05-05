import { type ChangeEvent, type KeyboardEvent } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
  autoFocus?: boolean;
  width?: string;
  showIcon?: boolean;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Buscar...', 
  onEnter,
  className = '',
  autoFocus = false,
  width = '240px',
  showIcon = true
}: SearchInputProps) {
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <div className={`${styles.container} ${className}`} style={{ width }}>
      {showIcon && (
        <svg 
          className={styles.icon} 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      )}
      <input
        type="text"
        className={`${styles.input} ${!showIcon ? styles.noIcon : ''}`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button 
          className={styles.clear}
          onClick={() => onChange('')}
          type="button"
          title="Limpiar búsqueda"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}