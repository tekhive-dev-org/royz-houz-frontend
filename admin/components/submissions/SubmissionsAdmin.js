import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
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
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import CloseIcon from "@mui/icons-material/Close";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { submissionsApi } from "@/services/submissionsApi";
import { SubmissionsStatsBanner } from "./SubmissionsStatsBanner";
import styles from "./SubmissionsAdmin.module.css";

const STATUSES = [
  { value: "new", label: "New (Unread)" },
  { value: "reviewing", label: "Under Review" },
  { value: "contacted", label: "Contacted" },
  { value: "resolved", label: "Resolved" },
  { value: "archived", label: "Archived" },
];

function getWorkflowStatusChip(status) {
  if (status === "new") return <StatusChip status="scheduled" />;
  if (status === "resolved" || status === "contacted") return <StatusChip status="published" />;
  if (status === "reviewing") return <StatusChip status="draft" />;
  return <StatusChip status="archived" />;
}

function getSubmissionName(item, module) {
  if (module === "contacts") return [item.first_name, item.last_name].filter(Boolean).join(" ") || "Anonymous Contact";
  return item.full_name || item.name || "Anonymous Applicant";
}

function getSubmissionTopic(item, module) {
  if (module === "contacts") return item.reason || "General Inquiry";
  return item.subject || item.category || item.talent_category || item.custom_talent_category || "General Application";
}

function getSubmissionMessage(item) {
  return item.message || item.short_bio || item.bio || item.pitch || "—";
}

