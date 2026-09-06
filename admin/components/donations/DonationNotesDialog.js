import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function DonationNotesDialog({ open, record, isSaving, onClose, onSave }) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (record) {
      setNotes(record.internalNotes || "");
    }
  }, [record]);

  if (!open || !record) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2, px: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Internal Notes: {record.donorName || "Patron Record"}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          multiline
          minRows={5}
          label="Staff Internal Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record follow-up actions, receipt dispatch confirmations, or donor communication preferences..."
          helperText="Visible only to administrative staff members"
        />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ py: 2, px: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSave(record.id, notes)}
          disabled={isSaving}
          sx={{ background: "#B46A2C !important", color: "#FFF !important", fontWeight: 600 }}
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
