import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, HelpCircle, Info, Trash2, XCircle } from 'lucide-react';
import { Button } from './Button';
import styles from './ConfirmModal.module.css';

interface ConfirmContext {
  title: string;
  subtitle?: string;
  amount?: string;
}

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
  context?: ConfirmContext;
}

const VARIANT_ICONS = {
  danger: Trash2,
  warning: HelpCircle,
  success: CheckCircle,
  info: Info,
  error: XCircle,
} as const;

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
  context,
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

  const IconComponent = VARIANT_ICONS[variant] || HelpCircle;

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <span className={`${styles.iconCircle} ${styles[variant]}`}>
          <IconComponent size={22} strokeWidth={1.9} />
        </span>

        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <p className={styles.message}>{message}</p>

        {context && (
          <div className={styles.context} data-testid="confirm-context">
            <div className={styles.contextInfo}>
              <p className={styles.contextTitle}>{context.title}</p>
              {context.subtitle && (
                <p className={styles.contextSubtitle}>{context.subtitle}</p>
              )}
            </div>
            {context.amount && (
              <span className={styles.contextAmount}>{context.amount}</span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={onCancel}>
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
