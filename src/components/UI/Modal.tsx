import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  closeLabel?: string;
  icon?: ReactNode;
  subtitle?: string;
  badge?: ReactNode;
  footerStatus?: ReactNode;
  /** Renders the accent dot next to the footer status. */
  dirty?: boolean;
  submitVariant?: 'primary' | 'dark';
  /** Extra actions rendered next to the cancel button. */
  footerActions?: ReactNode;
  /** 'md' fits simple forms, 'lg' fits two-column forms. */
  size?: 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Crear',
  cancelLabel = 'Cancelar',
  closeLabel = 'Close',
  icon,
  subtitle,
  badge,
  footerStatus,
  dirty = false,
  submitVariant = 'primary',
  footerActions,
  size = 'md',
}: ModalProps) {

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
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shell = (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${size === 'lg' ? styles.modalLg : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          {icon && <span className={styles.iconSlot}>{icon}</span>}
          <div className={styles.heading}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{title}</h3>
              {badge}
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        {onSubmit ? (
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.body}>{children}</div>
            <footer className={styles.actions}>
              {footerStatus && (
                <span className={styles.footerStatus}>
                  <span
                    className={`${styles.statusDot} ${dirty ? styles.statusDotDirty : ""}`}
                  />
                  {footerStatus}
                </span>
              )}
              <div className={styles.footerButtons}>
                <Button variant="ghost" type="button" onClick={onClose}>
                  {cancelLabel}
                </Button>
                {footerActions}
                <Button
                  type="submit"
                  variant={submitVariant}
                  accent={submitVariant === 'dark'}
                >
                  {submitLabel}
                </Button>
              </div>
            </footer>
          </form>
        ) : (
          <>
            <div className={styles.body}>{children}</div>
            <footer className={styles.actions}>
              {footerStatus && (
                <span className={styles.footerStatus}>
                  <span
                    className={`${styles.statusDot} ${dirty ? styles.statusDotDirty : ""}`}
                  />
                  {footerStatus}
                </span>
              )}
              <div className={styles.footerButtons}>
                <Button variant="ghost" type="button" onClick={onClose}>
                  {cancelLabel}
                </Button>
                {footerActions}
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(shell, document.body);
}
