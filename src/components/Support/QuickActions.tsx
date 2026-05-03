import styles from './QuickActions.module.css';

interface QuickAction {
  icon: string;
  label: string;
  query: string;
}

const quickActions: QuickAction[] = [
  { icon: '📦', label: 'Inventario', query: '¿Cómo gestionar el inventario de productos?' },
  { icon: '👥', label: 'RRHH', query: '¿Cómo crear y gestionar empleados?' },
  { icon: '💰', label: 'Ventas', query: '¿Cómo registrar una venta?' },
  { icon: '📊', label: 'Reportes', query: '¿Cómo generar reportes?' },
  { icon: '🛒', label: 'Compras', query: '¿Cómo registrar una compra?' },
  { icon: '⚙️', label: 'Configuración', query: '¿Cómo configurar el sistema?' },
];

interface QuickActionsProps {
  onAction: (query: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>Preguntas frecuentes:</div>
      <div className={styles.grid}>
        {quickActions.map((action) => (
          <button
            key={action.label}
            className={styles.button}
            onClick={() => onAction(action.query)}
          >
            <span className={styles.icon}>{action.icon}</span>
            <span className={styles.text}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}