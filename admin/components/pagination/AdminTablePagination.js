import React from "react";
import PropTypes from "prop-types";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import Tooltip from "@mui/material/Tooltip";
import styles from "./AdminTablePagination.module.css";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export function AdminTablePagination({
  page = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "items",
  disabled = false,
  showRowsPerPage = true,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const canPrev = currentPage > 1 && !disabled;
  const canNext = currentPage < totalPages && !disabled;

  return (
    <div className={`${styles.paginationContainer} ${className}`} aria-label="Table pagination">
      {/* Left: Items Summary & Optional Rows Per Page */}
      <div className={styles.leftSection}>
        <div className={styles.infoText}>
          {totalItems === 0 ? (
            <>No {itemLabel} found</>
          ) : (
            <>
              Showing <span className={styles.highlight}>{fromItem}</span>–
              <span className={styles.highlight}>{toItem}</span> of{" "}
              <span className={styles.highlight}>{totalItems.toLocaleString()}</span> {itemLabel}
            </>
          )}
        </div>

        {showRowsPerPage && onPageSizeChange && (
          <div className={styles.rowsPerPage}>
            <span>Rows per page:</span>
            <select
              className={styles.pageSizeSelect}
              value={pageSize}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className={styles.rightSection}>
        {/* First Page */}
        <Tooltip title="First page">
          <span>
            <button
              type="button"
              className={`${styles.navButton} ${styles.iconButton} ${styles.jumpBtn}`}
              disabled={!canPrev}
              onClick={() => onPageChange?.(1)}
              aria-label="Go to first page"
            >
              <FirstPageIcon fontSize="small" />
            </button>
          </span>
        </Tooltip>

        {/* Previous Page */}
        <button
          type="button"
          className={styles.navButton}
          disabled={!canPrev}
          onClick={() => onPageChange?.(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon fontSize="small" />
          <span>Prev</span>
        </button>

        {/* Mobile Page Indicator */}
        <span className={styles.mobilePageIndicator}>
          Page {currentPage} of {totalPages}
        </span>

        {/* Desktop Page Numbers */}
        <div className={styles.pageList}>
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                  …
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                className={`${styles.pagePill} ${isCurrent ? styles.active : ""}`}
                disabled={disabled}
                onClick={() => onPageChange?.(p)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          className={styles.navButton}
          disabled={!canNext}
          onClick={() => onPageChange?.(currentPage + 1)}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRightIcon fontSize="small" />
        </button>

        {/* Last Page */}
        <Tooltip title="Last page">
          <span>
            <button
              type="button"
              className={`${styles.navButton} ${styles.iconButton} ${styles.jumpBtn}`}
              disabled={!canNext}
              onClick={() => onPageChange?.(totalPages)}
              aria-label="Go to last page"
            >
              <LastPageIcon fontSize="small" />
            </button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}

AdminTablePagination.propTypes = {
  page: PropTypes.number,
  pageSize: PropTypes.number,
  totalItems: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  itemLabel: PropTypes.string,
  disabled: PropTypes.bool,
  showRowsPerPage: PropTypes.bool,
  className: PropTypes.string,
};

export default AdminTablePagination;
