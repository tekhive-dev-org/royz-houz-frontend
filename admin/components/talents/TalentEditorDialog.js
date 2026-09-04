import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import TabOutlinedIcon from "@mui/icons-material/TabOutlined";
import { formatMediaDuration, normalizeTalentSlugPreview } from "@/utils/talents";
import { TalentMediaField } from "./TalentMediaField";
import styles from "./TalentsAdmin.module.css";

const ALL_PROFILE_TABS = ["ABOUT", "GALLERY", "VIDEOS", "MUSIC", "PUBLICATIONS"];

export function TalentEditorDialog({
  open,
  onClose,
  talent,
  setTalent,
  onSave,
  onDuplicate,
  isSaving,
  onOpenMediaPicker,
  categories = [],
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [galleryImageUrl, setGalleryImageUrl] = useState("");

  if (!talent) return null;

  const setField = (key, value) => {
    setTalent((prev) => ({ ...prev, [key]: value }));
  };

  const setPrimaryCategory = (categoryId) => {
    const selectedCategory = categories.find((category) => category.id === categoryId);
    setTalent((previous) => ({
      ...previous,
      primaryCategoryId: categoryId || null,
      categoryIds: categoryId ? [categoryId] : [],
      category: selectedCategory?.title || "",
      categoryKey: selectedCategory?.slug || "",
    }));
  };

  const selectableCategories = categories.filter(
    (category) => category.status !== "archived" || category.id === talent.primaryCategoryId
  );

  const setSocial = (network, value) => {
    setTalent((prev) => ({
      ...prev,
      socials: { ...(prev.socials || {}), [network]: value },
    }));
  };

  // Awards list handlers
  const handleAddAward = () => {
    const next = [...(talent.awards || []), "New Award or Recognition Title"];
    setField("awards", next);
  };
  const handleUpdateAward = (index, value) => {
    const next = [...(talent.awards || [])];
    next[index] = value;
    setField("awards", next);
  };
  const handleDeleteAward = (index) => {
    const next = (talent.awards || []).filter((_, i) => i !== index);
    setField("awards", next);
  };

  // Achievements list handlers
  const handleAddAchievement = () => {
    const next = [...(talent.achievements || []), "New Key Milestone / Performance Achievement"];
    setField("achievements", next);
  };
  const handleUpdateAchievement = (index, value) => {
    const next = [...(talent.achievements || [])];
    next[index] = value;
    setField("achievements", next);
  };
  const handleDeleteAchievement = (index) => {
    const next = (talent.achievements || []).filter((_, i) => i !== index);
    setField("achievements", next);
  };

  // Gallery images handlers
  const handleAddGalleryImage = (url = galleryImageUrl, mediaAssetId = null) => {
    const normalizedUrl = typeof url === "string" ? url.trim() : "";
    if (!normalizedUrl || (talent.galleryImages || []).includes(normalizedUrl)) return;
    setTalent((previous) => {
      const existingImages = previous.galleryImages || [];
      const existingRefs = existingImages.map((image, index) =>
        previous.galleryMediaRefs?.[index] || { mediaAssetId: null, url: image }
      );
      return {
        ...previous,
        galleryImages: [...existingImages, normalizedUrl],
        galleryMediaRefs: [
          ...existingRefs,
          { mediaAssetId: mediaAssetId || null, url: normalizedUrl },
        ],
      };
    });
    setGalleryImageUrl("");
  };
  const handleDeleteGalleryImage = (index) => {
    const next = (talent.galleryImages || []).filter((_, i) => i !== index);
    const refs = (talent.galleryMediaRefs || []).filter((_, i) => i !== index);
    setTalent((previous) => ({
      ...previous,
      galleryImages: next,
      galleryMediaRefs: refs,
    }));
  };

  // Videos handlers
  const handleAddVideo = () => {
    const newVideo = {
      id: `vid-${Date.now()}`,
      title: "",
      artist: talent.name || "",
      duration: "",
      thumbnail: "",
      videoUrl: "",
    };
    setField("videos", [...(talent.videos || []), newVideo]);
  };
  const handleUpdateVideo = (index, field, value) => {
    const updates = typeof field === "object" ? field : { [field]: value };
    const next = [...(talent.videos || [])];
    next[index] = { ...next[index], ...updates };
    setField("videos", next);
  };
  const handleDeleteVideo = (index) => {
    const next = (talent.videos || []).filter((_, i) => i !== index);
    setField("videos", next);
  };

  // Music tracks handlers
  const handleAddTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      title: "",
      duration: "",
      streams: "",
      trackUrl: "",
    };
    setField("musicTracks", [...(talent.musicTracks || []), newTrack]);
  };
  const handleUpdateTrack = (index, field, value) => {
    const updates = typeof field === "object" ? field : { [field]: value };
    const next = [...(talent.musicTracks || [])];
    next[index] = { ...next[index], ...updates };
    setField("musicTracks", next);
  };
  const handleDeleteTrack = (index) => {
    const next = (talent.musicTracks || []).filter((_, i) => i !== index);
    setField("musicTracks", next);
  };

  // Publications handlers
  const handleAddPublication = () => {
    const newPub = {
      id: `pub-${Date.now()}`,
      title: "",
      type: "",
      year: "",
      publisher: "",
      url: "",
    };
    setField("publications", [...(talent.publications || []), newPub]);
  };
  const handleUpdatePublication = (index, field, value) => {
    const next = [...(talent.publications || [])];
    next[index] = { ...next[index], [field]: value };
    setField("publications", next);
  };
  const handleDeletePublication = (index) => {
    const next = (talent.publications || []).filter((_, i) => i !== index);
    setField("publications", next);
  };

  // Profile tabs toggle
  const handleToggleTab = (tabName) => {
    const current = talent.tabs || ["ABOUT", "GALLERY", "VIDEOS"];
    const exists = current.includes(tabName);
    const next = exists ? current.filter((t) => t !== tabName) : [...current, tabName];
    setField("tabs", next);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {talent.image ? <Avatar src={talent.image} alt={talent.name} variant="rounded" sx={{ width: 36, height: 36 }} /> : null}
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {talent?.id ? `Edit Talent: ${talent.name || "Untitled"}` : "Create New Creative Talent"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              Configure public profile visuals, recognition, portfolio media, and booking channels.
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
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
        <Tab icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" label="Identity & Basics" />
        <Tab icon={<EmojiEventsOutlinedIcon fontSize="small" />} iconPosition="start" label="Awards & Booking" />
        <Tab icon={<ShareOutlinedIcon fontSize="small" />} iconPosition="start" label="Social & Streaming" />
        <Tab icon={<PermMediaOutlinedIcon fontSize="small" />} iconPosition="start" label="Showcase Media" />
        <Tab icon={<TabOutlinedIcon fontSize="small" />} iconPosition="start" label="Profile Tabs Config" />
      </Tabs>

      <DialogContent sx={{ px: 3, py: 3, minHeight: 450 }}>
        {/* TAB 0: IDENTITY & BASICS */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <Box className={styles.formGrid}>
              <TextField
                label="Full Name / Artist Name"
                value={talent.name || ""}
                onChange={(e) => {
                  const nextName = e.target.value;
                  const currentSlug = talent.slug || "";
                  const prevExpected = normalizeTalentSlugPreview(talent.name || "");
                  const isAutoSlug = !currentSlug || currentSlug === prevExpected;
                  setTalent((prev) => ({
                    ...prev,
                    name: nextName,
                    slug: isAutoSlug ? normalizeTalentSlugPreview(nextName) : prev.slug,
                  }));
                }}
                required
                fullWidth
              />
              <TextField
                label="URL Slug"
                value={talent.slug || ""}
                onChange={(e) => setField("slug", normalizeTalentSlugPreview(e.target.value))}
                helperText={talent.slug ? `Auto-generated. Preview: /talents/${talent.slug}` : "Auto-generated from name. Click the icon to re-sync anytime."}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Auto-generate slug from artist name">
                        <IconButton
                          size="small"
                          onClick={() => setField("slug", normalizeTalentSlugPreview(talent.name || ""))}
                          edge="end"
                          aria-label="Auto-generate slug from name"
                        >
                          <AutoAwesomeOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Box>

            <Box className={styles.formGrid}>
              <TextField
                select
                label="Primary Specialty / Category"
                value={talent.primaryCategoryId || ""}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                helperText={
                  selectableCategories.length
                    ? "Controls talent filtering and the category displayed on the public profile."
                    : "Create and publish a talent category before adding talents."
                }
                required
                disabled={!selectableCategories.length}
                fullWidth
              >
                <MenuItem value="" disabled>
                  Select a specialty/category
                </MenuItem>
                {selectableCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}{category.status !== "published" ? ` (${category.status})` : ""}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Location"
                value={talent.location || ""}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="e.g. Lagos, Nigeria"
                fullWidth
              />
            </Box>

            <Box className={styles.formGrid}>
              <TextField
                label="Professional Title (Optional)"
                value={talent.profession || ""}
                onChange={(e) => setField("profession", e.target.value)}
                placeholder="e.g. Music Producer"
                helperText="Use only when a more specific public title is needed; otherwise the selected category is displayed."
                fullWidth
              />
              <TextField
                label="Genre"
                value={talent.genre || ""}
                onChange={(e) => setField("genre", e.target.value)}
                placeholder="e.g. Afrobeats / R&B"
                fullWidth
              />
            </Box>

            <TextField
              label="Profile Badge"
              value={talent.badge || ""}
              onChange={(e) => setField("badge", e.target.value)}
              placeholder="e.g. MUSIC"
              fullWidth
            />

            <Box className={styles.formGrid}>
              <TextField
                label="Follower Count Display (Editorial)"
                value={talent.followers || ""}
                onChange={(e) => setField("followers", e.target.value)}
                placeholder="e.g. 24.5K"
                helperText="Enter only the display count. The public site adds the word “followers”."
                fullWidth
              />
              <TextField
                label="Rating Display (Editorial)"
                type="number"
                value={talent.rating ?? ""}
                onChange={(e) => setField("rating", e.target.value)}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                helperText="Optional editorial value from 0 to 5. This is not calculated from public reviews."
                fullWidth
              />
            </Box>

            <TextField
              label="Compelling Subtitle / Tagline"
              value={talent.subtitle || ""}
              onChange={(e) => setField("subtitle", e.target.value)}
              placeholder="e.g. Grammy-nominated multi-instrumentalist blending traditional African rhythm with modern soundscapes."
              fullWidth
            />

            <TextField
              label="Full Biography"
              value={talent.bio || ""}
              onChange={(e) => setField("bio", e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />

            <Box className={styles.subSection}>
              <Typography className={styles.subSectionTitle}>Profile Visual Media</Typography>
              <Box className={styles.formGrid}>
                <Box>
                  <TalentMediaField
                    label="Portrait Photo URL"
                    value={talent.image || ""}
                    onChange={(value) => setField("image", value)}
                    onAltSuggested={(value) => {
                      if (!talent.alt) setField("alt", value);
                    }}
                    onBrowseLibrary={() => onOpenMediaPicker("image")}
                  />
                  <TextField
                    label="Portrait Image Alt Text"
                    value={talent.alt || ""}
                    onChange={(e) => setField("alt", e.target.value)}
                    helperText="Describe the portrait for screen readers and image fallbacks."
                    fullWidth
                    size="small"
                    sx={{ mt: 1.5 }}
                  />
                </Box>
                <TalentMediaField
                  label="Cover Banner URL"
                  value={talent.coverImage || ""}
                  onChange={(value) => setField("coverImage", value)}
                  onBrowseLibrary={() => onOpenMediaPicker("coverImage")}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap", pt: 1 }}>
              <FormControlLabel
                control={<Switch checked={Boolean(talent.featured)} onChange={(e) => setField("featured", e.target.checked)} />}
                label="Featured on Homepage & Highlights"
              />
              <FormControlLabel
                control={<Switch checked={Boolean(talent.isHot)} onChange={(e) => setField("isHot", e.target.checked)} />}
                label="Trending / Hot Spotlight Badge"
              />
            </Box>

            <Box className={styles.formGrid}>
              <TextField
                select
                label="Publication Lifecycle Status"
                value={talent.status || "draft"}
                onChange={(e) => {
                  const status = e.target.value;
                  setTalent((previous) => ({
                    ...previous,
                    status,
                    scheduledAt: status === "scheduled" ? previous.scheduledAt : undefined,
                  }));
                }}
                fullWidth
              >
                <MenuItem value="draft">Draft (Admin Only)</MenuItem>
                <MenuItem value="published">Published (Live on Public Web)</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              {talent.status === "scheduled" ? (
                <TextField
                  label="Scheduled publication"
                  type="datetime-local"
                  value={talent.scheduledAt ? talent.scheduledAt.slice(0, 16) : ""}
                  onChange={(e) => setField("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Choose when this profile should become public."
                  required
                  fullWidth
                />
              ) : null}
            </Box>
          </Stack>
        )}

        {/* TAB 1: AWARDS & BOOKING */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            {/* Booking & Availability Info */}
            <Box className={styles.subSection}>
              <Typography className={styles.subSectionTitle}>Booking &amp; Availability Details</Typography>
              <Box className={styles.formGrid}>
                <TextField
                  select
                  label="Availability Status"
                  value={talent.availability || "Available for Booking"}
                  onChange={(e) => setField("availability", e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="Available for Booking">Available for Booking</MenuItem>
                  <MenuItem value="On Tour">On Tour</MenuItem>
                  <MenuItem value="Studio Production">Studio Production</MenuItem>
                  <MenuItem value="Fully Booked">Fully Booked</MenuItem>
                </TextField>
                <TextField
                  label="Starting Booking Rate"
                  value={talent.bookingPrice || ""}
                  onChange={(e) => setField("bookingPrice", e.target.value)}
                  placeholder="e.g. $2,500 / event or Contact for Quote"
                  fullWidth
                  size="small"
                />
              </Box>
            </Box>

            {/* Awards & Recognition */}
            <Box className={styles.subSection}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography className={styles.subSectionTitle}>Award &amp; Recognition Highlights</Typography>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" className={styles.addBtn} onClick={handleAddAward}>
                  Add Award
                </Button>
              </Box>
              {(talent.awards || []).map((award, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    size="small"
                    value={award}
                    onChange={(e) => handleUpdateAward(idx, e.target.value)}
                    fullWidth
                    placeholder="e.g. African Music Award Nominee 2023"
                  />
                  <IconButton size="small" className={styles.deleteBtn} onClick={() => handleDeleteAward(idx)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {(!talent.awards || talent.awards.length === 0) && (
                <Typography variant="body2" sx={{ color: "#9CA3AF", fontStyle: "italic" }}>
                  No awards added. Click &quot;Add Award&quot; to showcase recognition.
                </Typography>
              )}
            </Box>

            {/* Key Achievements */}
            <Box className={styles.subSection}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography className={styles.subSectionTitle}>Key Achievements &amp; Milestones</Typography>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" className={styles.addBtn} onClick={handleAddAchievement}>
                  Add Achievement
                </Button>
              </Box>
              {(talent.achievements || []).map((ach, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    size="small"
                    value={ach}
                    onChange={(e) => handleUpdateAchievement(idx, e.target.value)}
                    fullWidth
                    placeholder="e.g. 4M+ streams on debut EP across streaming platforms"
                  />
                  <IconButton size="small" className={styles.deleteBtn} onClick={() => handleDeleteAchievement(idx)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {(!talent.achievements || talent.achievements.length === 0) && (
                <Typography variant="body2" sx={{ color: "#9CA3AF", fontStyle: "italic" }}>
                  No key achievements added yet.
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        {/* TAB 2: SOCIAL & STREAMING */}
        {activeTab === 2 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Provide verified external channel links and streaming profiles displayed on the talent&apos;s public profile sidebar and action bar.
            </Typography>
            <Box className={styles.formGrid}>
              <TextField
                label="Spotify Profile / Artist Link"
                value={talent.socials?.spotify || ""}
                onChange={(e) => setSocial("spotify", e.target.value)}
                placeholder="https://open.spotify.com/artist/..."
                fullWidth
              />
              <TextField
                label="Apple Music Profile"
                value={talent.socials?.appleMusic || ""}
                onChange={(e) => setSocial("appleMusic", e.target.value)}
                placeholder="https://music.apple.com/artist/..."
                fullWidth
              />
            </Box>

            <Box className={styles.formGrid}>
              <TextField
                label="YouTube Channel Link"
                value={talent.socials?.youtube || ""}
                onChange={(e) => setSocial("youtube", e.target.value)}
                placeholder="https://youtube.com/@..."
                fullWidth
              />
              <TextField
                label="Instagram Profile"
                value={talent.socials?.instagram || ""}
                onChange={(e) => setSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                fullWidth
              />
            </Box>

            <Box className={styles.formGrid}>
              <TextField
                label="Facebook Profile"
                value={talent.socials?.facebook || ""}
                onChange={(e) => setSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                fullWidth
              />
              <TextField
                label="X (Twitter) Profile"
                value={talent.socials?.twitter || ""}
                onChange={(e) => setSocial("twitter", e.target.value)}
                placeholder="https://x.com/..."
                fullWidth
              />
            </Box>

            <Box className={styles.formGrid}>
              <TextField
                label="TikTok Profile"
                value={talent.socials?.tiktok || ""}
                onChange={(e) => setSocial("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@..."
                fullWidth
              />
              <TextField
                label="SoundCloud Profile"
                value={talent.socials?.soundcloud || ""}
                onChange={(e) => setSocial("soundcloud", e.target.value)}
                placeholder="https://soundcloud.com/..."
                fullWidth
              />
            </Box>

          </Stack>
        )}

        {/* TAB 3: SHOWCASE MEDIA */}
        {activeTab === 3 && (
          <Stack spacing={3}>
            {/* Gallery Images */}
            <Box className={styles.subSection}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography className={styles.subSectionTitle}>Portfolio Photography Gallery</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  className={styles.addBtn}
                  onClick={() => onOpenMediaPicker({ field: "galleryAdd", type: "image" })}
                >
                  Add Photo
                </Button>
              </Box>
              <Box className={styles.galleryAddRow}>
                <TalentMediaField
                  label="New Gallery Image URL"
                  value={galleryImageUrl}
                  onChange={setGalleryImageUrl}
                  onUploaded={(url) => handleAddGalleryImage(url)}
                  onBrowseLibrary={() => onOpenMediaPicker({ field: "galleryAdd", type: "image" })}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAddGalleryImage()}
                  disabled={!galleryImageUrl.trim()}
                  className={styles.galleryAddButton}
                >
                  Add URL to gallery
                </Button>
              </Box>
              <Box className={styles.galleryThumbGrid}>
                {(talent.galleryImages || []).map((imgUrl, idx) => (
                  <Box key={idx} className={styles.galleryThumbCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className={styles.galleryThumbImg} />
                    <button
                      type="button"
                      className={styles.galleryThumbDelete}
                      onClick={() => handleDeleteGalleryImage(idx)}
                      aria-label="Remove gallery image reference"
                      title="Remove from gallery (Cloudinary asset is retained)"
                    >
                      <DeleteOutlineIcon fontSize="inherit" />
                    </button>
                  </Box>
                ))}
              </Box>
              {(!talent.galleryImages || talent.galleryImages.length === 0) && (
                <Typography variant="body2" sx={{ color: "#9CA3AF", fontStyle: "italic" }}>
                  No gallery photos added. Click &quot;Add Photo&quot; to populate the talent&apos;s gallery tab.
                </Typography>
              )}
            </Box>

            {/* Showcase Videos */}
            <Box className={styles.subSection}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography className={styles.subSectionTitle}>Video Showcase &amp; Performances</Typography>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" className={styles.addBtn} onClick={handleAddVideo}>
                  Add Video
                </Button>
              </Box>
              {(talent.videos || []).map((vid, idx) => (
                <Box key={vid.id || idx} className={styles.itemCard}>
                  <Box className={styles.itemHeader}>
                    <span className={styles.itemNumber}>VIDEO #{idx + 1}</span>
                    <IconButton size="small" className={styles.deleteBtn} onClick={() => handleDeleteVideo(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      size="small"
                      label="Video Title"
                      value={vid.title || ""}
                      onChange={(e) => handleUpdateVideo(idx, "title", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Artist / Credit"
                      value={vid.artist || ""}
                      onChange={(e) => handleUpdateVideo(idx, "artist", e.target.value)}
                      placeholder={talent.name || "Talent or featured artist"}
                      fullWidth
                    />
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      size="small"
                      label="Duration"
                      value={vid.duration || ""}
                      onChange={(e) => handleUpdateVideo(idx, "duration", e.target.value)}
                      placeholder="e.g. 04:30"
                      helperText="Filled automatically for uploaded or library media. Enter it only for an external URL."
                      fullWidth
                    />
                    <TalentMediaField
                      label="Video / YouTube URL"
                      value={vid.videoUrl || ""}
                      mediaType="video"
                      onChange={(value) =>
                        handleUpdateVideo(idx, { videoUrl: value, mediaAssetId: undefined, duration: "" })
                      }
                      onUploaded={(url, result) => {
                        const duration = formatMediaDuration(result.durationSeconds);
                        handleUpdateVideo(idx, {
                          videoUrl: url,
                          ...(duration ? { duration } : {}),
                          ...(result.asset?.id ? { mediaAssetId: result.asset.id } : {}),
                        });
                      }}
                      onBrowseLibrary={() =>
                        onOpenMediaPicker({ field: "videoUrl", type: "video", index: idx })
                      }
                      helperText="Paste a supported YouTube or Cloudinary video URL, upload a video, or select one from the media library."
                    />
                  </Box>
                  <TalentMediaField
                    label="Thumbnail Image URL"
                    value={vid.thumbnail || ""}
                    onChange={(value) =>
                      handleUpdateVideo(idx, { thumbnail: value, thumbnailMediaAssetId: undefined })
                    }
                    onBrowseLibrary={() =>
                      onOpenMediaPicker({ field: "thumbnail", type: "image", index: idx })
                    }
                  />
                </Box>
              ))}
            </Box>

            {/* Music / Audio Tracks */}
            <Box className={styles.subSection}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography className={styles.subSectionTitle}>Audio Tracks &amp; Discography</Typography>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" className={styles.addBtn} onClick={handleAddTrack}>
                  Add Track
                </Button>
              </Box>
              {(talent.musicTracks || []).map((track, idx) => (
                <Box key={track.id || idx} className={styles.itemCard}>
                  <Box className={styles.itemHeader}>
                    <span className={styles.itemNumber}>TRACK #{idx + 1}</span>
                    <IconButton size="small" className={styles.deleteBtn} onClick={() => handleDeleteTrack(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      size="small"
                      label="Track Title"
                      value={track.title || ""}
                      onChange={(e) => handleUpdateTrack(idx, "title", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Duration"
                      value={track.duration || ""}
                      onChange={(e) => handleUpdateTrack(idx, "duration", e.target.value)}
                      placeholder="e.g. 03:45"
                      helperText="Filled automatically for uploaded or library media. Enter it only for an external URL."
                      fullWidth
                    />
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      size="small"
                      label="Streams Count / Metric"
                      value={track.streams || track.plays || ""}
                      onChange={(e) => handleUpdateTrack(idx, "streams", e.target.value)}
                      placeholder="e.g. 1.2M"
                      fullWidth
                    />
                    <TalentMediaField
                      label="Streaming / Audio Link"
                      value={track.trackUrl || ""}
                      mediaType="audio"
                      onChange={(value) =>
                        handleUpdateTrack(idx, { trackUrl: value, mediaAssetId: undefined, duration: "" })
                      }
                      onUploaded={(url, result) => {
                        const duration = formatMediaDuration(result.durationSeconds);
                        handleUpdateTrack(idx, {
                          trackUrl: url,
                          ...(duration ? { duration } : {}),
                          ...(result.asset?.id ? { mediaAssetId: result.asset.id } : {}),
                        });
                      }}
                      onBrowseLibrary={() =>
                        onOpenMediaPicker({ field: "trackUrl", type: "audio", index: idx, collection: "musicTracks" })
                      }
                      helperText="Paste an existing audio URL, upload an MP3/WAV/M4A/AAC/OGG/FLAC file, or select audio from the media library."
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Publications */}
            <Box className={styles.subSection}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography className={styles.subSectionTitle}>Press Features &amp; Publications</Typography>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" className={styles.addBtn} onClick={handleAddPublication}>
                  Add Press Article
                </Button>
              </Box>
              {(talent.publications || []).map((pub, idx) => (
                <Box key={pub.id || idx} className={styles.itemCard}>
                  <Box className={styles.itemHeader}>
                    <span className={styles.itemNumber}>ARTICLE #{idx + 1}</span>
                    <IconButton size="small" className={styles.deleteBtn} onClick={() => handleDeletePublication(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      size="small"
                      label="Article Title"
                      value={pub.title || ""}
                      onChange={(e) => handleUpdatePublication(idx, "title", e.target.value)}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Publication Type"
                      value={pub.type || ""}
                      onChange={(e) => handleUpdatePublication(idx, "type", e.target.value)}
                      placeholder="e.g. Interview, Novel, Feature"
                      fullWidth
                    />
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      size="small"
                      label="Publication Year"
                      value={pub.year || ""}
                      onChange={(e) => handleUpdatePublication(idx, "year", e.target.value)}
                      placeholder="e.g. 2026"
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Publisher / Magazine"
                      value={pub.publisher || ""}
                      onChange={(e) => handleUpdatePublication(idx, "publisher", e.target.value)}
                      placeholder="e.g. BBC Africa"
                      fullWidth
                    />
                  </Box>
                  <TextField
                    size="small"
                    label="Article URL Link"
                    value={pub.url || ""}
                    onChange={(e) => handleUpdatePublication(idx, "url", e.target.value)}
                    fullWidth
                  />
                </Box>
              ))}
            </Box>
          </Stack>
        )}

        {/* TAB 4: PROFILE TABS CONFIG */}
        {activeTab === 4 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              Select which content tabs appear on this talent&apos;s public profile page (`/talents/{talent.slug || "[slug]"}`).
            </Typography>
            <FormGroup>
              {ALL_PROFILE_TABS.map((tabKey) => {
                const currentTabs = talent.tabs || ["ABOUT", "GALLERY", "VIDEOS"];
                const isChecked = currentTabs.includes(tabKey);
                return (
                  <FormControlLabel
                    key={tabKey}
                    control={<Checkbox checked={isChecked} onChange={() => handleToggleTab(tabKey)} sx={{ color: "#B46A2C", "&.Mui-checked": { color: "#B46A2C" } }} />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {tabKey} TAB
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280" }}>
                          {tabKey === "ABOUT" && "Displays biography narrative, award recognitions, and milestone achievements."}
                          {tabKey === "GALLERY" && "Displays responsive photography portfolio with lightbox."}
                          {tabKey === "VIDEOS" && "Displays video showcase reel and performance clips."}
                          {tabKey === "MUSIC" && "Displays playable music tracks and discography for musicians & producers."}
                          {tabKey === "PUBLICATIONS" && "Displays press coverage, magazine interviews, and publication links."}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2, alignItems: "flex-start" }}
                  />
                );
              })}
            </FormGroup>
          </Stack>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {talent?.id && onDuplicate && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopyOutlinedIcon fontSize="small" />}
              onClick={() => onDuplicate(talent)}
            >
              Duplicate as Draft
            </Button>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isSaving}
          sx={{
            background: "#B46A2C",
            "&:hover": { background: "#9A5B26" },
            fontWeight: 700,
            textTransform: "none",
            px: 3,
          }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : talent?.id ? "Save Changes" : "Create Talent"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
