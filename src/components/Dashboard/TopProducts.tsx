import { Trophy } from 'lucide-react';
import type { TopProduct } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

const PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23E5E7EB" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14"%3E%F0%9F%94%A5%3C/text%3E%3C/svg%3E';

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}><Trophy size={20} strokeWidth={1.8} /> Top Productos</h3>
      <div className={styles.productList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productItem}>
            <div 
              className={styles.productRank}
              style={{ background: product.rankColor }}
            >
              #{product.rank}
            </div>
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className={styles.productImg}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER;
              }}
            />
            <div className={styles.productInfo}>
              <div className={styles.productName}>{product.name}</div>
              <div className={styles.productCategory}>
                {product.category} • {product.sales} ventas
              </div>
            </div>
            <div className={styles.productValue}>{product.formattedValue}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
