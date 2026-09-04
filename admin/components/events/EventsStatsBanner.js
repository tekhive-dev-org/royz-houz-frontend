import { Box, Typography } from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import styles from "./EventsStatsBanner.module.css";

export function EventsStatsBanner({ items = [], featured = [] }) {
  const totalCount = items.length;
  const publishedCount = items.filter((e) => e.status === "published").length;
  const featuredCount = featured.length || items.filter((e) => Boolean(e.featured)).length;
  const upcomingCount = items.filter((e) => {
    const d = new Date(e.body?.startDate || e.date);
    return !isNaN(d.getTime()) && d >= new Date();
  }).length;

  const stats = [
    {
      id: "total",
      label: "Total Events",
      value: totalCount,
      subtext: `${totalCount === 1 ? "1 experience" : `${totalCount} experiences`} scheduled`,
      icon: <EventAvailableOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "published",
      label: "Published & Active",
      value: publishedCount,
      subtext: `${publishedCount} visible on public calendar`,
      icon: <CheckCircleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "upcoming",
      label: "Upcoming Dates",
      value: upcomingCount,
      subtext: `${upcomingCount} future shows & showcases`,
      icon: <ScheduleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardIndigo,
      iconVariant: styles.iconIndigo,
    },
    {
      id: "featured",
      label: "Featured Spotlight",
      value: featuredCount,
      subtext: `${featuredCount} spotlighted on homepage`,
      icon: <AutoAwesomeOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardGold,
      iconVariant: styles.iconGold,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Events Overview Statistics">
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

export default EventsStatsBanner;
