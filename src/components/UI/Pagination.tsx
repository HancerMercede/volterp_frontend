import { getPageNumbers, type PaginationInfo } from '../../utils/pagination';
import styles from './Pagination.module.css';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, hasPrev, hasNext, total } = pagination;
  
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Mostrando {((page - 1) * pagination.pageSize) + 1} - {Math.min(page * pagination.pageSize, total)} de {total}
      </div>
      
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          title="Primera página"
        >
          ««
        </button>
        
        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          title="Página anterior"
        >
          «
        </button>

        {pages.map((p: number, idx: number) => (
          p === -1 ? (
            <span key={`dots-${idx}`} className={styles.dots}>...</span>
          ) : (
            <button
              key={p}
              className={`${styles.btn} ${p === page ? styles.active : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        ))}

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          title="Siguiente página"
        >
          »
        </button>

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          title="Última página"
        >
          »»
        </button>
      </div>
    </div>
  );
}