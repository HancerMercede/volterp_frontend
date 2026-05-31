import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

export function ActionButtons({ onEdit, onDelete, onToggle }: ActionButtonsProps) {
  return (
    <div className={styles.actions}>
      {onToggle && (
        <button
          className={`${styles.btn} ${styles.toggle}`}
          onClick={onToggle}
          title="Activar/Desactivar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </button>
      )}
      {onEdit && (
        <button
          className={`${styles.btn} ${styles.edit}`}
          onClick={onEdit}
          title="Editar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button
          className={`${styles.btn} ${styles.delete}`}
          onClick={onDelete}
          title="Eliminar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </div>
  );
}