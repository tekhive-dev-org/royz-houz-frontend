import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { bookingsApi } from "@/services/bookingsApi";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import styles from "./BookingsAdmin.module.css";

const STATUSES = ["new", "reviewing", "contacted", "confirmed", "declined", "cancelled", "archived"];

function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`))
    : "—";
}

function BookingDialog({ booking, assignees, open, canUpdate, saving, onClose, onSave }) {
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (booking) {
      setStatus(booking.workflow_status);
      setAssignedTo(booking.assigned_to || "");
      setNotes(booking.internal_notes || "");
    }
  }, [booking]);

  if (!booking) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Booking request {booking.reference}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box className={styles.detail}>
            <Typography variant="overline">Talent</Typography>
            <Typography variant="h6">{booking.talent_name_snapshot}</Typography>
            <Typography variant="body2" color="text.secondary">
              Event date: {formatDate(booking.event_date)} · {booking.event_type}
            </Typography>
          </Box>
          <Box className={styles.detail}>
            <Typography variant="overline">Requester</Typography>
            <Typography>{booking.first_name} {booking.last_name}</Typography>
            <Typography variant="body2">{booking.email} · {booking.phone}</Typography>
          </Box>
          <Box className={styles.detail}>
            <Typography variant="overline">Event details</Typography>
            <Typography variant="body2">{booking.event_location}</Typography>
            <Typography variant="body2" className={styles.preformatted}>{booking.event_description}</Typography>
            {booking.budget ? <Typography variant="body2">Budget: {booking.budget}</Typography> : null}
          </Box>
          <TextField select label="Status" value={status} disabled={!canUpdate} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField select label="Assigned administrator" value={assignedTo} disabled={!canUpdate} onChange={(event) => setAssignedTo(event.target.value)}>
            <MenuItem value="">Unassigned</MenuItem>
            {assignees.map((item) => <MenuItem key={item.id} value={item.id}>{item.displayName}</MenuItem>)}
          </TextField>
          <TextField label="Internal notes" value={notes} disabled={!canUpdate} onChange={(event) => setNotes(event.target.value)} multiline minRows={3} helperText="Private administrative notes." />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{canUpdate ? "Cancel" : "Close"}</Button>
        {canUpdate ? <Button variant="contained" disabled={saving} onClick={() => onSave({ id: booking.id, status, assignedTo: assignedTo || null, internalNotes: notes || null })} className={styles.primaryButton}>{saving ? "Saving…" : "Save changes"}</Button> : null}
      </DialogActions>
    </Dialog>
  );
}

export function BookingsAdmin({ canUpdate = false }) {
  const [items, setItems] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [result, admins] = await Promise.all([
        bookingsApi.list({ page, limit: 12, search, status }),
        canUpdate ? bookingsApi.assignees() : Promise.resolve([]),
      ]);
      setItems(result.items);
      setPagination(result.pagination);
      setAssignees(admins);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, canUpdate]);

  async function openBooking(item) {
    try {
      setSelected(await bookingsApi.get(item.id));
    } catch (detailError) {
      setError(detailError.message);
    }
  }

  async function saveBooking(input) {
    setSaving(true);
    try {
      await bookingsApi.update(input);
      setSelected(null);
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AdminLoadingState />;

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Talent bookings</Typography>
          <Typography className={styles.description}>Receive, assign, and action private booking inquiries.</Typography>
        </Box>
      </Box>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Paper elevation={0} className={styles.filters}>
        <TextField size="small" label="Search reference, talent, or email" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
        <TextField select size="small" label="Status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
          <MenuItem value="">All statuses</MenuItem>
          {STATUSES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
        </TextField>
      </Paper>
      <TableContainer component={Paper} elevation={0} className={styles.table}>
        <Table>
          <TableHead><TableRow><TableCell>Reference</TableCell><TableCell>Talent</TableCell><TableCell>Event date</TableCell><TableCell>Status</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
          <TableBody>
            {items.map((item) => <TableRow key={item.id} hover><TableCell>{item.reference}</TableCell><TableCell><strong>{item.talent_name_snapshot}</strong><br /><small>{item.first_name} {item.last_name}</small></TableCell><TableCell>{formatDate(item.event_date)}</TableCell><TableCell className={styles.capitalize}>{item.workflow_status}</TableCell><TableCell align="right"><Button size="small" onClick={() => openBooking(item)}>View request</Button></TableCell></TableRow>)}
            {!items.length ? <TableRow><TableCell colSpan={5} align="center" className={styles.empty}>No booking requests found.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination?.totalPages > 1 ? <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Typography>Page {page} of {pagination.totalPages}</Typography><Button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></Stack> : null}
      <BookingDialog booking={selected} assignees={assignees} open={Boolean(selected)} canUpdate={canUpdate} saving={saving} onClose={() => setSelected(null)} onSave={saveBooking} />
    </Box>
  );
}

export default BookingsAdmin;
