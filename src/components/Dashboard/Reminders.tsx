import type { Reminder } from '../../domain/dashboard/types';
import styles from './DashboardComponents.module.css';

interface RemindersProps {
  reminders: Reminder[];
}

export function Reminders({ reminders }: RemindersProps) {
  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}>⏰ Recordatorios</h3>
      <div className={styles.reminderList}>
        {reminders.map((reminder) => (
          <div key={reminder.id} className={styles.reminderItem}>
            <div className={styles.reminderCheck} />
            <span className={styles.reminderText}>{reminder.text}</span>
            <span 
              className={styles.reminderBadge}
              style={{ background: reminder.badgeColor }}
            >
              {reminder.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}