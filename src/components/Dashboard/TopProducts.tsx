import type { TopProduct } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

interface TopProductsProps {
  products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}>🏆 Top Productos</h3>
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
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
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