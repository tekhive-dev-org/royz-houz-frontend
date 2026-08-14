import styles from "./WhyChooseUs.module.css";

/**
 * ProgressMetric component displaying a title, percentage, animated progress bar and description.
 */
export function ProgressMetric({ metric }) {
  return (
    <div className={styles.metricItem}>
      {/* Label and Percentage */}
      <div className={styles.metricHeader}>
        <span>{metric.title}</span>
        <span className={styles.metricPercentage}>{metric.percentage}%</span>
      </div>

      {/* Progress Track & Fill */}
      <div
        className={styles.progressBarTrack}
        role="progressbar"
        aria-valuenow={metric.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${metric.title}: ${metric.percentage}%`}
      >
        <div
          className={styles.progressBarFill}
          style={{ width: `${metric.percentage}%` }}
        />
      </div>

      {/* Description */}
      <p className={styles.metricDescription}>{metric.description}</p>
    </div>
  );
}

export default ProgressMetric;
