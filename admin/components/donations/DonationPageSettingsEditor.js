import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { DEFAULT_DONATION_PAGE_CONTENT } from "@/constants/donationPage";
import { donationsApi } from "@/services/donationsApi";
import { MediaField } from "@/components/content/MediaField";
import styles from "./DonationPageSettingsEditor.module.css";

const EDITOR_TABS = [
  "Hero & Headline",
  "Giving Parameters",
  "Review & Trust",
  "Receipt & Impact",
  "SEO & Social Share",
];

export function DonationPageSettingsEditor({ onSaved, onOpenMediaPicker }) {
  const [settings, setSettings] = useState(DEFAULT_DONATION_PAGE_CONTENT);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newPreset, setNewPreset] = useState("");

  useEffect(() => {
    donationsApi
      .getPageSettings()
      .then((record) => {
        if (record && record.content) {
          setSettings((current) => ({
            ...current,
            seo: { ...(current.seo || {}), ...(record.content.seo || {}) },
            hero: { ...(current.hero || {}), ...(record.content.hero || {}) },
            giving: {
              ...(current.giving || {}),
              ...(record.content.giving || {}),
              presetAmounts:
                record.content.giving?.presetAmounts || current.giving?.presetAmounts || [],
            },
            review: { ...(current.review || {}), ...(record.content.review || {}) },
            confirmation: {
              ...(current.confirmation || {}),
              ...(record.content.confirmation || {}),
            },
          }));
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load Donation Page studio settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateSection = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
    setSuccessMessage(null);
  };

  const handleAddPreset = () => {
    const val = Number(newPreset.replace(/[^0-9]/g, ""));
    if (!val || val <= 0) return;
    const current = settings.giving?.presetAmounts || [];
    if (!current.includes(val)) {
      updateSection("giving", "presetAmounts", [...current, val].sort((a, b) => a - b));
    }
    setNewPreset("");
  };

  const handleRemovePreset = (val) => {
    const current = settings.giving?.presetAmounts || [];
    updateSection(
      "giving",
      "presetAmounts",
      current.filter((item) => item !== val)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await donationsApi.updatePageSettings({
        slug: "donation-page",
        title: "Donation page",
        summary: settings.hero?.description || "Public donation page configuration",
        content: settings,
        status: "published",
      });
      setSuccessMessage("Donation page settings saved and published successfully!");
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.message || "Failed to save donation page studio settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper elevation={0} className={styles.container}>
        <Box sx={{ p: 4, textAlign: "center", color: "#64748B" }}>
          Loading Donation Page Studio…
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className={styles.container}>
      {/* Studio Header */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h6" className={styles.title}>
            Donation Page Studio
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            Control headlines, banner images, preset giving amounts, and trust assurances on the public donation page.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? "Saving…" : "Publish Page"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Navigation Sub-Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        className={styles.tabs}
        variant="scrollable"
        scrollButtons="auto"
      >
        {EDITOR_TABS.map((label, idx) => (
          <Tab key={label} label={label} id={`donation-studio-tab-${idx}`} />
        ))}
      </Tabs>
      <Divider />

      <Box className={styles.tabPanel}>
        {/* ── Tab 0: Hero & Headline ── */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Hero Banner &amp; Headline
              </Typography>
              <Typography variant="caption" color="text.secondary">
                The split hero displayed at the very top of the donation portal.
              </Typography>
            </Box>

            <TextField
              size="small"
              label="Eyebrow Pill Badge"
              value={settings.hero?.badge || ""}
              onChange={(e) => updateSection("hero", "badge", e.target.value)}
              placeholder="e.g. DONATION"
              helperText="Small pill label above the main headline"
            />

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                label="Headline Lead Part"
                value={settings.hero?.headlinePart1 || ""}
                onChange={(e) => updateSection("hero", "headlinePart1", e.target.value)}
                placeholder="TOGETHER WE CAN CREATE"
              />
              <TextField
                fullWidth
                size="small"
                label="Copper Accent Word 1"
                value={settings.hero?.headlineAccent1 || ""}
                onChange={(e) => updateSection("hero", "headlineAccent1", e.target.value)}
                placeholder="OPPORTUNITIES"
                helperText="Rendered in branded copper/gold accent"
              />
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                label="Headline Bridge Part"
                value={settings.hero?.headlinePart2 || ""}
                onChange={(e) => updateSection("hero", "headlinePart2", e.target.value)}
                placeholder="& CHANGE"
              />
              <TextField
                fullWidth
                size="small"
                label="Copper Accent Word 2"
                value={settings.hero?.headlineAccent2 || ""}
                onChange={(e) => updateSection("hero", "headlineAccent2", e.target.value)}
                placeholder="LIVES"
                helperText="Rendered in branded copper/gold accent"
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Mission Supporting Paragraph"
              value={settings.hero?.description || ""}
              onChange={(e) => updateSection("hero", "description", e.target.value)}
              multiline
              minRows={3}
              placeholder="Your support empowers talents, creates opportunities..."
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1E293B" }}>
                Hero Right-Bleed Banner Image
              </Typography>
              <MediaField
                label="Hero Image URL"
                value={settings.hero?.image || ""}
                mediaType="image"
                onChange={(url) => updateSection("hero", "image", url)}
                onBrowseLibrary={
                  onOpenMediaPicker
                    ? () => onOpenMediaPicker((url) => updateSection("hero", "image", url))
                    : undefined
                }
                helperText="Recommended dimension: 1200x900px or high-resolution photograph"
                previewHeight={220}
              />
            </Box>
          </Stack>
        )}

        {/* ── Tab 1: Giving Parameters ── */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Giving Parameters &amp; Presets
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Configure giving options, preset buttons, and security guarantees for donors.
              </Typography>
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                label="Giving Form Title"
                value={settings.giving?.title || ""}
                onChange={(e) => updateSection("giving", "title", e.target.value)}
                placeholder="Make A Donation"
              />
              <TextField
                fullWidth
                size="small"
                label="Giving Form Subtitle"
                value={settings.giving?.subtitle || ""}
                onChange={(e) => updateSection("giving", "subtitle", e.target.value)}
                placeholder="Choose how you would like to give."
              />
            </Box>

            {/* Preset Amounts Editor */}
            <Box className={styles.presetEditorCard}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Preset Donation Amounts (₦)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                These amounts appear as quick selection buttons on the donation form.
              </Typography>

              <Box className={styles.presetChipsWrap}>
                {(settings.giving?.presetAmounts || []).map((amt) => (
                  <Chip
                    key={amt}
                    label={`₦${amt.toLocaleString()}`}
                    onDelete={() => handleRemovePreset(amt)}
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderColor: "#F2E4D6",
                      bgcolor: "#FDF4EC",
                      color: "#B46A2C",
                      "& .MuiChip-deleteIcon": { color: "#B46A2C" },
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: 2 }}>
                <TextField
                  size="small"
                  type="number"
                  placeholder="e.g. 50000"
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value)}
                  sx={{ width: 180 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddPreset}
                  sx={{ borderColor: "#CBD5E1", color: "#334155" }}
                >
                  Add Preset
                </Button>
              </Box>
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Default Selected Amount (₦)"
                value={settings.giving?.defaultAmount || ""}
                onChange={(e) =>
                  updateSection("giving", "defaultAmount", Number(e.target.value) || 0)
                }
                placeholder="25000"
              />
              <TextField
                fullWidth
                size="small"
                label="Currency Symbol"
                value={settings.giving?.currencySymbol || "₦"}
                onChange={(e) => updateSection("giving", "currencySymbol", e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Security Guarantee Note"
              value={settings.giving?.securityNote || ""}
              onChange={(e) => updateSection("giving", "securityNote", e.target.value)}
              placeholder="Your donation is secured and encrypted."
            />
          </Stack>
        )}

        {/* ── Tab 2: Review & Trust ── */}
        {activeTab === 2 && (
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Review &amp; Trust Assurances
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Headings and security assurances displayed on Step 2 of the donor review flow.
              </Typography>
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                label="Review Step Title"
                value={settings.review?.title || ""}
                onChange={(e) => updateSection("review", "title", e.target.value)}
                placeholder="Review Your Donation"
              />
              <TextField
                fullWidth
                size="small"
                label="Review Step Subtitle"
                value={settings.review?.subtitle || ""}
                onChange={(e) => updateSection("review", "subtitle", e.target.value)}
                placeholder="Please confirm your donation details before proceeding."
              />
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                label="Security Trust Card Title"
                value={settings.review?.trustTitle || ""}
                onChange={(e) => updateSection("review", "trustTitle", e.target.value)}
                placeholder="Your Donation is Secured"
              />
              <TextField
                fullWidth
                size="small"
                label="Pending Verification Status Notice"
                value={settings.review?.pendingNotice || ""}
                onChange={(e) => updateSection("review", "pendingNotice", e.target.value)}
                placeholder="Your request will remain pending until payment is verified."
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Trust Guarantee Description"
              value={settings.review?.trustDescription || ""}
              onChange={(e) => updateSection("review", "trustDescription", e.target.value)}
              multiline
              minRows={2}
              placeholder="We use industry-standard security and paystack to process your payment safely."
            />
          </Stack>
        )}

        {/* ── Tab 3: Receipt & Impact ── */}
        {activeTab === 3 && (
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Receipt &amp; Thank You Confirmation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Displayed after a donor submits their contribution request.
              </Typography>
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                size="small"
                label="Confirmation Badge"
                value={settings.confirmation?.badge || ""}
                onChange={(e) => updateSection("confirmation", "badge", e.target.value)}
                placeholder="Donation Request Received"
              />
              <TextField
                fullWidth
                size="small"
                label="Thank You Title"
                value={settings.confirmation?.title || ""}
                onChange={(e) => updateSection("confirmation", "title", e.target.value)}
                placeholder="Thank You for Your Generosity!"
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Confirmation Subtitle"
              value={settings.confirmation?.subtitle || ""}
              onChange={(e) => updateSection("confirmation", "subtitle", e.target.value)}
              multiline
              minRows={2}
              placeholder="Your donation request is pending payment verification..."
            />

            <TextField
              fullWidth
              size="small"
              label="Impact Commitment Explanation"
              value={settings.confirmation?.impactText || ""}
              onChange={(e) => updateSection("confirmation", "impactText", e.target.value)}
              multiline
              minRows={3}
              placeholder="100% of your contribution goes directly towards equipment, training programs..."
            />

            <TextField
              fullWidth
              size="small"
              label="Verification Disclaimer"
              value={settings.confirmation?.disclaimer || ""}
              onChange={(e) => updateSection("confirmation", "disclaimer", e.target.value)}
              placeholder="Payment is not confirmed until it has been verified by Royz House."
            />
          </Stack>
        )}

        {/* ── Tab 4: SEO & Social Share ── */}
        {activeTab === 4 && (
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                SEO &amp; Social Graph Metadata
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Search engine titles, meta descriptions, and social preview cards for /donate.
              </Typography>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Search Engine Page Title"
              value={settings.seo?.title || ""}
              onChange={(e) => updateSection("seo", "title", e.target.value)}
              placeholder="Donate & Empower African Creatives — Royz House"
            />

            <TextField
              fullWidth
              size="small"
              label="Meta Description"
              value={settings.seo?.description || ""}
              onChange={(e) => updateSection("seo", "description", e.target.value)}
              multiline
              minRows={3}
              placeholder="Together we can create opportunities and change lives..."
            />

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1E293B" }}>
                OpenGraph Social Preview Image
              </Typography>
              <MediaField
                label="Social Share Banner"
                value={settings.seo?.ogImage || ""}
                mediaType="image"
                onChange={(url) => updateSection("seo", "ogImage", url)}
                onBrowseLibrary={
                  onOpenMediaPicker
                    ? () => onOpenMediaPicker((url) => updateSection("seo", "ogImage", url))
                    : undefined
                }
                helperText="Recommended 1200x630px image displayed when sharing on X, WhatsApp, LinkedIn"
                previewHeight={180}
              />
            </Box>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
