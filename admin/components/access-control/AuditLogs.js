import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
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
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { accessControlApi } from "@/services/accessControlApi";
import { AuditStatsBanner } from "./AuditStatsBanner";
import styles from "./AuditLogs.module.css";

function getActionStyle(action = "") {
  const act = action.toLowerCase();
  if (act.includes("create") || act.includes("publish")) return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
  if (act.includes("delete") || act.includes("archive") || act.includes("revoke")) return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
  if (act.includes("update") || act.includes("edit") || act.includes("assign")) return { bg: "#FAF4EF", text: "#B46A2C", border: "#F2E4D6" };
  if (act.includes("auth") || act.includes("login") || act.includes("session")) return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
  return { bg: "#F8FAFC", text: "#475569", border: "#E2E8F0" };
}

export function AuditLogs() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [actor, setActor] = useState("");
  const [entityType, setEntityType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const result = await accessControlApi.listAuditLogs({
        page,
        limit: 20,
        action: action || undefined,
        actor: actor || undefined,
        entityType: entityType || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      });
      setItems(result.items || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err.message || "Unable to load audit logs.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const result = await accessControlApi.listAuditLogs({
        page,
        limit: 20,
        action: action || undefined,
        actor: actor || undefined,
        entityType: entityType || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
      });
      setItems(result.items || []);
      setPagination(result.pagination || {});
    } catch (err) {
      setError(err.message || "Unable to load audit logs.");
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
        const result = await accessControlApi.listAuditLogs({
          page,
          limit: 20,
          action: action || undefined,
          actor: actor || undefined,
          entityType: entityType || undefined,
          from: from ? new Date(from).toISOString() : undefined,
          to: to ? new Date(`${to}T23:59:59`).toISOString() : undefined,
        });
        if (requestId === requestIdRef.current) {
          setItems(result.items || []);
          setPagination(result.pagination || {});
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to filter audit logs.");
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
  }, [page, action, actor, entityType, from, to]);

  if (isInitialLoading) return <AdminLoadingState />;
  if (error && !items.length) {
    return (
      <Stack spacing={2}>
        <Typography color="error">{error}</Typography>
        <Button onClick={refresh}>Retry</Button>
      </Stack>
    );
  }

  const QUICK_ACTION_PILLS = [
    { label: "All Actions", value: "" },
    { label: "Create", value: "create" },
    { label: "Update", value: "update" },
    { label: "Delete / Revoke", value: "delete" },
    { label: "Authentication", value: "auth" },
  ];

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>Audit Logs &amp; Security Trail</Typography>
        <Typography variant="body1" className={styles.description}>
          Immutable record of administrative operations, content mutations, and privilege modifications across Royz House.
        </Typography>
      </Box>

      <AuditStatsBanner items={items} pagination={pagination || {}} />

      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersGrid}>
          <TextField
            size="small"
            placeholder="Search action..."
            label="Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className={styles.searchInput}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ color: "#9CA3AF", mr: 1 }} />,
              endAdornment: action ? (
                <IconButton size="small" onClick={() => setAction("")} aria-label="Clear action">
                  <ClearIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                </IconButton>
              ) : null,
            }}
          />
          <TextField
            size="small"
            label="Entity Type"
            placeholder="e.g. talent, event, blog"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className={styles.searchInput}
          />
          <TextField
            size="small"
            label="Actor User ID"
            placeholder="Admin UUID"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            className={styles.searchInput}
          />
          <TextField
            size="small"
            label="From Date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.searchInput}
          />
          <TextField
            size="small"
            label="To Date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.searchInput}
          />
        </Box>

        {/* Quick Filter Pills */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Action Filter Pills">
            {QUICK_ACTION_PILLS.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.quickPill} ${action === pill.value ? styles.quickPillActive : ""}`}
                onClick={() => setAction(pill.value)}
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
                  Showing <span className={styles.resultsCount}>{items.length}</span> of {pagination?.total || items.length} entries
                </>
              )}
            </span>
            {(action || actor || entityType || from || to) && (
              <Button
                size="small"
                startIcon={<FilterListOffIcon fontSize="small" />}
                onClick={() => {
                  setAction("");
                  setActor("");
                  setEntityType("");
                  setFrom("");
                  setTo("");
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
              <TableCell className={styles.tableHeadCell} style={{ width: "24%" }}>Action Performed</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "18%" }}>Target Entity</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "24%" }}>Entity UUID</TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "18%" }}>Actor</TableCell>
              <TableCell align="right" className={styles.tableHeadCell} style={{ width: "16%" }}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#6B7280" }}>
                  No audit logs recorded for this criteria.
                </TableCell>
              </TableRow>
            ) : (
              items.map((entry) => {
                const style = getActionStyle(entry.action);
                return (
                  <TableRow key={entry.id} hover className={styles.tableRow}>
                    <TableCell className={styles.tableCell}>
                      <span
                        className={styles.actionPill}
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        {entry.action}
                      </span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.entityBadge}>{entry.entityType || "entity"}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.mono}>{entry.entityId ? entry.entityId.slice(0, 16) : "—"}</span>
                    </TableCell>
                    <TableCell className={styles.tableCell}>
                      <span className={styles.actorPill}>
                        {entry.actorUserId ? entry.actorUserId.slice(0, 8) : "System Engine"}
                      </span>
                    </TableCell>
                    <TableCell align="right" className={styles.tableCell}>
                      <span className={styles.timestamp}>
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && pagination.totalPages > 1 ? (
        <Box className={styles.pagination}>
          <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </Button>
          <Typography variant="caption" color="text.secondary">
            Page {pagination.page} of {pagination.totalPages}
          </Typography>
          <Button size="small" variant="outlined" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
