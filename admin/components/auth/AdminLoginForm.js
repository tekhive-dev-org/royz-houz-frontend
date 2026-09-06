import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useAdminAuth } from "./AdminAuthProvider";
import styles from "./AdminLoginForm.module.css";

export function AdminLoginForm({ next, sessionExpired = false }) {
  const { signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError("Unable to authenticate credentials right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box component="main" className={styles.page}>
      <Paper
        component="section"
        elevation={0}
        className={styles.card}
        aria-labelledby="admin-login-title"
      >
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
              id="admin-login-title"
              component="h1"
              variant="h4"
              className={styles.title}
            >
              Admin Studio
            </Typography>
            <Typography variant="body2" className={styles.description}>
              Authorized personnel sign-in for platform operations, talent management, and publication controls.
            </Typography>
          </Box>

          {sessionExpired ? (
            <Alert severity="info" className={styles.alert}>
              Your session has expired. Please sign in again to continue.
            </Alert>
          ) : null}

          {error ? (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          ) : null}

          {/* Authentication Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <div className={styles.formField}>
                <label htmlFor="admin-email" className={styles.fieldLabel}>
                  Administrator Email
                </label>
                <TextField
                  required
                  fullWidth
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@royzhouz.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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

              <div className={styles.formField}>
                <label htmlFor="admin-password" className={styles.fieldLabel}>
                  Security Password
                </label>
                <TextField
                  required
                  fullWidth
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className={styles.visibilityBtn}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <div className={styles.formUtilityRow}>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className={styles.submitButton}
                startIcon={<LockOutlinedIcon />}
              >
                {isSubmitting ? "Authenticating Session…" : "Sign In to Studio"}
              </Button>

              <div className={styles.inviteHelpRow}>
                <span>Invited to join Royz Houz?</span>
                <Link href="/accept-invite" className={styles.inviteHelpLink}>
                  Accept invitation
                </Link>
              </div>
            </Stack>
          </Box>

          {/* Footer Security Badge & Public Site Return */}
          <Box className={styles.footerBox}>
            <div className={styles.securityNote}>
              <ShieldOutlinedIcon className={styles.shieldIcon} />
              <span>Protected by enterprise session authentication &amp; RLS policies.</span>
            </div>

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
