import { useERP } from '../../context/ERPContext';
import { PageHeader } from '../../components/UI';
import styles from './Reportes.module.css';

export function Reportes() {
  const { ventas, compras, productos, clientes } = useERP();

  const totalVentas = ventas.filter(v => v.estado === 'completada').reduce((sum, v) => sum + v.total, 0);
  const totalCompras = compras.filter(c => c.estado === 'recibida').reduce((sum, c) => sum + c.total, 0);
  const productosSinStock = productos.filter(p => p.stock === 0).length;
  const productosStockBajo = productos.filter(p => p.stock > 0 && p.stock < 10).length;

  return (
    <div>
      <PageHeader title="Reportes" />

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Resumen de Ventas</h3>
          <p className={styles.cardValue}>${totalVentas.toLocaleString()}</p>
          <p className={styles.cardSubtext}>{ventas.length} transacciones</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Resumen de Compras</h3>
          <p className={styles.cardValue}>${totalCompras.toLocaleString()}</p>
          <p className={styles.cardSubtext}>{compras.length} transacciones</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Total Clientes</h3>
          <p className={styles.cardValue}>{clientes.length}</p>
          <p className={styles.cardSubtext}>Clientes registrados</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Inventario</h3>
          <p className={styles.cardValue}>{productos.length}</p>
          <p className={styles.cardSubtext}>{productosSinStock} sin stock, {productosStockBajo} bajo</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Top Clientes por Compras</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total Compras</th>
            </tr>
          </thead>
          <tbody>
            {[...clientes]
              .sort((a, b) => b.totalCompras - a.totalCompras)
              .slice(0, 5)
              .map(c => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>${c.totalCompras.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}