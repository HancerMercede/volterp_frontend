import { getPageNumbers, type PaginationInfo } from "../../utils/pagination";
import styles from "./Pagination.module.css";

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
        Mostrando {(page - 1) * pagination.pageSize + 1} -{" "}
        {Math.min(page * pagination.pageSize, total)} de {total}
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          title="Primera página"
        >
          <svg viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
        </button>

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          title="Página anterior"
        >
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {pages.map((p: number, idx: number) =>
          p === -1 ? (
            <span key={`dots-${idx}`} className={styles.dots}>
              ···
            </span>
          ) : (
            <button
              key={p}
              className={`${styles.btn} ${p === page ? styles.active : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          title="Siguiente página"
        >
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          title="Última página"
        >
          <svg viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
        </button>
      </div>
    </div>
  );
}
