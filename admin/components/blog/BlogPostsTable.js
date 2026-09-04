import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import GridViewIcon from "@mui/icons-material/GridView";
import HistoryIcon from "@mui/icons-material/History";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./BlogPostsTable.module.css";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
];

export function BlogPostsTable({
  posts = [],
  authors = [],
  categories = [],
  search = "",
  setSearch,
  status = "",
  setStatus,
  isUpdating = false,
  onAddClick,
  onEditClick,
  onDuplicateClick,
  onPreviewClick,
  onRevisionsClick,
  onArchiveClick,
}) {
  const [viewMode, setViewMode] = useState("auto");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      if (cat.id) map.set(cat.id, cat.title || cat.name);
      if (cat.slug) map.set(cat.slug, cat.title || cat.name);
    });
    return map;
  }, [categories]);

  const authorMap = useMemo(() => {
    const map = new Map();
    authors.forEach((author) => {
      const authorBody = author.body || {};
      const data = {
        name: author.name || author.title || author.email || "Royz House Editorial",
        role: author.role || authorBody.role || "STAFF WRITER",
        avatar: author.avatar || authorBody.avatar || "",
      };
      if (author.id) map.set(author.id, data);
      if (author.slug) map.set(author.slug, data);
      if (data.name) map.set(data.name.toLowerCase(), data);
    });
    return map;
  }, [authors]);

  function getCategoryLabel(post) {
    const body = post.body || {};
    if (post.primaryCategoryId && categoryMap.has(post.primaryCategoryId)) {
      return categoryMap.get(post.primaryCategoryId);
    }
    if (body.primaryCategoryId && categoryMap.has(body.primaryCategoryId)) {
      return categoryMap.get(body.primaryCategoryId);
    }
    return body.category || post.category || "Editorial";
  }

  function getAuthorData(post) {
    const body = post.body || {};
    const authorId = post.authorId || body.authorId || post.blog_author_id || body.blog_author_id;
    if (authorId && authorMap.has(authorId)) {
      return authorMap.get(authorId);
    }
    const authorName = body.author || post.author;
    if (authorName && authorMap.has(authorName.toLowerCase())) {
      return authorMap.get(authorName.toLowerCase());
    }
    return {
      name: authorName || "Royz House Editorial",
      role: body.role || "EDITORIAL",
      avatar: body.authorAvatar || post.authorAvatar || "",
    };
  }

  function formatArticleDate(raw) {
    if (!raw) return "";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  }

  const processedPosts = useMemo(() => {
    let result = [...posts];

    if (categoryFilter) {
      result = result.filter((post) => {
        const body = post.body || {};
        return (
          post.primaryCategoryId === categoryFilter ||
          body.primaryCategoryId === categoryFilter ||
          (Array.isArray(post.categoryIds) && post.categoryIds.includes(categoryFilter))
        );
      });
    }

    if (featuredOnly) {
      result = result.filter((p) => Boolean(p.featured));
    }

    if (sortBy === "title_asc") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "title_desc") {
      result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortBy === "date_desc") {
      result.sort((a, b) => new Date(b.created_at || b.displayDate || 0) - new Date(a.created_at || a.displayDate || 0));
    } else if (sortBy === "date_asc") {
      result.sort((a, b) => new Date(a.created_at || a.displayDate || 0) - new Date(b.created_at || b.displayDate || 0));
    } else if (sortBy === "status") {
      result.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    }

    return result;
  }, [posts, categoryFilter, featuredOnly, sortBy]);

  const totalPages = Math.ceil(processedPosts.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedPosts.slice(start, start + pageSize);
  }, [processedPosts, currentPage, pageSize]);

  const hasActiveFilters = Boolean(search || status || categoryFilter || featuredOnly || sortBy !== "default");

  function handleResetFilters() {
    if (setSearch) setSearch("");
    if (setStatus) setStatus("");
    setCategoryFilter("");
    setFeaturedOnly(false);
    setSortBy("default");
    setPage(1);
  }

  function handleToggleSort(col) {
    if (col === "title") {
      setSortBy((prev) => (prev === "title_asc" ? "title_desc" : "title_asc"));
    } else if (col === "date") {
      setSortBy((prev) => (prev === "date_desc" ? "date_asc" : "date_desc"));
    } else if (col === "status") {
      setSortBy((prev) => (prev === "status" ? "default" : "status"));
    }
  }

  return (
    <Paper elevation={0} className={styles.card}>
      {/* Header */}
      <Box className={styles.cardHeader}>
        <Box className={styles.headerLeft}>
          <Typography className={styles.cardTitle}>Editorial Articles &amp; Insights</Typography>
          <Typography className={styles.cardSubtitle}>
            Publish cultural essays, industry reports, artist features, and thought leadership articles.
          </Typography>
        </Box>

        <Box className={styles.headerActions}>
          <Box className={styles.viewToggleGroup} role="group" aria-label="Layout view mode">
            <Tooltip title="Adaptive Responsive View">
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
            Compose New Article
          </Button>
        </Box>
      </Box>

      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder="Search articles by title, author, or excerpt..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
                    aria-label="Clear search"
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
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className={styles.filterSelect}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id || cat.slug} value={cat.id || cat.slug}>
                {cat.title || cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
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
            <MenuItem value="date_desc">Publication Date (Newest)</MenuItem>
            <MenuItem value="date_asc">Publication Date (Oldest)</MenuItem>
            <MenuItem value="title_asc">Title (A → Z)</MenuItem>
            <MenuItem value="title_desc">Title (Z → A)</MenuItem>
            <MenuItem value="status">Status</MenuItem>
          </TextField>
        </Box>

        {/* Quick Filter Pills */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Status filters">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.quickPill} ${status === opt.value && !featuredOnly ? styles.quickPillActive : ""}`}
                onClick={() => {
                  setFeaturedOnly(false);
                  setStatus(opt.value);
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
                  Showing <span className={styles.resultsCount}>{processedPosts.length}</span> of{" "}
                  <span className={styles.resultsCount}>{posts.length}</span> articles
                </>
              )}
            </span>
            {hasActiveFilters && (
              <Button
                size="small"
                startIcon={<FilterListOffIcon fontSize="small" />}
                onClick={handleResetFilters}
                className={styles.resetFiltersBtn}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Subtle Background Updating Line */}
      {isUpdating && (
        <LinearProgress
          sx={{
            height: 2.5,
            borderRadius: 2,
            my: 0.5,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": { backgroundColor: "#B46A2C" },
          }}
        />
      )}

      {/* Data Views */}
      {processedPosts.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <SearchIcon fontSize="medium" />
          </Box>
          <Typography className={styles.emptyTitle}>No articles found</Typography>
          <Typography className={styles.emptyText}>
            No articles match your current search and filter settings. Try adjusting your search query or reset filters.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            {hasActiveFilters && (
              <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ textTransform: "none" }}>
                Clear Filters
              </Button>
            )}
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddClick} className={styles.primaryButton}>
              Compose Article
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {/* AUTO VIEW */}
          {viewMode === "auto" && (
            <>
              <Box className={styles.desktopOnly}>
                <BlogDesktopTable
                  posts={paginatedPosts}
                  getCategoryLabel={getCategoryLabel}
                  getAuthorData={getAuthorData}
                  formatArticleDate={formatArticleDate}
                  onEditClick={onEditClick}
                  onDuplicateClick={onDuplicateClick}
                  onPreviewClick={onPreviewClick}
                  onRevisionsClick={onRevisionsClick}
                  onArchiveClick={onArchiveClick}
                  sortBy={sortBy}
                  onToggleSort={handleToggleSort}
                />
              </Box>
              <Box className={styles.mobileOnly}>
                <BlogMobileCardGrid
                  posts={paginatedPosts}
                  getCategoryLabel={getCategoryLabel}
                  getAuthorData={getAuthorData}
                  formatArticleDate={formatArticleDate}
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
            <BlogDesktopTable
              posts={paginatedPosts}
              getCategoryLabel={getCategoryLabel}
              getAuthorData={getAuthorData}
              formatArticleDate={formatArticleDate}
              onEditClick={onEditClick}
              onDuplicateClick={onDuplicateClick}
              onPreviewClick={onPreviewClick}
              onRevisionsClick={onRevisionsClick}
              onArchiveClick={onArchiveClick}
              sortBy={sortBy}
              onToggleSort={handleToggleSort}
            />
          )}

          {/* FORCED CARDS VIEW */}
          {viewMode === "cards" && (
            <BlogMobileCardGrid
              posts={paginatedPosts}
              getCategoryLabel={getCategoryLabel}
              getAuthorData={getAuthorData}
              formatArticleDate={formatArticleDate}
              onEditClick={onEditClick}
              onDuplicateClick={onDuplicateClick}
              onPreviewClick={onPreviewClick}
              onArchiveClick={onArchiveClick}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box className={styles.paginationBar}>
              <span className={styles.paginationInfo}>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, processedPosts.length)} of {processedPosts.length} articles
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

function BlogDesktopTable({
  posts,
  getCategoryLabel,
  getAuthorData,
  formatArticleDate,
  onEditClick,
  onDuplicateClick,
  onPreviewClick,
  onRevisionsClick,
  onArchiveClick,
  sortBy,
  onToggleSort,
}) {
  return (
    <TableContainer className={styles.tableContainer}>
      <Table className={styles.table} size="medium">
        <TableHead>
          <TableRow className={styles.tableHeadRow}>
            <TableCell className={styles.tableHeadCell} style={{ width: "38%" }}>
              <TableSortLabel
                active={sortBy === "title_asc" || sortBy === "title_desc"}
                direction={sortBy === "title_desc" ? "desc" : "asc"}
                onClick={() => onToggleSort("title")}
              >
                Article Title &amp; Details
              </TableSortLabel>
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>
              Category
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "17%" }}>
              Author
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "11%" }}>
              Spotlight
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "10%" }}>
              <TableSortLabel active={sortBy === "status"} direction="asc" onClick={() => onToggleSort("status")}>
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" className={styles.tableHeadCell} style={{ width: "130px" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {posts.map((post) => {
            const body = post.body || {};
            const title = body.title || post.title || "Untitled Article";
            const coverImage = body.image || post.image;
            const category = getCategoryLabel(post);
            const authorData = getAuthorData(post);
            const readTime = body.readTime || post.readTime || "4 min read";
            const badge = body.badge || post.badge;
            const displayDate = formatArticleDate(body.displayDate || post.displayDate || post.created_at);

            const dotClass =
              post.status === "published"
                ? styles.dotPublished
                : post.status === "draft"
                ? styles.dotDraft
                : post.status === "scheduled"
                ? styles.dotScheduled
                : styles.dotArchived;

            return (
              <TableRow key={post.id} hover className={styles.tableRow}>
                {/* Title & Cover */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.postCell}>
                    <Tooltip title={`Cover for "${title}"`} placement="top-start">
                      <Box className={styles.avatarWrapper}>
                        <Avatar
                          src={coverImage}
                          alt={title}
                          variant="rounded"
                          className={styles.avatar}
                        >
                          <ArticleOutlinedIcon sx={{ fontSize: 24, color: "#B46A2C" }} />
                        </Avatar>
                        <span className={`${styles.avatarStatusDot} ${dotClass}`} />
                      </Box>
                    </Tooltip>

                    <Box className={styles.postMeta}>
                      <Box className={styles.postTitleRow}>
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.postTitleLink}
                          title={title}
                        >
                          {title}
                        </a>
                        {badge && <span className={styles.badgePill}>{badge}</span>}
                      </Box>

                      <Box className={styles.postSubMeta}>
                        <span className={styles.postSlugPill} title={`/blog/${post.slug}`}>
                          /blog/{post.slug}
                        </span>
                        <span className={styles.dotSeparator}>•</span>
                        <span className={styles.readTime}>
                          <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                          {readTime}
                        </span>
                        {displayDate && (
                          <>
                            <span className={styles.dotSeparator}>•</span>
                            <span className={styles.displayDate}>{displayDate}</span>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* Category */}
                <TableCell className={styles.tableCell}>
                  <span className={styles.categoryPill}>
                    <span className={styles.categoryDot} />
                    {category}
                  </span>
                </TableCell>

                {/* Author */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.authorContainer}>
                    <Avatar
                      src={authorData.avatar}
                      alt={authorData.name}
                      className={styles.authorAvatarImg}
                    >
                      {authorData.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box className={styles.authorTextWrap}>
                      <span className={styles.authorNameText} title={authorData.name}>
                        {authorData.name}
                      </span>
                      <span className={styles.authorRoleText}>
                        {authorData.role || "EDITORIAL"}
                      </span>
                    </Box>
                  </Box>
                </TableCell>

                {/* Spotlight */}
                <TableCell className={styles.tableCell}>
                  {post.featured ? (
                    <span className={styles.featuredBadge}>
                      <StarIcon sx={{ fontSize: 11 }} /> Featured
                    </span>
                  ) : (
                    <span className={styles.standardBadge}>Standard</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className={styles.tableCell}>
                  <StatusChip status={post.status} />
                </TableCell>

                {/* Actions */}
                <TableCell align="right" className={styles.tableCell}>
                  <Box className={styles.actionsDock}>
                    <Tooltip title="View Live Article">
                      <IconButton
                        size="small"
                        component="a"
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionBtn}
                        aria-label={`View live ${title}`}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onRevisionsClick && (
                      <Tooltip title="Version History">
                        <IconButton
                          size="small"
                          onClick={() => onRevisionsClick(post.id)}
                          className={styles.actionBtn}
                          aria-label={`View revisions for ${title}`}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Inspect Payload">
                      <IconButton
                        size="small"
                        onClick={() => onPreviewClick(post)}
                        className={styles.actionBtn}
                        aria-label={`Inspect ${title}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onDuplicateClick && (
                      <Tooltip title="Duplicate Article">
                        <IconButton
                          size="small"
                          onClick={() => onDuplicateClick(post)}
                          className={styles.actionBtn}
                          aria-label={`Duplicate ${title}`}
                        >
                          <ContentCopyOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Article">
                      <IconButton
                        size="small"
                        onClick={() => onEditClick(post)}
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        aria-label={`Edit ${title}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive Article">
                      <IconButton
                        size="small"
                        onClick={() => onArchiveClick(post)}
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        aria-label={`Archive ${title}`}
                      >
                        <ArchiveOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function BlogMobileCardGrid({
  posts,
  getCategoryLabel,
  getAuthorData,
  formatArticleDate,
  onEditClick,
  onDuplicateClick,
  onPreviewClick,
  onArchiveClick,
}) {
  return (
    <Box className={styles.cardsGrid}>
      {posts.map((post) => {
        const body = post.body || {};
        const title = body.title || post.title || "Untitled Article";
        const coverImage = body.image || post.image;
        const category = getCategoryLabel(post);
        const authorData = getAuthorData(post);
        const readTime = body.readTime || post.readTime || "4 min read";
        const badge = body.badge || post.badge;
        const summary = body.summary || post.summary || body.excerpt || post.excerpt || "";
        const displayDate = formatArticleDate(body.displayDate || post.displayDate || post.created_at);

        return (
          <Box key={post.id} className={styles.postCard}>
            {/* 1. Top Cover Banner */}
            <Box className={styles.cardCoverBanner}>
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt={title}
                  className={styles.cardCoverImg}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Box className={styles.cardCoverPlaceholder}>
                  <ArticleOutlinedIcon sx={{ fontSize: 48, color: "#B46A2C", opacity: 0.6 }} />
                </Box>
              )}

              {/* Floating Category Badge */}
              <Box className={styles.cardCoverFloatingTopLeft}>
                <span className={styles.cardCategoryFloating}>
                  <span className={styles.categoryDot} />
                  {category}
                </span>
                {badge && <span className={styles.cardBadgeFloating}>{badge}</span>}
              </Box>

              {/* Floating Publication Status */}
              <Box className={styles.cardCoverFloatingTopRight}>
                <StatusChip status={post.status} />
              </Box>

              {/* Floating Spotlight and Read Time */}
              <Box className={styles.cardCoverFloatingBottom}>
                {post.featured ? (
                  <span className={styles.featuredBadge}>
                    <StarIcon sx={{ fontSize: 11 }} /> Featured
                  </span>
                ) : (
                  <span />
                )}
                {readTime && (
                  <span className={styles.cardReadTimeFloating}>
                    <AccessTimeOutlinedIcon sx={{ fontSize: 12 }} />
                    {readTime}
                  </span>
                )}
              </Box>
            </Box>

            {/* 2. Card Content Body */}
            <Box className={styles.cardBody}>
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardTitleLink}
                title={title}
              >
                {title}
              </a>

              {summary && (
                <Typography variant="body2" className={styles.cardExcerpt}>
                  {summary}
                </Typography>
              )}

              <span className={styles.postSlugPill} title={`/blog/${post.slug}`}>
                /blog/{post.slug}
              </span>
            </Box>

            {/* 3. Author & Date Bar */}
            <Box className={styles.cardAuthorBar}>
              <Box className={styles.authorContainer}>
                <Avatar
                  src={authorData.avatar}
                  alt={authorData.name}
                  className={styles.authorAvatarImg}
                >
                  {authorData.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box className={styles.authorTextWrap}>
                  <span className={styles.authorNameText} title={authorData.name}>
                    {authorData.name}
                  </span>
                  <span className={styles.authorRoleText}>
                    {authorData.role || "EDITORIAL"}
                  </span>
                </Box>
              </Box>
              {displayDate && <span className={styles.displayDate}>{displayDate}</span>}
            </Box>

            {/* 4. Action Buttons Bar */}
            <Box className={styles.cardFooterActions}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onEditClick(post)}
                startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                className={styles.cardPrimaryEditBtn}
              >
                Edit Article
              </Button>

              <Box className={styles.cardIconActions}>
                <Tooltip title="View Live Article">
                  <IconButton
                    size="small"
                    component="a"
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    aria-label={`View live ${title}`}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Inspect JSON Payload">
                  <IconButton
                    size="small"
                    onClick={() => onPreviewClick(post)}
                    className={styles.actionBtn}
                    aria-label={`Inspect ${title}`}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {onDuplicateClick && (
                  <Tooltip title="Duplicate Article">
                    <IconButton
                      size="small"
                      onClick={() => onDuplicateClick(post)}
                      className={styles.actionBtn}
                      aria-label={`Duplicate ${title}`}
                    >
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Archive Article">
                  <IconButton
                    size="small"
                    onClick={() => onArchiveClick(post)}
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    aria-label={`Archive ${title}`}
                  >
                    <ArchiveOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default BlogPostsTable;
