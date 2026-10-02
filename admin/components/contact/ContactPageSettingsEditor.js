import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { DEFAULT_CONTACT_PAGE_CONTENT } from "@/constants/contactPage";
import { contactPageApi } from "@/services/contactPageApi";
import { MediaField } from "@/components/content/MediaField";
import styles from "./ContactPageSettingsEditor.module.css";

const EDITOR_TABS = [
  "Hero & Header",
  "Inquiry Form",
  "Headquarters & Map",
  "FAQs",
  "Talent CTA",
  "SEO & Social",
];

export function ContactPageSettingsEditor({ onSaved, onOpenMediaPicker }) {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_PAGE_CONTENT);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    contactPageApi
      .getPageSettings()
      .then((record) => {
        if (record && record.content) {
          setSettings((current) => ({
            ...current,
            seo: { ...(current.seo || {}), ...(record.content.seo || {}) },
            hero: { ...(current.hero || {}), ...(record.content.hero || {}) },
            info: {
              ...(current.info || {}),
              ...(record.content.info || {}),
              reasons: record.content.info?.reasons || current.info?.reasons || [],
            },
            map: { ...(current.map || {}), ...(record.content.map || {}) },
            faq: {
              ...(current.faq || {}),
              ...(record.content.faq || {}),
              items: record.content.faq?.items || current.faq?.items || [],
            },
            cta: { ...(current.cta || {}), ...(record.content.cta || {}) },
          }));
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load Contact Page studio settings.");
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

  const handleAddReason = () => {
    const val = newReason.trim();
    if (!val) return;
    const current = settings.info?.reasons || [];
    if (!current.includes(val)) {
      updateSection("info", "reasons", [...current, val]);
    }
    setNewReason("");
  };

  const handleRemoveReason = (val) => {
    const current = settings.info?.reasons || [];
    updateSection(
      "info",
      "reasons",
      current.filter((item) => item !== val)
    );
  };

  const handleAddFaq = () => {
    const current = settings.faq?.items || [];
    updateSection("faq", "items", [
      ...current,
      { question: "New Question?", answer: "Answer description goes here." },
    ]);
  };

  const handleUpdateFaq = (index, field, value) => {
    const current = [...(settings.faq?.items || [])];
    current[index] = { ...current[index], [field]: value };
    updateSection("faq", "items", current);
  };

  const handleRemoveFaq = (index) => {
    const current = (settings.faq?.items || []).filter((_, idx) => idx !== index);
    updateSection("faq", "items", current);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await contactPageApi.updatePageSettings({
        slug: "contact-page",
        title: "Contact page",
        summary: "Public contact page settings and content",
        content: settings,
        status: "published",
      });
      setSuccessMessage("Contact page content updated and published live.");
      if (onSaved) onSaved(settings);
    } catch (err) {
      setError(err.message || "Failed to save Contact Page settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">Loading Contact Page Studio...</Typography>
      </Box>
    );
  }

  return (
    <Paper className={styles.container}>
      {/* Studio Header */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h6" className={styles.title}>
            Contact Page Studio
          </Typography>
          <Typography variant="body2" className={styles.subtitle}>
            Control and customize headlines, inquiry categories, office locations, FAQs, and calls-to-action.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? "Publishing..." : "Publish Changes"}
        </Button>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        className={styles.tabs}
      >
        {EDITOR_TABS.map((tabLabel, idx) => (
          <Tab key={tabLabel} label={tabLabel} id={`contact-tab-${idx}`} />
        ))}
      </Tabs>

      {/* ── TAB 0: Hero & Header ───────────────────────── */}
      {activeTab === 0 && (
        <Box className={styles.tabPanel}>
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Hero Header Section
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure the top welcoming banner and supporting imagery.
              </Typography>
            </Box>

            <TextField
              label="Pill Badge Label"
              size="small"
              value={settings.hero?.badge || ""}
              onChange={(e) => updateSection("hero", "badge", e.target.value)}
              placeholder="e.g. GET IN TOUCH"
              fullWidth
            />

            <Box className={styles.row}>
              <TextField
                label="Headline (Dark Part)"
                size="small"
                value={settings.hero?.headlinePart1 || ""}
                onChange={(e) => updateSection("hero", "headlinePart1", e.target.value)}
                placeholder="e.g. LET'S START A"
                fullWidth
              />
              <TextField
                label="Headline (Accent / Gold Part)"
                size="small"
                value={settings.hero?.headlineAccent || ""}
                onChange={(e) => updateSection("hero", "headlineAccent", e.target.value)}
                placeholder="e.g. CONVERSATION"
                fullWidth
              />
            </Box>

            <TextField
              label="Hero Subtitle / Description"
              size="small"
              multiline
              minRows={3}
              value={settings.hero?.description || ""}
              onChange={(e) => updateSection("hero", "description", e.target.value)}
              fullWidth
            />

            <MediaField
              label="Hero Right Photo"
              value={settings.hero?.image || ""}
              mediaType="image"
              onChange={(url) => updateSection("hero", "image", url)}
              onBrowseLibrary={
                onOpenMediaPicker
                  ? () => onOpenMediaPicker((url) => updateSection("hero", "image", url))
                  : undefined
              }
              helperText="Full-bleed team or operations photography displayed on the right."
              previewHeight={180}
            />
          </Stack>
        </Box>
      )}

      {/* ── TAB 1: Inquiry Form ────────────────────────── */}
      {activeTab === 1 && (
        <Box className={styles.tabPanel}>
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Inquiry Form &amp; Reasons
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customize the form title and selectable contact reasons available to visitors.
              </Typography>
            </Box>

            <Box className={styles.row}>
              <TextField
                label="Form Section Badge"
                size="small"
                value={settings.info?.badge || ""}
                onChange={(e) => updateSection("info", "badge", e.target.value)}
                placeholder="e.g. SEND A MESSAGE"
                fullWidth
              />
              <TextField
                label="Form Heading"
                size="small"
                value={settings.info?.title || ""}
                onChange={(e) => updateSection("info", "title", e.target.value)}
                placeholder="e.g. We'd Love To Hear From You"
                fullWidth
              />
            </Box>

            <TextField
              label="Form Subtitle"
              size="small"
              value={settings.info?.subtitle || ""}
              onChange={(e) => updateSection("info", "subtitle", e.target.value)}
              placeholder="e.g. Fill out the form below and our team will get back to you within 24 hours."
              fullWidth
            />

            <Divider />

            <Box className={styles.card}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Contact Reasons Dropdown Options
              </Typography>
              <Box className={styles.chipsWrap} sx={{ mb: 2 }}>
                {(settings.info?.reasons || []).map((reason) => (
                  <Chip
                    key={reason}
                    label={reason}
                    onDelete={() => handleRemoveReason(reason)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ display: "flex", gap: 1, maxWidth: 440 }}>
                <TextField
                  size="small"
                  label="Add Reason"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="e.g. Sponsorship"
                  fullWidth
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddReason}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Stack>
        </Box>
      )}

      {/* ── TAB 2: Headquarters & Map ──────────────────── */}
      {activeTab === 2 && (
        <Box className={styles.tabPanel}>
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Headquarters &amp; Interactive Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure physical office addresses, operating hours, directions link, and embedded map.
              </Typography>
            </Box>

            <Box className={styles.row}>
              <TextField
                label="Eyebrow Tag"
                size="small"
                value={settings.map?.eyebrow || ""}
                onChange={(e) => updateSection("map", "eyebrow", e.target.value)}
                placeholder="e.g. COME VISIT US"
                fullWidth
              />
              <TextField
                label="Section Heading"
                size="small"
                value={settings.map?.heading || ""}
                onChange={(e) => updateSection("map", "heading", e.target.value)}
                placeholder="e.g. Our Headquarters"
                fullWidth
              />
            </Box>

            <TextField
              label="Description"
              size="small"
              multiline
              minRows={2}
              value={settings.map?.description || ""}
              onChange={(e) => updateSection("map", "description", e.target.value)}
              fullWidth
            />

            <Box className={styles.row}>
              <TextField
                label="HQ Facility Title"
                size="small"
                value={settings.map?.hqTitle || ""}
                onChange={(e) => updateSection("map", "hqTitle", e.target.value)}
                placeholder="e.g. Royz Houz Headquarters"
                fullWidth
              />
              <TextField
                label="Physical Address"
                size="small"
                value={settings.map?.address || ""}
                onChange={(e) => updateSection("map", "address", e.target.value)}
                placeholder="e.g. 14 Coste Avenue, Lekki Phase 2, Lagos, Nigeria"
                fullWidth
              />
            </Box>

            <Box className={styles.row}>
              <TextField
                label="Operating Hours"
                size="small"
                value={settings.map?.hours || ""}
                onChange={(e) => updateSection("map", "hours", e.target.value)}
                placeholder="e.g. Monday – Friday: 9:00 AM – 6:00 PM"
                fullWidth
              />
              <TextField
                label="Google Maps Directions URL"
                size="small"
                value={settings.map?.directionsUrl || ""}
                onChange={(e) => updateSection("map", "directionsUrl", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                fullWidth
              />
            </Box>

            <TextField
              label="Google Maps Embed Iframe URL (src)"
              size="small"
              multiline
              minRows={2}
              value={settings.map?.mapEmbedUrl || ""}
              onChange={(e) => updateSection("map", "mapEmbedUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              helperText="The embed link URL used to render the interactive map preview."
              fullWidth
            />
          </Stack>
        </Box>
      )}

      {/* ── TAB 3: FAQs ────────────────────────────────── */}
      {activeTab === 3 && (
        <Box className={styles.tabPanel}>
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Frequently Asked Questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage the questions and answers displayed in the contact accordion.
              </Typography>
            </Box>

            <TextField
              label="FAQ Section Title"
              size="small"
              value={settings.faq?.title || ""}
              onChange={(e) => updateSection("faq", "title", e.target.value)}
              placeholder="e.g. Frequently Asked Questions"
              fullWidth
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Questions ({settings.faq?.items?.length || 0})
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddFaq}
              >
                Add Question
              </Button>
            </Box>

            <Stack spacing={2}>
              {(settings.faq?.items || []).map((faqItem, idx) => (
                <Box key={idx} className={styles.faqItemCard}>
                  <Box className={styles.faqItemHeader}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Question #{idx + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFaq(idx)}
                      className={styles.deleteBtn}
                      title="Remove FAQ"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <TextField
                    label="Question"
                    size="small"
                    value={faqItem.question || ""}
                    onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Answer"
                    size="small"
                    multiline
                    minRows={2}
                    value={faqItem.answer || ""}
                    onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                    fullWidth
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* ── TAB 4: Talent CTA Banner ───────────────────── */}
      {activeTab === 4 && (
        <Box className={styles.tabPanel}>
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                Talent Call-to-Action Banner
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure the bottom call-to-action banner inviting creative talents to join.
              </Typography>
            </Box>

            <TextField
              label="Banner Heading"
              size="small"
              value={settings.cta?.heading || ""}
              onChange={(e) => updateSection("cta", "heading", e.target.value)}
              placeholder="e.g. Are you a talented Individual?"
              fullWidth
            />

            <TextField
              label="Banner Subtitle"
              size="small"
              value={settings.cta?.subtitle || ""}
              onChange={(e) => updateSection("cta", "subtitle", e.target.value)}
              placeholder="e.g. Join the Royz Houz family lets build your future together!"
              fullWidth
            />

            <Box className={styles.row}>
              <TextField
                label="Button Label"
                size="small"
                value={settings.cta?.btnText || ""}
                onChange={(e) => updateSection("cta", "btnText", e.target.value)}
                placeholder="e.g. Apply Now"
                fullWidth
              />
              <TextField
                label="Button Link / URL"
                size="small"
                value={settings.cta?.btnHref || ""}
                onChange={(e) => updateSection("cta", "btnHref", e.target.value)}
                placeholder="e.g. /talents"
                fullWidth
              />
            </Box>
          </Stack>
        </Box>
      )}

      {/* ── TAB 5: SEO & Social Share ──────────────────── */}
      {activeTab === 5 && (
        <Box className={styles.tabPanel}>
          <Stack spacing={3}>
            <Box className={styles.sectionHeader}>
              <Typography variant="subtitle1" fontWeight={700}>
                SEO &amp; OpenGraph Social Share
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Control metadata, browser tab title, and preview cards for social media sharing.
              </Typography>
            </Box>

            <TextField
              label="Meta Title"
              size="small"
              value={settings.seo?.title || ""}
              onChange={(e) => updateSection("seo", "title", e.target.value)}
              placeholder="Contact Us | RoyzHouz"
              fullWidth
            />

            <TextField
              label="Meta Description"
              size="small"
              multiline
              minRows={3}
              value={settings.seo?.description || ""}
              onChange={(e) => updateSection("seo", "description", e.target.value)}
              fullWidth
            />

            <MediaField
              label="OpenGraph Share Image"
              value={settings.seo?.ogImage || ""}
              mediaType="image"
              onChange={(url) => updateSection("seo", "ogImage", url)}
              onBrowseLibrary={
                onOpenMediaPicker
                  ? () => onOpenMediaPicker((url) => updateSection("seo", "ogImage", url))
                  : undefined
              }
              helperText="1200x630px high resolution image for social previews on Twitter, WhatsApp, and LinkedIn."
              previewHeight={160}
            />
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
