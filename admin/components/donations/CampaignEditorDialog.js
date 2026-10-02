import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./CampaignEditorDialog.module.css";

function generateSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export function CampaignEditorDialog({
  open,
  campaign,
  isSaving,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (campaign) {
      setFormData({
        id: campaign.id || undefined,
        title: campaign.title || "",
        slug: campaign.slug || "",
        summary: campaign.summary || "",
        description: campaign.description || campaign.body?.description || "",
        targetAmount: campaign.targetAmount || campaign.body?.targetAmount || "",
        currency: campaign.currency || campaign.body?.currency || "NGN",
        featured: Boolean(campaign.featured),
        status: campaign.status || "draft",
      });
    }
  }, [campaign]);

  const setField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !prev.id) {
        next.slug = generateSlug(value);
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    onSave(formData);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className={styles.dialogTitle}>
        <Typography variant="h6" className={styles.heading}>
          {formData.id ? `Edit Campaign: ${formData.title}` : "Create Giving Cause"}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent className={styles.dialogContent}>
          <Stack spacing={2.5}>
            {/* Title */}
            <TextField
              fullWidth
              size="small"
              label="Cause / Campaign Title"
              value={formData.title || ""}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Young Musicians Studio Equipment Fund"
              required
            />

            {/* Summary */}
            <TextField
              fullWidth
              size="small"
              label="Summary / Catchphrase"
              value={formData.summary || ""}
              onChange={(e) => setField("summary", e.target.value)}
              placeholder="Brief 1-2 sentence overview of this funding initiative"
            />

            {/* Mission Description */}
            <TextField
              fullWidth
              size="small"
              label="Campaign Mission Description"
              value={formData.description || ""}
              onChange={(e) => setField("description", e.target.value)}
              multiline
              minRows={3}
              placeholder="Provide context on why this campaign matters and how funds will be deployed..."
            />

            {/* Target Goal Amount & Status */}
            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Target Goal Amount"
                value={formData.targetAmount || ""}
                onChange={(e) => setField("targetAmount", e.target.value)}
                placeholder="5000000"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ fontWeight: 700, color: "text.primary" }}>
                      ₦
                    </InputAdornment>
                  ),
                }}
                helperText="Enter goal in Nigerian Naira (₦)"
              />
              <TextField
                fullWidth
                size="small"
                select
                label="Publication Status"
                value={formData.status || "draft"}
                onChange={(e) => setField("status", e.target.value)}
              >
                <MenuItem value="draft">Draft (Private)</MenuItem>
                <MenuItem value="published">Published (Live on Website)</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Box>

            {/* Spotlight / Featured Toggle */}
            <Box sx={{ pt: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formData.featured)}
                    onChange={(e) => setField("featured", e.target.checked)}
                    color="primary"
                  />
                }
                label="Primary Spotlight (Display prominently as featured cause)"
              />
            </Box>
          </Stack>
        </DialogContent>
        <Divider />

        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
            className={styles.saveBtn}
          >
            {isSaving ? "Saving..." : "Save Campaign"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
