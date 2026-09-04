/* eslint-disable @next/next/no-img-element */
// Raw <img> is intentional: Cloudinary/YouTube URLs are dynamic and cannot
// be statically configured for next/image optimization.
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import AudiotrackOutlinedIcon from "@mui/icons-material/AudiotrackOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { StatusChip } from "@/components/settings/StatusChip";
import { MediaThumbnailCell } from "./MediaThumbnailCell";
import styles from "./MediaAdmin.module.css";

function getSection(item) {
  const category = String(item.body?.category || item.category || item.section || "").toLowerCase();
  const type = item.media_type;
  if (category.includes("podcast")) return "Podcasts";
  if (type === "audio") return "Music";
  if (type === "image") return "Gallery";
  if (type === "video" || item.media_source === "youtube") return "Videos";
  return "Media";
}

function TypeBadge({ item }) {
  const isPodcast = String(item.body?.category || item.category || "").toLowerCase().includes("podcast");
  if (item.media_source === "youtube") {
    return <span className={`${styles.typeBadge} ${styles.typeBadgeYoutube}`}><YouTubeIcon sx={{ fontSize: 10 }} />YouTube</span>;
  }
  if (item.media_type === "audio" || isPodcast) {
    return <span className={`${styles.typeBadge} ${styles.typeBadgeAudio}`}><AudiotrackOutlinedIcon sx={{ fontSize: 10 }} />{isPodcast ? "Podcast" : "Audio"}</span>;
  }
  if (item.media_type === "image") {
    return <span className={`${styles.typeBadge} ${styles.typeBadgeImage}`}><ImageOutlinedIcon sx={{ fontSize: 10 }} />Image</span>;
  }
  return <span className={`${styles.typeBadge} ${styles.typeBadgeVideo}`}><VideoLibraryOutlinedIcon sx={{ fontSize: 10 }} />Video</span>;
}

export function MediaAssetsTable({ items, onCreate, onEdit, onPreview, onArchive, isUpdating }) {
  if (!items.length) {
    return (
      <Box className={styles.emptyState}>
        <Box className={styles.emptyIcon}>
          <VideoLibraryOutlinedIcon fontSize="medium" />
        </Box>
        <Typography variant="h6" fontWeight={800} color="#111827">No media items found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
          Create a video, podcast episode, music track, or gallery photo to populate the public Media page.
        </Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => onCreate("image")} sx={{ textTransform: "none", borderRadius: 2, borderColor: "#B46A2C", color: "#B46A2C" }}>
          Create your first media item
        </Button>
      </Box>
    );
  }

  return (
    <>
      {isUpdating && (
        <LinearProgress
          sx={{
            height: 2.5,
            borderRadius: 2,
            mb: 0.5,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": { backgroundColor: "#B46A2C" },
          }}
        />
      )}
      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table} size="medium">
          <TableHead>
            <TableRow className={styles.tableHeadRow}>
              <TableCell className={styles.tableHeadCell} style={{ width: "36%" }}>Media Item</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "10%" }}>Type</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Section</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Status</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>Placement</TableCell>
              <TableCell align="right" className={styles.tableHeadCell} style={{ width: "16%" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const section = getSection(item);
              return (
                <TableRow key={item.id} hover className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>
                    <Box className={styles.mediaCell}>
                      <MediaThumbnailCell item={item} />
                      <Box className={styles.mediaMeta}>
                        <span className={styles.mediaTitle}>{item.title || "Untitled"}</span>
                        <span className={styles.mediaSlug}>{item.slug || item.id?.slice(0, 12)}</span>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <TypeBadge item={item} />
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={styles.sectionBadge}>{section}</span>
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    <StatusChip status={item.status || "draft"} />
                  </TableCell>
                  <TableCell className={styles.tableCell}>
                    {item.featured ? (
                      <span className={styles.featuredBadge}>
                        <StarOutlinedIcon sx={{ fontSize: 10 }} />
                        Featured Hero
                      </span>
                    ) : (
                      <Box className={styles.orderCell}>{item.sort_order ?? "—"}</Box>
                    )}
                  </TableCell>
                  <TableCell align="right" className={styles.tableCell}>
                    <Box className={styles.actionsDock}>
                      <Tooltip title="Preview media">
                        <IconButton size="small" onClick={() => onPreview(item)} className={styles.actionBtn} aria-label="Preview">
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit content & settings">
                        <IconButton size="small" onClick={() => onEdit(item)} className={`${styles.actionBtn} ${styles.actionBtnEdit}`} aria-label="Edit">
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive from public page">
                        <IconButton size="small" onClick={() => onArchive(item)} className={`${styles.actionBtn} ${styles.actionBtnDanger}`} aria-label="Archive">
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
    </>
  );
}

export default MediaAssetsTable;
