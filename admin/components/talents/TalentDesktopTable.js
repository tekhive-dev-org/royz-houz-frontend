import {
  Avatar,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import StarIcon from "@mui/icons-material/Star";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./TalentsTable.module.css";

function getTalentInitials(name = "") {
  if (!name) return "TH";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TalentDesktopTable({
  items = [],
  getCategoryLabel,
  onEditClick,
  onDuplicateClick,
  onPreviewClick,
  onArchiveClick,
  sortBy = "default",
  onToggleSort,
}) {
  return (
    <TableContainer className={styles.tableContainer}>
      <Table className={styles.table} size="medium">
        <TableHead>
          <TableRow className={styles.tableHeadRow}>
            <TableCell className={styles.tableHeadCell} style={{ width: "30%" }}>
              <TableSortLabel
                active={sortBy === "name_asc" || sortBy === "name_desc"}
                direction={sortBy === "name_desc" ? "desc" : "asc"}
                onClick={() => onToggleSort("name")}
              >
                Talent Profile
              </TableSortLabel>
            </TableCell>

            <TableCell className={styles.tableHeadCell} style={{ width: "18%" }}>
              Discipline &amp; Specialty
            </TableCell>

            <TableCell className={styles.tableHeadCell} style={{ width: "22%" }}>
              <TableSortLabel
                active={sortBy === "followers_desc" || sortBy === "rating_desc"}
                direction={sortBy === "followers_desc" ? "desc" : "asc"}
                onClick={() => onToggleSort("rating")}
              >
                Location &amp; Reach
              </TableSortLabel>
            </TableCell>

            <TableCell className={styles.tableHeadCell} style={{ width: "10%" }}>
              Spotlight
            </TableCell>

            <TableCell className={styles.tableHeadCell} style={{ width: "10%" }}>
              <TableSortLabel
                active={sortBy === "status"}
                direction="asc"
                onClick={() => onToggleSort("status")}
              >
                Status
              </TableSortLabel>
            </TableCell>

            <TableCell align="right" className={styles.tableHeadCell} style={{ width: "10%", minWidth: "150px" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => {
            const body = item.body || {};
            const name = body.name || item.title || "Untitled Talent";
            const category = getCategoryLabel(item);
            const genre = body.genre;
            const badge = body.badge;
            const subtitle = body.subtitle || body.profession;
            const image = body.image || "/assets/img/talents/julius.jpg";
            const rating = body.rating || "5.0";
            const followers = body.followers || "N/A";
            const location = item.location || body.location || "Africa";
            const isHot = Boolean(body.isHot);
            const bookingPrice = body.bookingPrice;
            const availability = body.availability;
            const awardsCount = Array.isArray(body.awards) ? body.awards.length : 0;

            const dotClass =
              item.status === "published"
                ? styles.dotPublished
                : item.status === "draft"
                ? styles.dotDraft
                : item.status === "scheduled"
                ? styles.dotScheduled
                : styles.dotArchived;

            return (
              <TableRow key={item.id} hover className={styles.tableRow}>
                {/* Talent Profile Column */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.talentCell}>
                    <Tooltip title={body.bio ? body.bio.slice(0, 160) + "…" : name} placement="top-start">
                      <Box className={styles.avatarWrapper}>
                        <Avatar
                          src={image}
                          alt={name}
                          variant="rounded"
                          className={styles.avatar}
                        >
                          {getTalentInitials(name)}
                        </Avatar>
                        <span className={`${styles.avatarStatusDot} ${dotClass}`} />
                      </Box>
                    </Tooltip>

                    <Box className={styles.talentMeta}>
                      <Box className={styles.talentName}>
                        <a
                          href={`/talents/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.talentNameLink}
                        >
                          {name}
                        </a>
                        {badge && <span className={styles.talentBadge}>{badge}</span>}
                      </Box>

                      {subtitle ? (
                        <span className={styles.talentSubtitle} title={subtitle}>
                          {subtitle}
                        </span>
                      ) : null}

                      <span className={styles.talentSlugPill}>
                        /talents/{item.slug}
                      </span>
                    </Box>
                  </Box>
                </TableCell>

                {/* Discipline & Specialty Column */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.categoryStack}>
                    <span className={styles.categoryPill}>
                      <span className={styles.categoryDot} />
                      {category}
                    </span>
                    {genre && <span className={styles.genrePill}>{genre}</span>}
                    {availability ? (
                      <span className={styles.availabilityPill}>
                        <span className={styles.availabilityDot} />
                        {availability}
                      </span>
                    ) : null}
                  </Box>
                </TableCell>

                {/* Location & Metrics Column */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.locationStatsStack}>
                    <span className={styles.locationText}>
                      <PlaceOutlinedIcon sx={{ fontSize: 13, color: "#64748B" }} />
                      {location}
                    </span>

                    <Box className={styles.statsRow}>
                      <span className={styles.statItem} title="Public followers / reach">
                        <PeopleAltOutlinedIcon sx={{ fontSize: 12, color: "#64748B" }} />
                        {followers}
                      </span>

                      <span className={`${styles.statItem} ${styles.statItemRating}`} title="Rating">
                        <StarIcon sx={{ fontSize: 12, color: "#D97706" }} />
                        {rating}
                      </span>

                      {bookingPrice ? (
                        <span className={styles.bookingPriceTag} title="Performance / Booking Fee">
                          <PaidOutlinedIcon sx={{ fontSize: 12 }} />
                          {bookingPrice}
                        </span>
                      ) : null}
                    </Box>
                  </Box>
                </TableCell>

                {/* Spotlight & Honors Column */}
                <TableCell className={styles.tableCell}>
                  <Box className={styles.flagsContainer}>
                    {item.featured && (
                      <span className={styles.featuredBadge}>
                        <StarIcon sx={{ fontSize: 11 }} /> Featured
                      </span>
                    )}
                    {isHot && (
                      <span className={styles.hotBadge}>
                        <LocalFireDepartmentIcon sx={{ fontSize: 11 }} /> Hot
                      </span>
                    )}
                    {awardsCount > 0 && (
                      <span className={styles.awardsBadge} title={`${awardsCount} industry awards`}>
                        <EmojiEventsIcon sx={{ fontSize: 11 }} />
                        {awardsCount} {awardsCount === 1 ? "Award" : "Awards"}
                      </span>
                    )}
                    {!item.featured && !isHot && awardsCount === 0 && (
                      <span className={styles.standardRosterBadge}>—</span>
                    )}
                  </Box>
                </TableCell>

                {/* Publication Status Column */}
                <TableCell className={styles.tableCell}>
                  <StatusChip status={item.status} />
                </TableCell>

                {/* Actions Dock Column */}
                <TableCell align="right" className={styles.tableCell}>
                  <Box className={styles.actionsDock}>
                    <Tooltip title="View Live Public Profile">
                      <IconButton
                        size="small"
                        component="a"
                        href={`/talents/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionBtn}
                        aria-label={`View live profile for ${name}`}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Preview Record Payload">
                      <IconButton
                        size="small"
                        onClick={() => onPreviewClick(item)}
                        className={styles.actionBtn}
                        aria-label={`Preview payload for ${name}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {onDuplicateClick && (
                      <Tooltip title="Duplicate Talent">
                        <IconButton
                          size="small"
                          onClick={() => onDuplicateClick(item)}
                          className={styles.actionBtn}
                          aria-label={`Duplicate ${name}`}
                        >
                          <ContentCopyOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Edit Talent Details">
                      <IconButton
                        size="small"
                        onClick={() => onEditClick(item)}
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        aria-label={`Edit ${name}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Archive Talent">
                      <IconButton
                        size="small"
                        onClick={() => onArchiveClick(item)}
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        aria-label={`Archive ${name}`}
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

export default TalentDesktopTable;
