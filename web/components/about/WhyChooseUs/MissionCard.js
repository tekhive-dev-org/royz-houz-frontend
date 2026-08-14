import styles from "./WhyChooseUs.module.css";

/**
 * MissionCard component rendering a white card with dark icon badge, title and description.
 */
export function MissionCard({ item }) {
  const IconComponent = item.icon;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <IconComponent className={styles.icon} aria-hidden="true" />
      </div>

      <h3 className={styles.cardTitle}>{item.title}</h3>
      <p className={styles.cardDescription}>{item.description}</p>
    </div>
  );
}

export default MissionCard;
