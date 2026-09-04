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

export function TalentCategoryDialog({
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
          {category?.id ? "Edit Talent Category" : "Add Talent Category"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
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
            placeholder="e.g. Music & Production, Fashion & Styling"
            required
            fullWidth
          />
          <TextField
            label="Category Slug"
            value={category.slug || ""}
            onChange={(e) => setCategory({ ...category, slug: toSlug(e.target.value) })}
            placeholder="e.g. music-production, fashion-design"
            helperText="Identifier used for URL filtering"
            required
            fullWidth
          />
          <TextField
            label="Category Summary"
            value={category.summary || ""}
            onChange={(e) => setCategory({ ...category, summary: e.target.value })}
            placeholder="A short overview describing this creative discipline..."
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={category.status || "published"}
            onChange={(e) => setCategory({ ...category, status: e.target.value })}
            fullWidth
          >
            <MenuItem value="published">Published (Active)</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
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
          disabled={isSaving}
          sx={{
            background: "#B46A2C",
            "&:hover": { background: "#9A5B26" },
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          {isSaving ? <CircularProgress size={18} color="inherit" /> : category?.id ? "Save Category" : "Create Category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
