import { Box, Typography } from "@mui/material";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import AudiotrackOutlinedIcon from "@mui/icons-material/AudiotrackOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import styles from "./MediaStatsBanner.module.css";

function isPodcast(item) {
  return String(item.body?.category || item.category || item.section || "").toLowerCase().includes("podcast");
}

export function MediaStatsBanner({ items = [] }) {
  const total = items.length;
  const published = items.filter((m) => m.status === "published").length;
  const videos = items.filter((m) => (m.media_type === "video" || m.media_source === "youtube") && !isPodcast(m)).length;
  const podcasts = items.filter(isPodcast).length;
  const music = items.filter((m) => m.media_type === "audio" && !isPodcast(m)).length;
  const gallery = items.filter((m) => m.media_type === "image").length;
  const featured = items.filter((m) => m.featured).length;

  const stats = [
    {
      id: "total",
      label: "Total Items",
      value: total,
      subtext: "Across all sections",
      icon: <PermMediaOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardCopper,
      iconVariant: styles.iconCopper,
    },
    {
      id: "published",
      label: "Published",
      value: published,
      subtext: "Live on Media page",
      icon: <CheckCircleOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardEmerald,
      iconVariant: styles.iconEmerald,
    },
    {
      id: "videos",
      label: "Videos",
      value: videos,
      subtext: "In Videos section",
      icon: <VideoLibraryOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardBlue,
      iconVariant: styles.iconBlue,
    },
    {
      id: "podcasts",
      label: "Podcasts",
      value: podcasts,
      subtext: "Episode cards",
      icon: <MicNoneOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardViolet,
      iconVariant: styles.iconViolet,
    },
    {
      id: "music",
      label: "Music Tracks",
      value: music,
      subtext: "Music Spotlight",
      icon: <AudiotrackOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardRed,
      iconVariant: styles.iconRed,
    },
    {
      id: "gallery",
      label: "Gallery Photos",
      value: gallery,
      subtext: "Through The Lens",
      icon: <ImageOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardTeal,
      iconVariant: styles.iconTeal,
    },
    {
      id: "featured",
      label: "Featured Hero",
      value: featured,
      subtext: "Hero section items",
      icon: <StarOutlinedIcon fontSize="medium" />,
      cardVariant: styles.statCardAmber,
      iconVariant: styles.iconAmber,
    },
  ];

  return (
    <Box className={styles.bannerGrid} role="region" aria-label="Media Page Statistics">
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

export default MediaStatsBanner;
