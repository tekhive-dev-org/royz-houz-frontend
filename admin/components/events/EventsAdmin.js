import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  Tab,
  Tabs,
  Avatar,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { SortableList } from "@/components/settings/SortableList";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { MediaPicker } from "@/components/content/MediaPicker";
import { eventsApi } from "@/services/eventsApi";
import { talentsApi } from "@/services/talentsApi";
import { EventsStatsBanner } from "./EventsStatsBanner";
import { EventsTable } from "./EventsTable";
import { EventCategoryDialog } from "./EventCategoryDialog";
import { EventCategoriesTable } from "./EventCategoriesTable";
import { EventStructuredFields } from "./EventStructuredFields";
import { TalentMediaField } from "../talents/TalentMediaField";
import styles from "./EventsAdmin.module.css";

const DEFAULT_EVENT_TIMEZONE = "Africa/Lagos";
const STRUCTURED_FIELDS = ["aboutParagraphs", "speakers", "performingArtists", "partners", "schedule", "faqs", "ticketTiers", "gallery"];

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function formatStructuredValue(value) {
  return JSON.stringify(Array.isArray(value) ? value : [], null, 2);
}

function formatDateTimeForInput(value, timezone = DEFAULT_EVENT_TIMEZONE) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function formatDateTimeForStorage(value, timezone = DEFAULT_EVENT_TIMEZONE) {
  if (!value) return "";
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)) return new Date(value).toISOString();
  if (timezone === DEFAULT_EVENT_TIMEZONE) return new Date(`${value}:00+01:00`).toISOString();
  return new Date(value).toISOString();
}

function parseStructuredValues(event) {
  const parsed = { ...event };
  for (const field of STRUCTURED_FIELDS) {
    if (typeof parsed[field] !== "string" || !parsed[field].trim()) {
      parsed[field] = [];
      continue;
    }
    try {
      const value = JSON.parse(parsed[field]);
      if (!Array.isArray(value)) throw new Error();
      parsed[field] = field === "gallery"
        ? value.map((item) => typeof item === "string" ? item : item?.imageUrl || item?.secure_url || item?.url || "")
        : value;
    } catch {
      throw new Error(`${field} must be valid JSON containing an array.`);
    }
  }
  return parsed;
}

const EMPTY = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  category: "",
  location: "",
  venueName: "",
  venueAddress: "",
  isOnline: false,
  onlineUrl: "",
  startsAt: "",
  endsAt: "",
  timezone: DEFAULT_EVENT_TIMEZONE,
  time: "",
  image: "",
  heroImage: "",
  startingPrice: "",
  ticketLink: "",
  gallery: [],
  youtubeUrl: "",
  isPopular: false,
  featured: false,
  categoryIds: [],
  primaryCategoryId: "",
  scheduledAt: "",
  status: "draft",
  aboutParagraphs: [],
  speakers: [],
  performingArtists: [],
  partners: [],
  schedule: [],
  faqs: [],
  ticketTiers: [],
  attendees: "",
  recapLink: "",
  venue: "",
  dateString: "",
};

