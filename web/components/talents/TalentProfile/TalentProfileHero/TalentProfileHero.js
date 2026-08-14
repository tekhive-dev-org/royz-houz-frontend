import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import styles from "./TalentProfileHero.module.css";

/**
 * TalentProfileHero component displaying cover photo, category badge, name, and ratings.
 */
export function TalentProfileHero({ talent }) {
  if (!talent) return null;

  return (
    <section className={styles.heroSection} aria-label={`${talent.name} Profile Header`}>
      {/* Background Photography */}
      <Image
        src={talent.coverImage || talent.image}
        alt={`${talent.name} cover`}
        fill
        priority
        sizes="100vw"
        className={styles.heroImage}
      />

      {/* Atmospheric Dark Overlay */}
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.container}>
        {/* Top Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/talents" className={styles.breadcrumbLink}>
            <span className="inline-flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Talent Hub
            </span>
          </Link>
          <span className="text-slate-500">/</span>
          <span className={styles.breadcrumbCurrent}>{talent.name}</span>
        </nav>

        {/* Category Badge */}
        <div className={styles.categoryBadgeWrapper}>
          <span className={styles.categoryBadge}>{talent.badge || talent.category}</span>
        </div>

        {/* Talent Name */}
        <h1 className={styles.talentName}>{talent.name}</h1>

        {/* Subtitle / Specialty & Location */}
        <p className={styles.talentSubtitle}>{talent.subtitle}</p>

        {/* Rating & Followers Meta Row */}
        <div className={styles.metaRow}>
          <div className={styles.ratingGroup}>
            {[...Array(5)].map((_, i) => (
              <span key={i} className={styles.starFilled} aria-hidden="true">
                ★
              </span>
            ))}
            <span className="ml-1 text-white font-bold">{talent.rating}</span>
          </div>

          <span className={styles.followersCount}>
            {talent.followers} followers
          </span>
        </div>
      </div>
    </section>
  );
}

export default TalentProfileHero;