export function SubmissionsAdmin({ module, title, description }) {
  const [items, setItems] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [{ items: data, pagination: paginationMeta }, adminList] = await Promise.all([
        submissionsApi.list(module, { page, limit: 12, search, status }),
        submissionsApi.listAdminUsers(),
      ]);
      setItems(data);
      setPagination(paginationMeta);
      setAdmins(adminList);
    } catch (err) {
      setError(err.message || "Unable to load submissions.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const { items: data, pagination: paginationMeta } = await submissionsApi.list(module, { page, limit: 12, search, status });
      setItems(data);
      setPagination(paginationMeta);
    } catch (err) {
      setError(err.message || "Unable to load submissions.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

  useEffect(() => {
    const handleRealtimeChange = (event) => {
      const table = event.detail?.table;
      const submissionTable = module === "contacts" ? "contact_submissions" : module === "applications" ? "join_applications" : null;
      if (table === submissionTable) void refresh();
    };
    window.addEventListener("royz:admin-realtime", handleRealtimeChange);
    return () => window.removeEventListener("royz:admin-realtime", handleRealtimeChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module]);

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
        const { items: data, pagination: paginationMeta } = await submissionsApi.list(module, { page, limit: 12, search, status });
        if (requestId === requestIdRef.current) {
          setItems(data);
          setPagination(paginationMeta);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to filter submissions.");
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
  }, [module, page, search, status]);

  async function openDetail(item) {
    setSelected(await submissionsApi.get(module, item.id));
    setNotes(item.internal_notes || "");
    setAssignTo(item.assigned_to || "");
    setEditStatus(item.workflow_status || "");
  }

  async function saveDetail() {
    setIsSaving(true);
    try {
      await submissionsApi.update(module, { id: selected.id, status: editStatus, notes, assignedTo: assignTo || null });
      setSelected(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update submission.");
    } finally {
      setIsSaving(false);
    }
  }

  async function exportCsv() {
    try {
      const csv = await submissionsApi.exportCsv(module, { status });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${module}-export.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to export.");
    }
  }

  if (isInitialLoading) return <AdminLoadingState />;

  const QUICK_STATUS_PILLS = [
    { label: "All Submissions", value: "" },
    { label: "New (Unread)", value: "new" },
    { label: "Under Review", value: "reviewing" },
    { label: "Contacted", value: "contacted" },
    { label: "Resolved", value: "resolved" },
    { label: "Archived", value: "archived" },
  ];

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>
            {title}
          </Typography>
          <Typography variant="body1" className={styles.description}>
            {description}
          </Typography>
        </Box>
        <Box className={styles.headerActions}>
          <Button startIcon={<FileDownloadIcon />} variant="outlined" className={styles.outlineButton} onClick={exportCsv}>
            Export Submissions (CSV)
          </Button>
        </Box>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <SubmissionsStatsBanner items={items} module={module} />

      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder={module === "contacts" ? "Search by name, email, reason, or message..." : "Search by applicant name, email, or message text..."}
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
            label="Workflow Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.filterControl}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Quick Filter Pills */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Workflow Status Filter">
            {QUICK_STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.quickPill} ${status === pill.value ? styles.quickPillActive : ""}`}
                onClick={() => setStatus(pill.value)}
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
                  Showing <span className={styles.resultsCount}>{items.length}</span> submissions
                </>
              )}
            </span>
            {(search || status) && (
              <Button
                size="small"
                startIcon={<FilterListOffIcon fontSize="small" />}
                onClick={() => {
                  setSearch("");
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

      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table} size="medium">
          <TableHead>
            <TableRow className={styles.tableHeadRow}>
              <TableCell className={styles.tableHeadCell} style={{ width: "30%" }}>{module === "contacts" ? "Contact" : "Applicant"}</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "18%" }}>{module === "contacts" ? "Reason" : "Subject / Focus"}</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "24%" }}>{module === "contacts" ? "Message" : "Message Excerpt"}</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Workflow</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Received</TableCell>
              <TableCell align="right" className={styles.tableHeadCell} style={{ width: "90px" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#6B7280" }}>
                  No submissions found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const name = getSubmissionName(item, module);
                const initial = name.charAt(0).toUpperCase();

                return (
                  <TableRow key={item.id} hover className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <Box className={styles.submitterCell}>
                        <Box className={styles.avatar}>{initial}</Box>
                        <Box className={styles.submitterMeta}>
                          <span className={styles.submitterName}>{name}</span>
                          <span className={styles.submitterEmail}>
                            {item.email} {item.phone ? `· ${item.phone}` : ""}
                          </span>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.topicBadge}>
                        {getSubmissionTopic(item, module)}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <div className={styles.messageSnippet}>
                        {getSubmissionMessage(item)}
                      </div>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      {getWorkflowStatusChip(item.workflow_status || item.status)}
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.dateCell}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </span>
                    </TableCell>
                    <TableCell align="right" className={styles.tableCell}>
                      <Box className={styles.actionsDock}>
                        <Tooltip title="View full submission & update workflow">
                          <IconButton
                            size="small"
                            onClick={() => openDetail(item)}
                            className={styles.actionBtn}
                            aria-label={`View ${name}`}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
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

          {pagination && pagination.pages > 1 && (
            <Box className={styles.pagination}>
              <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Typography variant="caption" color="text.secondary">
                Page {page} of {pagination.pages}
              </Typography>
              <Button size="small" variant="outlined" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </Box>
          )}

      {/* Inquiry Detail Modal Dialog */}
      {selected && (
        <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="md">
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5, pt: 2.5, px: 3 }}>
            <Typography variant="h6" fontWeight={700}>
              Submission: {getSubmissionName(selected, module)}
            </Typography>
            <IconButton size="small" onClick={() => setSelected(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <Stack spacing={2.5}>
              <Paper elevation={0} sx={{ p: 2, background: "#F9FAFB", border: "1px solid #E8EAEF", borderRadius: "10px" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  {module === "contacts" ? "Contact details" : "Applicant contact & details"}
                </Typography>
                <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                  <div>
                    <Typography variant="caption" color="text.secondary">Name:</Typography>
                    <Typography variant="body2" fontWeight={600}>{getSubmissionName(selected, module)}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="text.secondary">Email:</Typography>
                    <Typography variant="body2" fontWeight={600}>{selected.email || "—"}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="text.secondary">Phone:</Typography>
                    <Typography variant="body2">{selected.phone || "—"}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="text.secondary">Category / Subject:</Typography>
                    <Typography variant="body2">{getSubmissionTopic(selected, module)}</Typography>
                  </div>
                </Box>
              </Paper>

              <div>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Full Message / Pitch
                </Typography>
                <Paper elevation={0} sx={{ p: 2, mt: 0.5, background: "#FFFFFF", border: "1px solid #E8EAEF", borderRadius: "10px", minHeight: 80 }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {getSubmissionMessage(selected) === "—" ? "No text provided." : getSubmissionMessage(selected)}
                  </Typography>
                </Paper>
              </div>

              <Box className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Workflow Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Assigned Staff Member"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {admins.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.display_name || a.email}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <TextField
                fullWidth
                size="small"
                multiline
                minRows={3}
                label="Internal Admin Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log internal feedback, interview times, or follow-up milestones..."
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setSelected(null)} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" onClick={saveDetail} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Workflow Status"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
