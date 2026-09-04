import Image from "next/image";
import Link from "next/link";
import { isTalentAvailableForBooking } from "../TalentProfile/talentProfileData";
import styles from "./TalentVideoPlayer.module.css";

/**
 * TalentMiniProfile sidebar widget displaying creator card with direct profile and booking links.
 * When the creator is an external or manual author who does not exist in the talent roster,
 * the profile view and booking buttons are omitted.
 */
export function TalentMiniProfile({ talent }) {
  if (!talent) return null;

  // Only consider as roster talent if explicitly flagged or has a valid talent roster slug (not generic "media")
  const hasTalentProfile = Boolean(
    talent.isRosterTalent ||
    talent.hasTalentProfile ||
    (talent.slug && talent.slug !== "media" && talent.isRosterTalent !== false)
  );

  const talentIdentifier = hasTalentProfile ? (talent.slug || talent.id) : null;
  const profileUrl = talentIdentifier ? `/talents/${talentIdentifier}` : null;
  const followersCount = hasTalentProfile && talent.followers
    ? talent.followers.includes("followers")
      ? talent.followers
      : `${talent.followers} followers`
    : "";
  const isBookingAvailable = hasTalentProfile && isTalentAvailableForBooking(talent);

  return (
    <div className={styles.profileCard} aria-label={`${talent.name} mini profile`}>
      {/* Top Banner Image */}
      <div className={styles.profileCover}>
        {talent.coverImage ? (
          <Image
            src={talent.coverImage}
            alt={`${talent.name} cover`}
            fill
            sizes="(max-width: 1024px) 100vw, 384px"
            className="object-cover object-center"
            priority
          />
        ) : null}
      </div>

      {/* Body Content */}
      <div className={styles.profileBody}>
        {/* Overlapping Avatar */}
        <div className={styles.profileAvatar}>
          {talent.image ? (
            <Image
              src={talent.image}
              alt={talent.alt || talent.name}
              fill
              sizes="56px"
              className="object-cover object-center"
            />
          ) : null}
        </div>

        {/* Talent Info */}
        <h3 className={styles.profileName}>{talent.name}</h3>
        <p className={styles.profileFollowers}>
          {[talent.category, followersCount].filter(Boolean).join(" • ")}
        </p>
        <p className={styles.profileBio}>{talent.bio}</p>

        {/* Action Buttons Row: Only displayed if author exists in the talents roster */}
        {hasTalentProfile && profileUrl && (
          <div className={styles.profileBtnRow}>
            <Link href={profileUrl} className={styles.btnViewProfile}>
              VIEW PROFILE
            </Link>
            {isBookingAvailable ? (
              <Link href={`/talents/${talentIdentifier}/book`} className={styles.btnBook}>
                BOOK
              </Link>
            ) : (
              <span className={styles.btnBook} aria-disabled="true">
                UNAVAILABLE
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TalentMiniProfile;
