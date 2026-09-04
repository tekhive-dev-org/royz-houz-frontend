/* eslint-disable @next/next/no-img-element */
// Raw <img> is intentional: media thumbnails use dynamic Cloudinary/YouTube
// URLs that cannot be statically configured for next/image optimization.
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AudioFileOutlinedIcon from "@mui/icons-material/AudioFileOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { mediaLibraryApi } from "@/services/mediaLibraryApi";
import { uploadMediaAsset } from "@/services/uploadMediaAsset";
import { MediaStatsBanner } from "./MediaStatsBanner";
import { MediaLibraryThumbnail } from "./MediaLibraryThumbnail";
import styles from "./MediaLibrary.module.css";

function acceptedFileTypes(mediaType) {
  if (mediaType === "video") return "video/mp4,video/webm,video/quicktime,video/x-m4v";
  if (mediaType === "audio") return "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/flac";
  return "image/jpeg,image/png,image/webp,image/avif";
}

export function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [usage, setUsage] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedIds, setAssignedIds] = useState([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [uploadType, setUploadType] = useState("image");
  const [createTitle, setCreateTitle] = useState("");
  const [createSummary, setCreateSummary] = useState("");
  const [createCategory, setCreateCategory] = useState("");
  const [createAltText, setCreateAltText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [data, cols] = await Promise.all([
        mediaLibraryApi.list({ search, type, source, status }),
        mediaLibraryApi.collections(),
      ]);
      setItems(data);
      setCollections(cols);
    } catch (err) {
      setError(err.message || "Unable to load media.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const [data, cols] = await Promise.all([
        mediaLibraryApi.list({ search, type, source, status }),
        mediaLibraryApi.collections(),
      ]);
      setItems(data);
      setCollections(cols);
    } catch (err) {
      setError(err.message || "Unable to load media.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleRealtimeChange = (event) => {
      const table = event.detail?.table;
      if (["media_assets", "media_collections", "media_collection_items"].includes(table)) {
        void refresh();
      }
    };
    window.addEventListener("royz:admin-realtime", handleRealtimeChange);
    return () => window.removeEventListener("royz:admin-realtime", handleRealtimeChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent background filter effect
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (filterDebounceTimerRef.current) {
      clearTimeout(filterDebounceTimerRef.current);
    }

    filterDebounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setIsUpdating(true);
      try {
        const data = await mediaLibraryApi.list({ search, type, source, status });
        if (requestId === requestIdRef.current) {
          setItems(data);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to filter media.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsUpdating(false);
        }
      }
    }, 250);

    return () => {
      if (filterDebounceTimerRef.current) {
        clearTimeout(filterDebounceTimerRef.current);
      }
    };
  }, [search, type, source, status]);

  function openUpload(mediaType) {
    setUploadType(mediaType);
    setUploadProgress(null);
    setCreateTitle("");
    setCreateSummary("");
    setCreateCategory("");
    setCreateAltText("");
    setCreateOpen(true);
  }

  function chooseUploadFile() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCreateOpen(false);
    setUploadOpen(true);
    try {
      const result = await uploadMediaAsset({
        file,
        mediaType: uploadType,
        title: createTitle,
        summary: createSummary,
        altText: createAltText,
        category: createCategory,
        onProgress: setUploadProgress,
      });
      if (result.asset?.id && createCategory.trim()) {
        await mediaLibraryApi.update({ id: result.asset.id, body: { category: createCategory.trim(), section: createCategory.trim() } });
      }
      setUploadOpen(false);
      await refresh();
    } catch (err) {
      setError(err.message || "Upload failed.");
      setUploadOpen(false);
    }
  }

  async function registerYoutube() {
    try {
      await mediaLibraryApi.registerYouTube({ url: youtubeUrl, title: youtubeTitle || "YouTube video" });
      setYoutubeOpen(false);
      setYoutubeUrl("");
      setYoutubeTitle("");
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to register YouTube video.");
    }
  }

  async function showUsage(item) {
    setSelected(item);
    setUsage(null);
    try {
      setUsage(await mediaLibraryApi.usage(item.id));
    } catch (err) {
      setError(err.message || "Unable to load media usage.");
    }
  }

  async function openCollectionAssignments(item) {
    setSelected(item);
    setUsage(null);
    setAssignedIds([]);
    setAssignOpen(true);
    setIsLoadingAssignments(true);

    try {
      const nextUsage = await mediaLibraryApi.usage(item.id);
      setUsage(nextUsage);
      setAssignedIds((nextUsage.collections || []).map((collection) => collection.id));
    } catch (err) {
      setError(err.message || "Unable to load media collections.");
      setAssignOpen(false);
    } finally {
      setIsLoadingAssignments(false);
    }
  }

  function copyUrl(item) {
    const url = item.secure_url || item.youtube_embed_url || "";
    if (navigator.clipboard) void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function saveEdit(fields) {
    await mediaLibraryApi.update({ id: selected.id, ...fields });
    setEditOpen(false);
    await refresh();
  }

  async function saveAssign() {
    if (!selected || isLoadingAssignments) return;

    try {
      await mediaLibraryApi.assignCollections({ assetId: selected.id, collectionIds: assignedIds });
      setAssignOpen(false);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update media collections.");
    }
  }

  if (isInitialLoading) return <AdminLoadingState />;

  const QUICK_MEDIA_TYPES = [
    { label: "All Media", value: "" },
    { label: "Images", value: "image" },
    { label: "Videos", value: "video" },
    { label: "Audio", value: "audio" },
  ];

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Media Library</Typography>
          <Typography variant="body1" className={styles.description}>Upload Cloudinary media, register YouTube videos, and manage collections.</Typography>
        </Box>
        <Box className={styles.headerActions}>
          <Button startIcon={<CloudUploadIcon />} variant="contained" className={styles.primaryButton} onClick={() => openUpload("image")}>Upload image</Button>
          <Button startIcon={<CloudUploadIcon />} variant="outlined" className={styles.outlineButton} onClick={() => openUpload("video")}>Upload video</Button>
          <Button startIcon={<AudioFileOutlinedIcon />} variant="outlined" className={styles.outlineButton} onClick={() => openUpload("audio")}>Upload audio</Button>
          <Button variant="outlined" className={styles.outlineButton} onClick={() => setYoutubeOpen(true)}>Create from YouTube</Button>
        </Box>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <MediaStatsBanner items={items} />

      <input ref={fileInputRef} type="file" accept={acceptedFileTypes(uploadType)} hidden onChange={handleFileChange} />

      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder="Search media by title, tag, or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ color: "#9CA3AF", mr: 1 }} />
              ),
              endAdornment: search ? (
                <IconButton size="small" onClick={() => setSearch("")} aria-label="Clear search">
                  <ClearIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                </IconButton>
              ) : null,
            }}
          />

          <TextField
            size="small"
            select
            label="Media Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={styles.filterControl}
          >
            <MenuItem value="">All Sources</MenuItem>
            <MenuItem value="cloudinary">Cloudinary</MenuItem>
            <MenuItem value="youtube">YouTube</MenuItem>
          </TextField>

          <TextField
            size="small"
            select
            label="Publication Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.filterControl}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>

          <TextField
            size="small"
            select
            label="Media Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.filterControl}
          >
            <MenuItem value="">All Formats</MenuItem>
            <MenuItem value="image">Images</MenuItem>
            <MenuItem value="video">Videos</MenuItem>
            <MenuItem value="audio">Audio Tracks</MenuItem>
          </TextField>
        </Box>

        {/* Quick Filter Pills */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Media Type Filters">
            {QUICK_MEDIA_TYPES.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.quickPill} ${type === pill.value && !source ? styles.quickPillActive : ""}`}
                onClick={() => {
                  setSource("");
                  setType(pill.value);
                }}
              >
                {pill.label}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.quickPill} ${source === "youtube" ? styles.quickPillActive : ""}`}
              onClick={() => {
                setType("");
                setSource((prev) => (prev === "youtube" ? "" : "youtube"));
              }}
            >
              YouTube Embeds
            </button>
          </Box>

          <Box className={styles.resultsMeta}>
            <span>
              {isUpdating ? (
                <span style={{ color: "#B46A2C", fontWeight: 600 }}>Filtering…</span>
              ) : (
                <>
                  Showing <span className={styles.resultsCount}>{items.length}</span> assets
                </>
              )}
            </span>
            {(search || type || source || status) && (
              <Button
                size="small"
                startIcon={<FilterListOffIcon fontSize="small" />}
                onClick={() => {
                  setSearch("");
                  setType("");
                  setSource("");
                  setStatus("");
                }}
                className={styles.resetFiltersBtn}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Subtle Background Updating Line */}
      {isUpdating && (
        <LinearProgress
          sx={{
            height: 2.5,
            borderRadius: 2,
            my: 0.5,
            backgroundColor: "transparent",
            "& .MuiLinearProgress-bar": { backgroundColor: "#B46A2C" },
          }}
        />
      )}

      {items.length === 0 ? (
        <Paper elevation={0} className={styles.empty}>
          <Box className={styles.emptyIconWrapper}>
            <SearchIcon fontSize="medium" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#111827">No media assets found</Typography>
          <Typography variant="body2" color="#6B7280" maxWidth={420}>
            No media assets match your search and filter criteria. Try adjusting filters or upload a new asset.
          </Typography>
        </Paper>
      ) : (
        <Box className={styles.grid}>
          {items.map((item) => (
            <Paper key={item.id} elevation={0} className={styles.card}>
              <Box className={styles.thumb}>
                <MediaLibraryThumbnail item={item} />
                <span className={styles.sourceBadge}>
                  {item.media_source || "asset"}
                </span>
              </Box>
              <Box className={styles.cardBody}>
                <Typography variant="body2" fontWeight={700} className={styles.cardTitle}>{item.title}</Typography>
                <Box className={styles.cardDetails}>
                  <span className={styles.mediaTypeBadge}>{item.media_type || "media"}</span>
                  <span>{item.format ? item.format.toUpperCase() : "URL"}</span>
                </Box>
                <Box className={styles.cardActions}>
                  <StatusChip status={item.status} />
                  <Box className={styles.actionDock}>
                    <Tooltip title="Preview / Usage">
                      <IconButton size="small" onClick={() => showUsage(item)} className={styles.actionBtn}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={copied ? "Copied!" : "Copy URL"}>
                      <IconButton size="small" onClick={() => copyUrl(item)} className={styles.actionBtn}>
                        <CopyAllIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Asset">
                      <IconButton size="small" onClick={() => { setSelected(item); setEditOpen(true); }} className={styles.actionBtn}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Collections">
                      <IconButton size="small" onClick={() => openCollectionAssignments(item)} className={styles.actionBtn}>
                        <CloudUploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Archive">
                      <IconButton size="small" onClick={async () => { await mediaLibraryApi.archive(item.id); await refresh(); }} className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create {uploadType} media</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Add the public editorial details first, then choose the file. New media is created as a draft until you publish it.
          </Typography>
          <TextField label="Title" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} fullWidth margin="normal" required placeholder="e.g. Royz Houz Live Highlights" />
          <TextField label="Summary" value={createSummary} onChange={(e) => setCreateSummary(e.target.value)} fullWidth margin="normal" multiline minRows={2} />
          <TextField label="Category / Section" value={createCategory} onChange={(e) => setCreateCategory(e.target.value)} fullWidth margin="normal" helperText="Use Podcast to place a video in the podcast section." />
          <TextField label="Alt text" value={createAltText} onChange={(e) => setCreateAltText(e.target.value)} fullWidth margin="normal" helperText="Defaults to the title when left empty." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={chooseUploadFile} disabled={!createTitle.trim()}>Choose file</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={uploadOpen} maxWidth="xs" fullWidth>
        <DialogTitle>Uploading…</DialogTitle>
        <DialogContent>
          <LinearProgress variant={uploadProgress === null ? "indeterminate" : "determinate"} value={uploadProgress || 0} />
          <Typography variant="body2" className={styles.progressText}>{uploadProgress}%</Typography>
        </DialogContent>
      </Dialog>

      <Dialog open={youtubeOpen} onClose={() => setYoutubeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Register YouTube video</DialogTitle>
        <DialogContent>
          <TextField label="YouTube URL" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} fullWidth margin="normal" helperText="watch, youtu.be, or Shorts URL" />
          <TextField label="Title" value={youtubeTitle} onChange={(e) => setYoutubeTitle(e.target.value)} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setYoutubeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={registerYoutube}>Register</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selected)} onClose={() => { setSelected(null); setUsage(null); setEditOpen(false); setAssignOpen(false); }} fullWidth maxWidth="md">
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent>
          {selected ? (
            <Box>
              {selected.media_source === "youtube" ? (
                <iframe className={styles.embed} src={selected.youtube_embed_url} title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : selected.media_type === "audio" ? (
                <audio controls preload="metadata" src={selected.secure_url || selected.url} className={styles.audioPreview} />
              ) : selected.media_type === "video" ? (
                <video controls preload="metadata" src={selected.secure_url || selected.url} className={styles.previewImage} />
              ) : (
                <img src={mediaThumbnail(selected)} alt={selected.alt_text || selected.title} className={styles.previewImage} />
              )}
              <Typography variant="caption" color="text.secondary">Secure URL: {selected.secure_url || selected.youtube_embed_url}</Typography>

              {usage ? (
                <Box className={styles.usage}>
                  <Typography variant="subtitle2">Usage references</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Collections: {usage.collections.length ? usage.collections.map((c) => c.title).join(", ") : "none"}.
                    Content references: {usage.references.length ? usage.references.map((r) => `${r.contentType}#${r.fieldPath}`).join(", ") : "none"}.
                  </Typography>
                </Box>
              ) : null}

              {editOpen ? (
                <EditForm
                  item={selected}
                  onSave={saveEdit}
                  onCancel={() => setEditOpen(false)}
                />
              ) : null}

              {assignOpen ? (
                <Box className={styles.assign}>
                  <Typography variant="subtitle2">Collections</Typography>
                  {isLoadingAssignments ? <Typography variant="body2" color="text.secondary">Loading current assignments…</Typography> : null}
                  {collections.map((collection) => (
                    <label key={collection.id} className={styles.assignRow}>
                      <input
                        type="checkbox"
                        checked={assignedIds.includes(collection.id)}
                        disabled={isLoadingAssignments}
                        onChange={(e) =>
                          setAssignedIds((current) =>
                            e.target.checked ? [...current, collection.id] : current.filter((id) => id !== collection.id)
                          )
                        }
                      />
                      {collection.title}
                    </label>
                  ))}
                  <Button variant="contained" size="small" onClick={saveAssign} disabled={isLoadingAssignments} className={styles.assignSave}>Save</Button>
                </Box>
              ) : null}

              {selected.media_source === "cloudinary" && selected.status !== "published" ? (
                <Button color="error" size="small" onClick={async () => { await mediaLibraryApi.deleteAsset(selected.id); setSelected(null); setUsage(null); await refresh(); }} className={styles.deleteButton}>
                  Delete permanently
                </Button>
              ) : null}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelected(null); setUsage(null); setEditOpen(false); setAssignOpen(false); }}>Close</Button>
          {copied ? <Typography variant="caption" color="success.main">URL copied</Typography> : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function EditForm({ item, onSave, onCancel }) {
  const body = item.body || {};
  const [title, setTitle] = useState(item.title || "");
  const [summary, setSummary] = useState(item.summary || "");
  const [altText, setAltText] = useState(item.alt_text || "");
  const [caption, setCaption] = useState(item.caption || "");
  const [category, setCategory] = useState(body.category || body.section || "");
  const [description, setDescription] = useState(body.description || "");
  const [author, setAuthor] = useState(body.author?.name || body.author || "");
  const [host, setHost] = useState(body.host || "");
  const [genre, setGenre] = useState(body.genre || "");
  const [artist, setArtist] = useState(body.artist || "");
  const [views, setViews] = useState(body.views || "");
  const [featured, setFeatured] = useState(Boolean(item.featured));
  const [sortOrder, setSortOrder] = useState(item.sort_order || 0);
  const [status, setStatus] = useState(item.status || "draft");

  function handleSave() {
    onSave({
      title,
      summary,
      altText,
      caption,
      featured,
      sortOrder: Number(sortOrder) || 0,
      status,
      body: {
        ...body,
        category,
        section: category,
        description,
        author: author ? { name: author } : undefined,
        host,
        genre,
        artist,
        views,
      },
    });
  }

  return (
    <Box className={styles.editForm}>
      <Typography variant="subtitle2">Public media content</Typography>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />
      <TextField label="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} fullWidth multiline minRows={2} />
      <TextField label="Category / Section" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth helperText="Use Podcast to place a video in the podcast section." />
      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={2} />
      {item.media_type === "video" ? (
        <Box className={styles.editGrid}>
          <TextField label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          <TextField label="Host" value={host} onChange={(e) => setHost(e.target.value)} />
          <TextField label="Views label" value={views} onChange={(e) => setViews(e.target.value)} placeholder="e.g. 12.4K views" />
        </Box>
      ) : null}
      {item.media_type === "audio" ? (
        <Box className={styles.editGrid}>
          <TextField label="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <TextField label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
        </Box>
      ) : null}
      <TextField label="Alt text" value={altText} onChange={(e) => setAltText(e.target.value)} fullWidth />
      <TextField label="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} fullWidth />
      <Box className={styles.editGrid}>
        <TextField label="Display order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputProps={{ min: 0, step: 1 }} />
        <TextField label="Publication status" select value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </TextField>
      </Box>
      <FormControlLabel control={<Switch checked={featured} onChange={(e) => setFeatured(e.target.checked)} />} label="Featured media / hero" />
      <Box className={styles.editActions}>
        <Button size="small" onClick={onCancel}>Cancel</Button>
        <Button size="small" variant="contained" onClick={handleSave}>Save</Button>
      </Box>
    </Box>
  );
}
