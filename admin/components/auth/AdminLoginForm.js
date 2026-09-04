import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAdminAuth } from "./AdminAuthProvider";
import styles from "./AdminLoginForm.module.css";

export function AdminLoginForm({ next, sessionExpired = false }) {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn({ email: email.trim(), password, next });
      if (!result.success) setError(result.message);
    } catch {
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="main" className={styles.page}>
      <Paper component="section" elevation={0} className={styles.card} aria-labelledby="admin-login-title">
        <Stack spacing={3}>
          <Box>
            <div className={styles.logoBadge}>
              <span className={styles.logoInitial}>RH</span>
            </div>
            <Typography className={styles.eyebrow} variant="overline">
              ROYZ HOUZ
            </Typography>
            <Typography id="admin-login-title" component="h1" variant="h4" className={styles.title}>
              Admin Studio
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Secure credential authentication for authorized platform administrators.
            </Typography>
          </Box>

          {sessionExpired ? (
            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              Your session expired. Please sign in again.
            </Alert>
          ) : null}
          {error ? (
            <Alert severity="error" sx={{ borderRadius: "10px" }}>
              {error}
            </Alert>
          ) : null}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                id="admin-email"
                label="Administrator Email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                className={styles.darkInput}
              />
              <TextField
                required
                fullWidth
                id="admin-password"
                label="Security Password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                className={styles.darkInput}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className={styles.submitButton}
                startIcon={<LockOutlinedIcon />}
              >
                {isSubmitting ? "Authenticating…" : "Enter Studio"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
