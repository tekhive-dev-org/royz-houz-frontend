import Image from "next/image";
import Link from "next/link";
import styles from "./TrendingTalents.module.css";

/**
 * TalentCard component displaying trending talent avatar, name, and profession.
 */
export function TalentCard({ talent }) {
  const profileUrl = `/talents/${talent.slug || talent.id}`;

  return (
    <Link href={profileUrl} className="block">
      <article className={styles.card} aria-label={`${talent.name} - ${talent.profession}`}>
        {/* Profile Image */}
        <Image
          src={talent.image}
          alt={talent.alt || talent.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={styles.image}
        />

        {/* Dark Ambient Gradient Overlay */}
        <div className={styles.gradientOverlay} aria-hidden="true" />

        {/* Bottom Information */}
        <div className={styles.content}>
          <h3 className={styles.name}>{talent.name}</h3>
          <p className={styles.profession}>{talent.profession}</p>
        </div>
      </article>
    </Link>
  );
}

export default TalentCard;
