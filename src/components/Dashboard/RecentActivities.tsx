import type { Activity } from "../../domain/dashboard/types";
import { ACTIVITY_ICONS } from "../../domain/dashboard/constants";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { Pagination } from "../UI";
import styles from "./DashboardComponents.module.css";

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const ITEMS_PER_PAGE = 5;
  const { pageNumber, getInfo, goToPage, pageSize } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });
  const paginationInfo = getInfo(activities.length);
  const visibleActivities = paginate(activities, pageNumber, pageSize);

  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}>📋 Actividades Recientes</h3>
      <div className={styles.activityList}>
        {visibleActivities.map((activity) => {
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
      <Pagination pagination={paginationInfo} onPageChange={goToPage} />
    </div>
  );
}
