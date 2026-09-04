import { useMemo } from "react";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { SortableList } from "@/components/settings/SortableList";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./BlogCategoriesTable.module.css";

export function BlogCategoriesTable({
  categories = [],
  posts = [],
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorderCategories,
  isReordering = false,
}) {
  const categoryCounts = useMemo(() => {
    const counts = new Map();
    posts.forEach((item) => {
      const body = item.body || {};
      const catIds = new Set();
      if (item.primaryCategoryId) catIds.add(String(item.primaryCategoryId));
      if (Array.isArray(item.categoryIds)) {
        item.categoryIds.forEach((id) => catIds.add(String(id)));
      }
      if (body.category) catIds.add(String(body.category));
      catIds.forEach((key) => {
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });
    return counts;
  }, [posts]);

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
          <Typography className={styles.cardTitle}>Editorial &amp; Journal Categories</Typography>
          <Typography className={styles.cardSubtitle}>
            Drag categories to reorder them on the public blog navigation and filter menus.
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
            No journal categories created yet
          </Typography>
          <Typography variant="body2" sx={{ color: "#6B7280", maxWidth: 400 }}>
            Create categories (e.g. Talent, Culture, Entertainment, Community) to organize articles and stories.
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
              Drag handles to adjust display hierarchy. Categories with active articles are protected from deletion.
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
            onReorder={onReorderCategories}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
            isDeletable={(cat) => getCountForCategory(cat) === 0}
            renderContent={(cat, index) => (
              <Box className={styles.categoryItemContent}>
                <Box className={styles.categoryLeft}>
                  <span className={styles.indexBadge}>{index + 1}</span>
                  <Box className={styles.categoryDetails}>
                    <Box className={styles.categoryTitleRow}>
                      <Typography className={styles.categoryTitle}>{cat.title}</Typography>
                      <span className={styles.categorySlug}>{cat.slug}</span>
                      <StatusChip status={cat.status || "published"} />
                    </Box>
                    {cat.summary ? (
                      <Typography className={styles.categorySummary}>{cat.summary}</Typography>
                    ) : null}
                  </Box>
                </Box>

                <Box className={styles.categoryRight}>
                  <span className={styles.postCountPill}>
                    <ArticleOutlinedIcon sx={{ fontSize: 14 }} />
                    {getCountForCategory(cat)} {getCountForCategory(cat) === 1 ? "article" : "articles"}
                  </span>
                </Box>
              </Box>
            )}
          />
        </>
      )}
    </Paper>
  );
}

export default BlogCategoriesTable;
