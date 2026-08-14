import { TRENDING_TALENTS } from "@/constants/talents";
import { TalentCard } from "./TalentCard";
import styles from "./TrendingTalents.module.css";

/**
 * TrendingTalents section highlighting featured creatives and performers.
 */
export function TrendingTalents() {
  return (
    <section className={styles.section} aria-label="Trending Talents">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.accentBar} aria-hidden="true" />
          <h2 className={styles.title}>
            <span className={styles.fireEmoji} role="img" aria-label="fire">
              🔥
            </span>
            <span>Trending Now</span>
          </h2>
        </div>

        {/* 4-Column Grid */}
        <div className={styles.grid}>
          {TRENDING_TALENTS.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingTalents;
