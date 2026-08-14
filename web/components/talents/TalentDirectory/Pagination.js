import { ChevronDown } from "lucide-react";
import styles from "./TalentDirectory.module.css";

/**
 * Pagination component with mobile-responsive layouts and touch-friendly targets.
 */
export function Pagination({
  currentPage = 1,
  totalPages = 16,
  perPage = 8,
  onPageChange,
  onPerPageChange,
}) {
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={styles.paginationBar}>
      {/* Numbered Controls (Centered and wrapped for mobile) */}
      <div className={styles.pageNumberGroup} role="navigation" aria-label="Pagination">
        {/* First Page (Hidden on small mobile screens to save space) */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${styles.pageBtn} ${styles.pageBtnFast} ${
            currentPage === 1 ? styles.pageBtnDisabled : ""
          }`}
          aria-label="First page"
        >
          «
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${styles.pageBtn} ${
            currentPage === 1 ? styles.pageBtnDisabled : ""
          }`}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 sm:px-2 text-slate-400 text-xs sm:text-sm select-none"
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`${styles.pageBtn} ${
                isActive ? styles.pageBtnActive : ""
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${styles.pageBtn} ${
            currentPage === totalPages ? styles.pageBtnDisabled : ""
          }`}
          aria-label="Next page"
        >
          ›
        </button>

        {/* Last Page (Hidden on small mobile screens to save space) */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${styles.pageBtn} ${styles.pageBtnFast} ${
            currentPage === totalPages ? styles.pageBtnDisabled : ""
          }`}
          aria-label="Last page"
        >
          »
        </button>
      </div>

      {/* Meta Bar: Page info & items per page on a single balanced row on mobile */}
      <div className={styles.paginationMeta}>
        <div className={styles.paginationInfo}>
          Page {currentPage} of {totalPages}
        </div>

        <div className={styles.sortWrapper}>
          <select
            value={perPage}
            onChange={(e) =>
              onPerPageChange && onPerPageChange(Number(e.target.value))
            }
            className={styles.perPageSelect}
            aria-label="Items per page"
          >
            <option value={7}>7 / page</option>
            <option value={8}>8 / page</option>
            <option value={12}>12 / page</option>
            <option value={16}>16 / page</option>
          </select>
          <ChevronDown className={styles.sortChevron} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default Pagination;
