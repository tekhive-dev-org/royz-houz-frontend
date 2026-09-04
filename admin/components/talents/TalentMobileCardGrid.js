import {
  Avatar,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
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

export function TalentMobileCardGrid({
  items = [],
  getCategoryLabel,
  onEditClick,
  onDuplicateClick,
  onPreviewClick,
  onArchiveClick,
}) {
  return (
    <Box className={styles.cardsGrid}>
      {items.map((item) => {
        const body = item.body || {};
        const name = body.name || item.title || "Untitled Talent";
        const category = getCategoryLabel(item);
        const genre = body.genre;
        const badge = body.badge;
        const subtitle = body.subtitle || body.profession;
        const image = body.image || item.image || "";
        const rating = body.rating || "5.0";
        const followers = body.followers || "";
        const location = item.location || body.location || "Africa";
        const isHot = Boolean(body.isHot);
        const bookingPrice = body.bookingPrice;
        const availability = body.availability;
        const bio = body.bio || body.summary || body.description || "";
        const awardsCount = Array.isArray(body.awards) ? body.awards.length : 0;

        return (
          <Box key={item.id} className={styles.talentCard}>
            {/* 1. Cover Banner with Floating Badges */}
            <Box className={styles.cardCoverBanner}>
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={name}
                  className={styles.cardCoverImg}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Box className={styles.cardCoverPlaceholder}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "rgba(180, 106, 44, 0.15)",
                      color: "#B46A2C",
                      fontWeight: 800,
                      fontSize: "1.3rem",
                    }}
                  >
                    {getTalentInitials(name)}
                  </Avatar>
                </Box>
              )}

              {/* Floating Category & Badges (Top-Left) */}
              <Box className={styles.cardCoverFloatingTopLeft}>
                <span className={styles.cardCategoryFloating}>
                  <span className={styles.cardCategoryDot} />
                  {category}
                </span>
                {genre && <span className={styles.cardBadgeFloating}>{genre}</span>}
                {badge && <span className={styles.cardBadgeFloating}>{badge}</span>}
              </Box>

              {/* Floating Publication Status (Top-Right) */}
              <Box className={styles.cardCoverFloatingTopRight}>
                <StatusChip status={item.status} />
              </Box>

              {/* Floating Spotlight & Metrics (Bottom Row) */}
              <Box className={styles.cardCoverFloatingBottom}>
                <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
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
                    <span className={styles.awardsBadge}>
                      <EmojiEventsIcon sx={{ fontSize: 11 }} /> {awardsCount}
                    </span>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {followers && (
                    <span className={styles.cardStatFloating} title="Followers">
                      <PeopleAltOutlinedIcon sx={{ fontSize: 12 }} />
                      {followers}
                    </span>
                  )}
                  {rating && (
                    <span className={styles.cardStatFloating} title="Rating">
                      <StarIcon sx={{ fontSize: 12, color: "#F59E0B" }} />
                      {rating}
                    </span>
                  )}
                </Box>
              </Box>
            </Box>

            {/* 2. Card Body */}
            <Box className={styles.cardBody}>
              <a
                href={`/talents/${item.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardTitleLink}
                title={name}
              >
                {name}
              </a>

              {subtitle && (
                <span className={styles.cardSubtitleText} title={subtitle}>
                  {subtitle}
                </span>
              )}

              {bio && (
                <Typography variant="body2" className={styles.cardExcerpt}>
                  {bio}
                </Typography>
              )}

              <span className={styles.cardSlugPill} title={`/talents/${item.slug}`}>
                /talents/{item.slug}
              </span>
            </Box>

            {/* 3. Location & Availability Highlights */}
            <Box className={styles.cardHighlightsBar}>
              <span className={styles.cardLocationTag}>
                <PlaceOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
                {location}
              </span>

              <Box sx={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {bookingPrice ? (
                  <span className={styles.cardBookingTag} title="Booking Rate">
                    <PaidOutlinedIcon sx={{ fontSize: 12 }} />
                    {bookingPrice}
                  </span>
                ) : null}
                {availability ? (
                  <span className={styles.cardAvailabilityTag}>
                    {availability}
                  </span>
                ) : null}
              </Box>
            </Box>

            {/* 4. Footer Actions Bar */}
            <Box className={styles.cardFooterActions}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onEditClick(item)}
                startIcon={<EditOutlinedIcon sx={{ fontSize: 15 }} />}
                className={styles.cardPrimaryEditBtn}
              >
                Edit Profile
              </Button>

              <Box className={styles.cardIconActions}>
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
                <Tooltip title="Inspect JSON Payload">
                  <IconButton
                    size="small"
                    onClick={() => onPreviewClick(item)}
                    className={styles.actionBtn}
                    aria-label={`Inspect ${name}`}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
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
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export default TalentMobileCardGrid;
