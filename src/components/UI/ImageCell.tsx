import styles from './ImageCell.module.css';

interface ImageCellProps {
  src: string;
  name: string;
  subtext?: string;
  type?: 'product' | 'avatar';
}

const PLACEHOLDER_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23E5E7EB" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14"%3E%3F%3C/text%3E%3C/svg%3E';
const PLACEHOLDER_PRODUCT = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23E5E7EB" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14"%3E%F0%9F%94%A5%3C/text%3E%3C/svg%3E';

export function ImageCell({ src, name, subtext, type = 'product' }: ImageCellProps) {
  const fallback = type === 'product' ? PLACEHOLDER_PRODUCT : PLACEHOLDER_AVATAR;
  
  return (
    <div className={styles.imageCell}>
      <img 
        src={src} 
        alt={name} 
        className={type === 'product' ? styles.image : styles.avatar}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallback;
        }}
      />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {subtext && <span className={styles.subtext}>{subtext}</span>}
      </div>
    </div>
  );
}