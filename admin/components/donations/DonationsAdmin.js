import { useEffect, useRef, useState } from "react";
import { Box, Button, LinearProgress, Paper, Tab, Tabs, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { MediaPicker } from "@/components/content/MediaPicker";
import { donationsApi } from "@/services/donationsApi";
import { DonationsStatsBanner } from "./DonationsStatsBanner";
import { CampaignsTable } from "./CampaignsTable";
import { CampaignEditorDialog } from "./CampaignEditorDialog";
import { DonationRecordsTable } from "./DonationRecordsTable";
import { DonationNotesDialog } from "./DonationNotesDialog";
import { DonationPageSettingsEditor } from "./DonationPageSettingsEditor";
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

  // Dialogs & Modals
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [notesRecord, setNotesRecord] = useState(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [mediaPicker, setMediaPicker] = useState(null);

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
      setError(err.message || "Unable to refresh campaigns.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function refreshRecords() {
    setIsUpdating(true);
    try {
      const [data, totalsData] = await Promise.all([
        donationsApi.listRecords({ status: recordStatus, search }),
        donationsApi.totals(),
      ]);
      setRecords(data);
      setTotals(totalsData);
    } catch (err) {
      setError(err.message || "Unable to refresh records.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background filter debounce
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (filterDebounceTimerRef.current) clearTimeout(filterDebounceTimerRef.current);

    filterDebounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setIsUpdating(true);
      try {
        if (tab === 0) {
          const cData = await donationsApi.listCampaigns({ search, status });
          if (requestId === requestIdRef.current) setCampaigns(cData);
        } else if (tab === 1) {
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
        if (requestId === requestIdRef.current) setError(err.message || "Unable to filter data.");
      } finally {
        if (requestId === requestIdRef.current) setIsUpdating(false);
      }
    }, 250);

    return () => {
      if (filterDebounceTimerRef.current) clearTimeout(filterDebounceTimerRef.current);
    };
  }, [tab, search, status, recordStatus]);

  function handleOpenCreateCampaign() {
    setEditingCampaign({ ...EMPTY_CAMPAIGN });
    setCampaignDialogOpen(true);
  }

  function handleOpenEditCampaign(item) {
    const body = item.body || {};
    setEditingCampaign({
      ...EMPTY_CAMPAIGN,
      ...body,
      id: item.id,
      slug: item.slug,
      title: item.title,
      summary: item.summary || "",
      featured: item.featured,
      status: item.status,
    });
    setCampaignDialogOpen(true);
  }

  async function handleSaveCampaign(data) {
    setIsSavingCampaign(true);
    try {
      await donationsApi.saveCampaign(data, data?.id);
      setCampaignDialogOpen(false);
      await refreshCampaigns();
    } catch (err) {
      setError(err.message || "Unable to save campaign.");
    } finally {
      setIsSavingCampaign(false);
    }
  }

  async function handleArchiveCampaign(id) {
    if (!window.confirm("Are you sure you want to archive this giving campaign?")) return;
    try {
      await donationsApi.archiveCampaign(id);
      await refreshCampaigns();
    } catch (err) {
      setError(err.message || "Unable to archive campaign.");
    }
  }

  async function handleSaveNotes(id, notes) {
    setIsSavingNotes(true);
    try {
      await donationsApi.updateNotes(id, notes);
      setNotesRecord(null);
      await refreshRecords();
    } catch (err) {
      setError(err.message || "Unable to update internal notes.");
    } finally {
      setIsSavingNotes(false);
    }
  }

  async function handleExport() {
    try {
      const csvData = await donationsApi.exportCsv();
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to export patron records.");
    }
  }

  if (isInitialLoading) return <AdminLoadingState />;

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      {/* Executive Header */}
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
          {tab === 0 && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              className={styles.primaryButton}
              onClick={handleOpenCreateCampaign}
            >
              New Giving Campaign
            </Button>
          )}
          {tab === 1 && (
            <Button
              startIcon={<FileDownloadIcon />}
              variant="outlined"
              className={styles.outlineButton}
              onClick={handleExport}
            >
              Export Patron Records (CSV)
            </Button>
          )}
          {tab === 2 && (
            <Button
              component="a"
              href="http://localhost:3000/donate"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon fontSize="inherit" />}
              variant="outlined"
              className={styles.outlineButton}
            >
              View Live Donate Page
            </Button>
          )}
        </Box>
      </Box>

      {error ? (
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 3, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
        >
          {error}
        </Paper>
      ) : null}

      {/* Top Stats Banner */}
      <DonationsStatsBanner campaigns={campaigns} records={records} totals={totals} />

      {/* Primary Navigation Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className={styles.tabs}>
        <Tab
          icon={<VolunteerActivismOutlinedIcon fontSize="small" />}
          iconPosition="start"
          label={`Giving Campaigns (${campaigns.length})`}
        />
        <Tab
          icon={<ReceiptLongOutlinedIcon fontSize="small" />}
          iconPosition="start"
          label={`Donation Records (${records.length})`}
        />
        <Tab
          icon={<DashboardCustomizeOutlinedIcon fontSize="small" />}
          iconPosition="start"
          label="Donation Page Studio"
        />
      </Tabs>

      {/* Subtle update progress bar */}
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

      {/* Tab 0: Giving Campaigns Table */}
      {tab === 0 && (
        <CampaignsTable
          campaigns={campaigns}
          totals={totals}
          search={search}
          status={status}
          isUpdating={isUpdating}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onResetFilters={() => {
            setSearch("");
            setStatus("");
          }}
          onEdit={handleOpenEditCampaign}
          onArchive={handleArchiveCampaign}
        />
      )}

      {/* Tab 1: Donation Records Table */}
      {tab === 1 && (
        <DonationRecordsTable
          records={records}
          search={search}
          recordStatus={recordStatus}
          isUpdating={isUpdating}
          onSearchChange={setSearch}
          onStatusChange={setRecordStatus}
          onResetFilters={() => {
            setSearch("");
            setRecordStatus("");
          }}
          onOpenNotes={(record) => setNotesRecord(record)}
        />
      )}

      {/* Tab 2: Donation Page Studio */}
      {tab === 2 && (
        <DonationPageSettingsEditor
          onOpenMediaPicker={(onSelect) => setMediaPicker({ onSelect })}
        />
      )}

      {/* Campaign Create/Edit Modal Dialog with MediaField */}
      <CampaignEditorDialog
        open={campaignDialogOpen}
        campaign={editingCampaign}
        isSaving={isSavingCampaign}
        onClose={() => setCampaignDialogOpen(false)}
        onSave={handleSaveCampaign}
        onOpenMediaPicker={(onSelect) => setMediaPicker({ onSelect })}
      />

      {/* Staff Internal Notes Modal */}
      <DonationNotesDialog
        open={Boolean(notesRecord)}
        record={notesRecord}
        isSaving={isSavingNotes}
        onClose={() => setNotesRecord(null)}
        onSave={handleSaveNotes}
      />

      {/* Media Picker Modal */}
      {mediaPicker && (
        <MediaPicker
          open={Boolean(mediaPicker)}
          onClose={() => setMediaPicker(null)}
          onSelect={(asset) => {
            if (mediaPicker.onSelect && asset?.url) {
              mediaPicker.onSelect(asset.url);
            }
            setMediaPicker(null);
          }}
        />
      )}
    </Box>
  );
}
