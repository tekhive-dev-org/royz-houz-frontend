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
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import GridViewIcon from "@mui/icons-material/GridView";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./EventsTable.module.css";

function formatEventDateBadge(dateString) {
  if (!dateString) return { month: "TBD", day: "—" };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { month: "TBD", day: "—" };
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.getDate(),
  };
}

function formatEventTime(event, body) {
  if (body.time) return body.time;
  if (!event.starts_at) return "Time TBD";
  const date = new Date(event.starts_at);
  if (Number.isNaN(date.getTime())) return "Time TBD";
  try {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: event.timezone || undefined });
  } catch {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
}

function parseVenueAndLocation(event, body = {}) {
  const explicitVenueName = (body.venueName || event.venue_name || "").trim();
  const explicitAddress = (body.venueAddress || event.venue_address || body.location || event.location || "").trim();

  if (explicitVenueName && explicitAddress && explicitVenueName.toLowerCase() !== explicitAddress.toLowerCase()) {
    return {
      venue: explicitVenueName,
      location: explicitAddress,
    };
  }

  const rawVenue = explicitVenueName || body.venue || explicitAddress || "Venue TBD";
  const commaIdx = rawVenue.indexOf(",");
  if (commaIdx > -1) {
    const venuePart = rawVenue.substring(0, commaIdx).trim();
    const locPart = rawVenue.substring(commaIdx + 1).trim();
    return {
      venue: venuePart || "Venue TBD",
      location: locPart,
    };
  }

  return {
    venue: rawVenue || "Venue TBD",
    location: "",
  };
}

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
];

