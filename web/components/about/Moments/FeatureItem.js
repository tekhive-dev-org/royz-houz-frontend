import { MOMENTS_FEATURES } from "@/constants/about";
import { Sprout, Heart } from "lucide-react";
import { SparkleStarIcon, TalentDiscoveryIcon } from "./Icons";
import styles from "./Moments.module.css";

const ICON_MAP = {
  TalentDiscovery: SparkleStarIcon,
  Sparkles: SparkleStarIcon,
  OrigamiDiscovery: TalentDiscoveryIcon,
  Sprout,
  Handshake: TalentDiscoveryIcon,
  Heart,
};

/**
 * FeatureItem component representing a single value proposition item.
 */
export function FeatureItem({ item = MOMENTS_FEATURES[0] } = {}) {
  const feature = { ...MOMENTS_FEATURES[0], ...(item || {}) };
  const IconComponent = ICON_MAP[feature.iconName] || SparkleStarIcon;

  return (
    <div className={styles.featureItem}>
      {/* Icon Badge */}
      <div
        className={`${styles.iconBadge} ${
          feature.darkBadge ? styles.iconBadgeDark : styles.iconBadgeLight
        }`}
      >
        <IconComponent className={styles.featureIcon} aria-hidden="true" />
      </div>

      {/* Title & Description */}
      <div className={styles.featureContent}>
        <h3 className={styles.featureTitle}>{feature.title}</h3>
        <p className={styles.featureDescription}>{feature.description}</p>
      </div>
    </div>
  );
}

export default FeatureItem;
