import {
  Box,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./CommentsModerationTable.module.css";

const COMMENT_FILTERS = [
  { label: "Pending Review", value: "pending" },
  { label: "Approved Comments", value: "approved" },
  { label: "Rejected / Spam", value: "rejected" },
];

export function CommentsModerationTable({
  comments = [],
  commentStatus = "pending",
  setCommentStatus,
  isUpdating = false,
  onModerate,
  onDelete,
}) {
  return (
    <Paper elevation={0} className={styles.card}>
      {/* Header with Quick Status Pills */}
      <Box className={styles.cardHeader}>
        <Box className={styles.headerLeft}>
          <Typography className={styles.cardTitle}>Comment Moderation Queue</Typography>
          <Typography className={styles.cardSubtitle}>
            Moderate reader feedback, approve comments for public display, or flag spam.
          </Typography>
        </Box>

        <Box className={styles.quickPills} role="group" aria-label="Comment Status Filters">
          {COMMENT_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`${styles.quickPill} ${commentStatus === filter.value ? styles.quickPillActive : ""}`}
              onClick={() => setCommentStatus(filter.value)}
            >
              {filter.label}
              {filter.value === "pending" && comments.filter((c) => c.status === "pending").length > 0 && (
                <span className={styles.badgePending}>
                  {comments.filter((c) => c.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </Box>
      </Box>

      {/* Subtle Linear Progress for Silent Background Filtering */}
      {isUpdating && (
        <LinearProgress
          sx={{
            height: 2.5,
            borderRadius: 2,
            my: 0.5,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": { backgroundColor: "#B46A2C" },
          }}
        />
      )}

      {/* Moderation Table */}
      {comments.length === 0 ? (
        <Box className={styles.emptyState}>
          <Box className={styles.emptyIconWrapper}>
            <ChatBubbleOutlineIcon fontSize="medium" />
          </Box>
          <Typography className={styles.emptyTitle}>
            No {commentStatus} comments
          </Typography>
          <Typography className={styles.emptyText}>
            All reader responses in this queue have been moderated. Check other filter tabs or await new user comments.
          </Typography>
        </Box>
      ) : (
        <TableContainer className={styles.tableContainer}>
          <Table className={styles.table} size="medium">
            <TableHead>
              <TableRow className={styles.tableHeadRow}>
                <TableCell className={styles.tableHeadCell} style={{ width: "24%" }}>
                  Reader / Commenter
                </TableCell>
                <TableCell className={styles.tableHeadCell} style={{ width: "42%" }}>
                  Comment &amp; Target Article
                </TableCell>
                <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>
                  Date Posted
                </TableCell>
                <TableCell className={styles.tableHeadCell} style={{ width: "10%" }}>
                  Status
                </TableCell>
                <TableCell align="right" className={styles.tableHeadCell} style={{ width: "120px" }}>
                  Moderation
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => {
                const authorName = comment.author_name || comment.author || "Anonymous Reader";
                const authorEmail = comment.author_email || "No email provided";
                const postTitle = comment.post_title || comment.post?.title || `Article #${comment.post_id || ""}`;
                const postSlug = comment.post_slug || comment.post?.slug;
                const formattedDate = comment.created_at
                  ? new Date(comment.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <TableRow key={comment.id} hover className={styles.tableRow}>
                    {/* Commenter */}
                    <TableCell className={styles.tableCell}>
                      <Box className={styles.commenterCell}>
                        <Box className={styles.commenterAvatar}>
                          {authorName.charAt(0).toUpperCase()}
                        </Box>
                        <Box className={styles.commenterMeta}>
                          <span className={styles.commenterName}>{authorName}</span>
                          <span className={styles.commenterEmail}>{authorEmail}</span>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Comment Text & Target Article */}
                    <TableCell className={styles.tableCell}>
                      <Box className={styles.commentBubble}>
                        &ldquo;{comment.body || comment.content}&rdquo;
                      </Box>
                      {postSlug ? (
                        <a
                          href={`/blog/${postSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.postTargetLink}
                        >
                          On: {postTitle} <OpenInNewIcon sx={{ fontSize: 11 }} />
                        </a>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 4, display: "block" }}>
                          On: {postTitle}
                        </span>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className={styles.tableCell}>
                      <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
                        {formattedDate}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className={styles.tableCell}>
                      <StatusChip status={comment.status === "approved" ? "published" : comment.status === "pending" ? "scheduled" : "archived"} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" className={styles.tableCell}>
                      <Box className={styles.actionsDock}>
                        {comment.status !== "approved" && (
                          <Tooltip title="Approve Comment">
                            <IconButton
                              size="small"
                              onClick={() => onModerate(comment.id, "approve")}
                              className={styles.btnApprove}
                              aria-label="Approve comment"
                            >
                              <CheckCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {comment.status !== "rejected" && (
                          <Tooltip title="Reject / Flag Spam">
                            <IconButton
                              size="small"
                              onClick={() => onModerate(comment.id, "reject")}
                              className={styles.btnReject}
                              aria-label="Reject comment"
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete Comment">
                          <IconButton
                            size="small"
                            onClick={() => onDelete(comment)}
                            className={styles.btnDelete}
                            aria-label="Delete comment"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default CommentsModerationTable;
