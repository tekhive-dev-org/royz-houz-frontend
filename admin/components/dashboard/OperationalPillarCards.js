import Link from "next/link";
import { Box, Paper, Typography } from "@mui/material";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import styles from "./OperationalPillarCards.module.css";

function getCardValue(cards, key, fallback = 0) {
  if (!Array.isArray(cards)) return fallback;
  const match = cards.find((c) => c.key === key);
  return typeof match?.value === "number" ? match.value : fallback;
}

function formatNaira(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "₦0";
  return `₦${amount.toLocaleString("en-NG")}`;
}

function formatPendingBreakdown(bookings, inquiries, apps, comments) {
  const parts = [];
  if (bookings > 0) parts.push(`${bookings} booking${bookings > 1 ? "s" : ""}`);
  if (inquiries > 0) parts.push(`${inquiries} inquir${inquiries > 1 ? "ies" : "y"}`);
  if (apps > 0) parts.push(`${apps} app${apps > 1 ? "s" : ""}`);
  if (comments > 0) parts.push(`${comments} comment${comments > 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" • ") : "All incoming queues clear";
}

export function OperationalPillarCards({ cards = [] }) {
  const activeTalents = getCardValue(cards, "activeTalents");
  const upcomingEvents = getCardValue(cards, "upcomingEvents");
  const totalEvents = getCardValue(cards, "totalEvents", upcomingEvents);
  const ticketRevenue = getCardValue(cards, "ticketRevenue");
  const paidTicketOrders = getCardValue(cards, "paidTicketOrders");
  const pendingTicketOrders = getCardValue(cards, "pendingTicketOrders");
  const publishedBlogPosts = getCardValue(cards, "publishedBlogPosts");
  const mediaAssets = getCardValue(cards, "mediaAssets");
  const pendingBookings = getCardValue(cards, "pendingBookings");
  const pendingContactSubmissions =
    getCardValue(cards, "pendingContactSubmissions") || getCardValue(cards, "newContactSubmissions");
  const pendingJoinApplications =
    getCardValue(cards, "pendingJoinApplications") || getCardValue(cards, "newJoinApplications");
  const pendingComments = getCardValue(cards, "pendingComments");

  const pendingTotal = pendingBookings + pendingContactSubmissions + pendingJoinApplications + pendingComments;

  const pillars = [
    {
      id: "talents",
      gridClass: styles.spanPrimary,
      title: "Talents Roster",
      count: activeTalents,
      unit: "Active Talents",
      chips: [
        `${activeTalents} Verified Artists`,
        "Roster Active",
      ],
      detail: "Verified profiles under active talent management.",
      icon: GroupOutlinedIcon,
      href: "/talents",
      actionText: "Manage Roster",
      tag: "Live Roster",
      tagClass: styles.tagNeutral,
      accentClass: styles.accentGold,
    },
    {
      id: "events",
      gridClass: styles.spanPrimary,
      title: "Live Productions",
      count: upcomingEvents,
      unit: "Upcoming Shows",
      chips: [
        `${upcomingEvents} Upcoming`,
        totalEvents > 0 ? `${totalEvents} Staged` : "Calendar",
      ],
      detail: "Concerts, tours, showcases, and stage calendar bookings.",
      icon: EventOutlinedIcon,
      href: "/events",
      actionText: "Schedule Events",
      tag: upcomingEvents > 0 ? `${upcomingEvents} Scheduled` : "Scheduled",
      tagClass: styles.tagBlue,
      accentClass: styles.accentBlue,
    },
    {
      id: "boxOffice",
      gridClass: `${styles.spanPrimary} ${styles.spanBoxOffice}`,
      title: "Box Office & Tickets",
      count: formatNaira(ticketRevenue),
      unit: "Gross Revenue",
      chips: [
        `${paidTicketOrders} Paid Orders`,
        `${pendingTicketOrders} In Checkout`,
      ],
      detail: "Verified Paystack ticket revenue and attendee order transactions.",
      icon: ConfirmationNumberOutlinedIcon,
      href: "/payments",
      actionText: "Inspect Box Office",
      tag: paidTicketOrders > 0 ? "Verified Revenue" : "Live Sales",
      tagClass: styles.tagPurple,
      accentClass: styles.accentPurple,
    },
    {
      id: "editorial",
      gridClass: styles.spanWorkflow,
      title: "Editorial & Media Library",
      count: publishedBlogPosts,
      unit: "Published Stories",
      chips: [
        `${publishedBlogPosts} Published Articles`,
        `${mediaAssets} Cataloged Assets`,
      ],
      detail: "Editorial publications, music showcases, and Cloudinary media assets.",
      icon: AutoStoriesOutlinedIcon,
      href: "/blog",
      actionText: "Editorial Studio",
      tag: "Catalog Active",
      tagClass: styles.tagGreen,
      accentClass: styles.accentGreen,
    },
    {
      id: "pipeline",
      gridClass: `${styles.spanWorkflow} ${styles.spanFullTablet}`,
      title: "Review & Inflow Desk",
      count: pendingTotal,
      unit: "Pending Actions",
      chips: [
        `${pendingBookings} Booking${pendingBookings === 1 ? "" : "s"}`,
        `${pendingContactSubmissions} Inquir${pendingContactSubmissions === 1 ? "y" : "ies"}`,
        `${pendingJoinApplications} Application${pendingJoinApplications === 1 ? "" : "s"}`,
      ],
      detail: formatPendingBreakdown(pendingBookings, pendingContactSubmissions, pendingJoinApplications, pendingComments),
      icon: MarkEmailUnreadOutlinedIcon,
      href: pendingBookings > 0 ? "/bookings" : (pendingContactSubmissions > 0 ? "/contacts" : "/join-applications"),
      actionText: "Process Inflow",
      tag: pendingTotal > 0 ? `${pendingTotal} Requires Review` : "Queues Clear",
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
            className={`${styles.card} ${pillar.accentClass} ${pillar.gridClass}`}
          >
            <div className={styles.topRow}>
              <div className={styles.iconWrapper}>
                <Icon fontSize="small" className={styles.icon} />
              </div>
              <span className={`${styles.statusBadge} ${pillar.tagClass}`}>
                <span className={styles.statusDot} />
                <span>{pillar.tag}</span>
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
              {pillar.chips && pillar.chips.length > 0 && (
                <div className={styles.chipsRow}>
                  {pillar.chips.map((chip, idx) => (
                    <span key={idx} className={styles.chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              <p className={styles.detail}>{pillar.detail}</p>
            </div>

            <div className={styles.footerRow}>
              <span className={styles.footerLink}>{pillar.actionText}</span>
              <ArrowForwardOutlinedIcon className={styles.arrowIcon} />
            </div>
          </Paper>
        );
      })}
    </Box>
  );
}
