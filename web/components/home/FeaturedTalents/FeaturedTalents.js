import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TalentCard } from "../TalentCard";
import { FEATURED_TALENTS } from "@/constants/talents";
import styles from "./FeaturedTalents.module.css";

export function FeaturedTalents() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>Featured Talent</h2>
          </div>

          <Link href="/talents" className={styles.viewAllLink}>
            <span>View all talents</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Talent Cards Grid */}
        <div className={styles.grid}>
          {FEATURED_TALENTS.map((talent) => (
            <TalentCard key={talent.id} talent={talent} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default FeaturedTalents;
