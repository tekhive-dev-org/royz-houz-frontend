import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

export function TestimonialHeaderCard({ headerData, onSave, isSaving }) {
  const [badge, setBadge] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (headerData) {
      setBadge(headerData.badge || "TESTIMONIALS");
      setTitle(headerData.title || "Impact - Changing Stories");
      setDescription(
        headerData.description ||
          "Explore the stories and experiences of members who have connected and found meaningful opportunities."
      );
      setIsDirty(false);
    }
  }, [headerData]);

  function handleBadgeChange(e) {
    setBadge(e.target.value);
    setIsDirty(true);
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    setIsDirty(true);
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
    setIsDirty(true);
  }

  async function handleSave() {
    await onSave({ badge, title, description });
    setIsDirty(false);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#0f172a", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
            Section Header & Taglines
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.8125rem", mt: 0.25 }}>
            Customize the badge, headline, and subtitle displayed above the testimonial carousel across all pages.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
          sx={{
            width: { xs: "100%", sm: "auto" },
            bgcolor: "#0f172a",
            "&:hover": { bgcolor: "#1e293b" },
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            py: { xs: 0.8, sm: 0.6 },
          }}
        >
          {isSaving ? "Saving..." : "Save Header Copy"}
        </Button>
      </Box>

      <Stack spacing={2}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 2fr" }, gap: 2 }}>
          <TextField
            label="Section Eyebrow / Badge"
            value={badge}
            onChange={handleBadgeChange}
            size="small"
            helperText="Upper badge tagline (e.g. 'TESTIMONIALS')"
          />
          <TextField
            label="Main Section Title"
            value={title}
            onChange={handleTitleChange}
            size="small"
            helperText="Headline (e.g. 'Impact - Changing Stories')"
          />
        </Box>
        <TextField
          label="Section Subheadline / Description"
          value={description}
          onChange={handleDescriptionChange}
          size="small"
          multiline
          minRows={2}
          helperText="Introductory description explaining member success stories."
        />
      </Stack>
    </Paper>
  );
}
