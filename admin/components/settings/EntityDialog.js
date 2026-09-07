import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";

export function EntityDialog({ open, onClose, onSubmit, title, fields = [], selectFields = [], initial = {}, resetKey }) {
  const [form, setForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const initialValues = {};
    for (const field of fields) initialValues[field.name] = initial[field.name] ?? field.default ?? "";
    for (const field of selectFields) initialValues[field.name] = initial[field.name] ?? field.default ?? "";
    initialValues.status = initial.status ?? "draft";
    setForm(initialValues);
    setIsSubmitting(false);
  }, [open, resetKey]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          m: { xs: 1.5, sm: 3 },
          width: { xs: "calc(100% - 24px)", sm: "auto" },
          borderRadius: { xs: "12px", sm: "16px" },
          maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 }, gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              borderRadius: "8px",
              background: "linear-gradient(135deg, #FAF4EF 0%, #F2E4D6 100%)",
              border: "1px solid rgba(180, 106, 44, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#B46A2C",
              flexShrink: 0,
            }}
          >
            <EditNoteOutlinedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" }, wordBreak: "break-word" }}>
            {title}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog" sx={{ flexShrink: 0 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <Divider />

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
        <form id="entity-dialog-form" onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                size="small"
                label={field.label}
                type={field.type || "text"}
                value={form[field.name] ?? ""}
                onChange={(event) => updateField(field.name, event.target.value)}
                required={field.required}
                helperText={field.helperText}
              />
            ))}

            {selectFields.map((field) => (
              <TextField
                key={field.name}
                fullWidth
                size="small"
                select
                label={field.label}
                value={form[field.name] ?? ""}
                onChange={(event) => updateField(field.name, event.target.value)}
              >
                {field.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}

            <TextField
              fullWidth
              size="small"
              select
              label="Publication Status"
              value={form.status ?? "draft"}
              onChange={(event) => updateField("status", event.target.value)}
              helperText="Published items appear live on the website."
            >
              <MenuItem value="draft">Draft (Private)</MenuItem>
              <MenuItem value="published">Published (Live on Web)</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </TextField>
          </Box>
        </form>
      </DialogContent>

      <Divider />

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
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="entity-dialog-form"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
