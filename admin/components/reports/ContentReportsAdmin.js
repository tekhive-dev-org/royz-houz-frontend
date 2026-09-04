import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  Typography,
} from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { contentReportsApi } from "@/services/contentReportsApi";
import { ContentReportDialog } from "./ContentReportDialog";
import styles from "./ContentReportsAdmin.module.css";

const STATUS_OPTIONS = ["", "new", "reviewing", "actioned", "dismissed", "duplicate", "archived"];
const REASON_OPTIONS = ["", "copyright", "inappropriate", "misinformation", "spam", "other"];

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ContentReportsAdmin({ canModerate = false }) {
  const [items, setItems] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const loadReports = async ({ initial = false } = {}) => {
    const requestId = ++requestRef.current;
    if (initial) setLoading(true);
    else setUpdating(true);
    setError("");
    try {
      const result = await contentReportsApi.list({ page, limit: 12, search, status, reason });
      if (requestId === requestRef.current) {
        setItems(result.items);
        setPagination(result.pagination);
      }
    } catch (loadError) {
      if (requestId === requestRef.current) setError(loadError.message);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setUpdating(false);
      }
    }
  };

  useEffect(() => {
    Promise.all([
      canModerate ? contentReportsApi.assignees() : Promise.resolve([]),
      loadReports({ initial: true }),
    ])
      .then(([admins]) => setAssignees(admins))
      .catch((loadError) => {
        setError(loadError.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canModerate]);

  useEffect(() => {
    if (loading) return undefined;
    const timer = setTimeout(() => void loadReports(), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, reason]);

  const openReport = (item) => {
    setError("");
    setSelected(item);
  };

  const saveReport = async (changes) => {
    setSaving(true);
    setError("");
    try {
      await contentReportsApi.update(changes);
      setSelected(null);
      await loadReports();
    } catch (saveError) {
      setError(saveError.message);
      throw saveError;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoadingState />;

  const newCount = items.filter((item) => item.workflow_status === "new").length;
  const activeCount = items.filter((item) => ["new", "reviewing"].includes(item.workflow_status)).length;

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <div>
          <Typography variant="h4" className={styles.title}>Content reports</Typography>
          <Typography variant="body1" className={styles.description}>Review reports submitted from public video and audio players.</Typography>
        </div>
        {updating ? <CircularProgress size={22} /> : null}
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <div className={styles.statsGrid}>
        <Paper className={styles.statCard} elevation={0}><FlagOutlinedIcon /><span><strong>{pagination?.total ?? items.length}</strong>Total reports</span></Paper>
        <Paper className={styles.statCard} elevation={0}><FlagOutlinedIcon /><span><strong>{newCount}</strong>New on this page</span></Paper>
        <Paper className={styles.statCard} elevation={0}><FlagOutlinedIcon /><span><strong>{activeCount}</strong>Open on this page</span></Paper>
      </div>

      <Paper className={styles.filters} elevation={0}>
        <TextField size="small" label="Search content title" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
        <TextField select size="small" label="Status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
          {STATUS_OPTIONS.map((value) => <MenuItem key={value || "all"} value={value}>{value || "All statuses"}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Reason" value={reason} onChange={(event) => { setPage(1); setReason(event.target.value); }}>
          {REASON_OPTIONS.map((value) => <MenuItem key={value || "all"} value={value}>{value || "All reasons"}</MenuItem>)}
        </TextField>
      </Paper>

      <TableContainer component={Paper} elevation={0} className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHead><TableRow><TableCell>Content</TableCell><TableCell>Talent</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Submitted</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell><Typography variant="body2" className={styles.contentTitle}>{item.target_title_snapshot}</Typography><Typography variant="caption" color="text.secondary">{item.target_type === "talent_media" ? "Talent production" : "Media asset"}</Typography></TableCell>
                <TableCell>
                  {item.talent ? (
                    <div className={styles.ownerCell}>
                      <Typography variant="body2" className={styles.ownerName}>{item.talent.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.talent.slug}</Typography>
                    </div>
                  ) : <Typography variant="body2" color="text.secondary">Not linked to a talent</Typography>}
                </TableCell>
                <TableCell className={styles.capitalize}>{item.reason_code}</TableCell>
                <TableCell><span className={`${styles.status} ${styles[`status_${item.workflow_status}`]}`}>{item.workflow_status}</span></TableCell>
                <TableCell>{formatDate(item.created_at)}</TableCell>
                <TableCell align="right"><Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => openReport(item)}>{canModerate ? "Review" : "View"}</Button></TableCell>
              </TableRow>
            ))}
            {!items.length ? <TableRow><TableCell colSpan={6} align="center" className={styles.empty}>No reports match these filters.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination?.totalPages > 1 ? (
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
          <Button disabled={page <= 1 || updating} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <Typography variant="body2">Page {page} of {pagination.totalPages}</Typography>
          <Button disabled={page >= pagination.totalPages || updating} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </Stack>
      ) : null}

      <ContentReportDialog report={selected} assignees={assignees} open={Boolean(selected)} saving={saving} canModerate={canModerate} onClose={() => setSelected(null)} onSave={saveReport} />
    </Box>
  );
}

export default ContentReportsAdmin;
