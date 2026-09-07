import { useCallback, useState } from "react";
import { Add, Visibility } from "@mui/icons-material";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { SortableList } from "@/components/settings/SortableList";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { contentApi } from "@/services/contentApi";
import { useAdminCollection } from "@/hooks/useAdminCollection";
import { MediaPicker } from "./MediaPicker";
import styles from "./SectionsEditor.module.css";

const EMPTY_SECTION = {
  slug: "",
  title: "",
  summary: "",
  eyebrow: "",
  heading: "",
  description: "",
  ctaLabel: "",
  ctaUrl: "",
  imageUrl: "",
  imageAlt: "",
  videoUrl: "",
  videoTitle: "",
  visible: true,
  sortOrder: 0,
  status: "draft",
};

function SectionForm({ value, onChange, onPickMedia }) {
  function set(field, fieldValue) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <Box className={styles.form}>
      <TextField label="Slug" value={value.slug} onChange={(e) => set("slug", e.target.value)} fullWidth required />
      <TextField label="Title" value={value.title} onChange={(e) => set("title", e.target.value)} fullWidth required />
      <TextField label="Eyebrow" value={value.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} fullWidth />
      <TextField label="Heading" value={value.heading} onChange={(e) => set("heading", e.target.value)} fullWidth />
      <TextField label="Description" value={value.description} onChange={(e) => set("description", e.target.value)} fullWidth multiline minRows={3} />
      <Box className={styles.row}>
        <TextField label="CTA label" value={value.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} fullWidth />
        <TextField label="CTA URL" value={value.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} fullWidth helperText="Internal path or safe https URL" />
      </Box>
      <Box className={styles.row}>
        <TextField label="Image URL" value={value.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} fullWidth />
        <Button onClick={() => onPickMedia("image")} startIcon={<Visibility />} variant="outlined" size="small" className={styles.mediaButton}>
          Select image
        </Button>
      </Box>
      <TextField label="Image alt text" value={value.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} fullWidth />
      <Box className={styles.row}>
        <TextField label="Video URL" value={value.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} fullWidth helperText="Cloudinary video or YouTube URL" />
        <Button onClick={() => onPickMedia("video")} startIcon={<Visibility />} variant="outlined" size="small" className={styles.mediaButton}>
          Select video
        </Button>
      </Box>
      <Box className={styles.row}>
        <TextField
          label="Status"
          select
          value={value.status}
          onChange={(e) => set("status", e.target.value)}
          fullWidth
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </TextField>
        <TextField
          label="Scheduled publication (optional)"
          type="datetime-local"
          value={value.scheduledAt ? value.scheduledAt.slice(0, 16) : ""}
          onChange={(e) => set("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </Box>
  );
}

export function SectionsEditor({ type, title, description }) {
  const listSections = useCallback(() => contentApi.listSections(type), [type]);
  const saveSection = useCallback((data, id) => contentApi.saveSection(type, data, id), [type]);
  const reorderSections = useCallback((ids) => contentApi.reorderSections(type, ids), [type]);
  const deleteSection = useCallback((id) => contentApi.deleteSection(type, id), [type]);
  const collection = useAdminCollection({
    list: listSections,
    save: saveSection,
    reorder: reorderSections,
    remove: deleteSection,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaType, setMediaType] = useState("image");

  function openCreate() {
    setEditing({ ...EMPTY_SECTION });
    setDialogOpen(true);
  }

  function openEdit(item) {
    const body = item.body || {};
    setEditing({ ...EMPTY_SECTION, ...body, id: item.id, slug: item.slug, title: item.title, summary: item.summary || "", sortOrder: item.sort_order, visible: item.featured !== false, status: item.status, scheduledAt: item.scheduled_at || undefined });
    setDialogOpen(true);
  }

  async function submit(section = editing) {
    if (!section) return;
    await collection.save(section, section.id);
    setDialogOpen(false);
  }

  async function openPreview() {
    try {
      const data = await contentApi.listSections(type, true);
      setPreviewData(data);
    } catch {
      setPreviewData([]);
    }
    setPreviewOpen(true);
  }

  if (collection.isLoading) return <AdminLoadingState />;
  if (collection.error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={collection.refresh}>Retry</Button>}>
        {collection.error}
      </Alert>
    );
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.pageTitle}>{title}</Typography>
          <Typography variant="body1" className={styles.pageDescription}>{description}</Typography>
        </Box>
        <Box className={styles.headerActions}>
          <Button variant="outlined" size="small" startIcon={<Visibility />} onClick={openPreview} className={styles.actionBtn}>
            Preview
          </Button>
          <Button variant="contained" size="small" startIcon={<Add />} onClick={openCreate} className={styles.actionBtn}>
            Add section
          </Button>
        </Box>
      </Box>

      {collection.items.length === 0 ? (
        <Paper elevation={0} className={styles.empty}>No sections yet. Add the first one to get started.</Paper>
      ) : (
        <SortableList
          items={collection.items}
          getKey={(item) => item.id}
          onMove={(from, to, updatedItems) => {
            let next = updatedItems;
            if (!next) {
              next = [...collection.items];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
            }
            collection.reorder(next.map((item) => item.id), next);
          }}
          onEdit={openEdit}
          onDelete={(item) => collection.remove(item.id)}
          renderPrimary={(item) => (
            <Box sx={{ minWidth: 0, width: "100%" }}>
              <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>{item.title}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word", display: "block", mt: 0.25 }}>
                {item.slug} · order {item.sort_order}
              </Typography>
              <Box className={styles.chips}>
                <StatusChip status={item.status} />
                {item.featured === false ? <StatusChip status="hidden" /> : null}
              </Box>
            </Box>
          )}
        />
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 3 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            borderRadius: { xs: "12px", sm: "16px" },
            maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5, fontWeight: 700 }}>
          {editing?.id ? "Edit section" : "Add section"}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          <SectionForm value={editing || EMPTY_SECTION} onChange={setEditing} onPickMedia={(type) => { setMediaType(type); setMediaPickerOpen(true); }} />
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: { xs: 1, sm: 1.5 },
            "& > button": {
              width: { xs: "100%", sm: "auto" },
              minHeight: { xs: "40px", sm: "36px" },
            },
          }}
        >
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="outlined" onClick={() => submit({ ...editing, status: "draft" })}>Save draft</Button>
          <Button variant="contained" onClick={() => submit({ ...editing, status: "published" })}>Publish</Button>
        </DialogActions>
      </Dialog>

      <MediaPicker
        open={mediaPickerOpen}
        type={mediaType}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(media) => {
          if (mediaType === "image") {
            setEditing({ ...editing, imageUrl: media.imageUrl, imageAlt: media.altText || media.title });
          } else {
            setEditing({ ...editing, videoUrl: media.videoUrl, videoTitle: media.title });
          }
          setMediaPickerOpen(false);
        }}
      />

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 3 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            borderRadius: { xs: "12px", sm: "16px" },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>Public preview data</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <pre className={styles.preview}>{JSON.stringify(previewData, null, 2)}</pre>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Button onClick={() => setPreviewOpen(false)} sx={{ width: { xs: "100%", sm: "auto" }, minHeight: "40px" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
