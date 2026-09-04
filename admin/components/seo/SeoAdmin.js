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
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import TuneIcon from "@mui/icons-material/Tune";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { seoAdminApi } from "@/services/seoAdminApi";
import { SeoStatsBanner } from "./SeoStatsBanner";
import styles from "./SeoAdmin.module.css";

const TYPES = [
  { value: "", label: "All content" },
  { value: "static", label: "Static pages" },
  { value: "talent", label: "Talents" },
  { value: "event", label: "Events" },
  { value: "blog", label: "Blog posts" },
  { value: "media", label: "Media collections" },
  { value: "campaign", label: "Donation campaigns" },
];

function SeoForm({ value, onChange }) {
  const set = (field, fieldValue) => onChange({ ...value, [field]: fieldValue });
  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="SEO title" value={value.title || ""} onChange={(e) => set("title", e.target.value)} fullWidth />
      <TextField label="Meta description" value={value.summary || ""} onChange={(e) => set("summary", e.target.value)} fullWidth multiline minRows={2} />
      <TextField label="Canonical URL" value={value.canonical || ""} onChange={(e) => set("canonical", e.target.value)} fullWidth helperText="Internal path (/about) or https URL" />
      <Box className={styles.row}>
        <TextField label="Open Graph title" value={value.ogTitle || ""} onChange={(e) => set("ogTitle", e.target.value)} fullWidth />
        <TextField label="Open Graph image URL" value={value.ogImageUrl || ""} onChange={(e) => set("ogImageUrl", e.target.value)} fullWidth />
      </Box>
      <TextField label="Open Graph description" value={value.ogDescription || ""} onChange={(e) => set("ogDescription", e.target.value)} fullWidth multiline minRows={2} />
      <TextField
        label="Structured data (JSON-LD)"
        value={value.structuredData ? JSON.stringify(value.structuredData, null, 2) : ""}
        onChange={(e) => {
          try {
            set("structuredData", e.target.value ? JSON.parse(e.target.value) : null);
          } catch {
            /* keep previous */
          }
        }}
        fullWidth
        multiline
        minRows={4}
      />
      <Box className={styles.row}>
        <FormControlLabel control={<Switch checked={Boolean(value.noIndex)} onChange={(e) => set("noIndex", e.target.checked)} />} label="noindex" />
        <FormControlLabel control={<Switch checked={Boolean(value.noFollow)} onChange={(e) => set("noFollow", e.target.checked)} />} label="nofollow" />
      </Box>
    </Stack>
  );
}

