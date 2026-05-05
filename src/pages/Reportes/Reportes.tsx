import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVentaStore } from '../../stores/ventaStore';
import { useCompraStore } from '../../stores/compraStore';
import { useProductoStore } from '../../stores/productoStore';
import { useClienteStore } from '../../stores/clienteStore';
import { PageHeader } from '../../components/UI';
import styles from './Reportes.module.css';

export function Reportes() {
  const { t } = useTranslation();
  const { ventas } = useVentaStore();
  const { compras } = useCompraStore();
  const { productos } = useProductoStore();
  const { clientes } = useClienteStore();

  const totalVentas = ventas.filter(v => v.estado === 'completada').reduce((sum, v) => sum + v.total, 0);
  const totalCompras = compras.filter(c => c.estado === 'recibida').reduce((sum, c) => sum + c.total, 0);
  const productosSinStock = productos.filter(p => p.stock === 0).length;
  const productosStockBajo = productos.filter(p => p.stock > 0 && p.stock < 10).length;

  const topProductosVendidos = useMemo(() => {
    const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
    const productosMap = new Map<string, { nombre: string; cantidad: number; total: number }>();

    ventasCompletadas.forEach(v => {
      const existente = productosMap.get(v.productoId);
      if (existente) {
        existente.cantidad += v.cantidad;
        existente.total += v.total;
      } else {
        productosMap.set(v.productoId, { nombre: v.producto, cantidad: v.cantidad, total: v.total });
      }
    });

    return Array.from(productosMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [ventas]);

  const ventasPorFecha = useMemo(() => {
    const ultimos7Dias: Record<string, { fecha: string; cantidad: number; total: number }> = {};

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const key = fecha.toISOString().split('T')[0];
      ultimos7Dias[key] = { fecha: key, cantidad: 0, total: 0 };
    }

    ventas.filter(v => v.estado === 'completada').forEach(v => {
      const key = v.fecha;
      if (ultimos7Dias[key]) {
        ultimos7Dias[key].cantidad += 1;
        ultimos7Dias[key].total += v.total;
      }
    });

    return Object.values(ultimos7Dias);
  }, [ventas]);

  return (
    <div>
      <PageHeader title={t('reportes.title')} subtitle={t('reportes.subtitle')} />

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('reportes.salesSummary')}</h3>
          <p className={styles.cardValue}>${totalVentas.toLocaleString()}</p>
          <p className={styles.cardSubtext}>{ventas.length} {t('reportes.transactions')}</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('reportes.purchasesSummary')}</h3>
          <p className={styles.cardValue}>${totalCompras.toLocaleString()}</p>
          <p className={styles.cardSubtext}>{compras.length} {t('reportes.transactions')}</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('reportes.totalClients')}</h3>
          <p className={styles.cardValue}>{clientes.length}</p>
          <p className={styles.cardSubtext}>{t('reportes.registeredClients')}</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>{t('reportes.inventory')}</h3>
          <p className={styles.cardValue}>{productos.length}</p>
          <p className={styles.cardSubtext}>{productosSinStock} {t('reportes.outOfStock')}, {productosStockBajo} {t('reportes.lowStock')}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('reportes.topClients')}</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('reportes.client')}</th>
              <th>{t('reportes.totalPurchases')}</th>
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

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('reportes.topProducts')}</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('reportes.product')}</th>
              <th>{t('reportes.quantitySold')}</th>
              <th>{t('reportes.totalGenerated')}</th>
            </tr>
          </thead>
          <tbody>
            {topProductosVendidos.map((p, idx) => (
              <tr key={idx}>
                <td>{p.nombre}</td>
                <td>{p.cantidad}</td>
                <td>${p.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('reportes.last7DaysSales')}</h3>
        <div className={styles.chartContainer}>
          {ventasPorFecha.map((v, idx) => (
            <div key={idx} className={styles.chartBar}>
              <div className={styles.barLabel}>{new Date(v.fecha).toLocaleDateString('es-DO', { weekday: 'short' })}</div>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${Math.max((v.total / Math.max(...ventasPorFecha.map(vf => vf.total), 1)) * 100, 5)}%`
                  }}
                />
              </div>
              <div className={styles.barValue}>${v.total.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}