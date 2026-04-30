import styles from './ImageCell.module.css';

interface ImageCellProps {
  src: string;
  name: string;
  subtext?: string;
  type?: 'product' | 'avatar';
}

export function ImageCell({ src, name, subtext, type = 'product' }: ImageCellProps) {
  return (
    <div className={styles.imageCell}>
      <img 
        src={src} 
        alt={name} 
        className={type === 'product' ? styles.image : styles.avatar}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?';
        }}
      />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {subtext && <span className={styles.subtext}>{subtext}</span>}
      </div>
    </div>
  );
}