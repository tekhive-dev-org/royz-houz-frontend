import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { DEFAULT_BLOG_PAGE_CONTENT } from "@/constants/blogPage";
import { blogApi } from "@/services/blogApi";
import { MediaField } from "@/components/content/MediaField";
import styles from "./BlogPageSettingsEditor.module.css";

const EDITOR_TABS = [
  "SEO & Page",
  "Hero & Carousel",
  "Discover Pillars",
  "Multimedia Video Stories",
  "CTA Banner",
];

export function BlogPageSettingsEditor({ onSaved, onOpenMediaPicker }) {
  const [settings, setSettings] = useState(DEFAULT_BLOG_PAGE_CONTENT);
  const [status, setStatus] = useState("published");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    blogApi
      .getPageSettings()
      .then((record) => {
        if (record && record.content) {
          setSettings((current) => ({
            ...current,
            seo: { ...(current.seo || {}), ...(record.content.seo || {}) },
            hero: {
              ...(current.hero || {}),
              ...(record.content.hero || {}),
              slides: record.content.hero?.slides || current.hero?.slides || [],
            },
            pillars: {
              ...(current.pillars || {}),
              ...(record.content.pillars || {}),
              items: record.content.pillars?.items || current.pillars?.items || [],
            },
            multimedia: {
              ...(current.multimedia || {}),
              ...(record.content.multimedia || {}),
              mainVideo: {
                ...(current.multimedia?.mainVideo || {}),
                ...(record.content.multimedia?.mainVideo || {}),
              },
              playlist: record.content.multimedia?.playlist || current.multimedia?.playlist || [],
            },
            cta: { ...(current.cta || {}), ...(record.content.cta || {}) },
          }));
          setStatus(record.status || "published");
        }
      })
      .catch((err) => setError(err.message || "Unable to load Blog page settings."))
      .finally(() => setLoading(false));
  }, []);

  const setSection = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  };

  // Hero slides handlers
  const handleAddHeroSlide = () => {
    const newSlide = {
      id: `hero-${Date.now()}`,
      badge: "The Royz Houz Journal",
      titlePrefix: "Spotlight Story:",
      titleHighlight: "Creative Excellence Across Africa",
      description: "Discover new perspectives and stories shaping modern culture.",
      ctaText: "Read Story",
      ctaLink: "/blog",
      backgroundImage: "/assets/img/blog/blog-hero-1.jpg",
    };
    setSettings((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: [...(current.hero?.slides || []), newSlide],
      },
    }));
  };

  const handleUpdateHeroSlide = (index, field, value) => {
    setSettings((current) => {
      const slides = [...(current.hero?.slides || [])];
      slides[index] = { ...slides[index], [field]: value };
      return { ...current, hero: { ...current.hero, slides } };
    });
  };

  const handleDeleteHeroSlide = (index) => {
    setSettings((current) => {
      const slides = (current.hero?.slides || []).filter((_, i) => i !== index);
      return { ...current, hero: { ...current.hero, slides } };
    });
  };

  // Pillar items handlers
  const handleUpdatePillar = (index, field, value) => {
    setSettings((current) => {
      const items = [...(current.pillars?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...current, pillars: { ...current.pillars, items } };
    });
  };

  // Multimedia playlist handlers
  const handleUpdatePlaylistItem = (index, field, value) => {
    setSettings((current) => {
      const playlist = [...(current.multimedia?.playlist || [])];
      playlist[index] = { ...playlist[index], [field]: value };
      return {
        ...current,
        multimedia: { ...current.multimedia, playlist },
      };
    });
  };

  const handleAddPlaylistItem = () => {
    const newItem = {
      id: `video-${Date.now()}`,
      title: "New Video Feature",
      category: "Documentary",
      duration: "12:30",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    };
    setSettings((current) => ({
      ...current,
      multimedia: {
        ...current.multimedia,
        playlist: [...(current.multimedia?.playlist || []), newItem],
      },
    }));
  };

  const handleDeletePlaylistItem = (index) => {
    setSettings((current) => {
      const playlist = (current.multimedia?.playlist || []).filter((_, i) => i !== index);
      return { ...current, multimedia: { ...current.multimedia, playlist } };
    });
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await blogApi.savePageSettings({ content: settings, status });
      onSaved?.("Blog page content and settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save Blog page settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Typography color="text.secondary">Loading blog page controls…</Typography>;
  }

  return (
    <Paper className={styles.settingsCard} variant="outlined">
      <Box className={styles.headerRow}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Blog Page &amp; Layout Manager
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the hero carousel, discovery pillars, multimedia video player, and CTA banner shown on the public Journal page.
          </Typography>
        </Box>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving Changes…" : "Save Blog Settings"}
        </Button>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        className={styles.tabs}
      >
        {EDITOR_TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {/* TAB 0: SEO & PAGE */}
      {activeTab === 0 && (
        <Stack spacing={2.5} className={styles.fieldsStack}>
          <TextField
            fullWidth
            label="Page Meta Title"
            value={settings.seo?.title || ""}
            onChange={(e) => setSection("seo", "title", e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Meta Description"
            value={settings.seo?.description || ""}
            onChange={(e) => setSection("seo", "description", e.target.value)}
          />
          <Box className={styles.row}>
            <MediaField
              label="OG Social Share Image"
              value={settings.seo?.ogImage || ""}
              mediaType="image"
              onChange={(url) => setSection("seo", "ogImage", url)}
              onUploaded={(url) => setSection("seo", "ogImage", url)}
              onBrowseLibrary={() =>
                onOpenMediaPicker?.({
                  type: "image",
                  onSelect: (url) => setSection("seo", "ogImage", url),
                })
              }
              helperText="Upload social card image from device or choose from media library."
              showPreview={true}
              previewHeight={140}
            />
            <TextField
              select
              fullWidth
              label="Page Settings Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="draft">Draft (Admin Only)</MenuItem>
              <MenuItem value="published">Published (Live On Site)</MenuItem>
            </TextField>
          </Box>
        </Stack>
      )}

      {/* TAB 1: HERO & CAROUSEL */}
      {activeTab === 1 && (
        <Stack spacing={3} className={styles.fieldsStack}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Hero Carousel Slides ({settings.hero?.slides?.length || 0})
            </Typography>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddHeroSlide}>
              Add Hero Slide
            </Button>
          </Box>

          <Stack spacing={2.5}>
            {(settings.hero?.slides || []).map((slide, idx) => (
              <Box key={slide.id || idx} className={styles.cardItem}>
                <Box className={styles.cardItemHeader}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Slide #{idx + 1}: {slide.titleHighlight || "Untitled Slide"}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={(settings.hero?.slides || []).length <= 1}
                    onClick={() => handleDeleteHeroSlide(idx)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box className={styles.row}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Badge / Tagline"
                    value={slide.badge || ""}
                    onChange={(e) => handleUpdateHeroSlide(idx, "badge", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Title Prefix"
                    value={slide.titlePrefix || ""}
                    onChange={(e) => handleUpdateHeroSlide(idx, "titlePrefix", e.target.value)}
                  />
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Title Highlight (Colored Accent)"
                  value={slide.titleHighlight || ""}
                  onChange={(e) => handleUpdateHeroSlide(idx, "titleHighlight", e.target.value)}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Slide Description"
                  value={slide.description || ""}
                  onChange={(e) => handleUpdateHeroSlide(idx, "description", e.target.value)}
                />

                <Box className={styles.row}>
                  <TextField
                    fullWidth
                    size="small"
                    label="CTA Button Label"
                    value={slide.ctaText || ""}
                    onChange={(e) => handleUpdateHeroSlide(idx, "ctaText", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="CTA Destination Link"
                    value={slide.ctaLink || ""}
                    onChange={(e) => handleUpdateHeroSlide(idx, "ctaLink", e.target.value)}
                  />
                </Box>

                <MediaField
                  label="Slide Background Image"
                  value={slide.backgroundImage || ""}
                  mediaType="image"
                  onChange={(url) => handleUpdateHeroSlide(idx, "backgroundImage", url)}
                  onUploaded={(url) => handleUpdateHeroSlide(idx, "backgroundImage", url)}
                  onBrowseLibrary={() =>
                    onOpenMediaPicker?.({
                      type: "image",
                      onSelect: (url) => handleUpdateHeroSlide(idx, "backgroundImage", url),
                    })
                  }
                  helperText="Upload slide background from your device, choose from media library, or paste an HTTPS URL."
                  showPreview={true}
                  previewHeight={200}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      )}

      {/* TAB 2: DISCOVER PILLARS */}
      {activeTab === 2 && (
        <Stack spacing={3} className={styles.fieldsStack}>
          <Box className={styles.row}>
            <TextField
              fullWidth
              size="small"
              label="Section Tagline"
              value={settings.pillars?.sectionTagline || ""}
              onChange={(e) => setSection("pillars", "sectionTagline", e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Section Main Title"
              value={settings.pillars?.sectionTitle || ""}
              onChange={(e) => setSection("pillars", "sectionTitle", e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Section Subtitle"
            value={settings.pillars?.sectionSubtitle || ""}
            onChange={(e) => setSection("pillars", "sectionSubtitle", e.target.value)}
          />

          <Divider />
          <Typography variant="subtitle1" fontWeight={700}>
            Pillar Cards (4 Pillars)
          </Typography>

          <Stack spacing={2.5}>
            {(settings.pillars?.items || []).map((pillar, idx) => (
              <Box key={pillar.id || idx} className={styles.cardItem}>
                <Box className={styles.cardItemHeader}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Pillar #{idx + 1}: {pillar.title}
                  </Typography>
                </Box>

                <Box className={styles.row}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Pillar Title"
                    value={pillar.title || ""}
                    onChange={(e) => handleUpdatePillar(idx, "title", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Destination Link"
                    value={pillar.link || ""}
                    onChange={(e) => handleUpdatePillar(idx, "link", e.target.value)}
                  />
                </Box>

                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Description"
                  value={pillar.description || ""}
                  onChange={(e) => handleUpdatePillar(idx, "description", e.target.value)}
                />

                <MediaField
                  label="Pillar Card Image"
                  value={pillar.image || ""}
                  mediaType="image"
                  onChange={(url) => handleUpdatePillar(idx, "image", url)}
                  onUploaded={(url) => handleUpdatePillar(idx, "image", url)}
                  onBrowseLibrary={() =>
                    onOpenMediaPicker?.({
                      type: "image",
                      onSelect: (url) => handleUpdatePillar(idx, "image", url),
                    })
                  }
                  helperText="Upload pillar thumbnail from device, pick from library, or enter URL."
                  showPreview={true}
                  previewHeight={160}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      )}

      {/* TAB 3: MULTIMEDIA VIDEO STORIES */}
      {activeTab === 3 && (
        <Stack spacing={3} className={styles.fieldsStack}>
          <Typography variant="subtitle1" fontWeight={700}>
            Stories Beyond the Page (Video Section)
          </Typography>

          <Box className={styles.row}>
            <TextField
              fullWidth
              size="small"
              label="Section Eyebrow Tagline"
              value={settings.multimedia?.sectionTagline || ""}
              onChange={(e) => setSection("multimedia", "sectionTagline", e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="Main Video Headline"
              value={settings.multimedia?.mainVideo?.title || ""}
              onChange={(e) =>
                setSettings((current) => ({
                  ...current,
                  multimedia: {
                    ...current.multimedia,
                    mainVideo: { ...current.multimedia?.mainVideo, title: e.target.value },
                  },
                }))
              }
            />
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Section Subtitle"
            value={settings.multimedia?.mainVideo?.subtitle || ""}
            onChange={(e) =>
              setSettings((current) => ({
                ...current,
                multimedia: {
                  ...current.multimedia,
                  mainVideo: { ...current.multimedia?.mainVideo, subtitle: e.target.value },
                },
              }))
            }
          />

          <Box className={styles.row}>
            <MediaField
              label="Main Video Playback URL (YouTube, Vimeo, or Video File)"
              value={settings.multimedia?.mainVideo?.videoUrl || ""}
              mediaType="video"
              onChange={(url) =>
                setSettings((current) => ({
                  ...current,
                  multimedia: {
                    ...current.multimedia,
                    mainVideo: { ...current.multimedia?.mainVideo, videoUrl: url },
                  },
                }))
              }
              onUploaded={(url) =>
                setSettings((current) => ({
                  ...current,
                  multimedia: {
                    ...current.multimedia,
                    mainVideo: { ...current.multimedia?.mainVideo, videoUrl: url },
                  },
                }))
              }
              onBrowseLibrary={() =>
                onOpenMediaPicker?.({
                  type: "video",
                  onSelect: (url) =>
                    setSettings((current) => ({
                      ...current,
                      multimedia: {
                        ...current.multimedia,
                        mainVideo: { ...current.multimedia?.mainVideo, videoUrl: url },
                      },
                    })),
                })
              }
              helperText="Upload video file, choose from library, or paste YouTube/Vimeo link."
              showPreview={false}
            />
            <MediaField
              label="Main Video Cover / Poster Image"
              value={settings.multimedia?.mainVideo?.coverImage || ""}
              mediaType="image"
              onChange={(url) =>
                setSettings((current) => ({
                  ...current,
                  multimedia: {
                    ...current.multimedia,
                    mainVideo: { ...current.multimedia?.mainVideo, coverImage: url },
                  },
                }))
              }
              onUploaded={(url) =>
                setSettings((current) => ({
                  ...current,
                  multimedia: {
                    ...current.multimedia,
                    mainVideo: { ...current.multimedia?.mainVideo, coverImage: url },
                  },
                }))
              }
              onBrowseLibrary={() =>
                onOpenMediaPicker?.({
                  type: "image",
                  onSelect: (url) =>
                    setSettings((current) => ({
                      ...current,
                      multimedia: {
                        ...current.multimedia,
                        mainVideo: { ...current.multimedia?.mainVideo, coverImage: url },
                      },
                    })),
                })
              }
              helperText="Upload video poster image from device or choose from media library."
              showPreview={true}
              previewHeight={160}
            />
          </Box>

          <Divider />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Interactive Video Playlist ({settings.multimedia?.playlist?.length || 0})
            </Typography>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddPlaylistItem}>
              Add Video Story
            </Button>
          </Box>

          <Stack spacing={2}>
            {(settings.multimedia?.playlist || []).map((item, idx) => (
              <Box key={item.id || idx} className={styles.cardItem}>
                <Box className={styles.cardItemHeader}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Story #{idx + 1}: {item.title}
                  </Typography>
                  <IconButton size="small" color="error" onClick={() => handleDeletePlaylistItem(idx)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>

                <TextField
                  fullWidth
                  size="small"
                  label="Story Title"
                  value={item.title || ""}
                  onChange={(e) => handleUpdatePlaylistItem(idx, "title", e.target.value)}
                />

                <Box className={styles.row}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Category (e.g. Documentary, Masterclass)"
                    value={item.category || ""}
                    onChange={(e) => handleUpdatePlaylistItem(idx, "category", e.target.value)}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Duration (e.g. 15:48)"
                    value={item.duration || ""}
                    onChange={(e) => handleUpdatePlaylistItem(idx, "duration", e.target.value)}
                  />
                </Box>

                <MediaField
                  label="Video Playback URL"
                  value={item.videoUrl || ""}
                  mediaType="video"
                  onChange={(url) => handleUpdatePlaylistItem(idx, "videoUrl", url)}
                  onUploaded={(url) => handleUpdatePlaylistItem(idx, "videoUrl", url)}
                  onBrowseLibrary={() =>
                    onOpenMediaPicker?.({
                      type: "video",
                      onSelect: (url) => handleUpdatePlaylistItem(idx, "videoUrl", url),
                    })
                  }
                  helperText="Upload video file, pick from library, or paste YouTube/Vimeo URL."
                  showPreview={false}
                />
              </Box>
            ))}
          </Stack>
        </Stack>
      )}

      {/* TAB 4: CTA BANNER */}
      {activeTab === 4 && (
        <Stack spacing={2.5} className={styles.fieldsStack}>
          <TextField
            fullWidth
            label="Call to Action Heading"
            value={settings.cta?.heading || ""}
            onChange={(e) => setSection("cta", "heading", e.target.value)}
            placeholder="Are you a talented individual?"
          />
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Subheading / Description"
            value={settings.cta?.subheading || ""}
            onChange={(e) => setSection("cta", "subheading", e.target.value)}
            placeholder="Join Royz Houz talent roster & take your career to the next level."
          />
          <Box className={styles.row}>
            <TextField
              fullWidth
              label="Button Label"
              value={settings.cta?.buttonLabel || ""}
              onChange={(e) => setSection("cta", "buttonLabel", e.target.value)}
              placeholder="Apply Now"
            />
            <TextField
              fullWidth
              label="Button Destination Link"
              value={settings.cta?.buttonHref || ""}
              onChange={(e) => setSection("cta", "buttonHref", e.target.value)}
              placeholder="/join"
            />
          </Box>
        </Stack>
      )}

      <Box className={styles.actions}>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving Changes…" : "Save Blog Settings"}
        </Button>
      </Box>
    </Paper>
  );
}

export default BlogPageSettingsEditor;
