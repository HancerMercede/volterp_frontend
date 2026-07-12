import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'error';
  subtitle?: string;
}

const VARIANT_ICONS: Record<string, string> = {
  danger: '⚠️',
  warning: '❓',
  success: '✅',
  info: 'ℹ️',
  error: '❌',
};

const BUTTON_VARIANT: Record<string, 'danger' | 'primary'> = {
  danger: 'danger',
  error: 'danger',
  warning: 'primary',
  success: 'primary',
  info: 'primary',
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  subtitle,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.icon} ${styles[variant]}`}>
          {VARIANT_ICONS[variant] || '❓'}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={BUTTON_VARIANT[variant] || 'primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
