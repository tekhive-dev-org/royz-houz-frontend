import Image from "next/image";
import Link from "next/link";
import styles from "./TalentVideoPlayer.module.css";

/**
 * TalentMiniProfile sidebar widget displaying creator card with direct profile and booking links.
 */
export function TalentMiniProfile({
  talent = {
    name: "Julius Ayomide",
    category: "Music Producer",
    followers: "9.8K",
    bio: "Julius Ayomide is a creative music producer and beatmaker specializing in Afrobeats, Hip-Hop, and contemporary African sounds.",
    image: "/assets/img/talents/julius.jpg",
    coverImage: "/assets/img/talents/producer-mini-cover.jpg",
    slug: "julius-ayomide",
  },
}) {
  const profileUrl = `/talents/${talent.slug || talent.id || "julius-ayomide"}`;
  const followersCount = talent.followers ? (talent.followers.includes("followers") ? talent.followers : `${talent.followers} followers`) : "9.8K followers";

  return (
    <div className={styles.profileCard} aria-label={`${talent.name} mini profile`}>
      {/* Top Banner Image */}
      <div className={styles.profileCover}>
        <Image
          src={talent.coverImage || "/assets/img/talents/producer-mini-cover.jpg"}
          alt={`${talent.name} cover`}
          fill
          sizes="(max-width: 1024px) 100vw, 384px"
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Body Content */}
      <div className={styles.profileBody}>
        {/* Overlapping Avatar */}
        <div className={styles.profileAvatar}>
          <Image
            src={talent.image || "/assets/img/talents/julius.jpg"}
            alt={talent.name}
            fill
            sizes="56px"
            className="object-cover object-center"
          />
        </div>

        {/* Talent Info */}
        <h3 className={styles.profileName}>{talent.name}</h3>
        <p className={styles.profileFollowers}>
          {talent.category || "Music Producer"} • {followersCount}
        </p>
        <p className={styles.profileBio}>{talent.bio}</p>

        {/* Action Buttons Row */}
        <div className={styles.profileBtnRow}>
          <Link href={profileUrl} className={styles.btnViewProfile}>
            VIEW PROFILE
          </Link>
          <Link
            href={`/talents/${talent.slug || talent.id || "julius-ayomide"}/book`}
            className={styles.btnBook}
          >
            BOOK
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TalentMiniProfile;
