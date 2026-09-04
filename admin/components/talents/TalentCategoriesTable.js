import { useMemo } from "react";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { SortableList } from "@/components/settings/SortableList";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./TalentCategoriesTable.module.css";

export function TalentCategoriesTable({
  categories = [],
  talents = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  isReordering = false,
}) {
  // Count how many talents belong to each category
  const categoryCounts = useMemo(() => {
    const counts = new Map();
    talents.forEach((item) => {
      const body = item.body || {};
      const catIds = new Set();
      if (item.primaryCategoryId) catIds.add(String(item.primaryCategoryId));
      if (Array.isArray(item.categoryIds)) {
        item.categoryIds.forEach((id) => catIds.add(String(id)));
      }
      if (body.categoryKey) catIds.add(String(body.categoryKey));
      if (body.category) catIds.add(String(body.category));

      catIds.forEach((key) => {
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    return counts;
  }, [talents]);

  function getCountForCategory(cat) {
    const byId = cat.id ? categoryCounts.get(String(cat.id)) : 0;
    const bySlug = cat.slug ? categoryCounts.get(String(cat.slug)) : 0;
    const byTitle = cat.title ? categoryCounts.get(String(cat.title)) : 0;
    return Math.max(byId || 0, bySlug || 0, byTitle || 0);
  }

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.cardHeader}>
        <Box className={styles.headerLeft}>
          <Typography className={styles.cardTitle}>Talent Creative Categories</Typography>
          <Typography className={styles.cardSubtitle}>
            Drag categories to set navigation priority and filter order across public directory and admin portals.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddCategory}
          className={styles.primaryButton}
        >
          Add New Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <CategoryOutlinedIcon fontSize="medium" />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 700, color: "#111827" }}>
            No talent categories created yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 400 }}>
            Create your first creative discipline (e.g. Afrobeat, Film &amp; Theater, Contemporary Dance) to organize artists.
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddCategory}
            className={styles.primaryButton}
            sx={{ mt: 1 }}
          >
            Create First Category
          </Button>
        </Box>
      ) : (
        <>
          <Box className={styles.metaBanner}>
            <span className={styles.metaHint}>
              <DragIndicatorIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              Drag handles to adjust display hierarchy. Categories with active talents are protected from deletion.
            </span>
            {isReordering ? (
              <span className={styles.reorderingPulse}>
                <CircularProgress size={12} color="inherit" /> Saving category order…
              </span>
            ) : (
              <span>{categories.length} total categories registered</span>
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
                (c) => (c.id && c.id === category.id) || (c.slug && c.slug === category.slug)
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
                    <span className={styles.talentCountPill} title="Talents in this category">
                      <PeopleAltOutlinedIcon sx={{ fontSize: 13, color: "#9CA3AF" }} />
                      {count} {count === 1 ? "artist" : "artists"}
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

export default TalentCategoriesTable;
