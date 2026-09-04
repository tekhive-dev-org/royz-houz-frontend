import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import AudiotrackOutlinedIcon from "@mui/icons-material/AudiotrackOutlined";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { TalentMediaField } from "@/components/talents/TalentMediaField";
import styles from "./MediaAdmin.module.css";

import { formatSecondsToTime, parseDurationToSeconds } from "@/utils/mediaDuration";
import { getMediaThumbnailUrl } from "@/utils/media/cloudinary";

export function MediaAssetEditorDialog({
  item,
  talents = [],
  onBrowseLibrary,
  open,
  onClose,
  onSave,
  isSaving = false,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const body = item?.body || {};
  const findTalentId = (value) =>
    talents.find((talent) => (talent.title || talent.name || talent.body?.name || "") === value)?.id || "";

  const [form, setForm] = useState(() => ({
    title: item?.title || "",
    summary: item?.summary || "",
    altText: item?.alt_text || "",
    caption: item?.caption || "",
    category: body.category || body.section || "",
    spotlightCategory: body.spotlightCategory || "",
    description: body.description || "",
    author: body.author?.name || (typeof body.author === "string" ? body.author : "") || body.artist || "",
    authorTalentId: body.author?.id || body.artistTalentId || findTalentId(body.author?.name || body.author || body.artist || ""),
    authorAvatar: body.author?.avatar || "",
    host: body.host || "",
    hostTalentId: body.hostTalentId || findTalentId(body.host || ""),
    artist: body.artist || (typeof body.author === "string" ? body.author : body.author?.name || ""),
    artistTalentId: body.artistTalentId || body.author?.id || findTalentId(body.artist || ""),
    genre: body.genre || "",
    views: body.views || "",
    duration: body.duration || (item?.duration_seconds ? formatSecondsToTime(item.duration_seconds) : ""),
    thumbnail: body.thumbnail || "",
    coverImage: body.coverImage || "",
    size: body.size || "short",
    featured: Boolean(item?.featured),
    sortOrder: item?.sort_order || 0,
    status: item?.status || "draft",
  }));

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit() {
    onSave({
      title: form.title,
      summary: form.summary,
      altText: form.altText,
      caption: form.caption,
      featured: form.featured,
      sortOrder: Number(form.sortOrder) || 0,
      duration_seconds: parseDurationToSeconds(form.duration) || item?.duration_seconds || undefined,
      status: form.status,
      body: {
        ...body,
        category: form.category,
        section: form.category,
        spotlightCategory: form.spotlightCategory,
        subtitle: form.summary,
        description: form.description,
        duration: form.duration,
        author: (form.author || (isAudio ? form.artist : ""))
          ? {
              ...(typeof body.author === "object" ? body.author : {}),
              ...((form.authorTalentId || (isAudio ? form.artistTalentId : ""))
                ? {
                    id: form.authorTalentId || form.artistTalentId,
                    slug: talents.find((talent) => talent.id === (form.authorTalentId || form.artistTalentId))?.slug,
                    avatar: form.authorAvatar || "",
                  }
                : {
                    avatar: form.authorAvatar || "",
                  }),
              name: form.author || form.artist,
            }
          : undefined,
        host: form.host,
        hostTalentId: form.hostTalentId || undefined,
        artist: form.artist,
        artistTalentId: form.artistTalentId || undefined,
        genre: form.genre,
        views: form.views,
        thumbnail: form.thumbnail,
        coverImage: form.coverImage,
        size: form.size,
      },
    });
  }

  const isVideo = item?.media_type === "video";
  const isAudio = item?.media_type === "audio";
  const isImage = item?.media_type === "image";

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {getMediaThumbnailUrl(item, { width: 160 }) ? (
            <Avatar
              src={getMediaThumbnailUrl(item, { width: 160 })}
              alt={item.title}
              variant="rounded"
              sx={{ width: 44, height: 44, borderRadius: 2, border: "1px solid #E8EAEF", bgcolor: "#FAF4EF" }}
            >
              {item?.media_type === "audio" ? "♫" : item?.media_type === "image" ? "🖼" : "▶"}
            </Avatar>
          ) : (
            <Box
              sx={{
                width: 44,
                height: 44,
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
              <PermMediaOutlinedIcon fontSize="small" />
            </Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#111827", lineHeight: 1.2 }}>
              Edit Media: {form.title || item?.title || "Untitled"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              Configure presentation details, category taxonomy, credits, and publishing state.
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSaving}>
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
        <Tab icon={<DescriptionOutlinedIcon fontSize="small" />} iconPosition="start" label="General & Content" />
        <Tab icon={<CategoryOutlinedIcon fontSize="small" />} iconPosition="start" label="Taxonomy & Credits" />
        <Tab icon={<PermMediaOutlinedIcon fontSize="small" />} iconPosition="start" label="Visuals & Artwork" />
        <Tab icon={<SettingsOutlinedIcon fontSize="small" />} iconPosition="start" label="Publishing & Hero" />
      </Tabs>

      <DialogContent sx={{ px: 3, py: 3, minHeight: 440 }}>
        {/* TAB 0: GENERAL & CONTENT */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <TextField
              label="Media Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              fullWidth
              size="small"
              required
              placeholder="e.g. Echoes of Lagos: Live Session"
            />

            <TextField
              label="Card Subtitle / Summary"
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
              fullWidth
              multiline
              minRows={2}
              size="small"
              placeholder="Shown below the title on public media cards"
              helperText="Appears on featured cards, spotlight banners, and catalog cards."
            />

            <TextField
              label="Full Editorial Description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              fullWidth
              multiline
              minRows={3}
              size="small"
              placeholder="Detailed description, lyrics, program notes, or editorial background."
            />

            <Box className={styles.formGrid}>
              <TextField
                label="Alt Text (Accessibility)"
                value={form.altText}
                onChange={(e) => setField("altText", e.target.value)}
                size="small"
                fullWidth
                helperText="Alternative descriptive text for screen readers."
              />
              <TextField
                label="Editorial Caption"
                value={form.caption}
                onChange={(e) => setField("caption", e.target.value)}
                size="small"
                fullWidth
                helperText="Optional display caption for photo galleries."
              />
            </Box>
          </Stack>
        )}

        {/* TAB 1: TAXONOMY & CREDITS */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            <Box className={styles.subSection}>
              <Box className={styles.subSectionTitle}>
                <CategoryOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                Categorization & Spotlight
              </Box>
              <Box className={styles.formGrid}>
                <TextField
                  label="Category / Section"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Use Podcast for podcast videos, or Music / Gallery / Videos."
                />

                {isVideo && (
                  <TextField
                    select
                    label="Spotlight Category"
                    value={form.spotlightCategory}
                    onChange={(e) => setField("spotlightCategory", e.target.value)}
                    size="small"
                    fullWidth
                    helperText="Visible tag pill on podcast spotlight cards."
                  >
                    <MenuItem value="">No spotlight category</MenuItem>
                    {["Culture", "Inspiration", "Business", "Documentary", "Interview", "Performance"].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            </Box>

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
                      value={form.authorTalentId}
                      onChange={(e) => {
                        const opt = talents.find((t) => t.id === e.target.value);
                        setField("authorTalentId", e.target.value);
                        if (opt) {
                          setField("author", opt.title || opt.name || opt.body?.name || "");
                          const tAvatar = opt.body?.image || opt.body?.avatar || opt.image || "";
                          if (tAvatar) setField("authorAvatar", tAvatar);
                        }
                      }}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="">Custom / Manual Author</MenuItem>
                      {talents.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.title || t.name || t.body?.name || t.slug}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Author / Creator Name"
                      value={form.author}
                      onChange={(e) => setField("author", e.target.value)}
                      placeholder="e.g. Royz Studios"
                      size="small"
                      fullWidth
                    />
                  </Box>

                  <TalentMediaField
                    label="Author / Creator Photo (Avatar)"
                    value={form.authorAvatar}
                    onChange={(val) => setField("authorAvatar", val)}
                    onBrowseLibrary={() => onBrowseLibrary?.("image", (val) => setField("authorAvatar", val))}
                    helperText="Creator photo displayed on video cards and the media player sidebar profile."
                  />
                </Box>

                <Box className={styles.subSection}>
                  <Box className={styles.subSectionTitle}>
                    <MicNoneOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                    Show Host Attribution
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      select
                      label="Host Talent (Roster)"
                      value={form.hostTalentId}
                      onChange={(e) => {
                        const opt = talents.find((t) => t.id === e.target.value);
                        setField("hostTalentId", e.target.value);
                        setField("host", opt?.title || opt?.name || opt?.body?.name || "");
                      }}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="">No roster host selected</MenuItem>
                      {talents.map((t) => (
                        <MenuItem key={t.id} value={t.id}>
                          {t.title || t.name || t.body?.name || t.slug}
                        </MenuItem>
                      ))}
                    </TextField>

                    {!form.hostTalentId && (
                      <TextField
                        label="Manual Host Name"
                        value={form.host}
                        onChange={(e) => setField("host", e.target.value)}
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
                    Playback Metrics
                  </Box>
                  <Box className={styles.formGrid}>
                    <TextField
                      label="Duration"
                      value={form.duration || body.duration || ""}
                      onChange={(e) => setField("duration", e.target.value)}
                      placeholder="e.g. 24:15"
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Views Display (Real Interaction Tracked)"
                      value={form.views}
                      onChange={(e) => setField("views", e.target.value)}
                      placeholder="e.g. 12.4K views"
                      size="small"
                      fullWidth
                      helperText={
                        typeof body.view_count === "number"
                          ? `✨ Live recorded count: ${body.view_count.toLocaleString()} unique plays. Updated automatically on visitor playback.`
                          : "Automatically tracked and incremented from unique user playback interactions."
                      }
                    />
                  </Box>
                </Box>
              </>
            )}

            {isAudio && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <AudiotrackOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Artist Attribution & Track Info
                </Box>
                <Box className={styles.formGrid}>
                  <TextField
                    select
                    label="Artist Talent (Roster)"
                    value={form.artistTalentId}
                    onChange={(e) => {
                      const opt = talents.find((t) => t.id === e.target.value);
                      setField("artistTalentId", e.target.value);
                      if (opt) {
                        setField("artist", opt.title || opt.name || opt.body?.name || "");
                        const tAvatar = opt.body?.image || opt.body?.avatar || opt.image || "";
                        if (tAvatar) setField("authorAvatar", tAvatar);
                      }
                    }}
                    size="small"
                    fullWidth
                  >
                    <MenuItem value="">Custom / Manual Artist</MenuItem>
                    {talents.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.title || t.name || t.body?.name || t.slug}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Artist / Creator Name"
                    value={form.artist}
                    onChange={(e) => setField("artist", e.target.value)}
                    placeholder="e.g. Royz Music Collective"
                    size="small"
                    fullWidth
                  />

                  <TextField
                    label="Genre"
                    value={form.genre}
                    onChange={(e) => setField("genre", e.target.value)}
                    placeholder="e.g. Afrobeats, Highlife"
                    size="small"
                    fullWidth
                  />

                  <TextField
                    label="Duration"
                    value={form.duration || body.duration || ""}
                    onChange={(e) => setField("duration", e.target.value)}
                    placeholder="e.g. 03:42"
                    size="small"
                    fullWidth
                  />
                </Box>

                <TalentMediaField
                  label="Artist / Creator Photo (Avatar)"
                  value={form.authorAvatar}
                  onChange={(val) => setField("authorAvatar", val)}
                  onBrowseLibrary={() => onBrowseLibrary?.("image", (val) => setField("authorAvatar", val))}
                  helperText="Artist/creator profile photo shown in the media player sidebar."
                />
              </Box>
            )}

            {isImage && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <ImageOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Photo Categorization
                </Box>
                <Typography variant="body2" sx={{ color: "#6B7280" }}>
                  Images are assigned to the Gallery section. You can customize the public card display height on the Visuals & Artwork tab.
                </Typography>
              </Box>
            )}
          </Stack>
        )}

        {/* TAB 2: VISUALS & ARTWORK */}
        {activeTab === 2 && (
          <Stack spacing={2.5}>
            <Box className={styles.subSection}>
              <Box className={styles.subSectionTitle}>
                <PermMediaOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                Source File & Media Stream
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Chip
                  label={item?.media_type?.toUpperCase() || "ASSET"}
                  size="small"
                  sx={{ bgcolor: "#FAF4EF", color: "#B46A2C", fontWeight: 700, border: "1px solid #E8D5C4" }}
                />
                <Chip
                  label={`Source: ${item?.media_source || "Upload"}`}
                  size="small"
                  variant="outlined"
                  sx={{ color: "#4B5563" }}
                />
                <Typography variant="caption" sx={{ color: "#6B7280", wordBreak: "break-all" }}>
                  {item?.secure_url || item?.url || "No URL available"}
                </Typography>
              </Box>
            </Box>

            {isVideo && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <VideoLibraryOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Video Thumbnail Poster
                </Box>
                <TalentMediaField
                  label="Thumbnail Artwork"
                  value={form.thumbnail}
                  onChange={(val) => setField("thumbnail", val)}
                  onBrowseLibrary={() => onBrowseLibrary?.("image", (val) => setField("thumbnail", val))}
                  helperText="Upload custom thumbnail poster or pick from media library. For YouTube videos, defaults to YouTube poster."
                />
              </Box>
            )}

            {isAudio && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <AudiotrackOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Track Cover Artwork
                </Box>
                <TalentMediaField
                  label="Cover Artwork"
                  value={form.coverImage}
                  onChange={(val) => setField("coverImage", val)}
                  onBrowseLibrary={() => onBrowseLibrary?.("image", (val) => setField("coverImage", val))}
                  helperText="Square cover artwork displayed in audio player cards and catalog lists."
                />
              </Box>
            )}

            {isImage && (
              <Box className={styles.subSection}>
                <Box className={styles.subSectionTitle}>
                  <ImageOutlinedIcon fontSize="small" sx={{ color: "#B46A2C" }} />
                  Gallery Card Height
                </Box>
                <TextField
                  select
                  label="Gallery Card Height"
                  value={form.size}
                  onChange={(e) => setField("size", e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Controls card aspect ratio in the public masonry photography grid."
                >
                  <MenuItem value="short">Short (Compact ratio)</MenuItem>
                  <MenuItem value="tall">Tall (Standard portrait)</MenuItem>
                  <MenuItem value="extraTall">Extra Tall (Feature poster)</MenuItem>
                </TextField>
              </Box>
            )}
          </Stack>
        )}

        {/* TAB 3: PUBLISHING & HERO */}
        {activeTab === 3 && (
          <Stack spacing={2.5}>
            <Box className={styles.formGrid}>
              <TextField
                select
                label="Publication Status"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                size="small"
                fullWidth
              >
                <MenuItem value="draft">Draft (Hidden from public catalog)</MenuItem>
                <MenuItem value="published">Published (Visible on media page)</MenuItem>
                <MenuItem value="archived">Archived (Stored in library only)</MenuItem>
              </TextField>

              <TextField
                label="Custom Sort Order"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                inputProps={{ min: 0, step: 1 }}
                size="small"
                fullWidth
                helperText="Lower numbers appear first in catalog lists."
              />
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
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
                sx={{
                  "& .Mui-checked": { color: "#B46A2C" },
                  "& .Mui-checked + .MuiSwitch-track": { backgroundColor: "#B46A2C !important" },
                }}
              />
            </Box>
          </Stack>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button onClick={onClose} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving || !form.title.trim()}
          sx={{
            background: "#B46A2C",
            "&:hover": { background: "#9A5B26" },
            fontWeight: 700,
            textTransform: "none",
            px: 3,
          }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MediaAssetEditorDialog;
