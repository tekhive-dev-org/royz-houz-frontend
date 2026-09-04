/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import AudioFileOutlinedIcon from "@mui/icons-material/AudioFileOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { getMediaThumbnailUrl } from "@/utils/media/cloudinary";
import styles from "./MediaLibrary.module.css";

export function MediaLibraryThumbnail({ item }) {
  const [hasError, setHasError] = useState(false);
  const thumbUrl = getMediaThumbnailUrl(item, { width: 480 });

  useEffect(() => {
    setHasError(false);
  }, [thumbUrl]);

  if (!thumbUrl || hasError) {
    return (
      <Box className={styles.audioPlaceholder} aria-label={`${item?.media_type || "media"} placeholder`}>
        {item?.media_type === "audio" ? (
          <AudioFileOutlinedIcon />
        ) : item?.media_type === "video" ? (
          <VideoLibraryOutlinedIcon />
        ) : (
          <ImageOutlinedIcon />
        )}
      </Box>
    );
  }

  return (
    <img
      src={thumbUrl}
      alt={item?.alt_text || item?.title || ""}
      className={styles.thumbImg}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

export default MediaLibraryThumbnail;