export function EventsAdmin() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [talents, setTalents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(null);
  const [preview, setPreview] = useState(null);
  const [eventPendingArchive, setEventPendingArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeEventTab, setActiveEventTab] = useState(0);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const [isReorderingCategories, setIsReorderingCategories] = useState(false);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [data, cats, talentData] = await Promise.all([
        eventsApi.list({ search, status }),
        eventsApi.listCategories(),
        talentsApi.list({ status: "published" }),
      ]);
      setItems(data);
      setCategories(cats);
      setTalents(talentData);
      setFeatured(data.filter((e) => e.featured));
    } catch (err) {
      setError(err.message || "Unable to load events.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const [data, cats] = await Promise.all([eventsApi.list({ search, status }), eventsApi.listCategories()]);
      setItems(data);
      setCategories(cats);
      setFeatured(data.filter((e) => e.featured));
    } catch (err) {
      setError(err.message || "Unable to load events.");
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
      if (["events", "event_categories", "event_category_assignments"].includes(table)) {
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
        const data = await eventsApi.list({ search, status });
        if (requestId === requestIdRef.current) {
          setItems(data);
          setFeatured(data.filter((e) => e.featured));
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to load events.");
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
  }, [search, status]);

  function openCreate() {
    setActiveEventTab(0);
    setEditing({
      ...EMPTY,
      ...Object.fromEntries(STRUCTURED_FIELDS.map((field) => [field, formatStructuredValue([])])),
    });
    setDialogOpen(true);
  }

  function openEdit(item) {
    const body = item.body || {};
    const legacyCategory = categories.find(
      (category) => category.slug === body.categoryKey || category.title === body.category
    );
    const primaryCategoryId = item.primaryCategoryId || legacyCategory?.id || "";
    const categoryIds = item.categoryIds?.length ? item.categoryIds : primaryCategoryId ? [primaryCategoryId] : [];
    setActiveEventTab(0);
    setEditing({
      ...EMPTY,
      ...body,
      id: item.id,
      slug: item.slug,
      title: item.title || body.title || "",
      summary: item.summary || body.summary || "",
      category: item.category || body.category || legacyCategory?.title || "",
      categoryIds,
      primaryCategoryId,
      location: item.location || body.location || "",
      venueName: item.venue_name || item.venueName || body.venueName || "",
      venueAddress: item.venue_address || item.venueAddress || body.venueAddress || "",
      timezone: item.timezone || body.timezone || DEFAULT_EVENT_TIMEZONE,
      startsAt: formatDateTimeForInput(item.starts_at || item.startsAt, item.timezone || body.timezone || DEFAULT_EVENT_TIMEZONE),
      endsAt: formatDateTimeForInput(item.ends_at || item.endsAt, item.timezone || body.timezone || DEFAULT_EVENT_TIMEZONE),
      scheduledAt: item.scheduled_at || body.scheduledAt || "",
      image: item.image || body.image || "",
      featured: item.featured,
      status: item.status,
      aboutParagraphs: formatStructuredValue(body.aboutParagraphs),
      speakers: formatStructuredValue(body.speakers),
      performingArtists: formatStructuredValue(body.performingArtists),
      partners: formatStructuredValue(body.partners),
      schedule: formatStructuredValue(body.schedule),
      faqs: formatStructuredValue(body.faqs),
      ticketTiers: formatStructuredValue(body.ticketTiers),
      gallery: formatStructuredValue(body.gallery),
      attendees: body.attendees || "",
      recapLink: body.recapLink || "",
      venue: body.venue || "",
      dateString: body.dateString || "",
    });
    setDialogOpen(true);
  }

  function openDuplicate(item) {
    const body = item.body || {};
    const legacyCategory = categories.find(
      (category) => category.slug === body.categoryKey || category.title === body.category
    );
    const primaryCategoryId = item.primaryCategoryId || legacyCategory?.id || "";
    const categoryIds = item.categoryIds?.length ? item.categoryIds : primaryCategoryId ? [primaryCategoryId] : [];
    const sourceTitle = item.title || body.title || "Untitled Event";
    setActiveEventTab(0);
    setEditing({
      ...EMPTY,
      ...body,
      id: undefined,
      slug: "",
      title: `${sourceTitle} (Copy)`,
      summary: item.summary || body.summary || "",
      category: item.category || body.category || legacyCategory?.title || "",
      categoryIds,
      primaryCategoryId,
      location: item.location || body.location || "",
      venueName: item.venue_name || item.venueName || body.venueName || "",
      venueAddress: item.venue_address || item.venueAddress || body.venueAddress || "",
      timezone: item.timezone || body.timezone || DEFAULT_EVENT_TIMEZONE,
      startsAt: formatDateTimeForInput(item.starts_at || item.startsAt, item.timezone || body.timezone || DEFAULT_EVENT_TIMEZONE),
      endsAt: formatDateTimeForInput(item.ends_at || item.endsAt, item.timezone || body.timezone || DEFAULT_EVENT_TIMEZONE),
      scheduledAt: "",
      image: item.image || body.image || "",
      featured: false,
      isPopular: false,
      status: "draft",
      aboutParagraphs: formatStructuredValue(body.aboutParagraphs),
      speakers: formatStructuredValue(body.speakers),
      performingArtists: formatStructuredValue(body.performingArtists),
      partners: formatStructuredValue(body.partners),
      schedule: formatStructuredValue(body.schedule),
      faqs: formatStructuredValue(body.faqs),
      ticketTiers: formatStructuredValue(body.ticketTiers),
      gallery: formatStructuredValue(body.gallery),
      attendees: body.attendees || "",
      recapLink: body.recapLink || "",
      venue: body.venue || "",
      dateString: body.dateString || "",
    });
    setDialogOpen(true);
  }

  function openCreateCategory() {
    setEditingCategory({ slug: "", title: "", summary: "", status: "published" });
    setCategoryDialogOpen(true);
  }

  function openEditCategory(category) {
    setEditingCategory({ ...category });
    setCategoryDialogOpen(true);
  }

  async function handleSaveCategory() {
    if (!editingCategory?.title || !editingCategory?.slug) {
      setError("Category title and slug are required.");
      return;
    }
    setIsSaving(true);
    try {
      await eventsApi.saveCategory(editingCategory, editingCategory.id);
      setCategoryDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to save event category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Delete event category "${category.title}"?`)) return;
    try {
      await eventsApi.deleteCategory(category.id);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete event category.");
    }
  }

  async function handleReorderCategories(orderedCategories) {
    if (isReorderingCategories) return;
    const previous = categories;
    setCategories(orderedCategories);
    setIsReorderingCategories(true);
    try {
      await eventsApi.reorderCategories(orderedCategories.map((category) => category.id));
    } catch (err) {
      setCategories(previous);
      setError(err.message || "Unable to update category order.");
    } finally {
      setIsReorderingCategories(false);
    }
  }

  async function handleSave() {
    if (editing?.categoryIds?.length && !editing.primaryCategoryId) {
      setError("Select a primary event category before saving.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = parseStructuredValues(editing);
      payload.slug = payload.slug?.trim() || undefined;

      payload.startsAt = formatDateTimeForStorage(payload.startsAt, payload.timezone);
      payload.endsAt = formatDateTimeForStorage(payload.endsAt, payload.timezone);
      payload.scheduledAt = formatDateTimeForStorage(payload.scheduledAt, payload.timezone);
      await eventsApi.save(payload, editing?.id);
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to save event.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleArchive(event) {
    setEventPendingArchive(event);
  }

  async function confirmArchive() {
    if (!eventPendingArchive) return;
    setIsArchiving(true);
    try {
      await eventsApi.archive(eventPendingArchive.id);
      setEventPendingArchive(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to archive event.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handlePreview(id) {
    try {
      const payload = await eventsApi.preview(id);
      setPreview(payload);
    } catch (err) {
      setError(err.message || "Unable to load preview.");
    }
  }

  const setField = (field, value) => setEditing((prev) => ({ ...prev, [field]: value }));

  if (isInitialLoading) return <AdminLoadingState />;

  return (
    <Box className="animate-fade-in">
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>
            Events &amp; Showcases
          </Typography>
          <Typography variant="body1" className={styles.description}>
            Manage exhibitions, masterclasses, concerts, ticketing links, and schedule dates.
          </Typography>
        </Box>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <EventsStatsBanner items={items} featured={featured} />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label={`Events (${items.length})`} />
        <Tab icon={<CategoryOutlinedIcon fontSize="small" />} iconPosition="start" label={`Event Categories (${categories.length})`} />
      </Tabs>

      {tab === 0 ? <EventsTable
        items={items}
        categories={categories}
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        isUpdating={isUpdating}
        onAddClick={openCreate}
        onEditClick={openEdit}
        onDuplicateClick={openDuplicate}
        onPreviewClick={handlePreview}
        onArchiveClick={handleArchive}
      /> : (
        <EventCategoriesTable
          categories={categories}
          events={items}
          onAddCategory={openCreateCategory}
          onEditCategory={openEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
          isReordering={isReorderingCategories}
        />
      )}

      {/* Featured Reorderable Section */}
      {tab === 0 && featured.length > 0 && (
        <Box className={styles.featuredSection}>
          <Typography variant="h6" className={styles.sectionTitle}>
            Featured Events Order (Homepage Highlights)
          </Typography>
          <SortableList
            items={featured}
            getKey={(e) => e.id}
            renderPrimary={(e) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  {e.title}
                </Typography>
                <span className={styles.eventSlug}>({e.slug})</span>
              </Box>
            )}
            onMove={async (from, to, updatedItems) => {
              let reordered = updatedItems;
              if (!reordered) {
                reordered = [...featured];
                const [moved] = reordered.splice(from, 1);
                reordered.splice(to, 0, moved);
              }
              setFeatured(reordered);
              try {
                await eventsApi.reorderFeatured(reordered.map((e) => e.id));
              } catch (err) {
                setError(err.message || "Unable to save featured order.");
              }
            }}
          />
        </Box>
      )}

      <ConfirmationDialog
        open={Boolean(eventPendingArchive)}
        title="Archive this event?"
        description={`${eventPendingArchive?.title || "This event"} will be hidden from the public website. You can still access the archived record from the admin panel.`}
        confirmLabel="Archive event"
        cancelLabel="Keep event"
        tone="warning"
        isConfirming={isArchiving}
        onCancel={() => setEventPendingArchive(null)}
        onConfirm={confirmArchive}
      />

      <EventCategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        category={editingCategory}
        setCategory={setEditingCategory}
        onSave={handleSaveCategory}
        isSaving={isSaving}
      />

      {/* Dialog for Creating/Editing Event */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {editing?.image ? <Avatar src={editing.image} alt={editing.title} variant="rounded" sx={{ width: 36, height: 36 }} /> : null}
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {editing?.id ? `Edit Event: ${editing.title}` : "Create New Event"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                Configure the public event experience, schedule, content, ticketing, and media.
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {editing && (
            <Tabs
              value={activeEventTab}
              onChange={(_, value) => setActiveEventTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: "divider", px: 0, mb: 3, background: "#F9FAFB" }}
            >
              <Tab icon={<EventNoteOutlinedIcon fontSize="small" />} iconPosition="start" label="Event Basics" />
              <Tab icon={<ScheduleOutlinedIcon fontSize="small" />} iconPosition="start" label="Schedule & Venue" />
              <Tab icon={<ConfirmationNumberOutlinedIcon fontSize="small" />} iconPosition="start" label="Event Content" />
              <Tab icon={<PermMediaOutlinedIcon fontSize="small" />} iconPosition="start" label="Media" />
              <Tab icon={<ConfirmationNumberOutlinedIcon fontSize="small" />} iconPosition="start" label="Tickets & Publishing" />
            </Tabs>
          )}
          {editing && (
            <Stack spacing={2}>
              <Box hidden={activeEventTab !== 0} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="Event Title"
                  value={editing.title || ""}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    const currentSlug = editing.slug || "";
                    const prevExpected = toSlug(editing.title || "");
                    const isAutoSlug = !currentSlug || currentSlug === prevExpected;
                    setEditing((prev) => ({
                      ...prev,
                      title: nextTitle,
                      slug: isAutoSlug ? toSlug(nextTitle) : prev.slug,
                    }));
                  }}
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  label="URL Slug"
                  value={editing.slug || ""}
                  onChange={(e) => setField("slug", toSlug(e.target.value))}
                  helperText={editing.slug ? `Auto-generated. Preview: /events/${editing.slug}` : "Auto-generated from title. Click the icon to re-sync anytime."}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Auto-generate slug from current title">
                          <IconButton
                            size="small"
                            onClick={() => setField("slug", toSlug(editing.title || ""))}
                            edge="end"
                            aria-label="Auto-generate slug from title"
                          >
                            <AutoAwesomeOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box hidden={activeEventTab !== 0} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Event Categories"
                  value={editing.categoryIds || []}
                  onChange={(e) => {
                    const categoryIds = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
                    setEditing((prev) => ({
                      ...prev,
                      categoryIds,
                      primaryCategoryId: categoryIds.includes(prev.primaryCategoryId) ? prev.primaryCategoryId : categoryIds[0] || "",
                      category: categories.find((category) => category.id === categoryIds[0])?.title || prev.category,
                    }));
                  }}
                  SelectProps={{ multiple: true }}
                  placeholder="Select one or more categories"
                >
                  {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.title}</MenuItem>)}
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  label="Location / City"
                  value={editing.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                />
              </Box>

              <Box hidden={activeEventTab !== 1} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Primary Event Category"
                  value={editing.primaryCategoryId || ""}
                  onChange={(e) => setField("primaryCategoryId", e.target.value)}
                >
                  <MenuItem value="">No primary category</MenuItem>
                  {(editing.categoryIds || []).map((id) => {
                    const category = categories.find((item) => item.id === id);
                    return category ? <MenuItem key={category.id} value={category.id}>{category.title}</MenuItem> : null;
                  })}
                </TextField>
                <TextField
                  fullWidth
                  size="small"
                  label="Venue Name"
                  value={editing.venueName}
                  onChange={(e) => setField("venueName", e.target.value)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Venue Address"
                  value={editing.venueAddress}
                  onChange={(e) => setField("venueAddress", e.target.value)}
                />
              </Box>

              <Box hidden={activeEventTab !== 1} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  type="datetime-local"
                  label="Starts At"
                  value={editing.startsAt}
                  onChange={(e) => setField("startsAt", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  size="small"
                  type="datetime-local"
                  label="Ends At"
                  value={editing.endsAt}
                  onChange={(e) => setField("endsAt", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                hidden={activeEventTab !== 0}
                className={styles.tabField}
                fullWidth
                size="small"
                label="Short Summary"
                value={editing.summary}
                onChange={(e) => setField("summary", e.target.value)}
                placeholder="A compelling one-line description"
              />

              <TextField
                hidden={activeEventTab !== 0}
                className={styles.tabField}
                fullWidth
                size="small"
                label="Full Description"
                value={editing.description}
                onChange={(e) => setField("description", e.target.value)}
                multiline
                minRows={3}
              />

              <Box hidden={activeEventTab !== 2} className={styles.tabPanel}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>Event content</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manage the information visitors read on the event page.</Typography>
                <EventStructuredFields
                  event={editing}
                  talents={talents}
                  fields={["aboutParagraphs", "speakers", "performingArtists", "partners", "schedule", "faqs"]}
                  setField={setField}
                  setMediaPicker={(picker) => setMediaPicker(picker)}
                />
              </Box>
              <Box hidden={activeEventTab !== 3} className={styles.tabPanel}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>Event media</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose the images and video used across event cards and the event page.</Typography>
                <EventStructuredFields
                  event={editing}
                  talents={talents}
                  fields={["gallery"]}
                  setField={setField}
                  setMediaPicker={(picker) => setMediaPicker(picker)}
                />
              </Box>

              <Box hidden={activeEventTab !== 4} className={styles.tabPanel}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>Tickets and publishing</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Configure ticket options, availability labels, pricing, and public visibility.</Typography>
                <EventStructuredFields
                  event={editing}
                  talents={talents}
                  fields={["ticketTiers"]}
                  setField={setField}
                  setMediaPicker={(picker) => setMediaPicker(picker)}
                />
              </Box>

              <Box hidden={activeEventTab !== 3} className={styles.row}>
                <TalentMediaField
                  label="Cover Image"
                  value={editing.image || ""}
                  onChange={(value) => setField("image", value)}
                  onBrowseLibrary={() => setMediaPicker({ field: "image" })}
                />
                <TalentMediaField
                  label="Hero Image"
                  value={editing.heroImage || ""}
                  onChange={(value) => setField("heroImage", value)}
                  onBrowseLibrary={() => setMediaPicker({ field: "heroImage" })}
                />
              </Box>

              <Box hidden={activeEventTab !== 4} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="Attendee Count / Label"
                  value={editing.attendees}
                  onChange={(e) => setField("attendees", e.target.value)}
                  helperText="Optional label shown with event attendance information."
                />
              </Box>

              <Box hidden={activeEventTab !== 3} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="Recap Link"
                  value={editing.recapLink}
                  onChange={(e) => setField("recapLink", e.target.value)}
                  placeholder="https://..."
                  helperText="Optional link to the event recap."
                />
              </Box>

              <Box hidden={activeEventTab !== 3} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="YouTube / Recap Video URL"
                  value={editing.youtubeUrl}
                  onChange={(e) => setField("youtubeUrl", e.target.value)}
                  placeholder="https://..."
                />
              </Box>

              <Box hidden={activeEventTab !== 1} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="Display Time"
                  value={editing.time}
                  onChange={(e) => setField("time", e.target.value)}
                  placeholder="e.g. 6:00 PM WAT"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Timezone"
                  value={editing.timezone}
                  onChange={(e) => setField("timezone", e.target.value)}
                  placeholder="e.g. Africa/Lagos"
                />
              </Box>


              <Box hidden={activeEventTab !== 4} className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="Starting Price (e.g. ₦15,000 / Free)"
                  value={editing.startingPrice}
                  onChange={(e) => setField("startingPrice", e.target.value)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Ticket Purchase URL"
                  value={editing.ticketLink}
                  onChange={(e) => setField("ticketLink", e.target.value)}
                  placeholder="https://..."
                />
              </Box>

              <Box hidden={activeEventTab !== 4} sx={{ display: "flex", gap: 3, alignItems: "center", pt: 1 }}>
                <FormControlLabel
                  control={<Switch checked={Boolean(editing.featured)} onChange={(e) => setField("featured", e.target.checked)} />}
                  label="Featured on Homepage"
                />

                <FormControlLabel
                  control={<Switch checked={Boolean(editing.isPopular)} onChange={(e) => setField("isPopular", e.target.checked)} />}
                  label="Popular Event"
                />
              </Box>

              <TextField
                hidden={activeEventTab !== 4}
                className={styles.tabField}
                fullWidth
                size="small"
                select
                label="Publication Status"
                value={editing.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <MenuItem value="draft">Draft (Private)</MenuItem>
                <MenuItem value="published">Published (Live on Website)</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              {editing.status === "scheduled" ? (
                <TextField
                  hidden={activeEventTab !== 4}
                  className={styles.tabField}
                  fullWidth
                  size="small"
                  type="datetime-local"
                  label="Scheduled publication"
                  value={formatDateTimeForInput(editing.scheduledAt, editing.timezone)}
                  onChange={(e) => setField("scheduledAt", formatDateTimeForStorage(e.target.value, editing.timezone))}
                  InputLabelProps={{ shrink: true }}
                  helperText="Choose when this event should become public."
                  required
                />
              ) : null}
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            {editing?.id && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ContentCopyOutlinedIcon fontSize="small" />}
                onClick={() => openDuplicate(editing)}
              >
                Duplicate as Draft
              </Button>
            )}
          </Box>
          <Button variant="contained" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : editing?.id ? "Save Event" : "Create Event"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      {preview && (
        <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Event Payload Preview</span>
            <IconButton size="small" onClick={() => setPreview(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <pre className={styles.preview}>{JSON.stringify(preview, null, 2)}</pre>
          </DialogContent>
        </Dialog>
      )}

      {/* Media Picker */}
      {mediaPicker && (
        <MediaPicker
          open={Boolean(mediaPicker)}
          onClose={() => setMediaPicker(null)}
          onSelect={(media) => {
            const url = typeof media === "string"
              ? media
              : media?.imageUrl || media?.secure_url || media?.url || media?.videoUrl || "";
            if (!url) {
              setError("The selected media does not have a usable URL.");
              setMediaPicker(null);
              return;
            }
            if (["gallery", "speakers"].includes(mediaPicker.field) && Number.isInteger(mediaPicker.index)) {
              let values = [];
              try {
                values = JSON.parse(editing[mediaPicker.field] || "[]");
              } catch {
                values = [];
              }
              if (mediaPicker.field === "speakers") {
                values[mediaPicker.index] = {
                  ...(values[mediaPicker.index] || {}),
                  [mediaPicker.nestedField || "avatar"]: url,
                };
              } else {
                values[mediaPicker.index] = url;
              }
              setField(mediaPicker.field, JSON.stringify(values, null, 2));
            } else {
              setField(mediaPicker.field, url);
            }
            setMediaPicker(null);
          }}
        />
      )}
    </Box>
  );
}
