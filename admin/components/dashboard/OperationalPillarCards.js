import Link from "next/link";
import { Box, Paper, Typography } from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import styles from "./OperationalPillarCards.module.css";

function getCardValue(cards, key, fallback = 0) {
  if (!Array.isArray(cards)) return fallback;
  const match = cards.find((c) => c.key === key);
  return typeof match?.value === "number" ? match.value : fallback;
}

export function OperationalPillarCards({ cards = [] }) {
  const activeTalents = getCardValue(cards, "activeTalents");
  const upcomingEvents = getCardValue(cards, "upcomingEvents");
  const publishedBlogPosts = getCardValue(cards, "publishedBlogPosts");
  const mediaAssets = getCardValue(cards, "mediaAssets");
  const newJoinApplications = getCardValue(cards, "newJoinApplications");
  const newContactSubmissions = getCardValue(cards, "newContactSubmissions");
  const pendingComments = getCardValue(cards, "pendingComments");

  const pendingTotal = newJoinApplications + newContactSubmissions + pendingComments;

  const pillars = [
    {
      id: "talents",
      title: "Talents Roster",
      count: activeTalents,
      unit: "Artists & Talents",
      detail: "Verified profiles in active management",
      icon: GroupOutlinedIcon,
      href: "/talents",
      tag: "Active Roster",
      tagClass: styles.tagNeutral,
      accentClass: styles.accentGold,
    },
    {
      id: "events",
      title: "Upcoming Productions",
      count: upcomingEvents,
      unit: "Live Productions",
      detail: "Concerts, tours & calendar bookings",
      icon: EventOutlinedIcon,
      href: "/events",
      tag: upcomingEvents > 0 ? `${upcomingEvents} Upcoming` : "Scheduled",
      tagClass: styles.tagBlue,
      accentClass: styles.accentBlue,
    },
    {
      id: "editorial",
      title: "Editorial & Media",
      count: publishedBlogPosts,
      unit: "Published Articles",
      detail: `${mediaAssets} assets cataloged in library`,
      icon: AutoStoriesOutlinedIcon,
      href: "/blog",
      tag: "Live Stories",
      tagClass: styles.tagGreen,
      accentClass: styles.accentGreen,
    },
    {
      id: "pipeline",
      title: "Review & Inflow Desk",
      count: pendingTotal,
      unit: "Pending Actions",
      detail: `${newJoinApplications} apps • ${newContactSubmissions} messages`,
      icon: MarkEmailUnreadOutlinedIcon,
      href: "/join-applications",
      tag: pendingTotal > 0 ? "Requires Review" : "Queue Clear",
      tagClass: pendingTotal > 0 ? styles.tagWarning : styles.tagSuccess,
      accentClass: styles.accentAmber,
    },
  ];

  return (
    <Box className={styles.container} aria-label="Core operational pillars">
      {pillars.map((pillar) => {
        const Icon = pillar.icon;
        return (
          <Paper
            key={pillar.id}
            elevation={0}
            component={Link}
            href={pillar.href}
            className={`${styles.card} ${pillar.accentClass}`}
          >
            <div className={styles.topRow}>
              <div className={styles.iconWrapper}>
                <Icon fontSize="small" className={styles.icon} />
              </div>
              <span className={`${styles.statusBadge} ${pillar.tagClass}`}>
                {pillar.tag}
              </span>
            </div>

            <div className={styles.body}>
              <Typography variant="overline" className={styles.title}>
                {pillar.title}
              </Typography>
              <div className={styles.metricRow}>
                <span className={styles.count}>{pillar.count}</span>
                <span className={styles.unit}>{pillar.unit}</span>
              </div>
              <p className={styles.detail}>{pillar.detail}</p>
            </div>

            <div className={styles.footerRow}>
              <span className={styles.footerLink}>Open Workspace</span>
              <ArrowForwardOutlinedIcon className={styles.arrowIcon} />
            </div>
          </Paper>
        );
      })}
    </Box>
  );
}
