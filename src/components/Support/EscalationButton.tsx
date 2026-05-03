import styles from './EscalationButton.module.css';

interface EscalationButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function EscalationButton({ onClick, isLoading }: EscalationButtonProps) {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        ¿No encontraste lo que buscabas?
      </div>
      <button
        className={styles.button}
        onClick={onClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner}></span>
            Conectando...
          </>
        ) : (
          <>
            <span className={styles.icon}>👤</span>
            Hablar con soporte humano
          </>
        )}
      </button>
    </div>
  );
}