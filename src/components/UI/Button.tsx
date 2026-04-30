import type { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small';
  children: ReactNode;
}

export function Button({ variant = 'primary', size, className, children, ...props }: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size ? styles[size] : '',
    className || ''
  ].filter(Boolean).join(' ');
  
  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}