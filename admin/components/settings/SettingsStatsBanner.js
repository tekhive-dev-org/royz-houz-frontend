import { Box, Typography } from "@mui/material";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import styles from "./SettingsStatsBanner.module.css";

export function SettingsStatsBanner({ healthStatus, readinessStatus, admin }) {
  const isHealthy = healthStatus?.ok && readinessStatus?.ok;

  const stats = [
    {
      id: "health",
      label: "Platform Diagnostics",
      value: isHealthy ? "Healthy" : "Attention Needed",
      subtext: healthStatus?.status ? `Liveness ${healthStatus.status} · Ready` : "Diagnostics running",
      icon: <SpeedOutlinedIcon fontSize="medium" />,
      cardVariant: isHealthy ? styles.statCardEmerald : styles.statCardCopper,
      iconVariant: isHealthy ? styles.iconEmerald : styles.iconCopper,
    },
    {
      id: "services",
      label: "Cloud Connectivity",
      value: "Connected",
      subtext: "Supabase PG & Cloudinary CDN online",
      icon: <DnsOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardBlue,
      iconVariant: styles.iconBlue,
    },
    {
      id: "session",
      label: "Operator Identity",
      value: admin?.roles?.[0] || "Administrator",
      subtext: admin?.status === "active" ? "Verified session key active" : "Authenticated session",
      icon: <ShieldOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardIndigo,
      iconVariant: styles.iconIndigo,
    },
    {
      id: "hubs",
      label: "Active Studios",
      value: "11 Modules",
      subtext: "All core management APIs active",
      icon: <HubOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="System Diagnostics Overview">
      {stats.map((stat) => (
        <Box key={stat.id} className={`${styles.statCard} ${stat.cardVariant}`}>
          <Box className={`${styles.iconWrapper} ${stat.iconVariant}`}>{stat.icon}</Box>
          <Box className={styles.statInfo}>
            <span className={styles.statLabel}>{stat.label}</span>
            <Typography variant="h5" className={styles.statValue}>
              {stat.value}
            </Typography>
            <span className={styles.statSubtext}>{stat.subtext}</span>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default SettingsStatsBanner;
