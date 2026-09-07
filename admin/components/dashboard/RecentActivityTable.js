import Link from "next/link";
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import styles from "./RecentActivityTable.module.css";

function formatActivityDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionColor(action = "") {
  if (action.includes("create") || action.includes("publish")) return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
  if (action.includes("delete") || action.includes("archive")) return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
  if (action.includes("update") || action.includes("edit")) return { bg: "#FAF4EF", text: "#B46A2C", border: "#F2E4D6" };
  return { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" };
}

export function RecentActivityTable({ activities = [], hidden = false }) {
  if (hidden) {
    return (
      <Paper elevation={0} className={styles.card}>
        <Box className={styles.header}>
          <Box className={styles.titleRow}>
            <HistoryOutlinedIcon className={styles.headerIcon} />
            <Typography component="h2" variant="h6" className={styles.title}>
              Administrative Audit Stream
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" className={styles.muted}>
          You do not have permission to view audit activity.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.header}>
        <Box className={styles.titleRow}>
          <HistoryOutlinedIcon className={styles.headerIcon} />
          <div>
            <Typography component="h2" variant="h6" className={styles.title}>
              Administrative Audit Stream
            </Typography>
            <Typography variant="caption" className={styles.subtitle}>
              Real-time audit trail of actions, publications, and administrative interventions.
            </Typography>
          </div>
        </Box>

        <Button
          component={Link}
          href="/audit-logs"
          size="small"
          endIcon={<ArrowForwardOutlinedIcon fontSize="inherit" />}
          className={styles.viewAllBtn}
        >
          View Full Audit Log
        </Button>
      </Box>

      {activities.length === 0 ? (
        <Box className={styles.emptyWrap}>
          <Typography variant="body2" className={styles.muted}>
            No administrative activity recorded in the selected period.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Desktop & Tablet Table View */}
          <TableContainer className={styles.tableWrap}>
            <Table size="medium" aria-label="Recent administrative activity">
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Initiator</TableCell>
                  <TableCell align="right">Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => {
                  const style = getActionColor(activity.action);
                  return (
                    <TableRow key={activity.id} className={styles.row}>
                      <TableCell className={styles.actionCell}>
                        <span
                          className={styles.actionChip}
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                            borderColor: style.border,
                          }}
                        >
                          {activity.action}
                        </span>
                      </TableCell>
                      <TableCell className={styles.entityCell}>
                        <span className={styles.entityTag}>{activity.entityType}</span>
                      </TableCell>
                      <TableCell>
                        <div className={styles.actorCell}>
                          <div className={styles.actorAvatar}>
                            {(activity.actor || "S")[0].toUpperCase()}
                          </div>
                          <span className={styles.actorName}>{activity.actor || "System"}</span>
                        </div>
                      </TableCell>
                      <TableCell align="right" className={styles.dateCell}>
                        {formatActivityDate(activity.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Screen Card View (< 640px) */}
          <Box className={styles.mobileList}>
            {activities.map((activity) => {
              const style = getActionColor(activity.action);
              return (
                <div key={activity.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span
                      className={styles.actionChip}
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        borderColor: style.border,
                      }}
                    >
                      {activity.action}
                    </span>
                    <span className={styles.entityTag}>{activity.entityType}</span>
                    <span className={styles.mobileDate}>
                      {formatActivityDate(activity.createdAt)}
                    </span>
                  </div>
                  <div className={styles.mobileCardBody}>
                    <div className={styles.actorCell}>
                      <div className={styles.actorAvatar}>
                        {(activity.actor || "S")[0].toUpperCase()}
                      </div>
                      <span className={styles.actorName}>{activity.actor || "System"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </Box>
        </>
      )}

    </Paper>
  );
}
