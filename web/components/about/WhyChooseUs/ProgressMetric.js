import { IMPACT_METRICS } from "@/constants/about";
import styles from "./WhyChooseUs.module.css";

/**
 * ProgressMetric component displaying a title, percentage, animated progress bar and description.
 */
export function ProgressMetric({ metric = IMPACT_METRICS[0] } = {}) {
  const item = { ...IMPACT_METRICS[0], ...(metric || {}) };

  return (
    <div className={styles.metricItem}>
      {/* Label and Percentage */}
      <div className={styles.metricHeader}>
        <span>{item.title}</span>
        <span className={styles.metricPercentage}>{item.percentage}%</span>
      </div>

      {/* Progress Track & Fill */}
      <div
        className={styles.progressBarTrack}
        role="progressbar"
        aria-valuenow={item.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.title}: ${item.percentage}%`}
      >
        <div
          className={styles.progressBarFill}
          style={{ width: `${item.percentage}%` }}
        />
      </div>

      {/* Description */}
      <p className={styles.metricDescription}>{item.description}</p>
    </div>
  );
}

export default ProgressMetric;
