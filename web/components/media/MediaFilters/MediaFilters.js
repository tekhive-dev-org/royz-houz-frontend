import { Search, ChevronDown } from "lucide-react";

import styles from "./MediaFilters.module.css";

/**
 * MediaFilters component providing category tab switcher, live search input, and sort dropdown.
 */
export function MediaFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  pageContent = {},
}) {
  const labels = { all: "All Media", videos: "Videos", music: "Music", podcasts: "Podcasts", gallery: "Gallery", ...pageContent };
  const tabs = [
    { id: "all", label: labels.all },
    { id: "videos", label: labels.videos },
    { id: "music", label: labels.music },
    { id: "podcasts", label: labels.podcasts },
    { id: "gallery", label: labels.gallery },
  ];
  return (
    <div className={styles.filterContainer} aria-label="Media Filters">
      {/* Category Filter Pills */}
      <div className={styles.tabsRow} role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`${styles.tabBtn} ${
                isActive ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Auxiliary Search & Sort Controls */}
      <div className={styles.controlsRow}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder={labels.searchPlaceholder || "Search media..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            aria-label="Search events"
          />
        </div>

        {/* Sort Dropdown */}
        <div className={styles.sortWrapper}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.sortSelect}
            aria-label="Sort media"
          >
            <option value="date">{labels.sortDate || "Sort: Date"}</option>
            <option value="latest">{labels.sortLatest || "Sort: Latest"}</option>
            <option value="popular">{labels.sortPopular || "Sort: Most Popular"}</option>
          </select>
          <ChevronDown className={styles.sortChevron} />
        </div>
      </div>
    </div>
  );
}

export default MediaFilters;
