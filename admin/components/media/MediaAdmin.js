/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VideoLibraryOutlinedIcon from "@mui/icons-material/VideoLibraryOutlined";
import AudiotrackOutlinedIcon from "@mui/icons-material/AudiotrackOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { MediaPicker } from "@/components/content/MediaPicker";
import { mediaLibraryApi } from "@/services/mediaLibraryApi";
import { talentsApi } from "@/services/talentsApi";
import { MediaPageSettingsEditor } from "./MediaPageSettingsEditor";
import { MediaStatsBanner } from "./MediaStatsBanner";
import { MediaCreateDialog } from "./MediaCreateDialog";
import { MediaAssetEditorDialog } from "./MediaAssetEditorDialog";
import { MediaAssetsTable } from "./MediaAssetsTable";
import styles from "./MediaAdmin.module.css";

/* ────────────────────────────────────────────────
   Section configuration – mirrors the public /media
   page tabs: Videos, Music, Podcasts, Gallery
───────────────────────────────────────────────── */
const SECTION_TABS = [
  { value: "all",      label: "All Media",  icon: PermMediaOutlinedIcon },
  { value: "videos",   label: "Videos",     icon: VideoLibraryOutlinedIcon },
  { value: "podcasts", label: "Podcasts",   icon: MicNoneOutlinedIcon },
  { value: "music",    label: "Music",      icon: AudiotrackOutlinedIcon },
  { value: "gallery",  label: "Gallery",    icon: ImageOutlinedIcon },
];

/** Map section tab → media_type filter sent to the API */
function sectionToType(section) {
  if (section === "videos")   return "video";
  if (section === "music")    return "audio";
  if (section === "gallery")  return "image";
  // "podcasts" are videos/audio tagged as Podcast — fetch all and client-filter
  return "";
}

/** Category quick-pills per section (subset that makes sense for each view) */
const CATEGORY_PILLS = {
  all:      ["Podcast", "Documentary", "Interview", "Performance", "Culture", "Inspiration", "Business", "Music", "Gallery"],
  videos:   ["Documentary", "Interview", "Performance", "Culture", "Inspiration", "Business"],
  podcasts: ["Podcast"],
  music:    ["Afrobeats", "R&B", "Highlife", "Gospel", "Classical", "Jazz", "Pop"],
  gallery:  ["Concert", "Backstage", "Portrait", "Event", "Lifestyle"],
};

function isPodcast(item) {
  return String(item.body?.category || item.category || item.section || "").toLowerCase().includes("podcast");
}

/** Client-side filter to keep only items that belong to the active section */
function filterBySection(items, section) {
  if (section === "all")      return items;
  if (section === "podcasts") return items.filter(isPodcast);
  if (section === "videos")   return items.filter((m) => (m.media_type === "video" || m.media_source === "youtube") && !isPodcast(m));
  if (section === "music")    return items.filter((m) => m.media_type === "audio" && !isPodcast(m));
  if (section === "gallery")  return items.filter((m) => m.media_type === "image");
  return items;
}

function filterByCategory(items, category) {
  if (!category) return items;
  return items.filter((m) => {
    const cat = String(m.body?.category || m.category || m.section || "").toLowerCase();
    return cat.includes(category.toLowerCase());
  });
}

