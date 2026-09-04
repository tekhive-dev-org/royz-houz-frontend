import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./TalentsTable.module.css";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
];

export function TalentFiltersBar({
  search = "",
  setSearch,
  categoryFilter = "",
  setCategoryFilter,
  statusFilter = "",
  setStatusFilter,
  sortBy = "default",
  setSortBy,
  featuredOnly = false,
  setFeaturedOnly,
  categories = [],
  totalCount = 0,
  filteredCount = 0,
  hasActiveFilters = false,
  onResetFilters,
  isUpdating = false,
}) {
  return (
    <Box className={styles.controlsBar}>
      {/* Primary Input Controls */}
      <Box className={styles.filtersRow}>
        <TextField
          size="small"
          placeholder="Search by artist name, location, or biography..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch("")}
                  aria-label="Clear search query"
                  sx={{ color: "#9CA3AF" }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <TextField
          select
          size="small"
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id || cat.slug} value={cat.id || cat.slug}>
              {cat.title}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <MenuItem value="default">Default Order</MenuItem>
          <MenuItem value="name_asc">Name (A → Z)</MenuItem>
          <MenuItem value="name_desc">Name (Z → A)</MenuItem>
          <MenuItem value="rating_desc">Highest Rated</MenuItem>
          <MenuItem value="followers_desc">Most Followers</MenuItem>
          <MenuItem value="status">Publication Status</MenuItem>
        </TextField>
      </Box>

      {/* Quick Pills and Meta Count */}
      <Box className={styles.quickFiltersRow}>
        <Box className={styles.quickPills} role="group" aria-label="Quick status filters">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.quickPill} ${
                statusFilter === opt.value && !featuredOnly ? styles.quickPillActive : ""
              }`}
              onClick={() => {
                setFeaturedOnly(false);
                setStatusFilter(opt.value);
              }}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.quickPill} ${featuredOnly ? styles.quickPillActive : ""}`}
            onClick={() => setFeaturedOnly((prev) => !prev)}
          >
            ★ Featured Spotlight
          </button>
        </Box>

        <Box className={styles.resultsMeta}>
          <span>
            {isUpdating ? (
              <span style={{ color: "#B46A2C", fontWeight: 600 }}>Filtering…</span>
            ) : (
              <>
                Showing <span className={styles.resultsCount}>{filteredCount}</span> of{" "}
                <span className={styles.resultsCount}>{totalCount}</span> artists
              </>
            )}
          </span>
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<FilterListOffIcon fontSize="small" />}
              onClick={onResetFilters}
              className={styles.resetFiltersBtn}
            >
              Reset Filters
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default TalentFiltersBar;
