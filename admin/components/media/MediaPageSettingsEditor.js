import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";

import { mediaPageApi } from "@/services/mediaPageApi";
import styles from "./MediaAdmin.module.css";

const DEFAULT_SETTINGS = {
  seo: { title: "Media & Highlights | Royz House", description: "Explore inspiring videos, podcast conversations, original music tracks, and photo galleries from Royz House." },
  hero: { badge: "FEATURED NOW", title: "BEYOND THE STAGE:", highlightTitle: "STORIES OF RESILIENCE\nAND EXCELLENCE.", description: "We discover. We develop. We empower. Together, we are a legacy that transforms lives and communities.", duration: "22:45", views: "440K views", authorName: "Amara Nwosu", authorAvatar: "/assets/img/talents/david.jpg", bgImage: "/assets/img/talent-hero.jpg" },
  filters: { all: "All Media", videos: "Videos", music: "Music", podcasts: "Podcasts", gallery: "Gallery", searchPlaceholder: "Search media...", sortDate: "Sort: Date", sortLatest: "Sort: Latest", sortPopular: "Sort: Most Popular" },
  videos: { title: "Videos", fullTitle: "Latest Videos", subtitle: "Watch inspiring stories, performances, interviews and more.", viewAllLabel: "View all videos" },
  podcasts: { beyondTitle: "Beyond the Spotlight", beyondSubtitle: "Hear the untold stories, creative journeys, and perspectives behind Africa's most inspiring voices.", title: "Podcasts", subtitle: "Conversations that inform, inspire and empower creatives." },
  music: { discoverTitle: "Discover New Sounds", discoverSubtitle: "Explore emerging voices and unique sounds shaping the evolving music scene.", spotlightTitle: "Music Spotlight", spotlightSubtitle: "Go beyond the spotlight and discover the people behind this creative excellence." },
  gallery: { title: "Through The Lens", subtitle: "Visual stories capturing moments from across Nigeria.", fullSubtitle: "Capturing moments that tell our stories", viewAllLabel: "View all photos" },
  cta: { heading: "Are you a talented individual?", subheading: "Join the Royz Houz family. Let's build your future together!", buttonLabel: "Apply Now", buttonHref: "/talents" },
};

const EDITOR_TABS = ["SEO & page", "Hero", "Filters", "Videos", "Podcasts", "Music", "Gallery", "CTA"];

function Field({ value, onChange, label, multiline = false, ...props }) {
  return <TextField label={label} value={value || ""} onChange={(e) => onChange(e.target.value)} fullWidth multiline={multiline} minRows={multiline ? 2 : undefined} {...props} />;
}

export function MediaPageSettingsEditor({ onSaved }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState("draft");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    mediaPageApi.get().then((record) => {
      setSettings((current) => Object.keys(current).reduce((result, section) => ({
        ...result,
        [section]: typeof current[section] === "object"
          ? { ...current[section], ...(record.content?.[section] || {}) }
          : record.content?.[section] ?? current[section],
      }), {}));
      setStatus(record.status || "draft");
    }).catch((err) => setError(err.message || "Unable to load page settings.")).finally(() => setLoading(false));
  }, []);

  function setValue(section, field, value) {
    setSettings((current) => ({ ...current, [section]: { ...current[section], [field]: value } }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await mediaPageApi.save({ content: settings, status });
      onSaved?.("Media page settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save Media page settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Typography color="text.secondary">Loading page settings…</Typography>;

  const section = ["seo", "hero", "filters", "videos", "podcasts", "music", "gallery", "cta"][activeTab];
  const fields = {
    seo: [["title", "SEO title"], ["description", "SEO description"]],
    hero: [["badge", "Badge"], ["title", "Hero title"], ["highlightTitle", "Hero highlight", true], ["description", "Hero description", true], ["duration", "Duration"], ["views", "Views label"], ["authorName", "Author name"], ["authorAvatar", "Author avatar URL"], ["bgImage", "Hero background image URL"]],
    filters: [["all", "All media label"], ["videos", "Videos label"], ["music", "Music label"], ["podcasts", "Podcasts label"], ["gallery", "Gallery label"], ["searchPlaceholder", "Search placeholder"], ["sortDate", "Date sort label"], ["sortLatest", "Latest sort label"], ["sortPopular", "Popular sort label"]],
    videos: [["title", "Section title"], ["fullTitle", "Full-page title"], ["subtitle", "Section description", true], ["viewAllLabel", "View-all label"]],
    podcasts: [["beyondTitle", "Spotlight title"], ["beyondSubtitle", "Spotlight description", true], ["title", "Section title"], ["subtitle", "Section description", true]],
    music: [["discoverTitle", "Discover title"], ["discoverSubtitle", "Discover description", true], ["spotlightTitle", "Spotlight title"], ["spotlightSubtitle", "Spotlight description", true]],
    gallery: [["title", "Section title"], ["subtitle", "Section description", true], ["fullSubtitle", "Full-page description", true], ["viewAllLabel", "View-all label"]],
    cta: [["heading", "CTA heading"], ["subheading", "CTA description", true], ["buttonLabel", "Button label"], ["buttonHref", "Button link"]],
  };

  return <Box>
    <Paper className={styles.settingsCard} variant="outlined">
      <Typography variant="h6" fontWeight={800}>Media page content</Typography>
      <Typography variant="body2" color="text.secondary">Control the copy, labels, hero presentation, and CTA used by the public Media page.</Typography>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto" sx={{ mt: 1 }}>
        {EDITOR_TABS.map((label) => <Tab key={label} label={label} />)}
      </Tabs>
      <Stack spacing={2} className={styles.settingsFields}>
        {fields[section].map(([field, label, multiline]) => <Field key={field} label={label} multiline={multiline} value={settings[section]?.[field]} onChange={(value) => setValue(section, field, value)} />)}
        {section === "seo" ? <TextField select label="Publication status" value={status} onChange={(e) => setStatus(e.target.value)}><MenuItem value="draft">Draft</MenuItem><MenuItem value="published">Published</MenuItem></TextField> : null}
      </Stack>
      {error ? <Typography color="error" variant="body2">{error}</Typography> : null}
      <Box className={styles.settingsActions}><Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Media page"}</Button></Box>
    </Paper>
  </Box>;
}

export default MediaPageSettingsEditor;
