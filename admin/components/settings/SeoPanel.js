import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { MediaField } from "@/components/content/MediaField";
import { siteApi } from "@/services/siteApi";
import styles from "./SeoPanel.module.css";

export function SeoPanel() {
  const [values, setValues] = useState({
    title: "",
    summary: "",
    canonicalPath: "/",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    noIndex: false,
  });
  const [status, setStatus] = useState("published");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [savingAction, setSavingAction] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await siteApi.getSeo();
        if (!active) return;
        if (data) {
          setValues({
            title: data.title || "",
            summary: data.summary || "",
            canonicalPath: data.canonicalPath || "/",
            ogTitle: data.ogTitle || "",
            ogDescription: data.ogDescription || "",
            ogImageUrl: data.ogImageUrl || "",
            noIndex: Boolean(data.noIndex),
          });
          if (data.status) setStatus(data.status);
        }
      } catch (err) {
        if (active) setLoadError(err.message || "Unable to load default SEO.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function updateField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (saveError) setSaveError(null);
  }

  async function handleSave(nextStatus) {
    setSavingAction(nextStatus);
    setSaveError(null);
    setToast(null);

    const payload = {
      title: values.title?.trim() || "Royz House",
      summary: values.summary?.trim() || null,
      canonicalPath: values.canonicalPath?.trim() || "/",
      ogTitle: values.ogTitle?.trim() || null,
      ogDescription: values.ogDescription?.trim() || null,
      ogImageUrl: values.ogImageUrl?.trim() || null,
      noIndex: Boolean(values.noIndex),
      status: nextStatus,
    };

    try {
      await siteApi.saveSeo(payload);
      setStatus(nextStatus);
      setToast(
        nextStatus === "published"
          ? "Default SEO published successfully."
          : "Default SEO saved as draft."
      );
    } catch (err) {
      setSaveError(err.message || "Unable to save default SEO.");
    } finally {
      setSavingAction(null);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 8 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      >
        {loadError}
      </Alert>
    );
  }

  const previewTitle = values.title || "Royz House | Building Africa's Next Generation";
  const previewDesc =
    values.summary ||
    "Building Africa's next generation of creatives, leaders & innovators through talent management, media production, and live entertainment.";
  const previewPath = values.canonicalPath || "/";

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.header}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6" className={styles.title}>
            Default Search &amp; Social SEO
          </Typography>
          <Chip
            size="small"
            label={status === "published" ? "Live on Web" : "Draft (Private)"}
            color={status === "published" ? "success" : "default"}
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" className={styles.description}>
          Global metadata for search engines (Google, Bing) and social preview cards (WhatsApp, X, Facebook, LinkedIn). Individual pages can override these defaults.
        </Typography>
      </Box>

      {saveError ? (
        <Alert severity="error" onClose={() => setSaveError(null)} sx={{ width: "100%" }}>
          {saveError}
        </Alert>
      ) : null}

      <Box className={styles.formGrid}>
        {/* Core Search Engine Metadata */}
        <Typography variant="subtitle2" className={styles.sectionHeading}>
          <SearchOutlinedIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: "middle" }} />
          Search Engine Metadata
        </Typography>

        <TextField
          fullWidth
          required
          size="small"
          label="Site Title (Default Page Title)"
          value={values.title}
          onChange={(e) => updateField("title", e.target.value)}
          helperText="Appears on search engine results and browser tabs. Recommended: 50–60 characters."
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label="Meta Description"
          value={values.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          helperText="A compelling summary shown in Google search results. Recommended: 120–160 characters."
        />

        <TextField
          fullWidth
          size="small"
          label="Canonical Path"
          value={values.canonicalPath}
          onChange={(e) => updateField("canonicalPath", e.target.value)}
          placeholder="/"
          helperText="Base canonical URL path (e.g. /). Must start with /."
        />

        {/* Live Google Search Preview */}
        <Box className={styles.previewSection}>
          <span className={styles.previewLabel}>Search Result Preview</span>
          <div className={styles.googleSnippet}>
            <div className={styles.googleUrl}>
              https://royzhouse.com{previewPath === "/" ? "" : previewPath}
            </div>
            <div className={styles.googleTitle}>{previewTitle}</div>
            <div className={styles.googleDesc}>{previewDesc}</div>
          </div>
        </Box>

        {/* Social Share / Open Graph Section */}
        <Typography variant="subtitle2" className={styles.sectionHeading} sx={{ mt: 2 }}>
          <ShareOutlinedIcon fontSize="inherit" sx={{ mr: 1, verticalAlign: "middle" }} />
          Social Share &amp; Open Graph (OG)
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Social Share Title (Optional)"
          value={values.ogTitle}
          onChange={(e) => updateField("ogTitle", e.target.value)}
          helperText="Defaults to the site title if left blank."
        />

        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          label="Social Share Description (Optional)"
          value={values.ogDescription}
          onChange={(e) => updateField("ogDescription", e.target.value)}
          helperText="Defaults to the meta description if left blank."
        />

        {/* Image Uploader */}
        <MediaField
          label="Social Share Image (og:image)"
          mediaType="image"
          value={values.ogImageUrl}
          onChange={(url) => updateField("ogImageUrl", url)}
          helperText="Upload or select an image for social cards (WhatsApp, X, Facebook, LinkedIn, iMessage). Recommended size: 1200 x 630 px."
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={values.noIndex}
              onChange={(e) => updateField("noIndex", e.target.checked)}
              color="primary"
            />
          }
          label="Prevent search engines from indexing the site (noindex, nofollow)"
        />
      </Box>

      {/* Action Buttons */}
      <Box className={styles.actions}>
        <Button
          variant="outlined"
          disabled={Boolean(savingAction)}
          onClick={() => handleSave("draft")}
          startIcon={
            savingAction === "draft" ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {savingAction === "draft" ? "Saving draft..." : "Save draft"}
        </Button>
        <Button
          variant="contained"
          disabled={Boolean(savingAction)}
          onClick={() => handleSave("published")}
          startIcon={
            savingAction === "published" ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {savingAction === "published" ? "Publishing..." : "Publish Default SEO"}
        </Button>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" onClose={() => setToast(null)} sx={{ width: "100%" }}>
          {toast}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
export default SeoPanel;
