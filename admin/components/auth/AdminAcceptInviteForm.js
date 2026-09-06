import { useEffect, useMemo, useState } from "react";
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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useAdminAuth } from "./AdminAuthProvider";
import styles from "./AdminAcceptInviteForm.module.css";

export function AdminAcceptInviteForm() {
  const router = useRouter();
  const { signIn } = useAdminAuth();

  const [tokenInput, setTokenInput] = useState("");
  const [activeToken, setActiveToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const queryToken = router.query.token;
      if (typeof queryToken === "string" && queryToken.trim()) {
        setActiveToken(queryToken.trim());
        setTokenInput(queryToken.trim());
      } else {
        setIsVerifying(false);
      }
    }
  }, [router.isReady, router.query.token]);

  useEffect(() => {
    if (!activeToken) return;

    let isMounted = true;
    setIsVerifying(true);
    setVerifyError("");

    fetch(`/api/admin/auth/verify-invite?token=${encodeURIComponent(activeToken)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.data) {
          setInviteDetails(data.data);
        } else {
          setVerifyError(data.error?.message || "Invalid or expired invitation token.");
          setInviteDetails(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setVerifyError("Unable to verify invitation token. Please check your network connection.");
      })
      .finally(() => {
        if (isMounted) setIsVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeToken]);

  const passwordRules = useMemo(() => [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "Number digit (0-9)", valid: /[0-9]/.test(password) },
  ], [password]);

  const isPasswordValid = passwordRules.every((r) => r.valid);
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  async function handleAccept(e) {
    e.preventDefault();
    if (!isPasswordValid) {
      setSubmitError("Please ensure your password satisfies all security criteria.");
      return;
    }
    if (!doPasswordsMatch) {
      setSubmitError("Passwords do not match. Please retype and verify.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: activeToken,
          displayName: displayName.trim(),
          password,
        }),
      });
      const result = await res.json();

      if (!result.success) {
        setSubmitError(result.error?.message || "Unable to complete registration.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      // Attempt seamless sign-in with newly configured credentials
      try {
        await signIn({ email: inviteDetails.email, password, next: "/" });
      } catch {
        // Fallback: router push to login
        setTimeout(() => router.replace("/login"), 1800);
      }
    } catch {
      setSubmitError("A network error occurred while configuring your account.");
      setIsSubmitting(false);
    }
  }

  function handleManualTokenSubmit(e) {
    e.preventDefault();
    if (tokenInput.trim()) {
      setActiveToken(tokenInput.trim());
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
            <Typography className={styles.eyebrow} variant="overline">ROYZ HOUZ ENTERPRISE</Typography>
            <Typography component="h1" variant="h4" className={styles.title}>
              {isSuccess ? "Welcome Aboard" : "Accept Admin Invitation"}
            </Typography>
            <Typography variant="body2" className={styles.description}>
              {isSuccess
                ? "Your administrative security credentials are confirmed. Launching studio…"
                : "Complete your administrator profile to access the Royz Houz operational suite."}
            </Typography>
          </Box>

          {isVerifying ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={32} sx={{ color: "#B46A2C" }} />
              <Typography variant="body2" color="text.secondary">Verifying invitation credentials…</Typography>
            </Stack>
          ) : isSuccess ? (
            <Box className={styles.successCard}>
              <div className={styles.successIconBadge}>
                <CheckCircleOutlineIcon fontSize="large" />
              </div>
              <Typography variant="h5" className={styles.successTitle}>Account Activated</Typography>
              <Typography variant="body2" className={styles.successText}>
                Welcome to Royz Houz, <strong>{displayName}</strong>. You are assigned as <strong>{inviteDetails?.roleName}</strong>.
              </Typography>
              <Button component={Link} href="/" variant="contained" className={styles.submitButton}>
                Open Admin Studio
              </Button>
            </Box>
          ) : !inviteDetails ? (
            <Stack spacing={2.5}>
              {verifyError ? (
                <Alert severity="error" className={styles.alert}>
                  {verifyError}
                </Alert>
              ) : null}
              <Box component="form" onSubmit={handleManualTokenSubmit}>
                <Stack spacing={2}>
                  <div className={styles.formField}>
                    <label htmlFor="manual-token" className={styles.fieldLabel}>Enter Invitation Token</label>
                    <TextField
                      id="manual-token"
                      fullWidth
                      placeholder="Paste your invitation token here"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className={styles.textInput}
                    />
                  </div>
                  <Button type="submit" variant="contained" className={styles.submitButton}>
                    Verify Token
                  </Button>
                </Stack>
              </Box>
              <Box className={styles.footerBox}>
                <Link href="/login" className={styles.backLink}>
                  <ArrowBackOutlinedIcon fontSize="inherit" /> Return to Sign In
                </Link>
              </Box>
            </Stack>
          ) : (
            <Box component="form" onSubmit={handleAccept} noValidate>
              <Stack spacing={2.5}>
                {submitError ? (
                  <Alert severity="error" className={styles.alert}>
                    {submitError}
                  </Alert>
                ) : null}

                <Box className={styles.inviteBadgeCard}>
                  <div className={styles.inviteBadgeRow}>
                    <div>
                      <div className={styles.inviteEmailLabel}>Invited Account</div>
                      <div className={styles.inviteEmailValue}>{inviteDetails.email}</div>
                    </div>
                    <span className={styles.roleChip}>{inviteDetails.roleName}</span>
                  </div>
                </Box>

                <div className={styles.formField}>
                  <label htmlFor="display-name" className={styles.fieldLabel}>Full Display Name</label>
                  <TextField
                    id="display-name"
                    required
                    fullWidth
                    placeholder="e.g. John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isSubmitting}
                    className={styles.textInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon fontSize="small" className={styles.adornmentIcon} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="invite-password" className={styles.fieldLabel}>Create Security Password</label>
                  <TextField
                    id="invite-password"
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
                  <label htmlFor="confirm-password" className={styles.fieldLabel}>Confirm Security Password</label>
                  <TextField
                    id="confirm-password"
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
                  disabled={isSubmitting || !displayName.trim() || !isPasswordValid || !doPasswordsMatch}
                  className={styles.submitButton}
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
                >
                  {isSubmitting ? "Configuring Account…" : "Activate Administrator Account"}
                </Button>
              </Stack>
            </Box>
          )}

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
