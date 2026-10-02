import { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { testimonialsAdminApi } from "@/services/testimonialsAdminApi";
import { TestimonialHeaderCard } from "./TestimonialHeaderCard";
import { TestimonialCardItem } from "./TestimonialCardItem";
import { TestimonialEditorDialog } from "./TestimonialEditorDialog";

export function TestimonialsAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  async function loadTestimonials() {
    try {
      setLoading(true);
      setError("");
      const result = await testimonialsAdminApi.getTestimonials();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTestimonials();
  }, []);

  const items = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [data?.items]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.name?.toLowerCase().includes(q) ||
        it.role?.toLowerCase().includes(q) ||
        it.quote?.toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((it) => it.isActive !== false).length;
    const sumRatings = items.reduce((acc, it) => acc + (it.rating || 5), 0);
    const avgRating = total > 0 ? (sumRatings / total).toFixed(1) : "5.0";
    return { total, active, avgRating };
  }, [items]);

  function handleOpenCreate() {
    setEditingItem(null);
    setEditorOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setEditorOpen(true);
  }

  async function handleSaveItem(formData) {
    setIsSaving(true);
    try {
      await testimonialsAdminApi.saveItem(formData);
      setToastMessage(
        formData.id ? `Testimonial for "${formData.name}" updated.` : `New testimonial for "${formData.name}" added.`
      );
      setEditorOpen(false);
      await loadTestimonials();
    } catch (err) {
      alert(err.message || "Failed to save testimonial.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveHeader(headerData) {
    setIsSaving(true);
    try {
      await testimonialsAdminApi.saveHeader(headerData);
      setToastMessage("Section header copy saved successfully.");
      await loadTestimonials();
    } catch (err) {
      alert(err.message || "Failed to save header copy.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMove(currentIndex, targetIndex) {
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    const ids = newItems.map((it) => it.id);
    try {
      await testimonialsAdminApi.reorderItems(ids);
      setData((prev) => ({ ...prev, items: newItems }));
      setToastMessage("Stories reordered successfully.");
    } catch (err) {
      alert(err.message || "Failed to reorder testimonials.");
      await loadTestimonials();
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmId) return;
    try {
      await testimonialsAdminApi.deleteItem(deleteConfirmId);
      setToastMessage("Testimonial story removed.");
      setDeleteConfirmId(null);
      await loadTestimonials();
    } catch (err) {
      alert(err.message || "Failed to delete testimonial.");
    }
  }

  if (loading && !data) {
    return <AdminLoadingState label="Loading testimonials studio..." />;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", pb: 6 }}>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: "#0f172a" }}>
              Testimonials Studio
            </Typography>
            <Chip
              label={`${items.length} Stories`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#f1f5f9", color: "#334155" }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Manage the member feedback, quotes, and impact stories displayed on the live website.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            width: { xs: "100%", sm: "auto" },
            bgcolor: "#0f172a",
            "&:hover": { bgcolor: "#1e293b" },
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            py: 1,
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
          }}
        >
          Add Testimonial
        </Button>
      </Box>

      {/* Overview Stat Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
            }}
          >
            <FormatQuoteIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1, color: "#0f172a" }}>
              {stats.total}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Total Member Stories
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#16a34a",
            }}
          >
            <CheckCircleOutlineIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1, color: "#0f172a" }}>
              {stats.active}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Active on Website
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2.5,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#fffbeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
            }}
          >
            <StarIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.1, color: "#0f172a" }}>
              {stats.avgRating} / 5.0
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Average Platform Rating
            </Typography>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Global Section Header Editor */}
      <TestimonialHeaderCard
        headerData={data}
        onSave={handleSaveHeader}
        isSaving={isSaving}
      />

      {/* Search & Filter Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <TextField
          placeholder="Search by author name, discipline, or quote..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: { xs: "100%", sm: 420 }, bgcolor: "#ffffff", borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />

        <Typography
          variant="caption"
          sx={{ color: "#64748b", fontWeight: 600, textAlign: { xs: "left", sm: "right" } }}
        >
          Showing {filteredItems.length} of {items.length} stories
        </Typography>
      </Box>

      {/* Testimonials List */}
      {filteredItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            bgcolor: "#f8fafc",
          }}
        >
          <FormatQuoteIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1.5 }} />
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#334155" }}>
            {search ? "No testimonials match your search" : "No testimonials yet"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2.5 }}>
            {search
              ? "Try adjusting your search query or clear the filter."
              : "Get started by adding the first member impact story to the platform."}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Add First Testimonial
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {filteredItems.map((item, index) => (
            <TestimonialCardItem
              key={item.id || index}
              item={item}
              index={index}
              totalItems={filteredItems.length}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onMoveUp={(idx) => handleMove(idx, idx - 1)}
              onMoveDown={(idx) => handleMove(idx, idx + 1)}
            />
          ))}
        </Stack>
      )}

      {/* Add / Edit Dialog */}
      <TestimonialEditorDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 3 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            borderRadius: { xs: "12px", sm: "16px" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>
          Delete Testimonial?
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <DialogContentText>
            Are you sure you want to remove this story? It will no longer be visible on the live homepage and about pages.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmId(null)}
            sx={{ textTransform: "none", flex: { xs: 1, sm: "none" } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 600, flex: { xs: 1, sm: "none" } }}
          >
            Delete Story
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage("")}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
}
