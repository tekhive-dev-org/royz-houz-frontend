import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { getAdminBrowserClient } from "@/lib/supabase/browser";
import styles from "./AdminForgotPasswordForm.module.css";

export function AdminForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      const supabase = getAdminBrowserClient();
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "/reset-password";

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        setError(resetError.message || "Failed to dispatch password recovery email.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError("Unable to process password reset request. Please check your network connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="main" className={styles.page}>
      <Paper component="section" elevation={0} className={styles.card} aria-labelledby="forgot-password-title">
        <Stack spacing={3.5}>
          {/* Header with Official Logo */}
          <Box className={styles.headerArea}>
            <div className={styles.logoContainer}>
              <Image
                src="/logo.png"
                alt="Royz House Official Logo"
                width={52}
                height={52}
                className={styles.logoImg}
                priority
              />
            </div>
            <Typography className={styles.eyebrow} variant="overline">
              ROYZ HOUZ ENTERPRISE
            </Typography>
            <Typography
              id="forgot-password-title"
              component="h1"
              variant="h4"
              className={styles.title}
            >
              Reset Password
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Enter your registered administrator email to receive secure password recovery instructions.
            </Typography>
          </Box>

          {isSuccess ? (
            <Box className={styles.successCard}>
              <div className={styles.successIconBadge}>
                <MarkEmailReadOutlinedIcon fontSize="large" />
              </div>
              <Typography variant="h5" className={styles.successTitle}>
                Check Your Inbox
              </Typography>
              <Typography variant="body2" className={styles.successText}>
                If an administrator account exists for{" "}
                <span className={styles.successEmail}>{email}</span>, a secure password reset link has been dispatched.
              </Typography>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                className={styles.submitButton}
                sx={{ width: "100%", mt: 1 }}
              >
                Return to Sign In
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
                  <label htmlFor="reset-email" className={styles.fieldLabel}>
                    Administrator Email
                  </label>
                  <TextField
                    id="reset-email"
                    required
                    fullWidth
                    type="email"
                    autoComplete="email"
                    placeholder="admin@royzhouz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className={styles.textInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MailOutlineOutlinedIcon fontSize="small" className={styles.adornmentIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !email.trim()}
                  className={styles.submitButton}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <MailOutlineOutlinedIcon />}
                >
                  {isSubmitting ? "Sending Reset Link…" : "Send Reset Instructions"}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Footer Navigation & Trust Badge */}
          <Box className={styles.footerBox}>
            <Link href="/login" className={styles.returnSignInLink}>
              <ArrowBackOutlinedIcon fontSize="small" />
              <span>Return to Sign In</span>
            </Link>

            <div className={styles.securityNote}>
              <ShieldOutlinedIcon className={styles.shieldIcon} />
              <span>Protected by enterprise session authentication &amp; RLS policies.</span>
            </div>

            <Link href="http://localhost:3000" className={styles.backLink}>
              <span>Return to Public Website</span>
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
