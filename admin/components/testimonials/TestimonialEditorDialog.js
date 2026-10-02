import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Rating,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { MediaField } from "@/components/content/MediaField";

const INITIAL_ITEM = {
  id: "",
  name: "",
  role: "",
  quote: "",
  avatar: "/assets/img/talents/blessing.jpg",
  rating: 5,
  isActive: true,
};

export function TestimonialEditorDialog({ open, onClose, onSave, item, isSaving }) {
  const [formData, setFormData] = useState(INITIAL_ITEM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        id: item.id || "",
        name: item.name || "",
        role: item.role || "",
        quote: item.quote || "",
        avatar: item.avatar || "/assets/img/talents/blessing.jpg",
        rating: item.rating ?? 5,
        isActive: item.isActive !== false,
      });
    } else {
      setFormData(INITIAL_ITEM);
    }
    setErrors({});
  }, [item, open]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate() {
    const errs = {};
    if (!formData.name?.trim()) errs.name = "Author name is required.";
    if (!formData.role?.trim()) errs.role = "Role or location is required.";
    if (!formData.quote?.trim()) errs.quote = "Quote statement is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData);
  }

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1.5, sm: 3 },
          width: { xs: "calc(100% - 24px)", sm: "auto" },
          borderRadius: { xs: "12px", sm: "16px" },
          maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5 }}>
          {item?.id ? "Edit Testimonial Story" : "Add New Testimonial"}
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Author Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. MacWilliams Jonah"
              fullWidth
              required
              error={Boolean(errors.name)}
              helperText={errors.name}
              disabled={isSaving}
            />

            <TextField
              label="Role, Discipline & Location"
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              placeholder="e.g. Musician, Lagos or Fashion Designer, Dakar"
              fullWidth
              required
              error={Boolean(errors.role)}
              helperText={errors.role || "Displayed beneath the member's name."}
              disabled={isSaving}
            />

            <TextField
              label="Quote Statement"
              value={formData.quote}
              onChange={(e) => handleChange("quote", e.target.value)}
              placeholder="What experience, mentorship, or breakthrough did this member gain at Royz Houz?"
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              required
              error={Boolean(errors.quote)}
              helperText={errors.quote}
              disabled={isSaving}
            />

            {/* MediaField for Cloudinary Avatar Upload */}
            <Box>
              <MediaField
                label="Author Avatar / Photo"
                value={formData.avatar}
                mediaType="image"
                onChange={(url) => handleChange("avatar", url)}
                onUploaded={(url) => handleChange("avatar", url)}
                helperText="Upload a crisp member portrait or square photo."
                showPreview={true}
                previewHeight={100}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                pt: 1,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: "#334155", mb: 0.5 }}>
                  Rating (Stars)
                </Typography>
                <Rating
                  value={formData.rating}
                  onChange={(_, val) => handleChange("rating", val || 5)}
                  disabled={isSaving}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    disabled={isSaving}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={600} sx={{ color: formData.isActive ? "#16a34a" : "#64748b" }}>
                    {formData.isActive ? "Active / Visible" : "Hidden"}
                  </Typography>
                }
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            gap: 1,
            flexDirection: { xs: "column-reverse", sm: "row" },
            "& > button": {
              width: { xs: "100%", sm: "auto" },
              minHeight: { xs: "40px", sm: "36px" },
              m: "0 !important",
            },
          }}
        >
          <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: "none", color: "#64748b" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#1f2937" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {isSaving ? "Saving..." : item?.id ? "Update Story" : "Add Testimonial"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