export function EventsTable({
  items = [],
  categories = [],
  search = "",
  setSearch,
  status = "",
  setStatus,
  isUpdating = false,
  onAddClick,
  onEditClick,
  onPreviewClick,
  onArchiveClick,
  onDuplicateClick,
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

  function getCategoryLabel(item) {
    const body = item.body || {};
    if (item.primaryCategoryId && categoryMap.has(item.primaryCategoryId)) {
      return categoryMap.get(item.primaryCategoryId);
    }
    if (body.category && categoryMap.has(body.category)) {
      return categoryMap.get(body.category);
    }
    return body.category || item.category || "General Event";
  }

  const processedItems = useMemo(() => {
    let result = [...items];

    if (categoryFilter) {
      result = result.filter((item) => {
        const body = item.body || {};
        return (
          item.primaryCategoryId === categoryFilter ||
          (Array.isArray(item.categoryIds) && item.categoryIds.includes(categoryFilter)) ||
          body.category === categoryFilter
        );
      });
    }

    if (featuredOnly) {
      result = result.filter((e) => Boolean(e.featured));
    }

    if (sortBy === "title_asc") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "title_desc") {
      result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortBy === "date_asc") {
      result.sort((a, b) => new Date(a.body?.startDate || a.date || 0) - new Date(b.body?.startDate || b.date || 0));
    } else if (sortBy === "date_desc") {
      result.sort((a, b) => new Date(b.body?.startDate || b.date || 0) - new Date(a.body?.startDate || a.date || 0));
    } else if (sortBy === "status") {
      result.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    }

    return result;
  }, [items, categoryFilter, featuredOnly, sortBy]);

  const totalPages = Math.ceil(processedItems.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedItems.slice(start, start + pageSize);
  }, [processedItems, currentPage, pageSize]);

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
          <Typography className={styles.cardTitle}>Event Experiences Directory</Typography>
          <Typography className={styles.cardSubtitle}>
            Manage concert dates, showcases, ticket reservations, venue details, and public event visibility.
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
            Create New Event
          </Button>
        </Box>
      </Box>

      {/* Filters Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder="Search events by title, venue, or description..."
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
            label="Publication Status"
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
            <MenuItem value="date_desc">Date (Upcoming First)</MenuItem>
            <MenuItem value="date_asc">Date (Oldest First)</MenuItem>
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
                  Showing <span className={styles.resultsCount}>{processedItems.length}</span> of{" "}
                  <span className={styles.resultsCount}>{items.length}</span> events
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
      {processedItems.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <SearchIcon fontSize="medium" />
          </Box>
          <Typography className={styles.emptyTitle}>No events found</Typography>
          <Typography className={styles.emptyText}>
            No event experiences match your current search and filter settings. Try adjusting your query or reset filters.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            {hasActiveFilters && (
              <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ textTransform: "none" }}>
                Clear Filters
              </Button>
            )}
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAddClick} className={styles.primaryButton}>
              Create New Event
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          {/* AUTO VIEW */}
          {viewMode === "auto" && (
            <>
              <Box className={styles.desktopOnly}>
                <EventsDesktopTable
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
                <EventsMobileCardGrid
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
            <EventsDesktopTable
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
            <EventsMobileCardGrid
              items={paginatedItems}
              getCategoryLabel={getCategoryLabel}
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
                {Math.min(currentPage * pageSize, processedItems.length)} of {processedItems.length} events
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

function EventsDesktopTable({ items, getCategoryLabel, onEditClick, onDuplicateClick, onPreviewClick, onArchiveClick, sortBy, onToggleSort }) {
  return (
    <TableContainer className={styles.tableContainer}>
      <Table className={styles.table} size="medium">
        <TableHead>
          <TableRow className={styles.tableHeadRow}>
            <TableCell className={styles.tableHeadCell} style={{ width: "32%" }}>
              <TableSortLabel
                active={sortBy === "title_asc" || sortBy === "title_desc"}
                direction={sortBy === "title_desc" ? "desc" : "asc"}
                onClick={() => onToggleSort("title")}
              >
                Event Title &amp; Date
              </TableSortLabel>
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>
              Discipline / Category
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "20%" }}>
              <TableSortLabel
                active={sortBy === "date_asc" || sortBy === "date_desc"}
                direction={sortBy === "date_desc" ? "desc" : "asc"}
                onClick={() => onToggleSort("date")}
              >
                Venue &amp; Timing
              </TableSortLabel>
            </TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Spotlight</TableCell>
            <TableCell className={styles.tableHeadCell} style={{ width: "10%" }}>
              <TableSortLabel active={sortBy === "status"} direction="asc" onClick={() => onToggleSort("status")}>
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" className={styles.tableHeadCell} style={{ width: "10%", minWidth: "150px" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((event) => {
            const body = event.body || {};
            const title = body.title || event.title || "Untitled Event";
            const coverImage = body.image || event.image || body.heroImage || event.heroImage || "";
            const dateBadge = formatEventDateBadge(body.startDate || event.starts_at || event.date);
            const category = getCategoryLabel(event);
            const venueInfo = parseVenueAndLocation(event, body);
            const time = formatEventTime(event, body);
            const isPopular = Boolean(body.isPopular || event.isPopular);

            return (
              <TableRow key={event.id} hover className={styles.tableRow}>
                {/* Title & Date Badge */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.eventCell}>
                    <Box className={styles.eventVisualGroup}>
                      {coverImage ? (
                        <Avatar
                          src={coverImage}
                          alt={title}
                          variant="rounded"
                          className={styles.eventCoverAvatar}
                        >
                          {title.slice(0, 2).toUpperCase()}
                        </Avatar>
                      ) : null}
                      <Box className={styles.calendarDateBadge}>
                        <span className={styles.calendarMonth}>{dateBadge.month}</span>
                        <span className={styles.calendarDay}>{dateBadge.day}</span>
                      </Box>
                    </Box>
                    <Box className={styles.eventMeta}>
                      <span className={styles.eventTitle}>
                        <a
                          href={`/events/${event.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.eventTitleLink}
                        >
                          {title}
                        </a>
                      </span>
                      <span className={styles.eventSlugPill}>/events/{event.slug}</span>
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

                {/* Venue & Timing */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.venueBlock}>
                    <span className={styles.venueName} title={venueInfo.venue}>
                      {venueInfo.venue}
                    </span>
                    <Box className={styles.venueMetaRow}>
                      {venueInfo.location ? (
                        <span className={styles.venueLocation} title={venueInfo.location}>
                          <PlaceOutlinedIcon sx={{ fontSize: 12, color: "#94A3B8" }} />
                          <span>{venueInfo.location}</span>
                        </span>
                      ) : null}
                      <span className={styles.timingBadge} title={`Event starts at ${time}`}>
                        <AccessTimeOutlinedIcon sx={{ fontSize: 11, color: "#B46A2C" }} />
                        <span>{time}</span>
                      </span>
                    </Box>
                  </Box>
                </TableCell>

                {/* Spotlight */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.flagsContainer}>
                    {event.featured && (
                      <span className={styles.featuredBadge}>
                        <StarIcon sx={{ fontSize: 11 }} /> Featured
                      </span>
                    )}
                    {isPopular && (
                      <span className={styles.popularBadge}>
                        <LocalFireDepartmentIcon sx={{ fontSize: 11 }} /> Popular
                      </span>
                    )}
                    {!event.featured && !isPopular && (
                      <span className={styles.standardBadge}>—</span>
                    )}
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell className={styles.tableCell}>
                  <StatusChip status={event.status} />
                </TableCell>

                {/* Actions */}
                <TableCell align="right" className={styles.tableCell}>
                  <Box className={styles.actionsDock}>
                    <Tooltip title="View Live Web Event">
                      <IconButton
                        size="small"
                        component="a"
                        href={`/events/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionBtn}
                        aria-label={`View live event ${title}`}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview Record Payload">
                      <IconButton
                        size="small"
                        onClick={() => onPreviewClick(event)}
                        className={styles.actionBtn}
                        aria-label={`Preview payload for ${title}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onDuplicateClick && (
                      <Tooltip title="Duplicate Event">
                        <IconButton
                          size="small"
                          onClick={() => onDuplicateClick(event)}
                          className={styles.actionBtn}
                          aria-label={`Duplicate ${title}`}
                        >
                          <ContentCopyOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Event Details">
                      <IconButton
                        size="small"
                        onClick={() => onEditClick(event)}
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        aria-label={`Edit ${title}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive Event">
                      <IconButton
                        size="small"
                        onClick={() => onArchiveClick(event)}
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

function EventsMobileCardGrid({ items, getCategoryLabel, onEditClick, onDuplicateClick, onPreviewClick, onArchiveClick }) {
  return (
    <Box className={styles.cardsGrid}>
      {items.map((event) => {
        const body = event.body || {};
        const title = body.title || event.title || "Untitled Event";
        const coverImage = body.image || event.image || body.heroImage || event.heroImage || "";
        const dateBadge = formatEventDateBadge(body.startDate || event.starts_at || event.date);
        const time = formatEventTime(event, body);
        const category = getCategoryLabel(event);
        const venueInfo = parseVenueAndLocation(event, body);
        const isPopular = Boolean(body.isPopular || event.isPopular);
        const description = body.description || body.excerpt || body.summary || event.description || "";
        const price = body.price || body.ticketPrice || (body.isFree ? "Free Entry" : "");

        return (
          <Box key={event.id} className={styles.eventCard}>
            {/* 1. Cover Banner */}
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
                  <ConfirmationNumberOutlinedIcon sx={{ fontSize: 48, color: "#B46A2C", opacity: 0.6 }} />
                </Box>
              )}

              {/* Floating Category & Badges (Top-Left) */}
              <Box className={styles.cardCoverFloatingTopLeft}>
                <span className={styles.cardCategoryFloating}>
                  <span className={styles.cardCategoryDot} />
                  {category}
                </span>
                {isPopular && (
                  <span className={styles.cardBadgeFloating}>
                    <LocalFireDepartmentIcon sx={{ fontSize: 11, mr: 0.3 }} /> Hot
                  </span>
                )}
              </Box>

              {/* Floating Publication Status (Top-Right) */}
              <Box className={styles.cardCoverFloatingTopRight}>
                <StatusChip status={event.status} />
              </Box>

              {/* Floating Spotlight & Date/Time (Bottom Row) */}
              <Box className={styles.cardCoverFloatingBottom}>
                {event.featured ? (
                  <span className={styles.featuredBadge}>
                    <StarIcon sx={{ fontSize: 11 }} /> Featured
                  </span>
                ) : (
                  <span />
                )}

                <span className={styles.cardDateTimeFloating}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 12 }} />
                  {dateBadge.month} {dateBadge.day} • {time}
                </span>
              </Box>
            </Box>

            {/* 2. Card Content Body */}
            <Box className={styles.cardBody}>
              <a
                href={`/events/${event.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardTitleLink}
                title={title}
              >
                {title}
              </a>

              {description && (
                <Typography variant="body2" className={styles.cardExcerpt}>
                  {description}
                </Typography>
              )}

              <span className={styles.cardSlugPill} title={`/events/${event.slug}`}>
                /events/{event.slug}
              </span>
            </Box>

            {/* 3. Venue & Admission Highlights */}
            <Box className={styles.cardHighlightsBar}>
              <span className={styles.cardVenueTag} title={`${venueInfo.venue}${venueInfo.location ? ` • ${venueInfo.location}` : ""}`}>
                <PlaceOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                {venueInfo.venue}{venueInfo.location ? ` • ${venueInfo.location}` : ""}
              </span>

              {price ? (
                <span className={styles.cardPriceTag} title="Admission">
                  <ConfirmationNumberOutlinedIcon sx={{ fontSize: 12 }} />
                  {price}
                </span>
              ) : null}
            </Box>

            {/* 4. Footer Actions */}
            <Box className={styles.cardFooterActions}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onEditClick(event)}
                startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                className={styles.cardPrimaryEditBtn}
              >
                Edit Event
              </Button>

              <Box className={styles.cardIconActions}>
                <Tooltip title="View Live Web Event">
                  <IconButton
                    size="small"
                    component="a"
                    href={`/events/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    aria-label={`View live event ${title}`}
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {onDuplicateClick && (
                  <Tooltip title="Duplicate Event">
                    <IconButton
                      size="small"
                      onClick={() => onDuplicateClick(event)}
                      className={styles.actionBtn}
                      aria-label={`Duplicate ${title}`}
                    >
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Preview Record Payload">
                  <IconButton
                    size="small"
                    onClick={() => onPreviewClick(event)}
                    className={styles.actionBtn}
                    aria-label={`Preview payload for ${title}`}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Archive Event">
                  <IconButton
                    size="small"
                    onClick={() => onArchiveClick(event)}
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

export default EventsTable;
