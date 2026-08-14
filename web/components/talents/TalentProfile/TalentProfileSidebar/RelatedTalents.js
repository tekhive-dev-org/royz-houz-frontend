import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getRelatedTalents } from "@/utils/talentHelpers";
import styles from "./TalentProfileSidebar.module.css";

/**
 * RelatedTalents sidebar widget rendering similar creatives strictly from the same category.
 */
export function RelatedTalents({ talent }) {
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

  const relatedList =
    (talent?.relatedCreatives && talent.relatedCreatives.length > 0)
      ? talent.relatedCreatives
      : getRelatedTalents(talent?.categoryKey || talent?.category, talent?.id, 3);

  const title =
    talent?.relatedCategoryTitle ||
    `Related ${formatCategoryName(talent?.categoryKey || talent?.category)}`;

  return (
    <div className={styles.relatedWidget} aria-label={title}>
      <h3 className={styles.widgetHeader}>{title}</h3>

      <div className={styles.relatedList}>
        {relatedList.map((item) => (
          <Link
            key={item.id}
            href={`/talents/${item.slug || item.id}`}
            className={styles.relatedItem}
          >
            <div className={styles.relatedAvatar}>
              <Image
                src={item.image || "/assets/img/talents/julius.jpg"}
                alt={item.name}
                fill
                sizes="40px"
                className="object-cover object-center"
              />
            </div>

            <div className={styles.relatedInfo}>
              <span className={styles.relatedName}>{item.name}</span>
              <span className={styles.relatedCategory}>{item.category || item.profession}</span>
            </div>
          </Link>
        ))}
      </div>

      <Link href="/talents" className={styles.viewAllLink}>
        View all talents
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default RelatedTalents;
