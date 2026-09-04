import { useState } from "react";
import { Avatar, Box, Button, CircularProgress, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import StarIcon from "@mui/icons-material/Star";
import { SortableList } from "@/components/settings/SortableList";
import styles from "./TalentFeaturedReorder.module.css";

export function TalentFeaturedReorder({
  featuredTalents = [],
  onReorder,
  onSaveOrder,
  isSaving = false,
}) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  function handleMoveItem(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= featuredTalents.length) return;
    const updated = [...featuredTalents];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
    setHasUnsavedChanges(true);
  }

  function handleSortableChange(nextItems) {
    const idMap = new Map(featuredTalents.map((t) => [t.id, t]));
    const nextOrdered = nextItems.map((item) => idMap.get(item.id)).filter(Boolean);
    onReorder(nextOrdered);
    setHasUnsavedChanges(true);
  }

  async function handleSave() {
    await onSaveOrder();
    setHasUnsavedChanges(false);
  }

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.cardHeader}>
        <Box className={styles.headerLeft}>
          <Typography className={styles.cardTitle}>Featured &amp; Trending Spotlight Ordering</Typography>
          <Typography className={styles.cardSubtitle}>
            Drag or shift artists to define the exact sequence featured on homepage carousels and editorial highlights.
          </Typography>
        </Box>
      </Box>

      {featuredTalents.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <StarIcon fontSize="medium" />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
            No artists marked as Featured yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 440 }}>
            Navigate to the Talent Roster tab, edit any artist profile, and enable the &quot;Featured on Homepage&quot; toggle to spotlight them here.
          </Typography>
        </Box>
      ) : (
        <>
          <Box className={styles.metaBanner}>
            <span className={styles.metaHint}>
              <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              The top 3 talents receive hero badge prominence. Drag or use arrow keys to adjust ranking.
            </span>
            <span>{featuredTalents.length} artists in spotlight sequence</span>
          </Box>

          <SortableList
            items={featuredTalents.map((t) => ({
              id: t.id,
              name: t.body?.name || t.title || t.name,
              category: t.body?.category || t.category || "Creative",
              subtitle: t.body?.subtitle || t.summary || "",
              image: t.body?.image || "/assets/img/talents/julius.jpg",
            }))}
            getKey={(item) => item.id}
            onChange={handleSortableChange}
            renderPrimary={(item) => {
              const index = featuredTalents.findIndex((t) => t.id === item.id);
              const rankClass =
                index === 0
                  ? styles.rankGold
                  : index === 1
                  ? styles.rankSilver
                  : index === 2
                  ? styles.rankBronze
                  : styles.rankStandard;

              const rankLabel =
                index === 0 ? (
                  <>
                    <EmojiEventsIcon sx={{ fontSize: 13 }} /> #1
                  </>
                ) : index === 1 ? (
                  <>
                    <StarIcon sx={{ fontSize: 13 }} /> #2
                  </>
                ) : index === 2 ? (
                  <>
                    <StarIcon sx={{ fontSize: 13 }} /> #3
                  </>
                ) : (
                  `#${index + 1}`
                );

              return (
                <Box className={styles.spotlightRow}>
                  <Box className={styles.spotlightLeft}>
                    <span className={`${styles.rankBadge} ${rankClass}`}>{rankLabel}</span>
                    <Avatar
                      src={item.image}
                      alt={item.name}
                      variant="rounded"
                      className={styles.avatar}
                    />
                    <Box className={styles.artistMeta}>
                      <span className={styles.artistName}>
                        {item.name}
                        <span className={styles.categoryPill}>{item.category}</span>
                      </span>
                      {item.subtitle ? (
                        <Typography variant="caption" className={styles.artistSubtitle}>
                          {item.subtitle}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>

                  <Box className={styles.spotlightRight}>
                    <Box className={styles.orderControls}>
                      <Tooltip title="Move up in ranking">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveItem(index, index - 1);
                            }}
                            disabled={index === 0}
                            className={styles.arrowBtn}
                            aria-label={`Move ${item.name} up`}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down in ranking">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveItem(index, index + 1);
                            }}
                            disabled={index === featuredTalents.length - 1}
                            className={styles.arrowBtn}
                            aria-label={`Move ${item.name} down`}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              );
            }}
          />

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" />
              {hasUnsavedChanges
                ? "Unsaved order adjustments — remember to click Save!"
                : "Spotlight ordering synchronized"}
            </span>

            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={handleSave}
              disabled={isSaving}
              className={styles.primaryButton}
            >
              {isSaving ? "Saving Order…" : "Save Featured Order"}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}

export default TalentFeaturedReorder;
