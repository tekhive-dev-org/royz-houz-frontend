import { ChevronDown } from "lucide-react";
import { TALENT_CATEGORIES } from "@/constants/talents";
import styles from "./TalentDirectory.module.css";

/**
 * CategoryFilter component with pill tabs, results counter, and sort dropdown.
 */
export function CategoryFilter({
  activeCategory,
  onSelectCategory,
  totalCount,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="w-full px-4">
      {/* Category Pills Navigation */}
      <div className={styles.filterRow} role="tablist" aria-label="Talent Categories">
        {TALENT_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(cat.id)}
              className={`${styles.filterPill} ${
                isActive ? styles.filterPillActive : ""
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Meta Bar (Result Count & Sort Selector) */}
      <div className={styles.metaBar}>
        <span className={styles.foundCount}>
          {totalCount} {totalCount === 1 ? "talent" : "talents"} found
        </span>

        <div className={styles.sortWrapper}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.sortSelect}
            aria-label="Sort talents"
          >
            <option value="date">Sort: Date</option>
            <option value="rating">Sort: Rating</option>
            <option value="name">Sort: Name</option>
          </select>
          <ChevronDown className={styles.sortChevron} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default CategoryFilter;
