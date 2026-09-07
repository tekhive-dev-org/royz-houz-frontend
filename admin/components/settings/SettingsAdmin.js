import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { SettingsStatsBanner } from "./SettingsStatsBanner";
import styles from "./SettingsAdmin.module.css";

const QUICK_LINKS = [
  {
    title: "Website Settings",
    desc: "Navigation, footer, social, contact info & general settings",
    href: "/website",
    icon: LanguageOutlinedIcon,
  },
  {
    title: "SEO Metadata",
    desc: "Global defaults and per-entity search & Open Graph overrides",
    href: "/seo",
    icon: ManageSearchOutlinedIcon,
  },
  {
    title: "Users & Roles",
    desc: "Admin profiles, role assignments and invitations",
    href: "/users-and-roles",
    icon: SecurityOutlinedIcon,
  },
  {
    title: "Audit Logs",
    desc: "Sensitive mutation audit trail and security logs",
    href: "/audit-logs",
    icon: ReceiptLongOutlinedIcon,
  },
  {
    title: "Media Library",
    desc: "Cloudinary asset uploads, YouTube embeds and collections",
    href: "/media",
    icon: PermMediaOutlinedIcon,
  },
];

export function SettingsAdmin({ admin }) {
  const [healthStatus, setHealthStatus] = useState(null);
  const [readinessStatus, setReadinessStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  async function checkDiagnostics() {
    setIsChecking(true);
    setError(null);
    try {
      const [livenessRes, readinessRes] = await Promise.all([
        fetch("/api/admin/health?check=liveness", { credentials: "include" }),
        fetch("/api/admin/health?check=readiness", { credentials: "include" }),
      ]);

      const livenessData = await livenessRes.json().catch(() => null);
      const readinessData = await readinessRes.json().catch(() => null);

      setHealthStatus({
        ok: livenessRes.ok,
        status: livenessData?.data?.status || (livenessRes.ok ? "alive" : "error"),
      });

      setReadinessStatus({
        ok: readinessRes.ok,
        status: readinessData?.data?.status || (readinessRes.ok ? "ready" : "not_ready"),
      });
    } catch (err) {
      setError(err.message || "Failed to run system diagnostics.");
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    void checkDiagnostics();
  }, []);

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          Settings & Diagnostics
        </Typography>
        <Typography variant="body1" className={styles.description}>
          Platform configuration overview, system health status, service connectivity, and management hubs.
        </Typography>
      </Box>

      <SettingsStatsBanner healthStatus={healthStatus} readinessStatus={readinessStatus} admin={admin} />

      {error ? (
        <Alert severity="warning" action={<Button color="inherit" size="small" onClick={checkDiagnostics}>Retry</Button>}>
          {error}
        </Alert>
      ) : null}

      <Box className={styles.grid}>
        {/* System Health Card */}
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Typography variant="h6" className={styles.cardTitle}>System Diagnostics</Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={isChecking ? <CircularProgress size={14} /> : <SyncOutlinedIcon fontSize="small" />}
              onClick={checkDiagnostics}
              disabled={isChecking}
            >
              Ping
            </Button>
          </Box>
          <Divider />
          <Stack spacing={2}>
            <Box className={styles.statusRow}>
              <Box
                className={`${styles.indicator} ${
                  healthStatus?.ok ? styles.indicatorActive : styles.indicatorError
                }`}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>Liveness Check</Typography>
                <Typography variant="caption" color="text.secondary">API server responds to HTTP requests</Typography>
              </Box>
              <Chip
                size="small"
                label={healthStatus?.status || (isChecking ? "checking…" : "unknown")}
                color={healthStatus?.ok ? "success" : "error"}
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            </Box>

            <Box className={styles.statusRow}>
              <Box
                className={`${styles.indicator} ${
                  readinessStatus?.ok ? styles.indicatorActive : styles.indicatorWarning
                }`}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>Production Readiness</Typography>
                <Typography variant="caption" color="text.secondary">Required environment variables verified</Typography>
              </Box>
              <Chip
                size="small"
                label={readinessStatus?.status || (isChecking ? "checking…" : "unknown")}
                color={readinessStatus?.ok ? "success" : "warning"}
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Integration Status Card */}
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Typography variant="h6" className={styles.cardTitle}>Services & Integrations</Typography>
            <Chip size="small" label="Active" color="success" icon={<CheckCircleOutlineIcon fontSize="small" />} sx={{ flexShrink: 0 }} />
          </Box>
          <Divider />
          <Stack spacing={2}>
            <Box className={styles.statusRow}>
              <StorageOutlinedIcon color="primary" fontSize="small" sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>Supabase Platform</Typography>
                <Typography variant="caption" color="text.secondary">Auth, PostgreSQL Database & Storage</Typography>
              </Box>
              <Chip size="small" label="Connected" color="success" variant="outlined" sx={{ flexShrink: 0 }} />
            </Box>

            <Box className={styles.statusRow}>
              <CloudDoneOutlinedIcon color="primary" fontSize="small" sx={{ flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>Cloudinary Media</Typography>
                <Typography variant="caption" color="text.secondary">Signed direct uploads & CDN delivery</Typography>
              </Box>
              <Chip size="small" label="Enabled" color="success" variant="outlined" sx={{ flexShrink: 0 }} />
            </Box>
          </Stack>
        </Paper>

        {/* Active Session & Role Card */}
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Typography variant="h6" className={styles.cardTitle}>Current Session</Typography>
            <Chip size="small" label="Authenticated" color="primary" sx={{ flexShrink: 0 }} />
          </Box>
          <Divider />
          <Stack spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">Admin User ID</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all", fontFamily: "monospace" }}>
                {admin?.userId || "Active Session"}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">Role / Status</Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                <Chip size="small" label={admin?.status || "active"} color="success" />
                {admin?.roles?.map((role) => (
                  <Chip key={role} size="small" label={role} variant="outlined" />
                ))}
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Quick Management Hub */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" className={styles.title} sx={{ mb: 1.5 }}>
          Administration Areas
        </Typography>
        <Box className={styles.quickLinks}>
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Paper
                key={link.href}
                component={Link}
                href={link.href}
                elevation={0}
                className={styles.quickLinkCard}
              >
                <Box className={styles.quickLinkIcon}>
                  <Icon fontSize="medium" />
                </Box>
                <Box className={styles.quickLinkText}>
                  <Typography variant="body2" className={styles.quickLinkTitle}>
                    {link.title}
                  </Typography>
                  <Typography variant="caption" className={styles.quickLinkDesc}>
                    {link.desc}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
