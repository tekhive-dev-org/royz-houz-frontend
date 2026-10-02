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
import { AdminTablePagination, useTablePagination } from "@/components/pagination";
import styles from "./DonationRecordsTable.module.css";

const RECORD_STATUS_PILLS = [
  { label: "All Records", value: "" },
  { label: "Approved", value: "approved" },
  { label: "Pending", value: "pending" },
  { label: "Rejected", value: "rejected" },
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
  const { paginatedItems, paginationProps } = useTablePagination(records, {
    initialPageSize: 10,
    itemLabel: "donations",
  });
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
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
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
                Contribution Amount (₦)
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
              paginatedItems.map((r) => {
                const donorName = r.donor_name || r.donorName || "Anonymous Patron";
                const donorEmail = r.donor_email || r.donorEmail || "No email";
                const donorPhone = r.donor_phone || r.donorPhone;
                const internalNotes = r.internal_notes || r.internalNotes;
                const isApproved = r.status === "approved" || r.status === "completed";
                const initial = donorName.charAt(0).toUpperCase();

                return (
                  <TableRow key={r.id} hover className={styles.tableRow}>
                    {/* Donor Details */}
                    <TableCell className={styles.tableCell}>
                      <div className={styles.donorCell}>
                        <div className={styles.donorAvatar}>{initial}</div>
                        <div className={styles.donorMeta}>
                          <span className={styles.donorName}>{donorName}</span>
                          <span className={styles.donorEmail}>
                            {donorEmail}
                            {donorPhone ? ` · ${donorPhone}` : ""}
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
                          isApproved
                            ? "published"
                            : r.status === "pending"
                            ? "draft"
                            : "archived"
                        }
                        label={
                          isApproved
                            ? "Approved"
                            : r.status === "pending"
                            ? "Pending"
                            : "Rejected"
                        }
                      />
                    </TableCell>

                    {/* Internal Notes */}
                    <TableCell align="right" className={styles.tableCell}>
                      <Tooltip
                        title={
                          internalNotes ? `Notes: ${internalNotes}` : "Add staff note"
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => onOpenNotes(r)}
                          className={`${styles.notesBtn} ${
                            internalNotes ? styles.notesBtnActive : ""
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
      <AdminTablePagination {...paginationProps} />
    </Box>
  );
}
