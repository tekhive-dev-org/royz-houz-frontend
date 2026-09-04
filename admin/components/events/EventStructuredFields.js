import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { TalentMediaField } from "../talents/TalentMediaField";
import styles from "./EventStructuredFields.module.css";

const FIELD_CONFIG = {
  aboutParagraphs: {
    label: "About paragraphs",
    itemLabel: "Paragraph",
    description: "Add the paragraphs that introduce this event.",
    emptyValue: "",
  },
  speakers: {
    label: "Speakers & performers",
    itemLabel: "Speaker",
    description: "Add the people appearing in the event content section.",
    emptyValue: { id: "", name: "", role: "", organization: "", avatar: "" },
  },
  performingArtists: {
    label: "Performing artists",
    itemLabel: "Artist",
    description: "Add performers shown in the event sidebar.",
    emptyValue: { id: "", name: "", initial: "", href: "" },
  },
  partners: {
    label: "Event partners",
    itemLabel: "Partner",
    description: "Add partner names shown in the event sidebar.",
    emptyValue: "",
  },
  schedule: {
    label: "Schedule",
    itemLabel: "Session",
    description: "Add the sessions or activities in event order.",
    emptyValue: { time: "", title: "", description: "" },
  },
  faqs: {
    label: "FAQs",
    itemLabel: "FAQ",
    description: "Answer common questions about this event.",
    emptyValue: { question: "", answer: "" },
  },
  ticketTiers: {
    label: "Ticket tiers",
    itemLabel: "Tier",
    description: "Configure the ticket options shown to attendees.",
    emptyValue: { id: "", name: "", badge: "", price: 0, available: "", features: [], description: "", isDefault: false },
  },
  gallery: {
    label: "Gallery",
    itemLabel: "Image",
    description: "Add event images using a URL or the media library.",
    emptyValue: "",
  },
};

function getArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function fieldValue(item, key) {
  return item && typeof item === "object" ? item[key] || "" : "";
}

