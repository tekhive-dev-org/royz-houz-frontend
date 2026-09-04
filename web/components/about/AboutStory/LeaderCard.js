import Image from "next/image";
import { ABOUT_STORY_CONTENT } from "@/constants/aboutContent";
import styles from "./AboutStory.module.css";

/**
 * LeaderCard component displaying portrait photo, quote, name, and role.
 */
export function LeaderCard({ content = ABOUT_STORY_CONTENT.leader } = {}) {
  const leader = { ...ABOUT_STORY_CONTENT.leader, ...(content || {}) };

  return (
    <article className={styles.leaderCard}>
      {/* Leader Portrait Image */}
      <div className={styles.leaderImageWrapper}>
        <Image
          src={leader.image}
          alt={leader.imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 360px"
          className={styles.leaderImage}
        />
      </div>

      {/* Quote & Author Info */}
      <div className={styles.leaderContent}>
        <blockquote className={styles.leaderQuote}>
          &ldquo;{leader.quote}&rdquo;
        </blockquote>

        <div className={styles.leaderInfo}>
          <h3 className={styles.leaderName}>{leader.name}</h3>
          <span className={styles.leaderRole}>{leader.role}</span>
        </div>
      </div>
    </article>
  );
}

export default LeaderCard;
