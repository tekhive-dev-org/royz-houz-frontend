import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Box, Chip, Paper, Typography } from "@mui/material";
import styles from "./MerchandiseComingSoon.module.css";

export function MerchandiseComingSoon() {
  return (
    <Box>
      <Chip label="Coming soon" size="small" className={styles.chip} />
      <Typography component="h1" variant="h4" className={styles.title}>
        Merchandise Management — Coming Soon.
      </Typography>
      <Typography variant="body1" className={styles.description}>
        Merchandise administration is not available yet. This area is a preview only and does not include product, inventory, or order features.
      </Typography>

      <Paper elevation={0} className={styles.card}>
        <StorefrontOutlinedIcon className={styles.cardIcon} aria-hidden="true" />
        <Typography variant="body2" className={styles.cardText}>
          No merchandise data is loaded here.
        </Typography>
      </Paper>
    </Box>
  );
}
