import { ChevronDown } from "lucide-react";
import styles from "./TalentDirectory.module.css";

/**
 * CategoryFilter component with pill tabs, results counter, and sort dropdown.
 */
export function CategoryFilter({
  categories = [],
  activeCategory,
  onSelectCategory,
  totalCount,
  sortBy,
  onSortChange,
}) {
  const categoryList = Array.isArray(categories) ? categories : [];

  return (
    <div className="w-full px-4">
      {/* Category Pills Navigation */}
      <div className={styles.filterRow} role="tablist" aria-label="Talent Categories">
        {categoryList.map((cat) => {
          const catId = cat.id || cat.slug;
          const catLabel = catId === "all" ? "All" : (cat.label || cat.title || cat.name || catId);
          const isActive = activeCategory === catId;
          return (
            <button
              key={catId}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(catId)}
              className={`${styles.filterPill} ${
                isActive ? styles.filterPillActive : ""
              }`}
            >
              {catLabel}
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
