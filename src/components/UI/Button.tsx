import type { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'dark' | 'ghost';
  size?: 'small';
  /** Renders the yellow accent dot of the dark variant. */
  accent?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size, accent, className, children, ...props }: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size ? styles[size] : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <button className={classNames} {...props}>
      {accent && <span className={styles.accentDot} />}
      {children}
    </button>
  );
}