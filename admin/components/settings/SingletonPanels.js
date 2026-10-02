import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { siteApi } from "@/services/siteApi";
import styles from "@/styles/website.module.css";

function SingletonPanel({ title, description, api, fields, buildPayload }) {
  const [values, setValues] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [savingAction, setSavingAction] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get();
        if (!active) return;
        const content = data?.content || {};
        setValues(content);
      } catch (err) {
        if (active) setLoadError(err.message || "Unable to load.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api]);

  async function handleSave(nextStatus) {
    setSavingAction(nextStatus);
    setSaveError(null);
    setToast(null);
    try {
      await api.save(buildPayload(values, nextStatus));
      setToast(
        nextStatus === "published"
          ? `${title} published successfully.`
          : `${title} saved as draft.`
      );
    } catch (err) {
      setSaveError(err.message || "Unable to save.");
    } finally {
      setSavingAction(null);
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 6 }}>
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

  return (
    <Paper elevation={0} className={styles.form}>
      <Box>
        <Typography variant="h6" className={styles.sectionTitle}>{title}</Typography>
        <Typography variant="body2" className={styles.sectionDescription}>{description}</Typography>
      </Box>

      {saveError ? (
        <Alert severity="error" onClose={() => setSaveError(null)} sx={{ width: "100%" }}>
          {saveError}
        </Alert>
      ) : null}

      {fields.map((field) => (
        <TextField
          key={field.name}
          fullWidth
          label={field.label}
          multiline={field.multiline}
          minRows={field.multiline ? 3 : undefined}
          value={values[field.name] ?? ""}
          onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
        />
      ))}

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
          {savingAction === "published" ? "Publishing..." : "Publish"}
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

export function ContactInfoPanel() {
  return (
    <SingletonPanel
      title="Contact information"
      description="Address, email, phone, and website shown in the public footer."
      api={{ get: siteApi.getContactInfo, save: siteApi.saveContactInfo }}
      fields={[
        { name: "address", label: "Address" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        { name: "website", label: "Website" },
      ]}
      buildPayload={(values, status) => ({ ...values, status })}
    />
  );
}

export { SeoPanel } from "./SeoPanel";

