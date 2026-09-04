import Link from "next/link";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import styles from "./UnauthorizedState.module.css";

export function UnauthorizedState() {
  return (
    <Box component="main" className={styles.page}>
      <Paper component="section" elevation={0} className={styles.card} aria-labelledby="unauthorized-title">
        <Stack spacing={2}>
          <Typography variant="overline" className={styles.eyebrow}>
            Access restricted
          </Typography>
          <Typography id="unauthorized-title" component="h1" variant="h4" className={styles.title}>
            Administrator access required
          </Typography>
          <Typography variant="body1" className={styles.description}>
            Your account is authenticated but does not have an active Royz Houz administrative profile and role.
          </Typography>
          <Button component={Link} href="/login" variant="contained" className={styles.button}>
            Return to sign in
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
