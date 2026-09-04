import { useEffect, useState } from "react";
import { Alert, Box, Button, MenuItem, Paper, Snackbar, Tab, Tabs, TextField, Typography } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { newsletterApi } from "@/services/newsletterApi";
import styles from "./NewsletterAdmin.module.css";

export function NewsletterAdmin() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("subscribed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() {
    setError(null);
    try { setItems(await newsletterApi.list({ search, status })); } catch (err) { setError(err.message || "Unable to load subscribers."); } finally { setLoading(false); }
  }

  // load is intentionally scoped to this component's current filters.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [search, status]);
  useEffect(() => {
    const handleRealtime = (event) => { if (event.detail?.table === "newsletter_subscriptions") void load(); };
    window.addEventListener("royz:admin-realtime", handleRealtime);
    return () => window.removeEventListener("royz:admin-realtime", handleRealtime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function updateStatus(item) {
    try { await newsletterApi.update({ id: item.id, status: item.status === "subscribed" ? "unsubscribed" : "subscribed" }); setToast("Subscriber status updated."); await load(); } catch (err) { setError(err.message || "Unable to update subscriber."); }
  }

  async function exportCsv() {
    try {
      const csv = await newsletterApi.exportCsv({ status });
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const link = document.createElement("a"); link.href = url; link.download = "newsletter-subscriptions.csv"; link.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.message || "Unable to export subscribers."); }
  }

  if (loading) return <AdminLoadingState />;
  return <Box className={`${styles.container} animate-fade-in`}>
    <Box className={styles.header}><Box><Typography variant="h4" className={styles.title}>Newsletter Subscribers</Typography><Typography className={styles.description}>Manage the audience collected from the website newsletter forms.</Typography></Box><Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={exportCsv}>Export CSV</Button></Box>
    {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}
    <Paper className={styles.stats} variant="outlined"><MailOutlineIcon /><Box><Typography variant="caption">Subscribers shown</Typography><Typography variant="h5" fontWeight={800}>{items.length}</Typography></Box></Paper>
    <Tabs value={status} onChange={(_, value) => setStatus(value)} sx={{ mb: 2 }}><Tab value="subscribed" label="Subscribed" /><Tab value="unsubscribed" label="Unsubscribed" /></Tabs>
    <Paper className={styles.filters} variant="outlined"><TextField fullWidth size="small" label="Search email" value={search} onChange={(e) => setSearch(e.target.value)} /><TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><MenuItem value="subscribed">Subscribed</MenuItem><MenuItem value="unsubscribed">Unsubscribed</MenuItem></TextField></Paper>
    <Paper className={styles.table} variant="outlined"><Box className={styles.tableHeader}><span>Email</span><span>Source</span><span>Subscribed</span><span>Action</span></Box>{items.length ? items.map((item) => <Box className={styles.row} key={item.id}><Box><Typography fontWeight={700}>{item.email}</Typography><Typography variant="caption" color="text.secondary">{item.id}</Typography></Box><Typography variant="body2">{item.source || "website"}</Typography><Typography variant="body2">{item.subscribed_at ? new Date(item.subscribed_at).toLocaleDateString() : "—"}</Typography><Button size="small" onClick={() => updateStatus(item)}>{item.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}</Button></Box>) : <Box className={styles.empty}><Typography>No newsletter subscribers found.</Typography></Box>}</Paper>
    <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast(null)}><Alert severity="success">{toast}</Alert></Snackbar>
  </Box>;
}

export default NewsletterAdmin;
