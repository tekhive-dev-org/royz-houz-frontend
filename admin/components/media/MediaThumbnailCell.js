/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { getMediaThumbnailUrl } from "@/utils/media/cloudinary";
import styles from "./MediaAdmin.module.css";

export function MediaThumbnailCell({ item }) {
  const [hasError, setHasError] = useState(false);
  const thumbUrl = getMediaThumbnailUrl(item, { width: 240 });

  useEffect(() => {
    setHasError(false);
  }, [thumbUrl]);

  if (!thumbUrl || hasError) {
    return (
      <Box className={styles.thumbnailPlaceholder} aria-label={`${item?.media_type || "media"} placeholder`}>
        {item?.media_type === "audio" ? "♫" : item?.media_type === "image" ? "🖼" : "▶"}
      </Box>
    );
  }

  return (
    <img
      src={thumbUrl}
      alt={item?.alt_text || item?.title || ""}
      className={styles.thumbnail}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

export default MediaThumbnailCell;
