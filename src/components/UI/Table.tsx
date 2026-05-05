import type { ReactNode } from 'react';
import styles from './Table.module.css';
import { ActionButtons } from './ActionButtons';

interface Column<T> {
  key: keyof T | string;
  header?: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
}

export function Table<T extends { id: string }>({ data, columns, onEdit, onDelete }: TableProps<T>) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.header || ''}</th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={`${item.id}-${String(col.key)}`}>
                  {col.render ? col.render(item) : String(item[col.key as keyof T] || '')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  <ActionButtons 
                    onEdit={onEdit ? () => onEdit(item) : undefined}
                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}