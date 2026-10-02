import { useState, useMemo, useEffect } from "react";

/**
 * Custom hook to manage client-side table pagination state and calculations.
 *
 * @param {Array} items - Array of filtered items to paginate
 * @param {Object} options - Configuration options
 * @param {number} [options.initialPage=1] - Starting page number
 * @param {number} [options.initialPageSize=10] - Starting items per page
 * @param {string} [options.itemLabel="items"] - Descriptive label for the items
 * @param {Array<number>} [options.pageSizeOptions=[10, 25, 50, 100]] - Available page sizes
 */
export function useTablePagination(items = [], options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    itemLabel = "items",
    pageSizeOptions = [10, 25, 50, 100],
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Automatically clamp or reset page if items change (e.g. search filter applied)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const fromIndex = (currentPage - 1) * pageSize;
    return items.slice(fromIndex, fromIndex + pageSize);
  }, [items, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    page: currentPage,
    setPage: handlePageChange,
    pageSize,
    setPageSize: handlePageSizeChange,
    paginatedItems,
    totalPages,
    totalItems,
    paginationProps: {
      page: currentPage,
      pageSize,
      totalItems,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
      pageSizeOptions,
      itemLabel,
    },
  };
}

export default useTablePagination;
