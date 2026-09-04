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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select {type}</DialogTitle>
      <DialogContent>
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
