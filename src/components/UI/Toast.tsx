import { useState, type FC } from 'react';
import { useUIStore, type Toast as ToastType } from '../../stores/uiStore';
import { ConfirmModal } from './ConfirmModal';
import styles from './Toast.module.css';

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const dismissible = toast.dismissible !== false;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const hasTitle = Boolean(toast.title);
  const hasActions = Boolean(toast.actions && toast.actions.length > 0);

  const classNames = [
    styles.toast,
    styles[toast.type],
    hasTitle ? styles.toastWithTitle : '',
    exiting ? styles.exiting : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className={styles.toastBody}>
        {hasTitle && <div className={styles.toastTitle}>{toast.title}</div>}
        <span>{toast.message}</span>
        {hasActions && (
          <div className={styles.toastActions}>
            {toast.actions!.map((action, i) => (
              <button
                key={i}
                className={`${styles.toastActionBtn} ${
                  action.variant === 'danger'
                    ? styles.toastActionDanger
                    : action.variant === 'secondary'
                    ? styles.toastActionSecondary
                    : styles.toastActionPrimary
                }`}
                onClick={() => {
                  action.onClick();
                  handleDismiss();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {dismissible && (
        <button className={styles.closeBtn} onClick={handleDismiss}>
          ×
        </button>
      )}
    </div>
  );
}

export function NotificationContainer() {
  const { toasts, modals, removeToast, dismissNotification, isLoading } = useUIStore();

  return (
    <>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}

      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      {modals.map((modal) => (
        <ConfirmModal
          key={modal.id}
          isOpen={true}
          title={modal.title || ''}
          message={modal.message}
          variant={
            modal.type === 'confirm' ? 'danger' :
            modal.type === 'alert' ? 'warning' :
            modal.type as 'danger' | 'warning' | 'success' | 'info' | 'error'
          }
          confirmLabel={modal.actions?.[0]?.label}
          cancelLabel={modal.actions?.[1]?.label}
          onConfirm={() => {
            modal.actions?.[0]?.onClick();
            dismissNotification(modal.id);
          }}
          onCancel={() => dismissNotification(modal.id)}
        />
      ))}
    </>
  );
}

export const ToastContainer: FC = NotificationContainer;
