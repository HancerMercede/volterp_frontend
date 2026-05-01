import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSubmit,
  submitLabel = 'Crear',
  cancelLabel = 'Cancelar'
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

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        
        {onSubmit ? (
          <form onSubmit={onSubmit} className={styles.form}>
            {children}
            <div className={styles.actions}>
              <Button variant="secondary" type="button" onClick={onClose}>{cancelLabel}</Button>
              <Button type="submit">{submitLabel}</Button>
            </div>
          </form>
        ) : (
          <>
            <div className={styles.content}>
              {children}
            </div>
            <div className={styles.actions}>
              <Button variant="secondary" type="button" onClick={onClose}>{cancelLabel}</Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}