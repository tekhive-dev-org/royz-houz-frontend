import { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./BlogAuthorsTable.module.css";

export function BlogAuthorsTable({
  authors = [],
  posts = [],
  onAddAuthor,
  onEditAuthor,
  onDeleteAuthor,
}) {
  const authorPostCounts = useMemo(() => {
    const counts = new Map();
    posts.forEach((item) => {
      const body = item.body || {};
      const authorId = item.blog_author_id || item.authorId || body.authorId;
      if (authorId) {
        counts.set(String(authorId), (counts.get(String(authorId)) || 0) + 1);
      }
    });
    return counts;
  }, [posts]);

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.cardHeader}>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Editorial Team &amp; Contributors ({authors.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage article authors whose bio cards and avatars appear on the sticky sidebar of article detail pages.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddAuthor}
          className={styles.primaryButton}
        >
          Add Contributor / Author
        </Button>
      </Box>

      {authors.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: 2 }}>
          <PersonOutlineIcon sx={{ fontSize: 40, color: "#9CA3AF", mb: 1 }} />
          <Typography variant="body1" fontWeight={700}>
            No authors registered yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add writers and editors to showcase their profiles and bylines across the Journal.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAddAuthor} sx={{ background: "#B46A2C" }}>
            Add First Author
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {authors.map((author) => {
            const body = author.body || {};
            const articleCount = authorPostCounts.get(String(author.id)) || 0;
            const avatarUrl = body.avatar || author.avatar || "/assets/img/blog/author-chisom.jpg";
            const role = body.role || "STAFF WRITER";
            const bio = author.summary || body.bio || "Staff writer and contributor at Royz Houz.";

            return (
              <Box key={author.id} className={styles.authorCard}>
                <Box className={styles.authorLeft}>
                  <Avatar src={avatarUrl} alt={author.title || author.name} className={styles.avatar} />
                  <Box className={styles.authorInfo}>
                    <Box className={styles.authorNameRow}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {author.title || author.name}
                      </Typography>
                      <span className={styles.authorRole}>• {role}</span>
                      <StatusChip status={author.status || "published"} />
                    </Box>
                    <Typography className={styles.authorBio}>{bio}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <ArticleOutlinedIcon fontSize="inherit" />
                      {articleCount} published {articleCount === 1 ? "article" : "articles"}
                    </Typography>
                  </Box>
                </Box>

                <Box className={styles.authorActions}>
                  <Tooltip title="Edit Author">
                    <IconButton size="small" onClick={() => onEditAuthor(author)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={articleCount > 0 ? "Cannot delete: author has articles" : "Delete Author"}>
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={articleCount > 0}
                        onClick={() => onDeleteAuthor(author)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export default BlogAuthorsTable;
