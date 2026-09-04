import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import styles from "./ContentReportsAdmin.module.css";

const STATUSES = [
  ["new", "New"],
  ["reviewing", "Reviewing"],
  ["actioned", "Actioned"],
  ["dismissed", "Dismissed"],
  ["duplicate", "Duplicate"],
  ["archived", "Archived"],
];
const RESOLUTION_STATUSES = new Set(["actioned", "dismissed", "duplicate"]);

export function ContentReportDialog({ report, assignees, open, saving, canModerate, onClose, onSave }) {
  const [status, setStatus] = useState("new");
  const [assignedTo, setAssignedTo] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!report) return;
    setStatus(report.workflow_status || "new");
    setAssignedTo(report.assigned_to || "");
    setInternalNotes(report.internal_notes || "");
    setResolution(report.resolution || "");
    setError("");
  }, [report]);

  const requiresResolution = RESOLUTION_STATUSES.has(status);

  const handleSave = async () => {
    if (requiresResolution && !resolution.trim()) {
      setError("Add a short resolution before closing this report.");
      return;
    }
    setError("");
    try {
      await onSave({
        id: report.id,
        status,
        assignedTo: assignedTo || null,
        internalNotes: internalNotes || null,
        resolution: requiresResolution ? resolution : null,
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to save this report. Please try again.");
    }
  };

  if (!report) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review content report</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <div className={styles.detailBlock}>
            <Typography variant="overline" className={styles.detailLabel}>Reported content</Typography>
            <Typography variant="h6">{report.target_title_snapshot}</Typography>
            <Typography variant="body2" color="text.secondary">
              {report.target_type === "talent_media" ? "Talent production" : "Media Library asset"} · {report.target_key}
            </Typography>
          </div>
          <div className={styles.detailBlock}>
            <Typography variant="overline" className={styles.detailLabel}>Linked talent</Typography>
            {report.talent ? (
              <>
                <Typography variant="body1" fontWeight={600}>{report.talent.title}</Typography>
                <Typography variant="body2" color="text.secondary">{report.talent.slug}</Typography>
              </>
            ) : <Typography variant="body2" color="text.secondary">This content is not linked to a talent.</Typography>}
          </div>
          <div className={styles.detailBlock}>
            <Typography variant="overline" className={styles.detailLabel}>Content creator contact</Typography>
            {report.owner ? (
              <>
                <Typography variant="body1" fontWeight={600}>{report.owner.name}</Typography>
                {report.owner.email ? <Typography variant="body2"><a className={styles.ownerEmail} href={`mailto:${report.owner.email}`}>{report.owner.email}</a></Typography> : null}
                {report.owner.phone ? <Typography variant="body2"><a className={styles.ownerEmail} href={`tel:${report.owner.phone}`}>{report.owner.phone}</a></Typography> : null}
              </>
            ) : <Typography variant="body2" color="text.secondary">Owner contact is unavailable.</Typography>}
          </div>
          <div className={styles.detailBlock}>
            <Typography variant="overline" className={styles.detailLabel}>Reason</Typography>
            <Typography variant="body1" className={styles.reasonText}>{report.reason_code}</Typography>
            {report.details ? <Typography variant="body2" className={styles.reportDetails}>{report.details}</Typography> : null}
          </div>
          {report.reporter_email ? (
            <div className={styles.privateBlock}>
              <Typography variant="overline" className={styles.detailLabel}>Private reporter contact</Typography>
              <Typography variant="body2">{report.reporter_email}</Typography>
            </div>
          ) : null}
          <TextField select label="Workflow status" value={status} onChange={(event) => setStatus(event.target.value)} disabled={!canModerate} fullWidth>
            {STATUSES.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
          </TextField>
          <TextField select label="Assigned administrator" value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} disabled={!canModerate} fullWidth>
            <MenuItem value="">Unassigned</MenuItem>
            {assignees.map((admin) => <MenuItem key={admin.id} value={admin.id}>{admin.displayName}</MenuItem>)}
          </TextField>
          <TextField label="Internal notes" value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} multiline minRows={3} disabled={!canModerate} inputProps={{ maxLength: 5000 }} helperText="Private. Never shown to the reporter." fullWidth />
          {requiresResolution ? (
            <TextField label="Resolution" value={resolution} onChange={(event) => setResolution(event.target.value)} multiline minRows={2} required disabled={!canModerate} inputProps={{ maxLength: 2000 }} helperText="Required when actioning, dismissing, or marking a duplicate." fullWidth />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} disabled={saving}>{canModerate ? "Cancel" : "Close"}</Button>
        {canModerate ? (
          <Button variant="contained" onClick={handleSave} disabled={saving} className={styles.primaryButton}>
            {saving ? "Saving…" : "Save report"}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

export default ContentReportDialog;
