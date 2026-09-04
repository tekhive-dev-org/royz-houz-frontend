import { useMemo } from "react";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { SortableList } from "@/components/settings/SortableList";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./EventCategoriesTable.module.css";

export function EventCategoriesTable({
  categories = [],
  events = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  isReordering = false,
}) {
  const categoryCounts = useMemo(() => {
    const counts = new Map();

    events.forEach((item) => {
      const body = item.body || {};
      const categoryKeys = new Set();
      if (item.primaryCategoryId) categoryKeys.add(String(item.primaryCategoryId));
      if (Array.isArray(item.categoryIds)) {
        item.categoryIds.forEach((id) => categoryKeys.add(String(id)));
      }
      if (body.categoryKey) categoryKeys.add(String(body.categoryKey));
      if (body.category) categoryKeys.add(String(body.category));
      if (item.category) categoryKeys.add(String(item.category));

      categoryKeys.forEach((key) => counts.set(key, (counts.get(key) || 0) + 1));
    });

    return counts;
  }, [events]);

  function getCountForCategory(category) {
    const byId = category.id ? categoryCounts.get(String(category.id)) : 0;
    const bySlug = category.slug ? categoryCounts.get(String(category.slug)) : 0;
    const byTitle = category.title ? categoryCounts.get(String(category.title)) : 0;
    return Math.max(byId || 0, bySlug || 0, byTitle || 0);
  }

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.cardHeader}>
        <Box className={styles.headerLeft}>
          <Typography className={styles.cardTitle}>Event Categories</Typography>
          <Typography className={styles.cardSubtitle}>
            Drag categories to set navigation priority and filter order across the public events directory and admin portal.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddCategory} className={styles.primaryButton}>
          Add New Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <CategoryOutlinedIcon fontSize="medium" />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
            No event categories created yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 400 }}>
            Create your first event category (e.g. Concerts, Exhibitions, Masterclasses) to organize events.
          </Typography>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={onAddCategory} className={styles.primaryButton} sx={{ mt: 1 }}>
            Create First Category
          </Button>
        </Box>
      ) : (
        <>
          <Box className={styles.metaBanner}>
            <span className={styles.metaHint}>
              <DragIndicatorIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              Drag handles to adjust display hierarchy. Categories with events are protected from deletion.
            </span>
            {isReordering ? (
              <span className={styles.reorderingPulse}>
                <CircularProgress size={12} color="inherit" /> Saving event category order…
              </span>
            ) : (
              <span>{categories.length} total event categories registered</span>
            )}
          </Box>

          <SortableList
            items={categories}
            getKey={(category) => category.id || category.slug}
            onMove={(_from, _to, orderedCategories) => onReorderCategories(orderedCategories)}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
            renderPrimary={(category) => {
              const index = categories.findIndex(
                (item) => (item.id && item.id === category.id) || (item.slug && item.slug === category.slug)
              );
              const count = getCountForCategory(category);

              return (
                <Box className={styles.categoryItemContent}>
                  <Box className={styles.categoryLeft}>
                    <span className={styles.indexBadge}>#{index + 1}</span>
                    <Box className={styles.categoryDetails}>
                      <Box className={styles.categoryTitleRow}>
                        <Typography variant="body1" className={styles.categoryTitle}>
                          {category.title}
                        </Typography>
                        <span className={styles.categorySlug}>{category.slug}</span>
                      </Box>
                      {category.summary && (
                        <Typography variant="body2" className={styles.categorySummary}>
                          {category.summary}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box className={styles.categoryRight}>
                    <span className={styles.eventCountPill} title="Events in this category">
                      <EventOutlinedIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                      {count} {count === 1 ? "event" : "events"}
                    </span>
                    <StatusChip status={category.status || "published"} />
                  </Box>
                </Box>
              );
            }}
          />
        </>
      )}
    </Paper>
  );
}

export default EventCategoriesTable;