export function SeoAdmin() {
  const [records, setRecords] = useState([]);
  const [defaultSeo, setDefaultSeo] = useState(null);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [preview, setPreview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [data, def] = await Promise.all([seoAdminApi.list({ type, search }), seoAdminApi.getDefault()]);
      setRecords(data);
      setDefaultSeo(def);
    } catch (err) {
      setError(err.message || "Unable to load SEO records.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const [data, def] = await Promise.all([seoAdminApi.list({ type, search }), seoAdminApi.getDefault()]);
      setRecords(data);
      setDefaultSeo(def);
    } catch (err) {
      setError(err.message || "Unable to load SEO records.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void initialLoad();
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
        const data = await seoAdminApi.list({ type, search });
        if (requestId === requestIdRef.current) {
          setRecords(data);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to filter SEO records.");
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
  }, [type, search]);

  async function openEdit(record) {
    setEditing(record);
    const existing = record.type === "static" ? null : await seoAdminApi.getRecord(record.type, record.id);
    setEditForm({
      title: existing?.title || record.title || "",
      summary: existing?.summary || "",
      canonical: existing?.canonical_path || "",
      ogTitle: existing?.og_title || "",
      ogDescription: existing?.og_description || "",
      ogImageUrl: existing?.og_image_url || "",
      noIndex: existing?.no_index || false,
      noFollow: existing?.no_follow || false,
      structuredData: existing?.structured_data || null,
    });
    setDialogOpen(true);
  }

  async function openEditDefault() {
    setEditing({ type: "default", title: "Default SEO" });
    setEditForm({
      title: defaultSeo?.title || "",
      summary: defaultSeo?.summary || "",
      canonical: defaultSeo?.canonical_path || "",
      ogTitle: defaultSeo?.og_title || "",
      ogDescription: defaultSeo?.og_description || "",
      ogImageUrl: defaultSeo?.og_image_url || "",
      noIndex: defaultSeo?.no_index || false,
      noFollow: defaultSeo?.no_follow || false,
      structuredData: defaultSeo?.structured_data || null,
    });
    setDialogOpen(true);
  }

  async function save() {
    if (editing.type === "default") {
      await seoAdminApi.saveDefault(editForm);
    } else {
      await seoAdminApi.saveRecord(editing.type, editing.id, editForm);
    }
    setDialogOpen(false);
    await refresh();
  }

  async function showPreview() {
    setPreview(await seoAdminApi.preview({ title: editForm.title, description: editForm.summary, canonical: editForm.canonical }));
  }

  if (isInitialLoading) return <AdminLoadingState />;

  const QUICK_TYPES = [
    { label: "All Content", value: "" },
    { label: "Static Pages", value: "static" },
    { label: "Talents", value: "talent" },
    { label: "Events", value: "event" },
    { label: "Blog Posts", value: "blog" },
    { label: "Media Collections", value: "media" },
    { label: "Donation Campaigns", value: "campaign" },
  ];

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>SEO &amp; Search Engine Index</Typography>
          <Typography variant="body1" className={styles.description}>Manage global search defaults, meta descriptions, and content-specific Open Graph overrides.</Typography>
        </Box>
        <Button variant="contained" className={styles.primaryButton} onClick={openEditDefault}>Edit Global Default SEO</Button>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <SeoStatsBanner records={records} />

      {/* Global Default Card */}
      <Paper elevation={0} className={styles.defaultCard}>
        <Box>
          <Typography className={styles.defaultTitle}>
            <TuneIcon fontSize="small" sx={{ color: "#B46A2C" }} /> Global Fallback Metadata
          </Typography>
          <Typography className={styles.defaultMeta}>
            <strong>{defaultSeo?.title || "Royz House — Cultural Platform"}</strong> — {defaultSeo?.summary || "Fallback metadata applied automatically across all pages lacking an override."}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" className={styles.editDefaultBtn} onClick={openEditDefault}>
          Tune Global Defaults
        </Button>
      </Paper>

      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder="Search SEO records by title, path, or description..."
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
            label="Content Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.filterControl}
          >
            {TYPES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Quick Filter Pills */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Content Type Filters">
            {QUICK_TYPES.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.quickPill} ${type === pill.value ? styles.quickPillActive : ""}`}
                onClick={() => setType(pill.value)}
              >
                {pill.label}
              </button>
            ))}
          </Box>

          <Box className={styles.resultsMeta}>
            <span>
              {isUpdating ? (
                <span style={{ color: "#B46A2C", fontWeight: 600 }}>Filtering…</span>
              ) : (
                <>
                  Showing <span className={styles.resultsCount}>{records.length}</span> entities
                </>
              )}
            </span>
            {(search || type) && (
              <Button
                size="small"
                startIcon={<FilterListOffIcon fontSize="small" />}
                onClick={() => {
                  setSearch("");
                  setType("");
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

      {/* Records Table */}
      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table} size="medium">
          <TableHead>
            <TableRow className={styles.tableHeadRow}>
              <TableCell className={styles.tableHeadCell} style={{ width: "32%" }}>Entity Title</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Content Type</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "24%" }}>Canonical URL Path</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Status</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Search Index</TableCell>
              <TableCell align="right" className={styles.tableHeadCell} style={{ width: "110px" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#6B7280" }}>
                  No SEO records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => {
                const hasOverride = Boolean(record.seo && (record.seo.title || record.seo.summary));
                const isNoIndex = Boolean(record.seo && record.seo.no_index);

                return (
                  <TableRow key={`${record.type}-${record.id}`} hover className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.entityTitle}>{record.title}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.typeBadge}>{record.type}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.pathPill}>{record.path}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <StatusChip status={record.status} />
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      {hasOverride ? (
                        <span className={styles.overrideBadge}>
                          {isNoIndex ? "noindex" : "Custom Override"}
                        </span>
                      ) : (
                        <span className={styles.defaultInheritBadge}>
                          Default Fallback
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="right" className={styles.tableCell}>
                      <Box className={styles.actionsDock}>
                        <Tooltip title="Preview Search Result">
                          <IconButton
                            size="small"
                            onClick={() => {
                              openEdit(record);
                              void showPreview();
                            }}
                            className={styles.actionBtn}
                            aria-label={`Preview SEO for ${record.title}`}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit SEO Overrides">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(record)}
                            className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                            aria-label={`Edit SEO for ${record.title}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>SEO — {editing?.title}</DialogTitle>
        <DialogContent>
          <SeoForm value={editForm} onChange={setEditForm} />
          {preview ? (
            <Paper elevation={0} className={styles.previewCard}>
              <Typography variant="subtitle2">Search preview</Typography>
              <Typography variant="body1" className={styles.previewTitle}>{preview.searchResult.title || "Untitled"}</Typography>
              <Typography variant="body2" color="primary" className={styles.previewUrl}>{preview.absoluteCanonical || "https://royzhouz.com"}</Typography>
              <Typography variant="body2" color="text.secondary">{preview.searchResult.description}</Typography>
            </Paper>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={showPreview}>Preview</Button>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
