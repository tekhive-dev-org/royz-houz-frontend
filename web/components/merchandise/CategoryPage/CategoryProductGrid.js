import { useState } from "react";
import { ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import { CategoryProductCard } from "./CategoryProductCard";
import styles from "./CategoryProductGrid.module.css";

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "newest", label: "Newest Arrivals" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

/**
 * CategoryProductGrid Component
 * Displays category header, sort dropdown, 3-column product cards, and pagination.
 */
export function CategoryProductGrid({
  categoryTitle = "Casual",
  products = [],
  totalProductsCount = 100,
  sortBy = "popular",
  onSortChange,
  currentPage = 1,
  onPageChange,
  onAddToCart,
  onQuickView,
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label || "Most Popular";

  return (
    <section className={styles.gridSection} aria-label={`${categoryTitle} Products`}>
      {/* ── Header: Title & Sorting Meta ───────────── */}
      <div className={styles.headerBar}>
        <h1 className={styles.categoryTitle}>{categoryTitle}</h1>

        <div className={styles.metaControls}>
          <span className={styles.resultsCount}>
            Showing 1-{products.length} of {totalProductsCount} Products
          </span>

          {/* Sort Dropdown */}
          <div className={styles.sortWrapper}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={styles.sortBtn}
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <span className={styles.sortLabel}>
                Sort by: <strong>{currentSortLabel}</strong>
              </span>
              <ChevronDown className="w-4 h-4 text-[#0A0D14]" />
            </button>

            {isSortOpen && (
              <div className={styles.sortDropdown} role="listbox">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSortChange && onSortChange(opt.id);
                      setIsSortOpen(false);
                    }}
                    className={`${styles.sortOption} ${
                      sortBy === opt.id ? styles.sortOptionActive : ""
                    }`}
                    role="option"
                    aria-selected={sortBy === opt.id}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3-Column Products Grid ─────────────────── */}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <CategoryProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        ))}
      </div>

      {/* ── Pagination Navigation ──────────────────── */}
      <div className={styles.paginationBar}>
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={styles.pageBtn}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className={styles.pageNumbers}>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(1)}
            className={`${styles.pageNumber} ${
              currentPage === 1 ? styles.pageNumberActive : ""
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(2)}
            className={`${styles.pageNumber} ${
              currentPage === 2 ? styles.pageNumberActive : ""
            }`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(3)}
            className={`${styles.pageNumber} ${
              currentPage === 3 ? styles.pageNumberActive : ""
            }`}
          >
            3
          </button>
          <span className={styles.pageEllipsis}>...</span>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(8)}
            className={styles.pageNumber}
          >
            8
          </button>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(9)}
            className={styles.pageNumber}
          >
            9
          </button>
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(10)}
            className={styles.pageNumber}
          >
            10
          </button>
        </div>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className={styles.pageBtn}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

export default CategoryProductGrid;
