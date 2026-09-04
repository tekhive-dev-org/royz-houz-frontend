import { Box, CircularProgress, Typography } from "@mui/material";
import styles from "./AdminLoadingState.module.css";

export function AdminLoadingState({ label = "Loading admin workspace…" }) {
  return (
    <Box className={styles.loading} role="status" aria-live="polite">
      <CircularProgress size={30} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
