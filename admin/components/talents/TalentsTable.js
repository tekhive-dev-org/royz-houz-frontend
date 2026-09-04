import { useMemo, useState } from "react";
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DevicesIcon from "@mui/icons-material/Devices";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import { TalentFiltersBar } from "./TalentFiltersBar";
import { TalentDesktopTable } from "./TalentDesktopTable";
import { TalentMobileCardGrid } from "./TalentMobileCardGrid";
import styles from "./TalentsTable.module.css";

function parseFollowerCount(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const str = String(val).trim().toUpperCase();
  if (str.endsWith("M")) return parseFloat(str) * 1_000_000;
  if (str.endsWith("K")) return parseFloat(str) * 1_000;
  const numeric = parseFloat(str.replace(/[^0-9.]/g, ""));
  return isNaN(numeric) ? 0 : numeric;
}

export function TalentsTable({
  items = [],
  categories = [],
  search = "",
  setSearch,
  categoryFilter = "",
  setCategoryFilter,
  statusFilter = "",
  setStatusFilter,
  isUpdating = false,
  onAddClick,
  onEditClick,
  onPreviewClick,
  onArchiveClick,
  onDuplicateClick,
}) {
  const [viewMode, setViewMode] = useState("auto");
  const [sortBy, setSortBy] = useState("default");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Category mapping
  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      if (cat.id) map.set(cat.id, cat.title);
      if (cat.slug) map.set(cat.slug, cat.title);
    });
    return map;
  }, [categories]);

  function getCategoryLabel(item) {
    const body = item.body || {};
    if (item.primaryCategoryId && categoryMap.has(item.primaryCategoryId)) {
      return categoryMap.get(item.primaryCategoryId);
    }
    if (body.categoryKey && categoryMap.has(body.categoryKey)) {
      return categoryMap.get(body.categoryKey);
    }
    return body.category || body.profession || "Creative";
  }

  // Processed and sorted items
  const processedItems = useMemo(() => {
    let result = [...items];

    if (featuredOnly) {
      result = result.filter((item) => Boolean(item.featured));
    }

    if (sortBy === "name_asc") {
      result.sort((a, b) => {
        const nameA = a.body?.name || a.title || "";
        const nameB = b.body?.name || b.title || "";
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "name_desc") {
      result.sort((a, b) => {
        const nameA = a.body?.name || a.title || "";
        const nameB = b.body?.name || b.title || "";
        return nameB.localeCompare(nameA);
      });
    } else if (sortBy === "rating_desc") {
      result.sort((a, b) => {
        const ratingA = parseFloat(a.body?.rating) || 0;
        const ratingB = parseFloat(b.body?.rating) || 0;
        return ratingB - ratingA;
      });
    } else if (sortBy === "followers_desc") {
      result.sort((a, b) => {
        const fA = parseFollowerCount(a.body?.followers);
        const fB = parseFollowerCount(b.body?.followers);
        return fB - fA;
      });
    } else if (sortBy === "status") {
      result.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    }

    return result;
  }, [items, sortBy, featuredOnly]);

  // Pagination calculation
  const totalPages = Math.ceil(processedItems.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedItems.slice(startIndex, startIndex + pageSize);
  }, [processedItems, currentPage, pageSize]);

  const hasActiveFilters = Boolean(
    search || categoryFilter || statusFilter || featuredOnly || sortBy !== "default"
  );

  function handleResetFilters() {
    if (setSearch) setSearch("");
    if (setCategoryFilter) setCategoryFilter("");
    if (setStatusFilter) setStatusFilter("");
    setFeaturedOnly(false);
    setSortBy("default");
    setPage(1);
  }

  function handleToggleSort(column) {
    if (column === "name") {
      setSortBy((prev) => (prev === "name_asc" ? "name_desc" : "name_asc"));
    } else if (column === "rating") {
      setSortBy((prev) => (prev === "rating_desc" ? "followers_desc" : "rating_desc"));
    } else if (column === "status") {
      setSortBy((prev) => (prev === "status" ? "default" : "status"));
    }
  }

  return (
    <Paper elevation={0} className={styles.card}>
      {/* Header */}
      <Box className={styles.cardHeader}>
        <Box className={styles.headerLeft}>
          <Typography className={styles.cardTitle}>Talent Roster Directory</Typography>
          <Typography className={styles.cardSubtitle}>
            Browse, filter, and manage Africa&apos;s leading artists, portfolios, booking rates, and public visibility.
          </Typography>
        </Box>

        <Box className={styles.headerActions}>
          <Box className={styles.viewToggleGroup} role="group" aria-label="Layout view mode">
            <Tooltip title="Adaptive Responsive View (Auto-switches table/cards)">
              <button
                type="button"
                className={`${styles.toggleBtn} ${viewMode === "auto" ? styles.toggleBtnActive : ""}`}
                onClick={() => setViewMode("auto")}
                aria-pressed={viewMode === "auto"}
              >
                <DevicesIcon fontSize="small" />
              </button>
            </Tooltip>
            <Tooltip title="Force Table View">
              <button
                type="button"
                className={`${styles.toggleBtn} ${viewMode === "table" ? styles.toggleBtnActive : ""}`}
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
              >
                <ViewListIcon fontSize="small" />
              </button>
            </Tooltip>
            <Tooltip title="Force Cards View">
              <button
                type="button"
                className={`${styles.toggleBtn} ${viewMode === "cards" ? styles.toggleBtnActive : ""}`}
                onClick={() => setViewMode("cards")}
                aria-pressed={viewMode === "cards"}
              >
                <GridViewIcon fontSize="small" />
              </button>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddClick}
            className={styles.primaryButton}
          >
            Add New Talent
          </Button>
        </Box>
      </Box>

      {/* Filters Bar */}
      <TalentFiltersBar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        categoryFilter={categoryFilter}
        setCategoryFilter={(val) => {
          setCategoryFilter(val);
          setPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sortBy={sortBy}
        setSortBy={setSortBy}
        featuredOnly={featuredOnly}
        setFeaturedOnly={(val) => {
          setFeaturedOnly(val);
          setPage(1);
        }}
        categories={categories}
        totalCount={items.length}
        filteredCount={processedItems.length}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        isUpdating={isUpdating}
      />

      {/* Subtle background filter indicator */}
      {isUpdating && (
        <LinearProgress
          sx={{
            height: 2.5,
            borderRadius: 2,
            my: 0.5,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#B46A2C",
            },
          }}
        />
      )}

      {/* Data Views */}
      {processedItems.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <SearchIcon fontSize="medium" />
          </Box>
          <Typography className={styles.emptyTitle}>No artists found</Typography>
          <Typography className={styles.emptyText}>
            No talent profiles match your current search and filter settings. Try adjusting your query or reset filters.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleResetFilters}
                sx={{ textTransform: "none", color: "#4B5563" }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              className={styles.primaryButton}
            >
              Add New Artist
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {/* AUTO VIEW: Uses CSS media query classes */}
          {viewMode === "auto" && (
            <>
              <Box className={styles.desktopOnly}>
                <TalentDesktopTable
                  items={paginatedItems}
                  getCategoryLabel={getCategoryLabel}
                  onEditClick={onEditClick}
                  onDuplicateClick={onDuplicateClick}
                  onPreviewClick={onPreviewClick}
                  onArchiveClick={onArchiveClick}
                  sortBy={sortBy}
                  onToggleSort={handleToggleSort}
                />
              </Box>
              <Box className={styles.mobileOnly}>
                <TalentMobileCardGrid
                  items={paginatedItems}
                  getCategoryLabel={getCategoryLabel}
                  onEditClick={onEditClick}
                  onDuplicateClick={onDuplicateClick}
                  onPreviewClick={onPreviewClick}
                  onArchiveClick={onArchiveClick}
                />
              </Box>
            </>
          )}

          {/* FORCED TABLE VIEW */}
          {viewMode === "table" && (
            <TalentDesktopTable
              items={paginatedItems}
              getCategoryLabel={getCategoryLabel}
              onEditClick={onEditClick}
              onDuplicateClick={onDuplicateClick}
              onPreviewClick={onPreviewClick}
              onArchiveClick={onArchiveClick}
              sortBy={sortBy}
              onToggleSort={handleToggleSort}
            />
          )}

          {/* FORCED CARDS VIEW */}
          {viewMode === "cards" && (
            <TalentMobileCardGrid
              items={paginatedItems}
              getCategoryLabel={getCategoryLabel}
              onEditClick={onEditClick}
              onDuplicateClick={onDuplicateClick}
              onPreviewClick={onPreviewClick}
              onArchiveClick={onArchiveClick}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box className={styles.paginationBar}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, processedItems.length)} of {processedItems.length} artists
              </span>

              <Box className={styles.paginationControls}>
                <Button
                  size="small"
                  className={styles.pageBtn}
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span style={{ fontSize: "0.8125rem", color: "#4B5563", fontWeight: 600, padding: "0 6px" }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="small"
                  className={styles.pageBtn}
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
}

export default TalentsTable;
