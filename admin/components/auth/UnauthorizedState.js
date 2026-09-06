import Image from "next/image";
import Link from "next/link";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import GppBadOutlinedIcon from "@mui/icons-material/GppBadOutlined";
import { useAdminAuth } from "./AdminAuthProvider";
import styles from "./UnauthorizedState.module.css";

export function UnauthorizedState() {
  const { session, signOut } = useAdminAuth();
  const userEmail = session?.user?.email;

  return (
    <Box component="main" className={styles.page}>
      <Paper component="section" elevation={0} className={styles.card} aria-labelledby="unauthorized-title">
        <Stack spacing={3.5}>
          <Box className={styles.headerArea}>
            <div className={styles.logoContainer}>
              <Image src="/logo.png" alt="Royz House Logo" width={52} height={52} className={styles.logoImg} priority />
            </div>
            <Typography className={styles.eyebrow} variant="overline">
              ACCESS RESTRICTED
            </Typography>
            <Typography id="unauthorized-title" component="h1" variant="h4" className={styles.title}>
              Administrative Access Required
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Your account is authenticated, but does not possess an active Royz Houz administrative profile or assigned security role.
            </Typography>
          </Box>

          {userEmail ? (
            <Box className={styles.warningBox}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <GppBadOutlinedIcon fontSize="small" sx={{ color: "#EF4444" }} />
                <span>
                  Signed in as <strong>{userEmail}</strong>. Contact a super administrator to request access.
                </span>
              </Stack>
            </Box>
          ) : null}

          <div className={styles.actionsStack}>
            <Button
              variant="contained"
              onClick={signOut}
              startIcon={<LogoutOutlinedIcon />}
              className={styles.primaryButton}
            >
              Sign In with Different Account
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              className={styles.secondaryButton}
            >
              Return to Sign In
            </Button>
          </div>

          <Box className={styles.footerBox}>
            <Link href="http://localhost:3000" className={styles.backLink}>
              <ArrowBackOutlinedIcon fontSize="inherit" />
              <span>Return to Public Website</span>
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
