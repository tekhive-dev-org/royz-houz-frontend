import Link from "next/link";
import { Button, Paper, Typography } from "@mui/material";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import styles from "./UpcomingEventsWidget.module.css";

function formatEventDate(dateString) {
  if (!dateString) return { month: "TBD", day: "--", time: "TBD" };
  const d = new Date(dateString);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function UpcomingEventsWidget({ events = [] }) {
  return (
    <Paper elevation={0} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <EventOutlinedIcon className={styles.headerIcon} />
          <div className={styles.titleWrapper}>
            <Typography component="h2" variant="h6" className={styles.title}>
              Live Production Schedule
            </Typography>
            <Typography variant="caption" className={styles.subtitle}>
              Upcoming showcases, concerts &amp; appearances
            </Typography>
          </div>
        </div>


        <Button
          component={Link}
          href="/events"
          size="small"
          endIcon={<ArrowForwardOutlinedIcon fontSize="inherit" />}
          className={styles.viewAllBtn}
        >
          Manage All
        </Button>
      </div>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No upcoming events scheduled at this time.</p>
          <Button
            component={Link}
            href="/events?action=new"
            size="small"
            variant="outlined"
            startIcon={<AddOutlinedIcon fontSize="small" />}
            className={styles.addBtn}
          >
            Schedule Event
          </Button>
        </div>
      ) : (
        <div className={styles.eventList}>
          {events.slice(0, 3).map((event) => {
            const date = formatEventDate(event.starts_at);
            const venue = event.venue_name || event.location || "Venue TBA";

            return (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.dateBadge}>
                  <span className={styles.dateMonth}>{date.month}</span>
                  <span className={styles.dateDay}>{date.day}</span>
                </div>

                <div className={styles.eventInfo}>
                  <div className={styles.eventTitleRow}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    {event.featured && (
                      <span className={styles.featuredBadge}>Featured</span>
                    )}
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaItem}>
                      <LocationOnOutlinedIcon fontSize="inherit" className={styles.metaIcon} />
                      <span className={styles.metaText}>{venue}</span>
                    </span>
                    <span className={styles.metaItem}>
                      <AccessTimeOutlinedIcon fontSize="inherit" className={styles.metaIcon} />
                      <span className={styles.metaText}>{date.time}</span>
                    </span>
                  </div>
                </div>

                <Link href={`/events?edit=${event.id}`} className={styles.editLink}>
                  Edit
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </Paper>
  );
}
