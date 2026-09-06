import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import styles from "./DonationRecordsTable.module.css";

const RECORD_STATUS_PILLS = [
  { label: "All Records", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
];

export function DonationRecordsTable({
  records = [],
  search = "",
  recordStatus = "",
  isUpdating = false,
  onSearchChange,
  onStatusChange,
  onResetFilters,
  onOpenNotes,
}) {
  return (
    <Box className={styles.wrapper}>
      {/* Controls Bar */}
      <Box className={styles.controlsBar}>
        <Box className={styles.filtersRow}>
          <TextField
            size="small"
            placeholder="Search donor name, email, or transaction reference..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <SearchIcon fontSize="small" sx={{ color: "#9CA3AF", mr: 1 }} />
              ),
              endAdornment: search ? (
                <IconButton
                  size="small"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                >
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
            onChange={(e) => onStatusChange(e.target.value)}
            className={styles.filterControl}
          >
            <MenuItem value="">All Records</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>

        {/* Quick Pills & Results Meta */}
        <Box className={styles.quickFiltersRow}>
          <Box className={styles.quickPills} role="group" aria-label="Record Status Filter">
            {RECORD_STATUS_PILLS.map((pill) => (
              <button
                key={pill.value}
                type="button"
                className={`${styles.quickPill} ${
                  recordStatus === pill.value ? styles.quickPillActive : ""
                }`}
                onClick={() => onStatusChange(pill.value)}
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
                onClick={onResetFilters}
                className={styles.resetFiltersBtn}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Table Container */}
      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table} size="medium">
          <TableHead>
            <TableRow className={styles.tableHeadRow}>
              <TableCell className={styles.tableHeadCell} style={{ width: "30%" }}>
                Donor &amp; Contact
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>
                Contribution Amount
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "14%" }}>
                Frequency
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "18%" }}>
                Reference Tag
              </TableCell>
              <TableCell className={styles.tableHeadCell} style={{ width: "12%" }}>
                Status
              </TableCell>
              <TableCell align="right" className={styles.tableHeadCell} style={{ width: "10%" }}>
                Notes
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className={styles.emptyCell}>
                  <div className={styles.emptyWrap}>
                    <ReceiptLongOutlinedIcon className={styles.emptyIcon} />
                    <p className={styles.emptyText}>No donation records found matching your query.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => {
                const initial = (r.donorName || "D").charAt(0).toUpperCase();

                return (
                  <TableRow key={r.id} hover className={styles.tableRow}>
                    {/* Donor Details */}
                    <TableCell className={styles.tableCell}>
                      <div className={styles.donorCell}>
                        <div className={styles.donorAvatar}>{initial}</div>
                        <div className={styles.donorMeta}>
                          <span className={styles.donorName}>
                            {r.donorName || "Anonymous Patron"}
                          </span>
                          <span className={styles.donorEmail}>
                            {r.donorEmail || "No email"}
                            {r.donorPhone ? ` · ${r.donorPhone}` : ""}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Amount Badge */}
                    <TableCell className={styles.tableCell}>
                      <span className={styles.amountBadge}>
                        ₦{Number(r.amount || 0).toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Frequency */}
                    <TableCell className={styles.tableCell}>
                      <span className={styles.frequencyTag}>
                        {r.frequency || "one-time"}
                      </span>
                    </TableCell>

                    {/* Reference */}
                    <TableCell className={styles.tableCell}>
                      <code className={styles.referenceCode}>{r.reference || "—"}</code>
                    </TableCell>

                    {/* Status */}
                    <TableCell className={styles.tableCell}>
                      <StatusChip
                        status={
                          r.status === "completed"
                            ? "published"
                            : r.status === "pending"
                            ? "draft"
                            : "archived"
                        }
                      />
                    </TableCell>

                    {/* Internal Notes */}
                    <TableCell align="right" className={styles.tableCell}>
                      <Tooltip
                        title={
                          r.internalNotes ? `Notes: ${r.internalNotes}` : "Add staff note"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => onOpenNotes(r)}
                          className={`${styles.notesBtn} ${
                            r.internalNotes ? styles.notesBtnActive : ""
                          }`}
                          aria-label="Staff notes"
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
    </Box>
  );
}
