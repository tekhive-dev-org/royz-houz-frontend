import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { EVENT_CATEGORIES } from "@/constants/events";
import styles from "./EventsFilterBar.module.css";

export const SORT_OPTIONS = [
  { id: "date-asc", label: "Date (Closest First)", shortLabel: "Date" },
  { id: "date-desc", label: "Date (Latest First)", shortLabel: "Date (Desc)" },
  { id: "title-asc", label: "Title (A - Z)", shortLabel: "Title (A-Z)" },
  { id: "title-desc", label: "Title (Z - A)", shortLabel: "Title (Z-A)" },
  { id: "popular", label: "Most Popular", shortLabel: "Popular" },
];

/**
 * EventsFilterBar component providing category filtering, live search, and production-ready sort dropdown.
 */
export function EventsFilterBar({
  selectedCategory = "All",
  onCategoryChange,
  categories = EVENT_CATEGORIES,
  searchQuery = "",
  onSearchChange,
  sortBy = "date-asc",
  onSortChange,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSortOpen) {
        setIsSortOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSortOpen]);

  const currentSortObj =
    SORT_OPTIONS.find((opt) => opt.id === sortBy) || SORT_OPTIONS[0];

  const handleSelectSort = (sortId) => {
    onSortChange?.(sortId);
    setIsSortOpen(false);
  };

  return (
    <div className={styles.filterSection} aria-label="Events Filters">
      <div className={styles.innerContainer}>
        {/* Category Pills List */}
        <div className={styles.categoryPillsList} role="tablist">
          {categories.map((cat) => {
            const isActive = cat === selectedCategory;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onCategoryChange?.(cat)}
                className={`${styles.pillBtn} ${
                  isActive ? styles.pillBtnActive : ""
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Filter Controls: Search & Sort */}
        <div className={styles.rightFilters}>
          {/* Search Box */}
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search events..."
              className={styles.searchInput}
              aria-label="Search events"
            />
          </div>

          {/* Production-Ready Sort Dropdown */}
          <div ref={sortRef} className={styles.sortContainer}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`${styles.sortSelectBtn} ${
                isSortOpen ? styles.sortSelectBtnActive : ""
              }`}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
              aria-label="Sort events"
            >
              <span>Sort: {currentSortObj.shortLabel}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${
                  isSortOpen ? "rotate-180 text-[#B46A2C]" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <div
                className={styles.sortMenu}
                role="listbox"
                aria-label="Sort options"
              >
                {SORT_OPTIONS.map((option) => {
                  const isSelected = option.id === sortBy;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectSort(option.id)}
                      className={`${styles.sortOption} ${
                        isSelected ? styles.sortOptionActive : ""
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#B46A2C] stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsFilterBar;
