import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Box, Paper, Typography } from "@mui/material";
import styles from "./DashboardSummaryCard.module.css";

const ICONS = {
  activeTalents: GroupOutlinedIcon,
  donationRecords: VolunteerActivismOutlinedIcon,
  draftContent: ArticleOutlinedIcon,
  mediaAssets: PermMediaOutlinedIcon,
  newContactSubmissions: NotificationsActiveOutlinedIcon,
  newJoinApplications: CampaignOutlinedIcon,
  pendingComments: CommentOutlinedIcon,
  publishedBlogPosts: ArticleOutlinedIcon,
  publishedContent: PublishOutlinedIcon,
  scheduledContent: ScheduleOutlinedIcon,
  upcomingEvents: EventOutlinedIcon,
};

export function DashboardSummaryCard({ card }) {
  if (!card.visible) {
    return (
      <Paper elevation={0} className={`${styles.card} ${styles.lockedCard}`} aria-label={`${card.label} (no permission)`}>
        <Box className={styles.lockedIconWrap}>
          <LockOutlinedIcon fontSize="small" aria-hidden="true" />
        </Box>
        <Typography variant="body2" className={styles.lockedLabel}>
          {card.label}
        </Typography>
        <Typography variant="caption" className={styles.lockedHint}>
          Requires permission
        </Typography>
      </Paper>
    );
  }

  const Icon = ICONS[card.key] || CalendarTodayOutlinedIcon;
  const value = card.value === null ? "—" : typeof card.value === "number" ? card.value.toLocaleString() : card.value;

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.topRow}>
        <Box className={styles.iconCircle}>
          <Icon className={styles.icon} aria-hidden="true" />
        </Box>
        <Typography variant="overline" className={styles.label}>
          {card.label}
        </Typography>
      </Box>
      
      <Box className={styles.valueRow}>
        <Typography component="p" variant="h3" className={styles.value}>
          {value}
        </Typography>
        <span className={styles.trendBadge}>
          <TrendingUpOutlinedIcon fontSize="inherit" />
          <span>Active</span>
        </span>
      </Box>
    </Paper>
  );
}
