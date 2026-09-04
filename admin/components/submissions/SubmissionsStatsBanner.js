import { Box, Typography } from "@mui/material";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import styles from "./SubmissionsStatsBanner.module.css";

export function SubmissionsStatsBanner({ items = [], module = "contacts" }) {
  const isJoinApp = module === "join-applications";
  const totalCount = items.length;
  const newCount = items.filter((i) => (i.workflow_status || i.status) === "new").length;
  const reviewingCount = items.filter((i) => (i.workflow_status || i.status) === "reviewing").length;
  const resolvedCount = items.filter((i) => (i.workflow_status || i.status) === "resolved" || (i.workflow_status || i.status) === "contacted").length;

  const stats = [
    {
      id: "total",
      label: isJoinApp ? "Total Applications" : "Total Inquiries",
      value: totalCount,
      subtext: `${totalCount === 1 ? "1 submission" : `${totalCount} submissions`} on record`,
      icon: <InboxOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "new",
      label: "New & Unread",
      value: newCount,
      subtext: newCount > 0 ? "Requires staff triage" : "Inbox zero reached",
      icon: <MarkEmailUnreadOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardAmber,
      iconVariant: styles.iconAmber,
    },
    {
      id: "reviewing",
      label: "Under Active Review",
      value: reviewingCount,
      subtext: `${reviewingCount} currently with reviewer`,
      icon: <PendingActionsOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardBlue,
      iconVariant: styles.iconBlue,
    },
    {
      id: "resolved",
      label: isJoinApp ? "Accepted & Onboarded" : "Resolved & Replied",
      value: resolvedCount,
      subtext: `${resolvedCount} completed workflows`,
      icon: <HowToRegOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Submissions Workflow Statistics">
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

export default SubmissionsStatsBanner;
