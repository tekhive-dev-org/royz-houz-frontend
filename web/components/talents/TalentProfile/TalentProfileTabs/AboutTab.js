import styles from "./TalentProfileTabs.module.css";

/**
 * AboutTab rendering Biography, Award & Recognition, and Key Achievements.
 */
export function AboutTab({ talent }) {
  const awards = talent?.awards || [
    "African Music Award Nominee 2023",
    "Best New Artist — Lagos Sound Fest",
    "Royz House Excellence Award",
  ];

  const achievements = talent?.achievements || [
    "Performed at AFRIMMA 2023",
    "Featured on BBC Africa",
    "4M+ streams on debut EP",
    "Brand ambassador — Lagos Fashion Week",
  ];

  return (
    <div className={styles.aboutSection} role="tabpanel" aria-label="About Talent">
      {/* 1. Biography */}
      <div>
        <h3 className={styles.sectionHeader}>
          <span className={styles.indicatorBar} aria-hidden="true" />
          Biography
        </h3>
        <p className={styles.bioText}>{talent?.bio}</p>
      </div>

      {/* 2. Award & Recognition */}
      <div>
        <h3 className={styles.sectionHeader}>
          <span className={styles.indicatorBar} aria-hidden="true" />
          Award & Recognition
        </h3>

        <div className={styles.awardList}>
          {awards.map((award, idx) => (
            <div key={idx} className={styles.awardCard}>
              <span className={styles.awardStar} aria-hidden="true">
                ★
              </span>
              <span>{award}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Key Achievements */}
      <div>
        <h3 className={styles.sectionHeader}>
          <span className={styles.indicatorBar} aria-hidden="true" />
          Key Achievements
        </h3>

        <div className={styles.achievementGrid}>
          {achievements.map((item, idx) => (
            <div key={idx} className={styles.achievementItem}>
              <span className={styles.diamondIcon} aria-hidden="true">
                ✦
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutTab;
