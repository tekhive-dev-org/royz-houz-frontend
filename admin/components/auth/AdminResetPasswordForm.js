import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { getAdminBrowserClient } from "@/lib/supabase/browser";
import styles from "./AdminResetPasswordForm.module.css";

export function AdminResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordRules = useMemo(() => [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "Number digit (0-9)", valid: /[0-9]/.test(password) },
  ], [password]);

  const isPasswordValid = passwordRules.every((r) => r.valid);
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isPasswordValid) {
      setError("Please ensure your new password satisfies all security criteria.");
      return;
    }
    if (!doPasswordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const supabase = getAdminBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message || "Failed to update security password.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch {
      setError("An error occurred while updating your password.");
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="main" className={styles.page}>
      <Paper component="section" elevation={0} className={styles.card}>
        <Stack spacing={3.5}>
          <Box className={styles.headerArea}>
            <div className={styles.logoContainer}>
              <Image src="/logo.png" alt="Royz House Logo" width={52} height={52} className={styles.logoImg} priority />
            </div>
            <Typography className={styles.eyebrow} variant="overline">ROYZ HOUZ SECURITY</Typography>
            <Typography component="h1" variant="h4" className={styles.title}>
              Set New Password
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Create a new secure password for your administrator account.
            </Typography>
          </Box>

          {isSuccess ? (
            <Box className={styles.successCard}>
              <div className={styles.successIconBadge}>
                <CheckCircleOutlineIcon fontSize="large" />
              </div>
              <Typography variant="h5" className={styles.successTitle}>Password Updated</Typography>
              <Typography variant="body2" className={styles.successText}>
                Your administrator credentials have been updated successfully. Redirecting to sign in…
              </Typography>
              <Button component={Link} href="/login" variant="contained" className={styles.submitButton}>
                Sign In Now
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {error ? (
                  <Alert severity="error" className={styles.alert}>
                    {error}
                  </Alert>
                ) : null}

                <div className={styles.formField}>
                  <label htmlFor="new-password" className={styles.fieldLabel}>New Security Password</label>
                  <TextField
                    id="new-password"
                    required
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={styles.textInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" className={styles.adornmentIcon} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword((p) => !p)}
                            edge="end"
                            className={styles.visibilityBtn}
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                {password ? (
                  <Box className={styles.passwordMeter}>
                    <div className={styles.meterLabel}>Password Requirements</div>
                    <div className={styles.ruleList}>
                      {passwordRules.map((r) => (
                        <div key={r.label} className={`${styles.ruleItem} ${r.valid ? styles.ruleValid : styles.ruleInvalid}`}>
                          {r.valid ? <CheckCircleOutlineIcon fontSize="inherit" /> : <RadioButtonUncheckedIcon fontSize="inherit" />}
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </Box>
                ) : null}

                <div className={styles.formField}>
                  <label htmlFor="confirm-new-password" className={styles.fieldLabel}>Confirm New Password</label>
                  <TextField
                    id="confirm-new-password"
                    required
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    error={Boolean(confirmPassword && !doPasswordsMatch)}
                    helperText={confirmPassword && !doPasswordsMatch ? "Passwords do not match" : ""}
                    className={styles.textInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon fontSize="small" className={styles.adornmentIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                  className={styles.submitButton}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
                >
                  {isSubmitting ? "Updating Password…" : "Update Security Password"}
                </Button>
              </Stack>
            </Box>
          )}

          <Box className={styles.footerBox}>
            <Link href="/login" className={styles.backLink}>
              <ArrowBackOutlinedIcon fontSize="inherit" />
              <span>Return to Sign In</span>
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
