import { Box, Typography } from "@mui/material";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import styles from "./PlatformHealthBar.module.css";

const HEALTH_SIGNALS = [
  {
    id: "db",
    label: "PostgreSQL Database",
    status: "Operational",
    icon: StorageOutlinedIcon,
  },
  {
    id: "storage",
    label: "Storage CDN",
    status: "Active",
    icon: CloudDoneOutlinedIcon,
  },
  {
    id: "rls",
    label: "Row-Level Security (RLS)",
    status: "Enforced",
    icon: ShieldOutlinedIcon,
  },
  {
    id: "engine",
    label: "Admin Studio Engine",
    status: "Online",
    icon: BoltOutlinedIcon,
  },
];

export function PlatformHealthBar() {
  return (
    <Box className={styles.bar} aria-label="Platform infrastructure health">
      <div className={styles.titleWrap}>
        <span className={styles.healthDot} />
        <Typography variant="overline" className={styles.title}>
          System Status
        </Typography>
      </div>

      <div className={styles.signalsGrid}>
        {HEALTH_SIGNALS.map((signal) => {
          const Icon = signal.icon;
          return (
            <div key={signal.id} className={styles.signalItem}>
              <Icon className={styles.signalIcon} fontSize="small" />
              <div className={styles.signalText}>
                <span className={styles.signalLabel}>{signal.label}</span>
                <span className={styles.signalStatus}>{signal.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
}
