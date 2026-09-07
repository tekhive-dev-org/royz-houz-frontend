import { useEffect, useRef, useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { StatusChip } from "@/components/settings/StatusChip";
import { paymentsApi } from "@/services/paymentsApi";

const statuses = ["", "paid", "pending", "failed", "cancelled"];
const money = (value) => `₦${(Number(value || 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
const statusLabel = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "All payments";

export function PaymentsAdmin() {
  const [items, setItems] = useState([]); const [pagination, setPagination] = useState(null); const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [selected, setSelected] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const timer = useRef(null);
  async function load() { try { setError(""); const result = await paymentsApi.list({ page, limit: 15, search, status }); setItems(result.items); setPagination(result.pagination); } catch (err) { setError(err.message); } finally { setLoading(false); } }
  useEffect(() => { void load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);
  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => void load(), 250); return () => clearTimeout(timer.current); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  useEffect(() => { const refresh = (event) => { if (event.detail?.table === "event_ticket_orders") void load(); }; window.addEventListener("royz:admin-realtime", refresh); return () => window.removeEventListener("royz:admin-realtime", refresh); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);
  async function openPayment(id) { try { setSelected(await paymentsApi.get(id)); } catch (err) { setError(err.message); } }
  async function exportCsv() { const csv = await paymentsApi.exportCsv(status); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); const link = document.createElement("a"); link.href = url; link.download = "ticket-payments.csv"; link.click(); URL.revokeObjectURL(url); }
  if (loading) return <AdminLoadingState />;
  return <Box sx={{ p: { xs: 2, md: 4 } }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 3, flexWrap: "wrap" }}><Box><Typography variant="h4" fontWeight={800}>Ticket payments</Typography><Typography color="text.secondary">Review Paystack orders, ticket sales, and payment confirmations.</Typography></Box><Button startIcon={<FileDownloadIcon />} variant="outlined" onClick={exportCsv}>Export CSV</Button></Box>
    {error && <Paper sx={{ p: 2, mb: 2, color: "#B42318" }}>{error}</Paper>}
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}><TextField size="small" placeholder="Search reference or ticket tier" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} /> }} /><TextField select size="small" label="Status" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} sx={{ minWidth: 160 }}>{statuses.map((value) => <MenuItem key={value || "all"} value={value}>{statusLabel(value)}</MenuItem>)}</TextField></Box>
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}><Table sx={{ minWidth: 1100, "& .MuiTableCell-root": { whiteSpace: "nowrap" } }}><TableHead><TableRow><TableCell>Reference</TableCell><TableCell>Customer</TableCell><TableCell>Event / Ticket</TableCell><TableCell>Qty</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell><TableCell /></TableRow></TableHead><TableBody>{items.length ? items.map((item) => <TableRow hover key={item.id}><TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{item.reference}</TableCell><TableCell><strong>{[item.customer?.firstName, item.customer?.lastName].filter(Boolean).join(" ") || "—"}</strong><br /><Typography variant="caption">{item.customer?.email || "—"}</Typography></TableCell><TableCell>{item.events?.title || "—"}<br /><Typography variant="caption">{item.tier_name}</Typography></TableCell><TableCell>{item.quantity}</TableCell><TableCell>{money(item.amount_kobo)}</TableCell><TableCell><StatusChip status={item.status === "paid" ? "published" : item.status === "failed" ? "archived" : "draft"} label={item.status} /></TableCell><TableCell>{new Date(item.created_at).toLocaleDateString("en-NG")}</TableCell><TableCell><IconButton aria-label="View payment" onClick={() => openPayment(item.id)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></TableCell></TableRow>) : <TableRow><TableCell colSpan={8} align="center">No ticket payments found.</TableCell></TableRow>}</TableBody></Table></TableContainer>
    {pagination?.pages > 1 && <Box sx={{ display: "flex", justifyContent: "center", gap: 2, p: 2 }}><Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Typography sx={{ pt: 1 }}>Page {page} of {pagination.pages}</Typography><Button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button></Box>}
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>Payment details<IconButton onClick={() => setSelected(null)} sx={{ float: "right" }}><CloseIcon /></IconButton></DialogTitle><DialogContent dividers>{selected && <Box sx={{ display: "grid", gap: 1.5 }}><Typography><strong>Reference:</strong> {selected.reference}</Typography><Typography><strong>Paystack transaction:</strong> {selected.paystack_transaction_id || "Not assigned"}</Typography><Typography><strong>Event:</strong> {selected.events?.title || "—"}</Typography><Typography><strong>Ticket:</strong> {selected.tier_name} × {selected.quantity}</Typography><Typography><strong>Amount:</strong> {money(selected.amount_kobo)}</Typography><Typography><strong>Status:</strong> {selected.status}</Typography><Typography><strong>Customer:</strong> {selected.customer?.firstName} {selected.customer?.lastName} · {selected.customer?.email} · {selected.customer?.phone}</Typography><Typography><strong>Created:</strong> {new Date(selected.created_at).toLocaleString("en-NG")}</Typography><Typography><strong>Paid:</strong> {selected.paid_at ? new Date(selected.paid_at).toLocaleString("en-NG") : "—"}</Typography></Box>}</DialogContent></Dialog>
  </Box>;
}
