import Image from "next/image";
import styles from "./AboutStory.module.css";

/**
 * LeaderCard component displaying portrait photo, quote, name, and role.
 */
export function LeaderCard() {
  return (
    <article className={styles.leaderCard}>
      {/* Leader Portrait Image */}
      <div className={styles.leaderImageWrapper}>
        <Image
          src="/assets/img/about/leader.jpg"
          alt="Kennedy Donald, CEO Royz Houz"
          fill
          sizes="(max-width: 1024px) 100vw, 360px"
          className={styles.leaderImage}
        />
      </div>

      {/* Quote & Author Info */}
      <div className={styles.leaderContent}>
        <blockquote className={styles.leaderQuote}>
          &ldquo;Royz Houz exists to turn that belief into meaningful opportunities,
          lasting connections, and real impact.&rdquo;
        </blockquote>

        <div className={styles.leaderInfo}>
          <h3 className={styles.leaderName}>Kennedy Donald</h3>
          <span className={styles.leaderRole}>CEO Royz Houz</span>
        </div>
      </div>
    </article>
  );
}

export default LeaderCard;
