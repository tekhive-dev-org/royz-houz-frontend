import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { ADMIN_FOUNDATION_STATUS } from "@/constants/admin";
import styles from "./AdminFoundation.module.css";

/**
 * Dashboard landing content. It renders no CMS data and no module forms; it
 * confirms the authenticated shell and its supporting boundaries are ready.
 */
export function AdminFoundation() {
  return (
    <Stack spacing={3}>
      <Box>
        <Chip label="Dashboard" size="small" className={styles.chip} />
        <Typography component="h1" variant="h4" className={styles.title}>
          Royz Houz administration
        </Typography>
        <Typography variant="body1" className={styles.description}>
          The responsive admin workspace is ready for future content-management modules.
        </Typography>
      </Box>

      <Paper elevation={0} className={styles.statusCard}>
        <CheckCircleOutlineIcon className={styles.statusIcon} aria-hidden="true" />
        <Box>
          <Typography component="h2" variant="subtitle1" className={styles.statusTitle}>
            {ADMIN_FOUNDATION_STATUS.label}
          </Typography>
          <Typography variant="body2" className={styles.statusDescription}>
            {ADMIN_FOUNDATION_STATUS.description}
          </Typography>
        </Box>
      </Paper>
    </Stack>
  );
}
