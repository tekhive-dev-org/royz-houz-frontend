import { useState } from "react";
import { Box, Button, CircularProgress, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import StarIcon from "@mui/icons-material/Star";
import { SortableList } from "@/components/settings/SortableList";
import styles from "./BlogFeaturedReorder.module.css";

export function BlogFeaturedReorder({
  featuredPosts = [],
  onReorder,
  onSaveOrder,
  isSaving = false,
}) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  function handleMoveItem(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= featuredPosts.length) return;
    const updated = [...featuredPosts];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onReorder(updated);
    setHasUnsavedChanges(true);
  }

  function handleSortableChange(nextItems) {
    const idMap = new Map(featuredPosts.map((p) => [p.id, p]));
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
          <Typography className={styles.cardTitle}>Featured Articles &amp; Editorial Spotlight</Typography>
          <Typography className={styles.cardSubtitle}>
            Drag or shift articles to define the exact sequence featured in the top hero showcase and journal highlights.
          </Typography>
        </Box>
      </Box>

      {featuredPosts.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <StarIcon fontSize="medium" />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
            No articles marked as Featured yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 440 }}>
            Go to the Articles tab, edit any post, and switch on the &quot;Featured Spotlight&quot; toggle to rank it here.
          </Typography>
        </Box>
      ) : (
        <>
          <Box className={styles.metaBanner}>
            <span className={styles.metaHint}>
              <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              The top articles receive prime hero and spotlight placement. Adjust order and save changes.
            </span>
            <span>{featuredPosts.length} stories in spotlight sequence</span>
          </Box>

          <SortableList
            items={featuredPosts.map((p) => {
              const body = p.body || {};
              return {
                id: p.id,
                title: p.title || "Untitled",
                badge: body.badge || "FEATURED",
                summary: p.summary || body.summary || body.excerpt || "",
                image: body.image || "/assets/img/blog/post-ballet.jpg",
              };
            })}
            getKey={(item) => item.id}
            onChange={handleSortableChange}
            renderPrimary={(item) => {
              const index = featuredPosts.findIndex((p) => p.id === item.id);
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
                    <img src={item.image} alt={item.title} className={styles.coverImage} />
                    <Box className={styles.postMeta}>
                      <span className={styles.postTitle}>
                        {item.title}
                        <span className={styles.categoryPill}>{item.badge}</span>
                      </span>
                      {item.summary ? (
                        <Typography variant="caption" className={styles.postSubtitle}>
                          {item.summary}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>

                  <Box className={styles.spotlightRight}>
                    <Box className={styles.orderControls}>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveItem(index, index - 1);
                            }}
                            disabled={index === 0}
                            className={styles.arrowBtn}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveItem(index, index + 1);
                            }}
                            disabled={index === featuredPosts.length - 1}
                            className={styles.arrowBtn}
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
                ? "Unsaved order changes — remember to click Save Order!"
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

export default BlogFeaturedReorder;
