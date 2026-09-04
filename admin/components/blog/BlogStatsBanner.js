import { Box, Typography } from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import MarkChatUnreadOutlinedIcon from "@mui/icons-material/MarkChatUnreadOutlined";
import styles from "./BlogStatsBanner.module.css";

export function BlogStatsBanner({ posts = [], comments = [] }) {
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;
  const draftPosts = posts.filter((p) => p.status === "draft").length;
  const pendingComments = comments.filter((c) => c.status === "pending").length;

  const stats = [
    {
      id: "total",
      label: "Total Articles",
      value: totalPosts,
      subtext: `${totalPosts === 1 ? "1 editorial article" : `${totalPosts} editorial articles`}`,
      icon: <ArticleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "published",
      label: "Published & Live",
      value: publishedPosts,
      subtext: `${publishedPosts} public on Royz Journal`,
      icon: <CheckCircleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "drafts",
      label: "Drafts & Staged",
      value: draftPosts,
      subtext: `${draftPosts} awaiting publication`,
      icon: <EditNoteOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardAmber,
      iconVariant: styles.iconAmber,
    },
    {
      id: "comments",
      label: "Reader Comments",
      value: pendingComments > 0 ? `${pendingComments} Pending` : comments.length,
      subtext: pendingComments > 0 ? `${pendingComments} need moderation review` : "All comments moderated",
      icon: <MarkChatUnreadOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardPurple,
      iconVariant: styles.iconPurple,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Blog Studio Statistics">
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

export default BlogStatsBanner;
