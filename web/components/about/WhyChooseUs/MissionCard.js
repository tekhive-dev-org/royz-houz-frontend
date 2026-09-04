import { MISSION_VISION_CARDS } from "@/constants/about";
import { MissionTargetIcon, VisionEyeIcon } from "./Icons";
import styles from "./WhyChooseUs.module.css";

const MISSION_ICON_MAP = {
  mission: MissionTargetIcon,
  vision: VisionEyeIcon,
};

/**
 * MissionCard component rendering a white card with dark icon badge, title and description.
 */
export function MissionCard({ item = MISSION_VISION_CARDS[0] } = {}) {
  const card = { ...MISSION_VISION_CARDS[0], ...(item || {}) };
  const IconComponent =
    typeof card.icon === "function"
      ? card.icon
      : MISSION_ICON_MAP[card.iconKey] ||
        MISSION_ICON_MAP[card.icon] ||
        MISSION_ICON_MAP[card.id] ||
        MissionTargetIcon;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <IconComponent className={styles.icon} aria-hidden="true" />
      </div>

      <h3 className={styles.cardTitle}>{card.title}</h3>
      <p className={styles.cardDescription}>{card.description}</p>
    </div>
  );
}

export default MissionCard;
