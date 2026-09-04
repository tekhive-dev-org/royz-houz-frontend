import { useRef, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import { Alert, Box, Button, LinearProgress, TextField, Typography } from "@mui/material";
import { uploadMediaAsset } from "@/services/uploadMediaAsset";
import styles from "./MediaField.module.css";

export function MediaField({
  label,
  value,
  mediaType = "image",
  onChange,
  onUploaded,
  onAltSuggested,
  onBrowseLibrary,
  helperText,
  placeholder = "https://...",
  showPreview = true,
  previewHeight = 160,
  size = "small",
  fullWidth = true,
  required = false,
}) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError("");
    try {
      const result = await uploadMediaAsset({ file, mediaType, onProgress: setProgress });
      if (onUploaded) {
        onUploaded(result.secureUrl, result);
      }
      if (onChange) {
        onChange(result.secureUrl);
      }
      if (result.altText) {
        onAltSuggested?.(result.altText);
      }
    } catch (uploadError) {
      setError(uploadError.message || `Unable to upload this ${mediaType}.`);
    } finally {
      setIsUploading(false);
    }
  }

  const isImage = mediaType === "image" && Boolean(value) && typeof value === "string" && !value.includes(".mp4");
  const isVideo = mediaType === "video" && Boolean(value) && typeof value === "string";

  return (
    <Box className={styles.field}>
      <TextField
        label={label}
        value={value || ""}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        helperText={
          helperText ||
          `Paste an HTTPS ${mediaType} URL, upload directly from your device, or choose from the media library.`
        }
        disabled={isUploading}
        fullWidth={fullWidth}
        size={size}
        required={required}
      />

      <input
        ref={inputRef}
        type="file"
        accept={
          mediaType === "video"
            ? "video/mp4,video/webm,video/quicktime,video/x-m4v"
            : mediaType === "audio"
              ? "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac"
              : "image/jpeg,image/png,image/webp,image/avif,image/gif"
        }
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      <Box className={styles.actions}>
        <Button
          size="small"
          variant="contained"
          startIcon={<CloudUploadOutlinedIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={styles.uploadButton}
        >
          {isUploading ? "Uploading…" : "Upload from device"}
        </Button>

        {onBrowseLibrary && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<PermMediaOutlinedIcon />}
            onClick={onBrowseLibrary}
            disabled={isUploading}
            className={styles.libraryButton}
          >
            Media library
          </Button>
        )}
      </Box>

      {isUploading ? (
        <Box className={styles.progress} aria-live="polite">
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" sx={{ color: "#B46A2C", fontWeight: 600 }}>
            Uploading {mediaType}… {progress}%
          </Typography>
        </Box>
      ) : null}

      {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}

      {showPreview && Boolean(value) && (
        <Box className={styles.previewContainer} sx={{ maxHeight: previewHeight }}>
          {isImage ? (
            <img
              src={value}
              alt="Media preview"
              className={styles.previewImage}
              style={{ maxHeight: previewHeight }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : isVideo && !value.includes("youtube.com") && !value.includes("youtu.be") ? (
            <video src={value} controls className={styles.previewVideo} style={{ maxHeight: previewHeight }} />
          ) : null}
        </Box>
      )}
    </Box>
  );
}

export default MediaField;
