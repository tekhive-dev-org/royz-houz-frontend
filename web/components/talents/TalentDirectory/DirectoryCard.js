import Image from "next/image";
import Link from "next/link";
import styles from "./TalentDirectory.module.css";

/**
 * DirectoryCard component displaying rich talent portfolio information with booking action.
 * Exact Figma dimensions: 306x332px, rx: 10px, button: 73x28px rx: 4px.
 */
export function DirectoryCard({ talent, onBook }) {
  const profileUrl = `/talents/${talent.slug || talent.id}`;

  return (
    <article className={styles.card} aria-label={`${talent.name} - ${talent.category}`}>
      {/* Background Photography */}
      <Link href={profileUrl} className="absolute inset-0 z-0">
        <Image
          src={talent.image}
          alt={talent.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={styles.cardImage}
        />
      </Link>

      {/* Atmospheric Dark Gradient Overlay */}
      <div className={styles.cardGradient} aria-hidden="true" />

      {/* Top Badges */}
      <div className={styles.topBadges}>
        <span className={styles.categoryBadge}>{talent.category}</span>
        {talent.isHot && (
          <span className={styles.hotBadge} role="img" aria-label="Hot Talent">
            🔥
          </span>
        )}
      </div>

      {/* Bottom Content & Booking CTA */}
      <div className={styles.bottomContent}>
        <Link href={profileUrl} className="hover:underline">
          <h3 className={styles.name}>{talent.name}</h3>
        </Link>
        <p className={styles.subtitle}>{talent.subtitle}</p>
        <p className={styles.bio}>{talent.bio}</p>

        {/* Footer Row (Rating + Book Button) */}
        <div className={styles.footerRow}>
          <div className={styles.ratingGroup}>
            <span className={styles.starIcon} aria-hidden="true">
              ★
            </span>
            <span className={styles.ratingNumber}>{talent.rating}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBook && onBook(talent);
            }}
            className={styles.bookBtn}
          >
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

export default DirectoryCard;
