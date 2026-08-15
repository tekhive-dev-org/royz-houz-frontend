import { ChevronDown } from "lucide-react";
import styles from "./MediaPagination.module.css";

/**
 * MediaPagination component providing fully functional, accessible, and responsive page controls.
 */
export function MediaPagination({
  currentPage = 1,
  totalPages = 1,
  perPage = 9,
  onPageChange,
  onPerPageChange,
}) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const handleSafePageChange = (targetPage) => {
    if (!onPageChange) return;
    const clampedPage = Math.min(Math.max(1, targetPage), safeTotalPages);
    if (clampedPage !== safeCurrentPage) {
      onPageChange(clampedPage);
    }
  };

  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", safeTotalPages];
    }

    if (safeCurrentPage >= safeTotalPages - 3) {
      return [
        1,
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      safeTotalPages,
    ];
  };

  return (
    <nav className={styles.paginationBar} aria-label="Catalog Pagination">
      {/* Left: Current Page Meta */}
      <div className={styles.pageInfo} aria-live="polite">
        Page {safeCurrentPage} of {safeTotalPages}
      </div>

      {/* Center: Page Controls */}
      <div
        className={styles.pageNumberGroup}
        role="navigation"
        aria-label="Pagination Navigation"
      >
        {/* Fast Previous (First Page) */}
        <button
          type="button"
          onClick={() => handleSafePageChange(1)}
          disabled={safeCurrentPage === 1}
          className={`${styles.pageNavBtn} ${
            safeCurrentPage === 1 ? styles.pageNavBtnDisabled : ""
          }`}
          aria-label="First page"
          title="First page"
        >
          «
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => handleSafePageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage === 1}
          className={`${styles.pageNavBtn} ${
            safeCurrentPage === 1 ? styles.pageNavBtnDisabled : ""
          }`}
          aria-label="Previous page"
          title="Previous page"
        >
          ‹
        </button>

        {/* Number Buttons & Ellipses */}
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className={styles.ellipsis}
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isActive = page === safeCurrentPage;
          return (
            <button
              key={`page-${page}`}
              type="button"
              onClick={() => handleSafePageChange(page)}
              className={`${styles.pageNumBtn} ${
                isActive ? styles.pageNumBtnActive : ""
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          onClick={() => handleSafePageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage === safeTotalPages}
          className={`${styles.pageNavBtn} ${
            safeCurrentPage === safeTotalPages ? styles.pageNavBtnDisabled : ""
          }`}
          aria-label="Next page"
          title="Next page"
        >
          ›
        </button>

        {/* Fast Next (Last Page) */}
        <button
          type="button"
          onClick={() => handleSafePageChange(safeTotalPages)}
          disabled={safeCurrentPage === safeTotalPages}
          className={`${styles.pageNavBtn} ${
            safeCurrentPage === safeTotalPages ? styles.pageNavBtnDisabled : ""
          }`}
          aria-label="Last page"
          title="Last page"
        >
          »
        </button>
      </div>

      {/* Right: Items Per Page Dropdown */}
      <div className={styles.perPageWrapper}>
        <select
          value={perPage}
          onChange={(e) => {
            if (onPerPageChange) {
              onPerPageChange(Number(e.target.value));
            }
          }}
          className={styles.perPageSelect}
          aria-label="Items per page"
        >
          <option value={6}>6 / page</option>
          <option value={7}>7 / page</option>
          <option value={8}>8 / page</option>
          <option value={9}>9 / page</option>
          <option value={12}>12 / page</option>
          <option value={16}>16 / page</option>
        </select>
        <ChevronDown className={styles.perPageChevron} aria-hidden="true" />
      </div>
    </nav>
  );
}

export default MediaPagination;
