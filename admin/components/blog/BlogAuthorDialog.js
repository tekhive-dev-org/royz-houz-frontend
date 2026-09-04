import {
  Avatar,
  Box,
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
import { MediaField } from "@/components/content/MediaField";

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function BlogAuthorDialog({
  open,
  onClose,
  author,
  setAuthor,
  onSave,
  isSaving,
  onOpenMediaPicker,
}) {
  if (!author) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          {author?.id ? "Edit Contributor / Author" : "Add New Contributor"}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Full Name"
            value={author.name || ""}
            onChange={(e) => {
              const name = e.target.value;
              const shouldGenerateSlug = !author.id && (!author.slug || author.slug === toSlug(author.name || ""));
              setAuthor({ ...author, name, slug: shouldGenerateSlug ? toSlug(name) : author.slug });
            }}
            placeholder="e.g. Chisom Obi"
            required
            fullWidth
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="URL Slug"
              value={author.slug || ""}
              onChange={(e) => setAuthor({ ...author, slug: toSlug(e.target.value) })}
              placeholder="e.g. chisom-obi"
              required
              fullWidth
            />
            <TextField
              label="Editorial Role / Title"
              value={author.role || ""}
              onChange={(e) => setAuthor({ ...author, role: e.target.value })}
              placeholder="e.g. STAFF WRITER, CULTURE EDITOR"
              fullWidth
            />
          </Box>

          <TextField
            label="Biography"
            value={author.bio || ""}
            onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
            placeholder="Bio narrative shown on the sticky sidebar of articles written by this author."
            multiline
            minRows={3}
            fullWidth
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Avatar
              src={author.avatar || "/assets/img/blog/author-chisom.jpg"}
              alt={author.name}
              sx={{ width: 64, height: 64, border: "2px solid #E5E7EB", mt: 0.5, flexShrink: 0 }}
            />
            <Box sx={{ flex: 1 }}>
              <MediaField
                label="Author Avatar Image"
                value={author.avatar || ""}
                mediaType="image"
                onChange={(url) => setAuthor({ ...author, avatar: url })}
                onUploaded={(url) => setAuthor({ ...author, avatar: url })}
                onBrowseLibrary={() =>
                  onOpenMediaPicker?.({
                    type: "image",
                    onSelect: (url) => setAuthor({ ...author, avatar: url }),
                  })
                }
                helperText="Upload an author photo from your device, choose from media library, or paste a URL."
                showPreview={false}
              />
            </Box>
          </Box>

          <TextField
            select
            label="Status"
            value={author.status || "published"}
            onChange={(e) => setAuthor({ ...author, status: e.target.value })}
            fullWidth
          >
            <MenuItem value="published">Active / Published</MenuItem>
            <MenuItem value="draft">Draft / Hidden</MenuItem>
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
          disabled={isSaving || !author.name?.trim() || !author.slug?.trim()}
          sx={{ background: "#B46A2C", "&:hover": { background: "#9A5B26" } }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : author?.id ? "Save Author" : "Create Author"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BlogAuthorDialog;
