import { Package, Users, DollarSign, BarChart3, ShoppingCart, Settings, type LucideIcon } from 'lucide-react';
import styles from './QuickActions.module.css';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  query: string;
}

const quickActions: QuickAction[] = [
  { icon: Package, label: 'Inventario', query: '¿Cómo gestionar el inventario de productos?' },
  { icon: Users, label: 'RRHH', query: '¿Cómo crear y gestionar empleados?' },
  { icon: DollarSign, label: 'Ventas', query: '¿Cómo registrar una venta?' },
  { icon: BarChart3, label: 'Reportes', query: '¿Cómo generar reportes?' },
  { icon: ShoppingCart, label: 'Compras', query: '¿Cómo registrar una compra?' },
  { icon: Settings, label: 'Configuración', query: '¿Cómo configurar el sistema?' },
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
            <span className={styles.icon}><action.icon size={20} strokeWidth={1.8} /></span>
            <span className={styles.text}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