function StructuredSection({ field, event, updateField, setMediaPicker, talents }) {
  const config = FIELD_CONFIG[field];
  const values = getArray(event?.[field]);

  function addRow() {
    const value = typeof config.emptyValue === "object" ? { ...config.emptyValue } : config.emptyValue;
    if (field === "ticketTiers") value.id = `tier-${Date.now()}-${values.length + 1}`;
    updateField(field, [...values, value]);
  }

  function removeRow(index) {
    updateField(field, values.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateRow(index, key, value) {
    const nextValues = values.map((item, rowIndex) => {
      if (rowIndex !== index) return item;
      if (typeof item !== "object" || item === null) return key === "value" ? value : { [key]: value };
      return { ...item, [key]: value };
    });
    updateField(field, nextValues);
  }

  function updateRowObject(index, patch) {
    updateField(field, values.map((item, rowIndex) => (
      rowIndex === index ? { ...(item || {}), ...patch } : item
    )));
  }

  return (
    <Paper className={styles.section} variant="outlined">
      <Box className={styles.sectionHeader}>
        <Box>
          <Typography className={styles.sectionTitle} variant="subtitle1">
            {config.label}
          </Typography>
          <Typography className={styles.sectionDescription} variant="body2">
            {config.description}
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} onClick={addRow} size="small" variant="outlined">
          Add
        </Button>
      </Box>

      <Divider />

      <Stack className={styles.rows} divider={<Divider flexItem />} spacing={2}>
        {values.length === 0 ? (
          <Typography className={styles.empty} variant="body2">
            No {config.label.toLowerCase()} added yet.
          </Typography>
        ) : (
          values.map((item, index) => (
            <Box className={styles.row} key={`${field}-${index}`}>
              <Typography className={styles.rowLabel} variant="caption">
                {config.itemLabel} {index + 1}
              </Typography>

              {field === "aboutParagraphs" && (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label={`Paragraph ${index + 1}`}
                  size="small"
                  value={typeof item === "string" ? item : ""}
                  onChange={(eventChange) => updateRow(index, "value", eventChange.target.value)}
                />
              )}

              {field === "speakers" && (
                <Box className={styles.fields}>
                  <TextField label="Speaker ID" size="small" value={fieldValue(item, "id")} onChange={(e) => updateRow(index, "id", e.target.value)} helperText="Optional stable identifier" />
                  <TextField fullWidth label="Full Name" size="small" value={fieldValue(item, "name")} onChange={(e) => updateRow(index, "name", e.target.value)} required />
                  <TextField fullWidth label="Role / Title" size="small" value={fieldValue(item, "role")} onChange={(e) => updateRow(index, "role", e.target.value)} required />
                  <TextField fullWidth label="Organization" size="small" value={fieldValue(item, "organization")} onChange={(e) => updateRow(index, "organization", e.target.value)} />
                  <TalentMediaField
                    label="Speaker Image"
                    value={fieldValue(item, "avatar") || fieldValue(item, "image")}
                    onChange={(value) => updateRow(index, "avatar", value)}
                    onBrowseLibrary={() => setMediaPicker?.({ field: "speakers", index, nestedField: "avatar" })}
                    helperText="Upload a speaker image or select one from the media library."
                  />
                </Box>
              )}

              {field === "performingArtists" && (
                <Box className={styles.fields}>
                  <TextField
                    fullWidth
                    select
                    label="Select talent"
                    size="small"
                    value={fieldValue(item, "id")}
                    onChange={(e) => {
                      const talent = talents.find((option) => option.id === e.target.value);
                      if (!talent) return;
                      const name = talent.title || talent.name || talent.body?.name || "";
                      updateRowObject(index, {
                        id: talent.id,
                        name,
                        initial: name.trim().charAt(0).toUpperCase(),
                        href: `/talents/${talent.slug || talent.id}`,
                      });
                    }}
                    required
                    helperText={talents.length ? "Select a talent with a public profile." : "No published talents are available yet."}
                  >
                    <MenuItem value="" disabled>Select a talent</MenuItem>
                    {talents.map((talent) => (
                      <MenuItem key={talent.id} value={talent.id}>
                        {talent.title || talent.name || talent.body?.name || talent.slug || talent.id}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Artist name" size="small" value={fieldValue(item, "name")} InputProps={{ readOnly: true }} />
                  <TextField label="Initial" size="small" value={fieldValue(item, "initial")} InputProps={{ readOnly: true }} />
                  <TextField fullWidth label="Talent profile link" size="small" value={fieldValue(item, "href")} InputProps={{ readOnly: true }} />
                </Box>
              )}

              {field === "partners" && (
                <TextField
                  fullWidth
                  label={`Partner ${index + 1}`}
                  size="small"
                  value={typeof item === "string" ? item : fieldValue(item, "name")}
                  onChange={(e) => updateRow(index, "value", e.target.value)}
                  required
                  placeholder="e.g. Unity Bank"
                />
              )}

              {field === "schedule" && (
                <Box className={styles.fields}>
                  <TextField label="Time" size="small" value={fieldValue(item, "time")} onChange={(e) => updateRow(index, "time", e.target.value)} />
                  <TextField fullWidth label="Title" size="small" value={fieldValue(item, "title")} onChange={(e) => updateRow(index, "title", e.target.value)} />
                  <TextField fullWidth multiline label="Description" size="small" value={fieldValue(item, "description")} onChange={(e) => updateRow(index, "description", e.target.value)} />
                </Box>
              )}

              {field === "faqs" && (
                <Box className={styles.fields}>
                  <TextField fullWidth label="Question" size="small" value={fieldValue(item, "question")} onChange={(e) => updateRow(index, "question", e.target.value)} />
                  <TextField fullWidth multiline minRows={2} label="Answer" size="small" value={fieldValue(item, "answer")} onChange={(e) => updateRow(index, "answer", e.target.value)} />
                </Box>
              )}

              {field === "ticketTiers" && (
                <Box className={styles.fields}>
                  <TextField fullWidth label="Ticket name" size="small" value={fieldValue(item, "name")} onChange={(e) => updateRow(index, "name", e.target.value)} required placeholder="e.g. Early Bird" />
                  <TextField label="Availability badge" size="small" value={fieldValue(item, "badge")} onChange={(e) => updateRow(index, "badge", e.target.value)} placeholder="e.g. 12 LEFT" />
                  <TextField label="Available quantity" type="number" size="small" value={item?.available ?? ""} onChange={(e) => updateRow(index, "available", e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || 0))} inputProps={{ min: 0, step: 1 }} helperText="Optional starting inventory; successful Paystack payments will reduce this later." />
                  <TextField label="Price (₦)" type="number" size="small" value={item?.price ?? ""} onChange={(e) => updateRow(index, "price", Number(e.target.value) || 0)} inputProps={{ min: 0, step: 100 }} helperText="Enter numbers only; the ₦ symbol is added automatically." required />
                  <TextField fullWidth multiline minRows={3} label="Included features (one per line)" size="small" value={Array.isArray(item?.features) ? item.features.join("\n") : ""} onChange={(e) => updateRow(index, "features", e.target.value.split("\n").map((feature) => feature.trim()).filter(Boolean))} placeholder={"General access\nWelcome drink\nEvent programme"} />
                  <TextField fullWidth multiline label="Description" size="small" value={fieldValue(item, "description")} onChange={(e) => updateRow(index, "description", e.target.value)} />
                  <FormControlLabel control={<Checkbox checked={Boolean(item?.isDefault)} onChange={(e) => updateRow(index, "isDefault", e.target.checked)} />} label="Default tier" />
                </Box>
              )}

              {field === "gallery" && (
                <Box className={styles.mediaField}>
                  <TalentMediaField
                    label={`Gallery Image ${index + 1}`}
                    value={typeof item === "string" ? item : ""}
                    onChange={(value) => updateRow(index, "value", value)}
                    onBrowseLibrary={() => setMediaPicker?.({ field: "gallery", index })}
                    helperText="Upload an image, select one from the media library, or paste an HTTPS URL."
                  />
                </Box>
              )}

              <IconButton aria-label={`Remove ${config.itemLabel.toLowerCase()} ${index + 1}`} className={styles.deleteButton} onClick={() => removeRow(index)} size="small">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        )}
      </Stack>
    </Paper>
  );
}

export function EventStructuredFields({ event = {}, setField, setMediaPicker, talents = [], fields = Object.keys(FIELD_CONFIG) }) {
  function updateField(field, value) {
    // EventsAdmin stores these fields as JSON strings until its save parser runs.
    setField(field, JSON.stringify(value, null, 2));
  }

  return (
    <Stack className={styles.container} spacing={2}>
      {fields.map((field) => (
        <StructuredSection key={field} event={event} field={field} talents={talents} setMediaPicker={setMediaPicker} updateField={updateField} />
      ))}
    </Stack>
  );
}

export default EventStructuredFields;
