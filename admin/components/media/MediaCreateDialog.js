import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlayCircleOutlineOutlinedIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import AudiotrackOutlinedIcon from "@mui/icons-material/AudiotrackOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PublishIcon from "@mui/icons-material/Publish";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { mediaLibraryApi } from "@/services/mediaLibraryApi";
import { uploadMediaAsset } from "@/services/uploadMediaAsset";
import { TalentMediaField } from "@/components/talents/TalentMediaField";
import { detectMediaDuration, formatSecondsToTime, parseDurationToSeconds } from "@/utils/mediaDuration";
import styles from "./MediaAdmin.module.css";

const ACCEPTED_TYPES = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm,video/quicktime,video/x-m4v",
  audio: "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac",
};

export function MediaCreateDialog({
  open,
  onClose,
  onCreated,
  initialType = "image",
  categories = [],
  talents = [],
  onBrowseLibrary,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [source, setSource] = useState("upload");
  const [mediaType, setMediaType] = useState(initialType);
  const [status, setStatus] = useState("published");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [spotlightCategory, setSpotlightCategory] = useState("");
  const [altText, setAltText] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [authorTalentId, setAuthorTalentId] = useState("");
  const [host, setHost] = useState("");
  const [hostTalentId, setHostTalentId] = useState("");
  const [views, setViews] = useState("");
  const [duration, setDuration] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(null);
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [artist, setArtist] = useState("");
  const [artistTalentId, setArtistTalentId] = useState("");
  const [genre, setGenre] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [size, setSize] = useState("short");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);

  function reset() {
    setActiveTab(0);
    setSource("upload");
    setMediaType(initialType);
    setStatus("published");
    setFeatured(false);
    setSortOrder(0);
    setTitle("");
    setSummary("");
    setCategory("");
    setSpotlightCategory("");
    setAltText("");
    setDescription("");
    setAuthor("");
    setAuthorAvatar("");
    setAuthorTalentId("");
    setHost("");
    setHostTalentId("");
    setViews("");
    setDuration("");
    setDurationSeconds(null);
    setIsAutoDetected(false);
    setThumbnail("");
    setArtist("");
    setArtistTalentId("");
    setGenre("");
    setCoverImage("");
    setSize("short");
    setYoutubeUrl("");
    setUploading(false);
    setProgress(null);
    setError(null);
    setSelectedFile(null);
    setSelectedFileName("");
  }

  function handleClose() {
    if (uploading) return;
    reset();
    onClose();
  }

  function getTalent(id) {
    return talents.find((talent) => talent.id === id);
  }

  function talentValue(id, fallback) {
    const talent = getTalent(id);
    const avatar = authorAvatar.trim() || talent?.body?.image || talent?.body?.avatar || talent?.image || "";
    return talent
      ? {
          id: talent.id,
          slug: talent.slug,
          name: talent.title || talent.name || talent.body?.name || "",
          avatar,
        }
      : fallback.trim()
      ? { name: fallback.trim(), avatar: authorAvatar.trim() }
      : undefined;
  }

  function talentName(id, fallback) {
    const talent = getTalent(id);
    return talent ? talent.title || talent.name || talent.body?.name || "" : fallback.trim();
  }

  function buildBody(effectiveDuration = duration) {
    const effectiveType = source === "youtube" ? "video" : mediaType;
    return {
      category: category.trim(),
      section: category.trim(),
      spotlightCategory: spotlightCategory.trim(),
      subtitle: summary.trim(),
      description: description.trim(),
      ...(effectiveType === "video"
        ? {
            author: talentValue(authorTalentId, author),
            host: talentName(hostTalentId, host),
            views: views.trim(),
            duration: (effectiveDuration || duration).trim(),
            thumbnail: thumbnail.trim(),
          }
        : {}),
      ...(effectiveType === "audio"
        ? {
            artist: talentName(artistTalentId, artist),
            author: talentValue(artistTalentId, artist),
            genre: genre.trim(),
            duration: (effectiveDuration || duration).trim(),
            coverImage: coverImage.trim(),
          }
        : {}),
      ...(effectiveType === "image" ? { size } : {}),
    };
  }

  async function saveBody(asset, effectiveDuration = duration, effectiveSeconds = durationSeconds) {
    if (asset?.id) {
      await mediaLibraryApi.update({
        id: asset.id,
        status: status || "published",
        featured: Boolean(featured),
        sortOrder: Number(sortOrder) || 0,
        duration_seconds: effectiveSeconds || parseDurationToSeconds(effectiveDuration) || undefined,
        body: buildBody(effectiveDuration),
      });
    }
  }

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setError(null);

    // Auto-fill title from filename if title is empty
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanName);
    }

    // Auto-detect duration instantly from file metadata (without submitting!)
    try {
      const detected = await detectMediaDuration(file);
      if (detected && Number.isFinite(detected) && detected > 0) {
        const formatted = formatSecondsToTime(detected);
        setDuration(formatted);
        setDurationSeconds(detected);
        setIsAutoDetected(true);
      }
    } catch {
      // ignore
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setSelectedFileName("");
    setIsAutoDetected(false);
    setDuration("");
    setDurationSeconds(null);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Please provide a title for this media asset.");
      return;
    }

    if (source === "upload") {
      if (!selectedFile) {
        setError("Please choose a media file to upload.");
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(0);

      try {
        let autoDuration = duration;
        let autoSecs = durationSeconds;

        const result = await uploadMediaAsset({
          file: selectedFile,
          mediaType,
          title: title.trim(),
          summary: summary.trim(),
          altText: altText.trim(),
          category: category.trim(),
          onProgress: setProgress,
        });

        // If client probing failed, use Cloudinary's server-verified duration
        if (!autoDuration && result.durationSeconds) {
          autoSecs = result.durationSeconds;
          autoDuration = formatSecondsToTime(result.durationSeconds);
        }

        await saveBody(result.asset, autoDuration, autoSecs);
        reset();
        onClose();
        onCreated(result.asset);
      } catch (err) {
        setError(err.message || "Unable to upload media.");
        setUploading(false);
      }
    } else {
      if (!youtubeUrl.trim()) {
        setError("Please enter a valid YouTube URL.");
        return;
      }

      setUploading(true);
      setError(null);
      try {
        const asset = await mediaLibraryApi.registerYouTube({
          url: youtubeUrl.trim(),
          title: title.trim(),
          summary: summary.trim() || undefined,
          altText: altText.trim() || undefined,
        });
        await saveBody(asset);
        reset();
        onClose();
        onCreated(asset);
      } catch (err) {
        setError(err.message || "Unable to create YouTube media.");
        setUploading(false);
      }
    }
  }

  const isVideo = source === "youtube" || mediaType === "video";
  const hasMedia = source === "upload" ? Boolean(selectedFile) : Boolean(youtubeUrl.trim());
  const hasTitle = Boolean(title.trim());
  const isFormComplete = hasMedia && hasTitle;
  const isSubmitDisabled = uploading || !isFormComplete;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: "linear-gradient(135deg, #FAF4EF 0%, #F2E4D6 100%)",
              border: "1px solid rgba(180, 106, 44, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#B46A2C",
              flexShrink: 0,
            }}
          >
            <CloudUploadOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#111827", lineHeight: 1.2 }}>
              Create New Media Asset
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              Select media, configure editorial details, and publish when you are ready.
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={uploading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{ borderBottom: 1, borderColor: "divider", px: 3, background: "#F9FAFB" }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<CloudUploadOutlinedIcon fontSize="small" />} iconPosition="start" label="Source & Asset" />
        <Tab icon={<DescriptionOutlinedIcon fontSize="small" />} iconPosition="start" label="Editorial & Metadata" />
        <Tab icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" label="Credits & Visuals" />
      </Tabs>

      <DialogContent sx={{ px: 3, py: 3, minHeight: 440 }}>
        {/* TAB 0: SOURCE & ASSET */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <Box className={styles.sourceCardsGrid}>
              <Box
                className={`${styles.sourceCard} ${source === "upload" ? styles.sourceCardActive : ""}`}
                onClick={() => setSource("upload")}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: source === "upload" ? "#FAF4EF" : "#F3F4F6",
                    color: source === "upload" ? "#B46A2C" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloudUploadOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: source === "upload" ? "#B46A2C" : "#111827" }}>
                    Upload from Device
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Upload original HD media with intelligent client & server duration auto-detection.
                  </Typography>
                </Box>
              </Box>

              <Box
                className={`${styles.sourceCard} ${source === "youtube" ? styles.sourceCardActive : ""}`}
                onClick={() => {
                  setSource("youtube");
                  setMediaType("video");
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: source === "youtube" ? "#FAF4EF" : "#F3F4F6",
                    color: source === "youtube" ? "#B46A2C" : "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PlayCircleOutlineOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: source === "youtube" ? "#B46A2C" : "#111827" }}>
                    YouTube Video
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#6B7280" }}>
                    Register YouTube video links or Shorts with automatic streaming thumbnail extraction.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {source === "upload" ? (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Media Asset Type
                  </Typography>
                  <Box className={styles.typePills}>
                    <Box
                      className={`${styles.typePill} ${mediaType === "image" ? styles.typePillActive : ""}`}
                      onClick={() => {
                        setMediaType("image");
                        if (selectedFile && !selectedFile.type?.startsWith("image/")) {
                          handleRemoveFile();
                        }
                      }}
                    >
                      <ImageOutlinedIcon fontSize="small" /> Photo / Gallery Image
                    </Box>
                    <Box
                      className={`${styles.typePill} ${mediaType === "video" ? styles.typePillActive : ""}`}
                      onClick={() => {
                        setMediaType("video");
                        if (selectedFile && !selectedFile.type?.startsWith("video/")) {
                          handleRemoveFile();
                        }
                      }}
                    >
                      <VideoLibraryOutlinedIcon fontSize="small" /> Video Clip
                    </Box>
                    <Box
                      className={`${styles.typePill} ${mediaType === "audio" ? styles.typePillActive : ""}`}
                      onClick={() => {
                        setMediaType("audio");
                        if (selectedFile && !selectedFile.type?.startsWith("audio/")) {
                          handleRemoveFile();
                        }
                      }}
                    >
                      <AudiotrackOutlinedIcon fontSize="small" /> Music / Audio Track
                    </Box>
                  </Box>
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES[mediaType]}
                  hidden
                  onChange={handleFileSelect}
                />

                {selectedFile ? (
                  <Box
                    sx={{
                      border: "1.5px solid #B46A2C",
                      borderRadius: "12px",
                      p: 2,
                      bgcolor: "#FAF6F2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: "#FAF4EF",
                          border: "1px solid rgba(180, 106, 44, 0.3)",
                          color: "#B46A2C",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {mediaType === "image" && <ImageOutlinedIcon />}
                        {mediaType === "video" && <VideoLibraryOutlinedIcon />}
                        {mediaType === "audio" && <AudiotrackOutlinedIcon />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#111827", wordBreak: "break-all" }}>
                          {selectedFileName}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.25 }}>
                          <Chip
                            label={`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}
                            size="small"
                            sx={{ height: 22, fontSize: "0.75rem", bgcolor: "#FFFFFF", border: "1px solid #E8EAEF" }}
                          />
                          {duration && (
                            <Chip
                              icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "0.9rem !important", color: "#B46A2C !important" }} />}
                              label={`Duration: ${duration}`}
                              size="small"
                              sx={{ height: 22, fontSize: "0.75rem", bgcolor: "#FFFFFF", color: "#B46A2C", fontWeight: 700, border: "1px solid #E8D5C4" }}
                            />
                          )}
                          <Chip
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: "0.9rem !important", color: "#059669 !important" }} />}
                            label="Media staged • Fill details & submit when ready"
                            size="small"
                            sx={{ height: 22, fontSize: "0.75rem", bgcolor: "#ECFDF5", color: "#059669", fontWeight: 600, border: "1px solid #A7F3D0" }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ borderColor: "#B46A2C", color: "#B46A2C", textTransform: "none", fontWeight: 600 }}
                      >
                        Change file
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={handleRemoveFile}
                        sx={{ textTransform: "none" }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box className={styles.uploadDropzone} onClick={() => fileInputRef.current?.click()}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "#B46A2C" }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#111827" }}>
                      Click to select a file for upload
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6B7280" }}>
                      {mediaType === "image" && "Supported formats: JPG, PNG, WEBP, AVIF"}
                      {mediaType === "video" && "Supported formats: MP4, WEBM, QuickTime (MOV) • Duration auto-detected"}
                      {mediaType === "audio" && "Supported formats: MP3, WAV, AAC, M4A, FLAC • Duration auto-detected"}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <TextField
                label="YouTube URL"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                fullWidth
                size="small"
                required
                helperText="Paste any standard YouTube video URL or YouTube Shorts link."
              />
            )}

            <Box className={styles.formGrid}>
              <TextField
                label="Media Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Echoes of Lagos: Live Showcase"
                required
                size="small"
                fullWidth
              />
              <TextField
                select
                label="Category / Section"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="small"
                fullWidth
                helperText="Use Podcast to place a video in the Podcasts section."
              >
                <MenuItem value="" disabled>
                  Select a section / category
                </MenuItem>
                {categories.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Publication Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                size="small"
                fullWidth
                helperText="Choose whether this asset is live immediately or saved as draft."
              >
                <MenuItem value="published">Published (Visible on web immediately)</MenuItem>
                <MenuItem value="draft">Draft (Hidden from public catalog)</MenuItem>
                <MenuItem value="archived">Archived (Library storage only)</MenuItem>
              </TextField>
            </Box>

            <Box className={styles.featureHeroCard}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#111827" }}>
                  Feature on Homepage & Media Hero
                </Typography>
                <Typography variant="caption" sx={{ color: "#6B7280" }}>
                  Spotlight this media. The #1 featured item (lowest sort order) becomes the long stretch banner on both the homepage and media page; the next 3 featured items become the 3 homepage cards.
                </Typography>
              </Box>
              <Switch
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                sx={{
                  "& .Mui-checked": { color: "#B46A2C" },
                  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#B46A2C !important" },
                }}
              />
            </Box>
          </Stack>
        )}

        {/* TAB 1: EDITORIAL & METADATA */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            <TextField
              label="Card Subtitle / Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              size="small"
              placeholder="Brief summary displayed under the media title on public cards."
              helperText="Appears on featured spotlight cards, carousel slides, and archive grids."
            />

            <TextField
              label="Full Editorial Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              size="small"
              placeholder="Detailed description, lyrics, program notes, or editorial background."
            />

            <Box className={styles.formGrid}>
              {isVideo && (
                <TextField
                  select
                  label="Spotlight Category"
                  value={spotlightCategory}
                  onChange={(e) => setSpotlightCategory(e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Visible badge pill on podcast spotlight cards."
                >
                  <MenuItem value="">No spotlight category</MenuItem>
                  {["Culture", "Inspiration", "Business", "Documentary", "Interview", "Performance"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                label="Alt Text (Accessibility)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                size="small"
                fullWidth
                helperText="Alternative descriptive text. Defaults to the title when empty."
              />

              {mediaType === "image" && source !== "youtube" && (
                <TextField
                  select
                  label="Gallery Card Height"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="short">Short (Compact 4:3)</MenuItem>
                  <MenuItem value="tall">Tall (Standard 3:4 portrait)</MenuItem>
                  <MenuItem value="extraTall">Extra Tall (Feature poster)</MenuItem>
                </TextField>
              )}

              <TextField
                label="Display Sort Order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                helperText="Lower numbers appear first in catalog listings."
              />
            </Box>
          </Stack>
        )}

        {/* TAB 2: CREDITS & VISUALS */}
        {activeTab === 2 && (
          <Stack spacing={2.5}>
            {isVideo && (
              <>
                <Box className={styles.subSection}>
                  <Box className={styles.subSectionTitle}>
                    <PersonOutlineIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                    Author / Creator Attribution
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      select
                      label="Author Talent (Roster)"
                      value={authorTalentId}
                      onChange={(e) => {
                        const talentId = e.target.value;
                        setAuthorTalentId(talentId);
                        const talent = getTalent(talentId);
                        if (talent) {
                          setAuthor(talent.title || talent.name || talent.body?.name || "");
                          const tAvatar = talent.body?.image || talent.body?.avatar || talent.image || "";
                          if (tAvatar) setAuthorAvatar(tAvatar);
                        }
                      }}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="">Custom / Manual Author</MenuItem>
                      {talents.map((talent) => (
                        <MenuItem key={talent.id} value={talent.id}>
                          {talent.title || talent.name || talent.body?.name || talent.slug}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Author / Creator Name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Royz Production"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <TalentMediaField
                    label="Author / Creator Photo (Avatar)"
                    value={authorAvatar}
                    onChange={setAuthorAvatar}
                    onBrowseLibrary={() => onBrowseLibrary?.("image", setAuthorAvatar)}
                    helperText="Creator photo displayed on video cards and the media player sidebar profile."
                  />
                </Box>

                <Box className={styles.subSection}>
                  <Box className={styles.subSectionTitle}>
                    <MicNoneOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                    Show Host Attribution (Podcasts & Interviews)
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      select
                      label="Host Talent (Roster)"
                      value={hostTalentId}
                      onChange={(e) => {
                        setHostTalentId(e.target.value);
                        setHost("");
                      }}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="">Enter manually below</MenuItem>
                      {talents.map((talent) => (
                        <MenuItem key={talent.id} value={talent.id}>
                          {talent.title || talent.name || talent.body?.name || talent.slug}
                        </MenuItem>
                      ))}
                    </TextField>

                    {!hostTalentId && (
                      <TextField
                        label="Manual Host Name"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="e.g. DJ Royz"
                        size="small"
                        fullWidth
                      />
                    )}
                  </Box>
                </Box>

                <Box className={styles.subSection}>
                  <Box className={styles.subSectionTitle}>
                    <PermMediaOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                    Playback Metrics & Custom Thumbnail
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      label={isAutoDetected ? "Duration (Auto-detected)" : "Duration"}
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setIsAutoDetected(false);
                      }}
                      placeholder="Auto-detected on file select"
                      size="small"
                      fullWidth
                      helperText={
                        isAutoDetected
                          ? "✨ Intelligently auto-detected from uploaded media file."
                          : "Auto-detected when you choose a video file (e.g. 24:15)."
                      }
                    />
                    <TextField
                      label="Views Display (Optional Initial Baseline)"
                      value={views}
                      onChange={(e) => setViews(e.target.value)}
                      placeholder="e.g. 12.4K views"
                      size="small"
                      fullWidth
                      helperText="Optional seed value. Views are automatically tracked from real user playback interactions."
                    />
                  </Box>
                  <TalentMediaField
                    label="Video Thumbnail Poster"
                    value={thumbnail}
                    onChange={setThumbnail}
                    onBrowseLibrary={() => onBrowseLibrary?.("image", setThumbnail)}
                    helperText="Upload or pick custom thumbnail. YouTube thumbnails are extracted automatically if left empty."
                  />
                </Box>
              </>
            )}

            {mediaType === "audio" && source !== "youtube" && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <AudiotrackOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Artist Attribution & Track Metadata
                </Box>
                <Box className={styles.formGrid}>
                  <TextField
                    select
                    label="Artist Talent (Roster)"
                    value={artistTalentId}
                    onChange={(e) => {
                      setArtistTalentId(e.target.value);
                      setArtist("");
                    }}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">Enter manually below</MenuItem>
                    {talents.map((talent) => (
                      <MenuItem key={talent.id} value={talent.id}>
                        {talent.title || talent.name || talent.body?.name || talent.slug}
                      </MenuItem>
                    ))}
                  </TextField>

                  {!artistTalentId && (
                    <TextField
                      label="Manual Artist Name"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="e.g. Royz Music Collective"
                      size="small"
                      fullWidth
                    />
                  )}

                  <TextField
                    label="Genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g. Afrobeats, Highlife, Gospel"
                    size="small"
                    fullWidth
                  />

                  <TextField
                    label={isAutoDetected ? "Duration (Auto-detected)" : "Duration"}
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      setIsAutoDetected(false);
                    }}
                    placeholder="Auto-detected on file select"
                    size="small"
                    fullWidth
                    helperText={
                      isAutoDetected
                        ? "✨ Intelligently auto-detected from audio track."
                        : "Track duration (auto-detected when file is chosen)."
                    }
                  />
                </Box>
                <TalentMediaField
                  label="Artist / Creator Photo (Avatar)"
                  value={authorAvatar}
                  onChange={setAuthorAvatar}
                  onBrowseLibrary={() => onBrowseLibrary?.("image", setAuthorAvatar)}
                  helperText="Artist/creator profile photo shown in the media player sidebar."
                />
                <TalentMediaField
                  label="Album / Track Artwork"
                  value={coverImage}
                  onChange={setCoverImage}
                  onBrowseLibrary={() => onBrowseLibrary?.("image", setCoverImage)}
                  helperText="Square cover artwork for audio player cards and catalog lists."
                />
              </Box>
            )}

            {mediaType === "image" && source !== "youtube" && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <ImageOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Photo Presentation Notes
                </Box>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Photo assets utilize title, card summary, and alt text configured in the previous tabs. You can adjust the gallery display card ratio under Editorial & Metadata.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* Persistent error & upload progress visible regardless of active tab */}
      {error && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {uploading && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Box sx={{ p: 2, bgcolor: "#FAF4EF", borderRadius: 2, border: "1px solid #E8D5C4" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight={700} sx={{ color: "#B46A2C" }}>
                {source === "upload" ? "Uploading media asset to Cloudinary storage..." : "Registering YouTube video..."}
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: "#B46A2C" }}>
                {progress !== null ? `${progress}%` : "Processing..."}
              </Typography>
            </Box>
            <LinearProgress
              variant={progress === null ? "indeterminate" : "determinate"}
              value={progress || 0}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(180, 106, 44, 0.15)",
                "& .MuiLinearProgress-bar": { bgcolor: "#B46A2C" },
              }}
            />
          </Box>
        </Box>
      )}

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button onClick={handleClose} color="inherit" disabled={uploading}>
            Cancel
          </Button>
          {activeTab > 0 && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setActiveTab((t) => t - 1)}
              disabled={uploading}
              sx={{ textTransform: "none", color: "#4B5563" }}
            >
              Back
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          {!isFormComplete && (
            <Typography variant="caption" sx={{ color: "#9CA3AF", display: { xs: "none", sm: "block" } }}>
              {!hasMedia && !hasTitle
                ? "Select media file & enter title to proceed"
                : !hasMedia
                ? "Select media file to proceed"
                : "Enter title to proceed"}
            </Typography>
          )}

          {isFormComplete && (
            <Chip
              icon={<CheckCircleOutlineIcon sx={{ fontSize: "0.9rem !important", color: "#059669 !important" }} />}
              label="All required fields ready"
              size="small"
              sx={{
                height: 24,
                fontSize: "0.75rem",
                bgcolor: "#ECFDF5",
                color: "#059669",
                fontWeight: 600,
                border: "1px solid #A7F3D0",
                display: { xs: "none", md: "inline-flex" },
              }}
            />
          )}

          {activeTab < 2 && (
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => setActiveTab((t) => t + 1)}
              disabled={uploading}
              sx={{
                borderColor: "#D1D5DB",
                color: "#374151",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
              }}
            >
              Next Step
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            startIcon={
              uploading ? undefined : status === "published" ? (
                <PublishIcon />
              ) : (
                <CloudUploadOutlinedIcon />
              )
            }
            sx={{
              background: "#B46A2C",
              "&:hover": { background: "#9A5B26" },
              fontWeight: 700,
              textTransform: "none",
              px: 3,
            }}
          >
            {uploading ? (
              source === "upload" ? (status === "published" ? "Publishing..." : "Uploading...") : "Registering..."
            ) : status === "published" ? (
              "Publish"
            ) : (
              "Upload"
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default MediaCreateDialog;
