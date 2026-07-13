import { LifeBuoy } from 'lucide-react';
import styles from './ChatHeader.module.css';

interface ChatHeaderProps {
  onClose?: () => void;
}

export function ChatHeader(_props: ChatHeaderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div className={styles.icon}><LifeBuoy size={24} strokeWidth={1.8} /></div>
        <div className={styles.text}>
          <div className={styles.title}>Soporte Volterp</div>
          <div className={styles.subtitle}>Asistente virtual 24/7</div>
        </div>
      </div>
      <div className={styles.status}>
        <span className={styles.dot}></span>
        En línea
      </div>
    </div>
  );
}