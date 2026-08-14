import Image from "next/image";
import { Flame } from "lucide-react";
import { TalentCardSocialSvg, RatingStarIcon } from "@/components/common/SocialIcons";
import styles from "./TalentCard.module.css";

export function TalentCard({ talent }) {
  const { name, category, genre, location, rating, followers, image, isHot } = talent;

  return (
    <article className={`${styles.card} group`}>
      {/* Background Image */}
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className={styles.image}
      />

      {/* Dark Vignette Overlay */}
      <div className={styles.overlay} />

      {/* Top Badges */}
      <div className={styles.topBadges}>
        <span className={styles.categoryBadge}>{category}</span>
        {isHot && (
          <span className={styles.fireBadge} aria-label="Hot Talent">
            <Flame className={styles.animatedFlame} />
          </span>
        )}
      </div>

      {/* Card Info Overlay */}
      <div className={styles.cardContent}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.subDetails}>
          {genre} &ndash; {location}
        </p>

        <div className={styles.metaRow}>
          <RatingStarIcon className="w-3.5 h-3.5 text-[#C8781A]" />
          <span>{rating}</span>
          <span className="mx-1">&middot;</span>
          <span>{followers} followers</span>
        </div>

        {/* Social Links */}
        <div className={styles.socialRow}>
          <TalentCardSocialSvg className="h-4 w-auto text-white/90" />
        </div>
      </div>
    </article>
  );
}

export default TalentCard;
