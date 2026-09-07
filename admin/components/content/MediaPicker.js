import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemButton, ListItemText, TextField } from "@mui/material";
import { contentApi } from "@/services/contentApi";
import styles from "./MediaPicker.module.css";

export function MediaPicker({ open, type, onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    contentApi
      .listMedia({ type })
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, type]);

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
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>Select {type}</DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search media"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          margin="normal"
        />
        {loading ? (
          <Box className={styles.hint}>Loading media…</Box>
        ) : items.length === 0 ? (
          <Box className={styles.hint}>No media available.</Box>
        ) : (
          <List dense>
            {items
              .filter((item) => !search || item.title.toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <ListItemButton key={item.id} onClick={() => onSelect(item)}>
                  <ListItemText primary={item.title} secondary={`${item.source} · ${item.type}`} />
                </ListItemButton>
              ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
        <Button onClick={onClose} sx={{ width: { xs: "100%", sm: "auto" }, minHeight: "40px" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
