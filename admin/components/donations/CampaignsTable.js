import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import StarIcon from "@mui/icons-material/Star";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./CampaignsTable.module.css";

const CAMPAIGN_STATUS_PILLS = [
  { label: "All Campaigns", value: "" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Archived", value: "archived" },
];

export function CampaignsTable({
  campaigns = [],
  totals = {},
  search = "",
  status = "",
  isUpdating = false,
  onSearchChange,
  onStatusChange,
  onResetFilters,
  onEdit,
  onArchive,
}) {
  return (
    <Box className={styles.wrapper}>
      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder="Search campaigns by title, slug, or summary..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ color: "#9CA3AF", mr: 1 }} />
              ),
              endAdornment: search ? (
                <IconButton
                  size="small"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                </IconButton>
              ) : null,
            }}
          />
          <TextField
            size="small"
            select
            label="Campaign Status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={styles.filterControl}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
        </Box>

        {/* Quick Pills & Results Meta */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Campaign Status Filter">
            {CAMPAIGN_STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.quickPill} ${
                  status === pill.value ? styles.quickPillActive : ""
                }`}
                onClick={() => onStatusChange(pill.value)}
              >
                {pill.label}
              </button>
            ))}
          </Box>

          <Box className={styles.resultsMeta}>
            <span>
              {isUpdating ? (
                <span style={{ color: "#B46A2C", fontWeight: 600 }}>Filtering…</span>
              ) : (
                <>
                  Showing <span className={styles.resultsCount}>{campaigns.length}</span> campaigns
                </>
              )}
            </span>
            {(search || status) && (
              <Button
                size="small"
                startIcon={<FilterListOffIcon fontSize="small" />}
                onClick={onResetFilters}
                className={styles.resetFiltersBtn}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Table Container */}
      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table} size="medium">
          <TableHead>
            <TableRow className={styles.tableHeadRow}>
              <TableCell className={styles.tableHeadCell} style={{ width: "34%" }}>
                Campaign &amp; Banner
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "22%" }}>
                Goal &amp; Progress
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>
                Status
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>
                Spotlight
              </TableCell>
              <TableCell align="right" className={styles.tableHeadCell} style={{ width: "14%" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" className={styles.emptyCell}>
                  <div className={styles.emptyWrap}>
                    <VolunteerActivismOutlinedIcon className={styles.emptyIcon} />
                    <p className={styles.emptyText}>No giving campaigns found matching your query.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((camp) => {
                const targetAmount = Number(camp.body?.targetAmount || camp.targetAmount || 0);
                const campaignTotals = totals.campaigns?.[camp.id] || {};
                const raised = campaignTotals.totalAmount || 0;
                const percent =
                  targetAmount > 0
                    ? Math.min(100, Math.round((raised / targetAmount) * 100))
                    : 0;
                const bannerUrl = camp.body?.image || camp.image;
                const initial = (camp.title || "C").charAt(0).toUpperCase();

                return (
                  <TableRow key={camp.id} hover className={styles.tableRow}>
                    {/* Column 1: Campaign Profile & Cover Image */}
                    <TableCell className={styles.tableCell}>
                      <div className={styles.campaignCell}>
                        <div className={styles.coverThumbnail}>
                          {bannerUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={bannerUrl}
                              alt={camp.title}
                              className={styles.coverImg}
                            />
                          ) : (
                            <div className={styles.coverPlaceholder}>{initial}</div>
                          )}
                        </div>
                        <div className={styles.campaignMeta}>
                          <span className={styles.campaignTitle}>{camp.title}</span>
                          <span className={styles.campaignSlug}>/donations/{camp.slug}</span>
                          {camp.summary && (
                            <p className={styles.campaignSummary}>{camp.summary}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Goal & Progress */}
                    <TableCell className={styles.tableCell}>
                      <Box className={styles.progressWrapper}>
                        <Box className={styles.progressNumbers}>
                          <span className={styles.raisedText}>₦{raised.toLocaleString()}</span>
                          <span className={styles.goalText}>
                            {targetAmount > 0 ? `₦${targetAmount.toLocaleString()}` : "Open Goal"}
                          </span>
                        </Box>
                        {targetAmount > 0 && (
                          <Box className={styles.progressBarTrack}>
                            <Box
                              className={styles.progressBarFill}
                              style={{ width: `${percent}%` }}
                            />
                          </Box>
                        )}
                        {targetAmount > 0 && (
                          <span className={styles.percentLabel}>{percent}% funded</span>
                        )}
                      </Box>
                    </TableCell>

                    {/* Column 3: Status */}
                    <TableCell className={styles.tableCell}>
                      <StatusChip status={camp.status} />
                    </TableCell>

                    {/* Column 4: Spotlight */}
                    <TableCell className={styles.tableCell}>
                      {camp.featured ? (
                        <span className={styles.featuredBadge}>
                          <StarIcon sx={{ fontSize: 11 }} /> Primary Spotlight
                        </span>
                      ) : (
                        <span className={styles.standardLabel}>Standard</span>
                      )}
                    </TableCell>

                    {/* Column 5: Actions Dock */}
                    <TableCell align="right" className={styles.tableCell}>
                      <Box className={styles.actionsDock}>
                        <Tooltip title="View on Public Site">
                          <IconButton
                            size="small"
                            component="a"
                            href={`/donations/${camp.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtn}
                            aria-label={`View live ${camp.title}`}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Campaign">
                          <IconButton
                            size="small"
                            onClick={() => onEdit(camp)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            aria-label={`Edit ${camp.title}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onArchive && (
                          <Tooltip title="Archive Campaign">
                            <IconButton
                              size="small"
                              onClick={() => onArchive(camp.id)}
                              className={`${styles.actionBtn} ${styles.actionBtnArchive}`}
                              aria-label={`Archive ${camp.title}`}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
