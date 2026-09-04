import { MISSION_VISION_CARDS, IMPACT_METRICS } from "@/constants/about";
import { WHY_CHOOSE_US_CONTENT } from "@/constants/aboutContent";
import { MissionCard } from "./MissionCard";
import { ProgressMetric } from "./ProgressMetric";
import styles from "./WhyChooseUs.module.css";

/**
 * WhyChooseUs section component displaying mission, vision, headline and key capability metrics.
 */
export function WhyChooseUs({
  content = WHY_CHOOSE_US_CONTENT,
  cards = MISSION_VISION_CARDS,
  metrics = IMPACT_METRICS,
} = {}) {
  const sectionContent = { ...WHY_CHOOSE_US_CONTENT, ...(content || {}) };
  const missionVisionCards = Array.isArray(cards) ? cards : MISSION_VISION_CARDS;
  const impactMetrics = Array.isArray(metrics) ? metrics : IMPACT_METRICS;

  return (
    <section className={styles.section} id="why-choose-us">
      <div className={styles.container}>
        {/* Top Grid: Headline + Mission/Vision Cards */}
        <div className={styles.topGrid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <span className={styles.badge}>{sectionContent.badge}</span>
            <h2 className={styles.headline}>{sectionContent.headline}</h2>
            <p className={styles.description}>{sectionContent.description}</p>
          </div>

          {/* Right Column: Mission and Vision Cards */}
          <div className={styles.cardsCol}>
            {missionVisionCards.map((card, index) => (
              <MissionCard key={card?.id || index} item={card} />
            ))}
          </div>
        </div>

        {/* Bottom Row: 3 Progress Metrics */}
        <div className={styles.metricsGrid}>
          {impactMetrics.map((metric, index) => (
            <ProgressMetric key={metric?.id || index} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
