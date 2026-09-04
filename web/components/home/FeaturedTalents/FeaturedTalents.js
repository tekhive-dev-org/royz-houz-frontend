import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TalentCard } from "../TalentCard";
import { HOMEPAGE_FEATURED_TALENTS_CONTENT } from "@/constants/homepageContent";
import styles from "./FeaturedTalents.module.css";

export function FeaturedTalents({ content }) {
  const sectionContent = { ...HOMEPAGE_FEATURED_TALENTS_CONTENT, ...content };
  const talents = Array.isArray(sectionContent.talents)
    ? sectionContent.talents
    : HOMEPAGE_FEATURED_TALENTS_CONTENT.talents;
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>{sectionContent.title}</h2>
          </div>

          <Link href={sectionContent.viewAllHref} className={styles.viewAllLink}>
            <span>{sectionContent.viewAllLabel}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Talent Cards Grid */}
        <div className={styles.grid}>
          {talents.map((talent, index) => (
            <TalentCard key={talent?.id || index} talent={talent} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedTalents;
