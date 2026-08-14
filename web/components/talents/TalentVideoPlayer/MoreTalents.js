import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getRelatedTalents } from "@/utils/talentHelpers";
import styles from "./TalentVideoPlayer.module.css";

/**
 * MoreTalents sidebar widget rendering creatives strictly from the same category.
 */
export function MoreTalents({
  talent,
  title,
  talents,
}) {
  const resolvedTalents =
    (talents && talents.length > 0)
      ? talents
      : (talent?.relatedCreatives && talent.relatedCreatives.length > 0)
      ? talent.relatedCreatives
      : getRelatedTalents(talent?.categoryKey || talent?.category, talent?.id, 3);

  const formatCategoryName = (cat) => {
    if (!cat) return "Creatives";
    const lower = cat.toLowerCase();
    if (lower === "musician" || lower === "musicians") return "Musicians";
    if (lower === "actor" || lower === "actors") return "Actors";
    if (lower === "dancer" || lower === "dancers") return "Dancers";
    if (lower === "influencer" || lower === "influencers") return "Influencers";
    if (lower === "writer" || lower === "writers") return "Writers";
    if (lower === "producer" || lower === "producers") return "Producers";
    return `${cat}s`;
  };

  const resolvedTitle =
    title ||
    talent?.relatedCategoryTitle ||
    `More ${formatCategoryName(talent?.categoryKey || talent?.category)}`;

  return (
    <div className={styles.moreTalentsContainer} aria-label={resolvedTitle}>
      <h3 className={styles.moreTalentsSectionHeading}>{resolvedTitle}</h3>

      <div className={styles.moreTalentsList}>
        {resolvedTalents.map((item) => (
          <Link
            key={item.id}
            href={`/talents/${item.slug || item.id}`}
            className={styles.moreTalentRow}
          >
            <div className={styles.moreTalentLeft}>
              <div className={styles.moreTalentAvatar}>
                <Image
                  src={item.image || "/assets/img/talents/julius.jpg"}
                  alt={item.name}
                  fill
                  sizes="40px"
                  className="object-cover object-center"
                />
              </div>

              <div>
                <span className={styles.moreTalentName}>{item.name}</span>
                <p className={styles.moreTalentRole}>{item.category || item.profession}</p>
              </div>
            </div>

            <ChevronRight className={styles.chevronIcon} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MoreTalents;
