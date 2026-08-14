import { MISSION_VISION_CARDS, IMPACT_METRICS } from "@/constants/about";
import { MissionCard } from "./MissionCard";
import { ProgressMetric } from "./ProgressMetric";
import styles from "./WhyChooseUs.module.css";

/**
 * WhyChooseUs section component displaying mission, vision, headline and key capability metrics.
 */
export function WhyChooseUs() {
  return (
    <section className={styles.section} id="why-choose-us">
      <div className={styles.container}>
        {/* Top Grid: Headline + Mission/Vision Cards */}
        <div className={styles.topGrid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <span className={styles.badge}>WHY CHOOSE US</span>
            <h2 className={styles.headline}>
              We Connect Africa’s Creative Talent With Opportunities To Grow.
            </h2>
            <p className={styles.description}>
              We create a space where Africa’s creative talent can be discovered,
              celebrated, and connected with meaningful opportunities that inspire growth,
              collaboration, and lasting impact.
            </p>
          </div>

          {/* Right Column: Mission and Vision Cards */}
          <div className={styles.cardsCol}>
            {MISSION_VISION_CARDS.map((card) => (
              <MissionCard key={card.id} item={card} />
            ))}
          </div>
        </div>

        {/* Bottom Row: 3 Progress Metrics */}
        <div className={styles.metricsGrid}>
          {IMPACT_METRICS.map((metric) => (
            <ProgressMetric key={metric.id} metric={metric} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
