import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { siteApi } from "@/services/siteApi";
import styles from "@/styles/website.module.css";

function SingletonPanel({ title, description, api, fields, buildPayload }) {
  const [values, setValues] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.get();
        if (!active) return;
        const content = data?.content || {};
        setValues(content);
      } catch (err) {
        if (active) setError(err.message || "Unable to load.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api]);

  async function handleSave(nextStatus) {
    setSaving(true);
    setError(null);
    try {
      await api.save(buildPayload(values, nextStatus));
    } catch (err) {
      setError(err.message || "Unable to save.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper elevation={0} className={styles.form}>
      <Box>
        <Typography variant="h6" className={styles.sectionTitle}>{title}</Typography>
        <Typography variant="body2" className={styles.sectionDescription}>{description}</Typography>
      </Box>

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
        <Button variant="outlined" disabled={saving} onClick={() => handleSave("draft")}>
          Save draft
        </Button>
        <Button variant="contained" disabled={saving} onClick={() => handleSave("published")}>
          Publish
        </Button>
      </Box>
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

export function SeoPanel() {
  return (
    <SingletonPanel
      title="Default SEO"
      description="Default search and social metadata for the public website."
      api={{ get: siteApi.getSeo, save: siteApi.saveSeo }}
      fields={[
        { name: "title", label: "Title" },
        { name: "summary", label: "Description", multiline: true },
        { name: "canonicalPath", label: "Canonical path" },
        { name: "ogTitle", label: "Open Graph title" },
        { name: "ogDescription", label: "Open Graph description", multiline: true },
        { name: "ogImageUrl", label: "Open Graph image URL" },
      ]}
      buildPayload={(values) => ({
        title: values.title || "Royz Houz",
        summary: values.summary || undefined,
        canonicalPath: values.canonicalPath || undefined,
        ogTitle: values.ogTitle || undefined,
        ogDescription: values.ogDescription || undefined,
        ogImageUrl: values.ogImageUrl || undefined,
        noIndex: false,
      })}
    />
  );
}
