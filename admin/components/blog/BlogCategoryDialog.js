import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function BlogCategoryDialog({
  open,
  onClose,
  category,
  setCategory,
  onSave,
  isSaving,
}) {
  if (!category) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          {category?.id ? "Edit Journal Category" : "Add Journal Category"}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Category Title"
            value={category.title || ""}
            onChange={(e) => {
              const title = e.target.value;
              const previousGeneratedSlug = toSlug(category.title || "");
              const shouldGenerateSlug = !category.id && (!category.slug || category.slug === previousGeneratedSlug);
              setCategory({ ...category, title, slug: shouldGenerateSlug ? toSlug(title) : category.slug });
            }}
            placeholder="e.g. Talent, Culture, Entertainment, Community"
            required
            fullWidth
          />
          <TextField
            label="URL Slug"
            value={category.slug || ""}
            onChange={(e) => setCategory({ ...category, slug: toSlug(e.target.value) })}
            placeholder="e.g. culture"
            required
            fullWidth
            helperText="Used in web navigation filters and URLs."
          />
          <TextField
            label="Summary / Description"
            value={category.summary || ""}
            onChange={(e) => setCategory({ ...category, summary: e.target.value })}
            placeholder="Brief description of what this category covers."
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={category.status || "published"}
            onChange={(e) => setCategory({ ...category, status: e.target.value })}
            fullWidth
          >
            <MenuItem value="published">Published (Visible in Filters)</MenuItem>
            <MenuItem value="draft">Draft (Hidden)</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isSaving || !category.title?.trim() || !category.slug?.trim()}
          sx={{ background: "#B46A2C", "&:hover": { background: "#9A5B26" } }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : category?.id ? "Save Changes" : "Create Category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BlogCategoryDialog;