/* ────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────── */
export function MediaAdmin() {
  const [allItems, setAllItems]     = useState([]);
  const [talents, setTalents]       = useState([]);
  const [section, setSection]       = useState("all");
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [category, setCategory]     = useState("");
  const [view, setView]             = useState("content"); // "content" | "settings"

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating]             = useState(false);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);

  const [createType, setCreateType] = useState("image");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing]       = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [mediaPicker, setMediaPicker] = useState(null);

  const requestIdRef     = useRef(0);
  const filterTimerRef   = useRef(null);
  const isMountedRef     = useRef(false);

  /* ── Data fetching ─────────────────────────────── */
  const fetchItems = useCallback(async (background = false) => {
    const reqId = ++requestIdRef.current;

    if (background) setIsUpdating(true);
    else            setIsInitialLoading(true);
    setError(null);

    try {
      // Fetch with type filter when possible; podcasts need full fetch and client-filter
      const apiType = section === "podcasts" ? "" : sectionToType(section);
      const data = await mediaLibraryApi.list({ search, type: apiType, status });
      if (reqId !== requestIdRef.current) return; // stale response
      setAllItems(data);
    } catch (err) {
      if (reqId !== requestIdRef.current) return;
      setError(err.message || "Unable to load media.");
    } finally {
      if (reqId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsUpdating(false);
        isMountedRef.current = true;
      }
    }
  }, [search, section, status]);

  // Initial load
  useEffect(() => {
    void fetchItems(false);
    talentsApi.list({ status: "published" }).then(setTalents).catch(() => setTalents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced background refresh on filter changes
  useEffect(() => {
    if (!isMountedRef.current) return undefined;
    clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => void fetchItems(true), 250);
    return () => clearTimeout(filterTimerRef.current);
  }, [fetchItems, search, section, status]);

  // Real-time admin events
  useEffect(() => {
    const handleRealtime = (event) => {
      if (["media_assets", "media_collections", "media_collection_items"].includes(event.detail?.table)) {
        void fetchItems(true);
      }
    };
    window.addEventListener("royz:admin-realtime", handleRealtime);
    return () => window.removeEventListener("royz:admin-realtime", handleRealtime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Derived display items ─────────────────────── */
  const sectionItems   = filterBySection(allItems, section);
  const displayItems   = filterByCategory(sectionItems, category);
  const hasActiveFilter = Boolean(search || status || category);

  /* ── Action handlers ───────────────────────────── */
  const mediaCategories = Array.from(new Set([
    "Podcast", "Documentary", "Interview", "Performance", "Culture",
    "Inspiration", "Business", "Music", "Gallery",
    ...allItems.flatMap((m) => [m.body?.category, m.body?.section]).filter(Boolean),
  ])).sort((a, b) => a.localeCompare(b));

  function openMediaPicker(type, onSelect) {
    setMediaPicker({ type: type || "image", onSelect });
  }

  function handleMediaSelected(media) {
    if (!mediaPicker) return;
    const url = mediaPicker.type === "video"
      ? media?.videoUrl || media?.secure_url || media?.url || ""
      : mediaPicker.type === "audio"
        ? media?.audioUrl || media?.secure_url || media?.url || ""
        : media?.imageUrl || media?.secure_url || media?.url || "";
    mediaPicker.onSelect?.(url, media);
    setMediaPicker(null);
  }

  function openCreate(type) {
    setCreateType(type || "image");
    setCreateOpen(true);
  }

  async function handleCreated(asset) {
    const isPub = asset?.status === "published";
    setToast(`"${asset?.title || "Media item"}" ${isPub ? "published successfully." : "saved as draft."}`);
    await fetchItems(true);
  }

  async function handleSave(fields) {
    if (!editing) return;
    setIsSaving(true);
    try {
      await mediaLibraryApi.update({ id: editing.id, ...fields });
      setEditing(null);
      setToast("Media content saved successfully.");
      await fetchItems(true);
    } catch (err) {
      setError(err.message || "Unable to save media.");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmArchive() {
    if (!archiveTarget) return;
    try {
      await mediaLibraryApi.archive(archiveTarget.id);
      setArchiveTarget(null);
      setToast(`"${archiveTarget.title || "Media item"}" archived successfully.`);
      await fetchItems(true);
    } catch (err) {
      setError(err.message || "Unable to archive media.");
      setArchiveTarget(null);
    }
  }

  /* ── Helpers ───────────────────────────────────── */
  function defaultCreateType() {
    if (section === "videos")   return "video";
    if (section === "music")    return "audio";
    if (section === "podcasts") return "audio";
    if (section === "gallery")  return "image";
    return "image";
  }

  const quickPills = CATEGORY_PILLS[section] || CATEGORY_PILLS.all;

  /* ── Render ────────────────────────────────────── */
  if (isInitialLoading) return <AdminLoadingState />;

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      {/* ─── Header ───────────────────────────────── */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Media Content</Typography>
          <Typography variant="body1" className={styles.description}>
            Create, edit, feature, and publish every video, podcast, music track, and gallery photo that appears on the public Media page. Each tab maps directly to a section visitors see.
          </Typography>
        </Box>
        <Box className={styles.headerActions}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setView(view === "settings" ? "content" : "settings")}
            sx={{ textTransform: "none", borderRadius: 2, borderColor: "#E8EAEF", color: "#4B5563", fontWeight: 600 }}
            startIcon={<TuneOutlinedIcon fontSize="small" />}
          >
            {view === "settings" ? "Media Content" : "Page Settings"}
          </Button>
          {view === "content" && (
            <Button
              variant="contained"
              className={styles.createButton}
              startIcon={<AddIcon />}
              onClick={() => openCreate(defaultCreateType())}
            >
              Add media
            </Button>
          )}
        </Box>
      </Box>

      {/* ─── Error ────────────────────────────────── */}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* ─── Stats Banner (content view only) ─────── */}
      {view === "content" && <MediaStatsBanner items={allItems} />}

      {/* ─── Settings view ────────────────────────── */}
      {view === "settings" ? (
        <MediaPageSettingsEditor onSaved={setToast} />
      ) : (
        <>
          {/* ── Section tabs ──────────────────────── */}
          <Tabs
            value={section}
            onChange={(_, value) => { setSection(value); setCategory(""); }}
            variant="scrollable"
            scrollButtons="auto"
            className={styles.sectionTabs}
          >
            {SECTION_TABS.map(({ value, label, icon: Icon }) => (
              <Tab
                key={value}
                value={value}
                icon={<Icon fontSize="small" />}
                iconPosition="start"
                label={label}
                disableRipple
              />
            ))}
          </Tabs>

          {/* ── Controls bar ──────────────────────── */}
          <Box className={styles.controlsBar}>
            <Box className={styles.filtersRow}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                label="Search media"
                placeholder="Search by title or description…"
                size="small"
                fullWidth
                className={styles.searchInput}
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <TextField
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
                select
                size="small"
                className={styles.filterControl}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Box>

            <Box className={styles.quickFiltersRow}>
              {/* Category quick pills */}
              <Box className={styles.quickPills}>
                <Chip
                  size="small"
                  label="All categories"
                  onClick={() => setCategory("")}
                  className={`${styles.quickPill} ${!category ? styles.quickPillActive : ""}`}
                />
                {quickPills.map((pill) => (
                  <Chip
                    key={pill}
                    size="small"
                    label={pill}
                    onClick={() => setCategory(category === pill ? "" : pill)}
                    className={`${styles.quickPill} ${category === pill ? styles.quickPillActive : ""}`}
                  />
                ))}
              </Box>

              {/* Result meta + reset */}
              <Box className={styles.resultsMeta}>
                <span className={styles.resultsCount}>{displayItems.length}</span>
                <span>of {allItems.length} items</span>
                {hasActiveFilter && (
                  <Button
                    size="small"
                    className={styles.resetFiltersBtn}
                    onClick={() => { setSearch(""); setStatus(""); setCategory(""); }}
                  >
                    Reset
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* ── Table ─────────────────────────────── */}
          <MediaAssetsTable
            items={displayItems}
            onCreate={openCreate}
            onEdit={setEditing}
            onPreview={setPreviewing}
            onArchive={setArchiveTarget}
            isUpdating={isUpdating}
          />
        </>
      )}

      {/* ─── Dialogs ──────────────────────────────── */}
      {mediaPicker && (
        <MediaPicker
          open
          type={mediaPicker.type}
          onClose={() => setMediaPicker(null)}
          onSelect={handleMediaSelected}
        />
      )}
      <MediaCreateDialog
        open={createOpen}
        initialType={createType}
        categories={mediaCategories}
        talents={talents}
        onBrowseLibrary={(type, onSelect) => openMediaPicker(type, onSelect)}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
      <MediaAssetEditorDialog
        key={editing?.id || "media-editor"}
        item={editing}
        talents={talents}
        onBrowseLibrary={(type, onSelect) => openMediaPicker(type, onSelect)}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <Dialog open={Boolean(previewing)} onClose={() => setPreviewing(null)} fullWidth maxWidth="md">
        <DialogTitle>{previewing?.title}</DialogTitle>
        <DialogContent>
          {previewing && (
            <Box>
              {previewing.media_type === "audio" ? (
                <audio controls src={previewing.secure_url || previewing.url} className={styles.previewMedia} />
              ) : previewing.media_type === "video" ? (
                <video controls src={previewing.media_source === "youtube" ? previewing.youtube_embed_url : previewing.secure_url || previewing.url} className={styles.previewMedia} />
              ) : (
                <img src={previewing.secure_url || previewing.url} alt={previewing.alt_text || previewing.title} className={styles.previewMedia} />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        open={Boolean(archiveTarget)}
        title="Archive this media?"
        description={`"${archiveTarget?.title || "This item"}" will be removed from the public Media page but kept in the admin library.`}
        confirmLabel="Archive media"
        cancelLabel="Keep media"
        tone="warning"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
      />
      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast(null)}>
        <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}

export default MediaAdmin;
