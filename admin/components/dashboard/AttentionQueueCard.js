import { useState } from "react";
import Link from "next/link";
import { Button, Paper, Typography } from "@mui/material";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import CommentOutlinedIcon from "@mui/icons-material/CommentOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import styles from "./AttentionQueueCard.module.css";

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TYPE_CONFIG = {
  application: {
    icon: AssignmentIndOutlinedIcon,
    pillClass: styles.typeApplication,
  },
  contact: {
    icon: MailOutlineOutlinedIcon,
    pillClass: styles.typeContact,
  },
  comment: {
    icon: CommentOutlinedIcon,
    pillClass: styles.typeComment,
  },
};

export function AttentionQueueCard({ items = [] }) {
  const [filter, setFilter] = useState("all");

  const appCount = items.filter((i) => i.type === "application").length;
  const contactCount = items.filter((i) => i.type === "contact").length;
  const commentCount = items.filter((i) => i.type === "comment").length;

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  return (
    <Paper elevation={0} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.headingRow}>
            <Typography component="h2" variant="h6" className={styles.title}>
              Action Required Queue
            </Typography>
            <span className={items.length > 0 ? styles.countBadgeAlert : styles.countBadgeClear}>
              {items.length} Pending
            </span>
          </div>
          <Typography variant="body2" className={styles.description}>
            Items awaiting administrative moderation, candidate review, or response.
          </Typography>
        </div>

        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({items.length})
          </button>
          {appCount > 0 && (
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === "application" ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter("application")}
            >
              Applications ({appCount})
            </button>
          )}
          {contactCount > 0 && (
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === "contact" ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter("contact")}
            >
              Inquiries ({contactCount})
            </button>
          )}
          {commentCount > 0 && (
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === "comment" ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter("comment")}
            >
              Comments ({commentCount})
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <TaskAltOutlinedIcon className={styles.emptyIcon} />
          </div>
          <Typography variant="subtitle1" className={styles.emptyTitle}>
            All administrative queues are clear
          </Typography>
          <Typography variant="body2" className={styles.emptyDesc}>
            There are no pending submissions, comments, or applications awaiting review at this time.
          </Typography>
        </div>
      ) : (
        <div className={styles.itemList}>
          {filteredItems.map((item) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.contact;
            const Icon = conf.icon;
            return (
              <div key={item.id} className={styles.itemRow}>
                <div className={styles.itemLeft}>
                  <div className={`${styles.itemIconBadge} ${conf.pillClass}`}>
                    <Icon fontSize="small" />
                  </div>
                  <div className={styles.itemMeta}>
                    <div className={styles.itemTopRow}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <span className={`${styles.typeBadge} ${conf.pillClass}`}>
                        {item.typeLabel}
                      </span>
                      <span className={styles.itemTime}>
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className={styles.itemSubtitle}>{item.subtitle}</p>
                    {item.email && <span className={styles.itemEmail}>{item.email}</span>}
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <Button
                    component={Link}
                    href={item.href}
                    size="small"
                    variant="outlined"
                    endIcon={<LaunchOutlinedIcon fontSize="inherit" />}
                    className={styles.actionBtn}
                  >
                    {item.actionLabel}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Paper>
  );
}
