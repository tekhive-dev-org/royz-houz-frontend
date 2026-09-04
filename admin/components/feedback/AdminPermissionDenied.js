import Link from "next/link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";
import styles from "./AdminPermissionDenied.module.css";

export function AdminPermissionDenied({ permission }) {
  return (
    <Paper component="section" elevation={0} className={styles.card} aria-labelledby="permission-denied-title">
      <Box className={styles.iconWrap}>
        <LockOutlinedIcon aria-hidden="true" />
      </Box>
      <Typography id="permission-denied-title" component="h1" variant="h5" className={styles.title}>
        Permission required
      </Typography>
      <Typography variant="body2" className={styles.description}>
        You do not have permission to access this area{permission ? ` (${permission})` : ""}.
      </Typography>
      <Button component={Link} href="/" variant="outlined" className={styles.action}>
        Return to dashboard
      </Button>
    </Paper>
  );
}
