import { Box, Typography } from "@mui/material";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import styles from "./AuditStatsBanner.module.css";

export function AuditStatsBanner({ items = [], pagination = {} }) {
  const totalLogs = pagination.total || items.length;
  const createCount = items.filter((i) => (i.action || "").includes("create") || (i.action || "").includes("publish")).length;
  const updateCount = items.filter((i) => (i.action || "").includes("update") || (i.action || "").includes("edit")).length;
  const deleteCount = items.filter((i) => (i.action || "").includes("delete") || (i.action || "").includes("archive") || (i.action || "").includes("revoke")).length;

  const stats = [
    {
      id: "total",
      label: "Audit Trail Records",
      value: totalLogs,
      subtext: "Immutable system activity log",
      icon: <HistoryToggleOffIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "create",
      label: "Creation Events",
      value: createCount,
      subtext: `${createCount} new entities created on this page`,
      icon: <AddCircleOutlineIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "update",
      label: "Mutations & Edits",
      value: updateCount,
      subtext: `${updateCount} content updates logged`,
      icon: <EditNoteOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardBlue,
      iconVariant: styles.iconBlue,
    },
    {
      id: "delete",
      label: "Deletions & Revocations",
      value: deleteCount,
      subtext: `${deleteCount} destructive actions tracked`,
      icon: <DeleteSweepOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardRed,
      iconVariant: styles.iconRed,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Security Audit Statistics">
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

export default AuditStatsBanner;
