import styles from "./PageLoader.module.css";

export function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <span>Loading...</span>
    </div>
  );
}
