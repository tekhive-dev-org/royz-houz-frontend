import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import styles from "./FeaturePlaceholder.module.css";

export function FeaturePlaceholder({ title, description }) {
  return (
    <Stack spacing={3}>
      <Box>
        <Chip label="Coming soon" size="small" className={styles.chip} />
        <Typography component="h1" variant="h4" className={styles.title}>
          {title}
        </Typography>
        <Typography variant="body1" className={styles.description}>
          {description}
        </Typography>
      </Box>

      <Paper elevation={0} className={styles.card}>
        <ConstructionOutlinedIcon className={styles.cardIcon} aria-hidden="true" />
        <Box>
          <Typography component="h2" variant="subtitle1" className={styles.cardTitle}>
            Module in progress
          </Typography>
          <Typography variant="body2" className={styles.cardDescription}>
            This area is reserved for a future administration feature. Navigation and authorization boundaries are ready.
          </Typography>
        </Box>
      </Paper>
    </Stack>
  );
}
