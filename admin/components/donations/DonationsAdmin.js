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
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
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
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { donationsApi } from "@/services/donationsApi";
import { DonationsStatsBanner } from "./DonationsStatsBanner";
import styles from "./DonationsAdmin.module.css";

const EMPTY_CAMPAIGN = {
  slug: "",
  title: "",
  summary: "",
  description: "",
  targetAmount: "",
  currency: "NGN",
  image: "",
  featured: false,
  status: "draft",
};

export function DonationsAdmin() {
  const [tab, setTab] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [records, setRecords] = useState([]);
  const [totals, setTotals] = useState({ campaigns: {} });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [recordStatus, setRecordStatus] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notesFor, setNotesFor] = useState(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [cData, rData, totalsData] = await Promise.all([
        donationsApi.listCampaigns({ search, status }),
        donationsApi.listRecords({ status: recordStatus, search }),
        donationsApi.totals(),
      ]);
      setCampaigns(cData);
      setRecords(rData);
      setTotals(totalsData);
    } catch (err) {
      setError(err.message || "Unable to load donations studio.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refreshCampaigns() {
    setIsUpdating(true);
    try {
      setCampaigns(await donationsApi.listCampaigns({ search, status }));
    } catch (err) {
      setError(err.message || "Unable to load campaigns.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function refreshRecords() {
    setIsUpdating(true);
    try {
      const [data, totalsData] = await Promise.all([donationsApi.listRecords({ status: recordStatus, search }), donationsApi.totals()]);
      setRecords(data);
      setTotals(totalsData);
    } catch (err) {
      setError(err.message || "Unable to load records.");
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
        if (tab === 0) {
          const cData = await donationsApi.listCampaigns({ search, status });
          if (requestId === requestIdRef.current) {
            setCampaigns(cData);
          }
        } else {
          const [rData, totalsData] = await Promise.all([
            donationsApi.listRecords({ status: recordStatus, search }),
            donationsApi.totals(),
          ]);
          if (requestId === requestIdRef.current) {
            setRecords(rData);
            setTotals(totalsData);
          }
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to filter data.");
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
  }, [tab, search, status, recordStatus]);

  function openCreate() {
    setEditing({ ...EMPTY_CAMPAIGN });
    setDialogOpen(true);
  }

  function openEdit(item) {
    const body = item.body || {};
    setEditing({
      ...EMPTY_CAMPAIGN,
      ...body,
      id: item.id,
      slug: item.slug,
      title: item.title,
      summary: item.summary || "",
      featured: item.featured,
      status: item.status,
    });
    setDialogOpen(true);
  }

  async function handleSaveCampaign() {
    setIsSaving(true);
    try {
      await donationsApi.saveCampaign(editing, editing?.id);
      setDialogOpen(false);
      await refreshCampaigns();
    } catch (err) {
      setError(err.message || "Unable to save campaign.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveNotes() {
    try {
      await donationsApi.updateNotes(notesFor.id, notes);
      setNotesFor(null);
      await refreshRecords();
    } catch (err) {
      setError(err.message || "Unable to update notes.");
    }
  }

  async function handleExport() {
    try {
      const blob = await donationsApi.exportRecords();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to export records.");
    }
  }

  const setField = (field, value) => setEditing((prev) => ({ ...prev, [field]: value }));

  if (isInitialLoading) return <AdminLoadingState />;

  const CAMPAIGN_STATUS_PILLS = [
    { label: "All Campaigns", value: "" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
    { label: "Archived", value: "archived" },
  ];

  const RECORD_STATUS_PILLS = [
    { label: "All Records", value: "" },
    { label: "Completed", value: "completed" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>
            Donations &amp; Philanthropy Studio
          </Typography>
          <Typography variant="body1" className={styles.description}>
            Empower African creative talents through active campaigns, donor records, and verified contributions.
          </Typography>
        </Box>
        <Box className={styles.headerActions}>
          {tab === 0 ? (
            <Button startIcon={<AddIcon />} variant="contained" className={styles.primaryButton} onClick={openCreate}>
              New Giving Campaign
            </Button>
          ) : (
            <Button startIcon={<FileDownloadIcon />} variant="outlined" className={styles.outlineButton} onClick={handleExport}>
              Export Patron Records (CSV)
            </Button>
          )}
        </Box>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <DonationsStatsBanner campaigns={campaigns} records={records} totals={totals} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className={styles.tabs}>
        <Tab icon={<VolunteerActivismOutlinedIcon fontSize="small" />} iconPosition="start" label={`Giving Campaigns (${campaigns.length})`} />
        <Tab icon={<ReceiptLongOutlinedIcon fontSize="small" />} iconPosition="start" label={`Donation Records (${records.length})`} />
      </Tabs>

      {tab === 0 ? (
        <>
          {/* Controls Bar for Campaigns */}
          <Box className={styles.controlsBar}>
            <Box className={styles.filtersRow}>
              <TextField
                size="small"
                placeholder="Search campaigns by title, slug, or summary..."
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
                label="Campaign Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.filterControl}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Box>

            {/* Quick Pills */}
            <Box className={styles.quickFiltersRow}>
              <Box className={styles.quickPills} role="group" aria-label="Campaign Status Filter">
                {CAMPAIGN_STATUS_PILLS.map((pill) => (
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
                      Showing <span className={styles.resultsCount}>{campaigns.length}</span> campaigns
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

          {/* Background updating progress */}
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
                  <TableCell className={styles.tableHeadCell} style={{ width: "34%" }}>Campaign &amp; Slug</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "22%" }}>Goal &amp; Progress</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>Status</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Spotlight</TableCell>
                  <TableCell align="right" className={styles.tableHeadCell} style={{ width: "110px" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#6B7280" }}>
                      No campaigns found matching your query.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((camp) => {
                    const targetAmount = Number(camp.body?.targetAmount || 0);
                    const campaignTotals = totals.campaigns?.[camp.id] || {};
                    const raised = campaignTotals.totalAmount || 0;
                    const percent = targetAmount > 0 ? Math.min(100, Math.round((raised / targetAmount) * 100)) : 0;

                    return (
                      <TableRow key={camp.id} hover className={styles.tableRow}>
                        <TableCell className={styles.tableCell}>
                          <span className={styles.campaignTitle}>{camp.title}</span>
                          <span className={styles.campaignSlug}>/donations/{camp.slug}</span>
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <Box className={styles.progressWrapper}>
                            <Box className={styles.progressNumbers}>
                              <span>₦{raised.toLocaleString()}</span>
                              <span>{targetAmount > 0 ? `₦${targetAmount.toLocaleString()}` : "Open"}</span>
                            </Box>
                            {targetAmount > 0 && (
                              <Box className={styles.progressBarTrack}>
                                <Box className={styles.progressBarFill} style={{ width: `${percent}%` }} />
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <StatusChip status={camp.status} />
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {camp.featured ? (
                            <span className={styles.featuredBadge}>
                              <StarIcon sx={{ fontSize: 11 }} /> Primary Spotlight
                            </span>
                          ) : (
                            <span style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>Standard</span>
                          )}
                        </TableCell>
                        <TableCell align="right" className={styles.tableCell}>
                          <Box className={styles.actionsDock}>
                            <Tooltip title="View Live Campaign">
                              <IconButton
                                size="small"
                                component="a"
                                href={`/donations/${camp.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.actionBtn}
                                aria-label={`View live ${camp.title}`}
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Campaign">
                              <IconButton
                                size="small"
                                onClick={() => openEdit(camp)}
                                className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                                aria-label={`Edit ${camp.title}`}
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
        </>
      ) : (
        /* Records Tab */
        <>
          {/* Controls Bar for Records */}
          <Box className={styles.controlsBar}>
            <Box className={styles.filtersRow}>
              <TextField
                size="small"
                placeholder="Search donor name, email, or transaction reference..."
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
                label="Record Status"
                value={recordStatus}
                onChange={(e) => setRecordStatus(e.target.value)}
                className={styles.filterControl}
              >
                <MenuItem value="">All Records</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Box>

            {/* Quick Pills */}
            <Box className={styles.quickFiltersRow}>
              <Box className={styles.quickPills} role="group" aria-label="Record Status Filter">
                {RECORD_STATUS_PILLS.map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    className={`${styles.quickPill} ${recordStatus === pill.value ? styles.quickPillActive : ""}`}
                    onClick={() => setRecordStatus(pill.value)}
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
                      Showing <span className={styles.resultsCount}>{records.length}</span> contributions
                    </>
                  )}
                </span>
                {(search || recordStatus) && (
                  <Button
                    size="small"
                    startIcon={<FilterListOffIcon fontSize="small" />}
                    onClick={() => {
                      setSearch("");
                      setRecordStatus("");
                    }}
                    className={styles.resetFiltersBtn}
                  >
                    Reset
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Background updating progress */}
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
                  <TableCell className={styles.tableHeadCell} style={{ width: "30%" }}>Donor &amp; Contact</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Contribution Amount</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>Frequency</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "18%" }}>Reference Tag</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>Status</TableCell>
                  <TableCell align="right" className={styles.tableHeadCell} style={{ width: "100px" }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#6B7280" }}>
                      No donation records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((r) => {
                    const initial = (r.donorName || "D").charAt(0).toUpperCase();

                    return (
                      <TableRow key={r.id} hover className={styles.tableRow}>
                        <TableCell className={styles.tableCell}>
                          <Box className={styles.donorCell}>
                            <Box className={styles.donorAvatar}>{initial}</Box>
                            <Box className={styles.donorMeta}>
                              <span className={styles.donorName}>{r.donorName || "Anonymous Patron"}</span>
                              <span className={styles.donorEmail}>{r.donorEmail || "No email"} {r.donorPhone ? `· ${r.donorPhone}` : ""}</span>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <span className={styles.amountBadge}>
                            ₦{Number(r.amount || 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className={styles.tableCell} sx={{ textTransform: "capitalize", fontWeight: 600, color: "#475569" }}>
                          {r.frequency || "one-time"}
                        </TableCell>
                        <TableCell className={styles.tableCell} sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748B" }}>
                          {r.reference || "—"}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <StatusChip status={r.status === "completed" ? "published" : r.status === "pending" ? "draft" : "archived"} />
                        </TableCell>
                        <TableCell align="right" className={styles.tableCell}>
                          <Tooltip title={r.internalNotes ? "View/Edit Notes" : "Add Note"}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setNotesFor(r);
                                setNotes(r.internalNotes || "");
                              }}
                              className={styles.actionBtn}
                              aria-label="Notes"
                            >
                              <NoteAltOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Campaign Modal Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1.5, pt: 2.5, px: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            {editing?.id ? `Edit Campaign: ${editing.title}` : "Create Giving Campaign"}
          </Typography>
          <IconButton size="small" onClick={() => setDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {editing && (
            <Stack spacing={2}>
              <Box className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  label="Campaign Title"
                  value={editing.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  size="small"
                  label="URL Slug"
                  value={editing.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  helperText="Unique identifier for donation causes"
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Summary / Catchphrase"
                value={editing.summary}
                onChange={(e) => setField("summary", e.target.value)}
              />

              <TextField
                fullWidth
                size="small"
                label="Full Campaign Mission Description"
                value={editing.description}
                onChange={(e) => setField("description", e.target.value)}
                multiline
                minRows={3}
              />

              <Box className={styles.row}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Target Goal Amount (NGN)"
                  value={editing.targetAmount}
                  onChange={(e) => setField("targetAmount", e.target.value)}
                  placeholder="e.g. 5000000"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Banner Image URL"
                  value={editing.image}
                  onChange={(e) => setField("image", e.target.value)}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 3, alignItems: "center", pt: 1 }}>
                <FormControlLabel
                  control={<Switch checked={Boolean(editing.featured)} onChange={(e) => setField("featured", e.target.checked)} />}
                  label="Featured Campaign"
                />
              </Box>

              <TextField
                fullWidth
                size="small"
                select
                label="Publication Status"
                value={editing.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <MenuItem value="draft">Draft (Private)</MenuItem>
                <MenuItem value="published">Published (Live on Website)</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveCampaign} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Campaign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Internal Notes Dialog */}
      {notesFor && (
        <Dialog open={Boolean(notesFor)} onClose={() => setNotesFor(null)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Internal Notes: {notesFor.donorName}</span>
            <IconButton size="small" onClick={() => setNotesFor(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Staff Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record follow-up actions, receipt dispatch confirmations, or donor preferences..."
            />
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button onClick={() => setNotesFor(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveNotes}>
              Save Note
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
