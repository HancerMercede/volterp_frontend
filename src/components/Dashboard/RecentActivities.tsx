import type { Activity } from '../../domain/dashboard/types';
import { ACTIVITY_ICONS } from '../../domain/dashboard/constants';
import styles from './DashboardComponents.module.css';

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}>📋 Actividades Recientes</h3>
      <div className={styles.activityList}>
        {activities.map((activity) => {
          const iconConfig = ACTIVITY_ICONS[activity.type];
          return (
            <div key={activity.id} className={styles.activityItem}>
              <div 
                className={styles.activityIcon}
                style={{ background: iconConfig.bg }}
              >
                {iconConfig.icon}
              </div>
              <div className={styles.activityContent}>
                <p className={styles.activityText}>{activity.text}</p>
                <span className={styles.activityTime}>{activity.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}