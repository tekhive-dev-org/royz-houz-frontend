import { useCallback, useState } from "react";
import { Add, Visibility, HelpOutline, LayersOutlined, OpenInNew } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { SortableList } from "@/components/settings/SortableList";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { MediaField } from "./MediaField";
import { MediaPicker } from "./MediaPicker";
import { contentApi } from "@/services/contentApi";
import { useAdminCollection } from "@/hooks/useAdminCollection";
import { getPublicSiteUrl } from "@/lib/publicSite";
import styles from "./SectionsEditor.module.css";

export const DEFAULT_TESTIMONIALS = [
  {
    id: "1",
    name: "MacWilliams Jonah",
    role: "Musician, Lagos",
    quote:
      "Royz Houz gave me the opportunity to grow my talent and connect with people who truly believe in what I do. The support, guidance, and exposure have given me more confidence to pursue my creative journey.",
    avatar: "/assets/img/talents/blessing.jpg",
  },
  {
    id: "2",
    name: "Zara Diallo",
    role: "Fashion Designer, Dakar",
    quote:
      "Being part of the Royz Houz ecosystem opened doors to international stages and collaborations I never thought possible so early in my career. The mentorship is unmatched.",
    avatar: "/assets/img/talents/zara.jpg",
  },
  {
    id: "3",
    name: "Emeka Nwosu",
    role: "Sound Engineer, Abuja",
    quote:
      "From technical workshops to network access and spotlight features, Royz Houz has been the single most impactful community for my creative journey.",
    avatar: "/assets/img/talents/emeka.jpg",
  },
];

export const DEFAULT_HERO_STATS = [
  { value: "500+", label: "Verified Talents" },
  { value: "50+", label: "Projects Delivered" },
  { value: "4.7/5", label: "Platform Rating" },
  { value: "100K+", label: "Lives Impacted" },
];

export const HOMEPAGE_PRESETS = [
  {
    slug: "hero",
    name: "Hero Banner",
    badge: "Top Banner",
    tagline: "First-impression banner at the top of the homepage.",
    ctaLabelName: "Primary Button Label",
    ctaHelper: "Primary button (default: 'Explore Talents' → /talents)",
    imageLabel: "Hero Background Image",
    imageHelper: "High-resolution banner visual with dark vignette overlay.",
    defaultTitle: "Hero Banner",
    defaultEyebrow: "Welcome to Royz Houz",
    defaultHeading: "BUILDING AFRICA'S NEXT GENERATION OF",
    defaultHeadingHighlight: "CREATIVES, LEADERS & INNOVATORS",
    defaultDescription: "We discover. We develop. We empower. Together, we are a legacy that transforms lives and communities.",
    defaultCtaLabel: "Explore Talents",
    defaultCtaUrl: "/talents",
    defaultSecondaryCtaLabel: "Support Our Mission",
    defaultSecondaryCtaUrl: "/about",
    defaultStats: [
      { value: "500+", label: "Verified Talents" },
      { value: "50+", label: "Projects Delivered" },
      { value: "4.7/5", label: "Platform Rating" },
      { value: "100K+", label: "Lives Impacted" },
    ],
  },
  {
    slug: "featured-talents",
    name: "Featured Talents Showcase",
    badge: "Talents Feed",
    tagline: "Displays the latest featured artists and performers from the Talents studio.",
    titleLabel: "Section Header Title",
    titleHelper: "Heading shown on the live homepage directly above the talents grid.",
    ctaLabelName: "'View All' Link Label",
    ctaHelper: "Link leading to the full directory (default: 'View all talents' → /talents)",
    defaultTitle: "Featured Talent",
    defaultCtaLabel: "View all talents",
    defaultCtaUrl: "/talents",
  },
  {
    slug: "our-impact",
    name: "Our Impact & Story",
    badge: "Impact Showcase",
    tagline: "Mission narrative with key impact numbers and playable video modal.",
    ctaLabelName: "CTA Button Label",
    ctaHelper: "Action button below the narrative (default: 'Support Our Mission' → /about)",
    imageLabel: "Impact Visual / Video Poster Image",
    imageHelper: "Banner image displayed next to the story and behind the play button.",
    defaultTitle: "Our Impact & Story",
    defaultEyebrow: "OUR IMPACT",
    defaultHeading: "Creating Opportunities, Transforming Lives",
    defaultDescription: "Through education, mentorship, creative programs and community initiatives, we are empowering the next generation to rise, create and lead.",
    defaultCtaLabel: "Support Our Mission",
    defaultCtaUrl: "/about",
  },
  {
    slug: "upcoming-events",
    name: "Upcoming Events Feed",
    badge: "Events Feed",
    tagline: "Live carousel of scheduled events fed from the Events studio.",
    titleLabel: "Section Header Title",
    titleHelper: "Heading shown on the live homepage directly above the events carousel.",
    ctaLabelName: "'View All' Link Label",
    ctaHelper: "Link leading to the events calendar (default: 'View all events' → /events)",
    defaultTitle: "Upcoming Events",
    defaultCtaLabel: "View all events",
    defaultCtaUrl: "/events",
  },
  {
    slug: "media-highlight",
    name: "Media Spotlight",
    badge: "Media Feed",
    tagline: "Featured video player spotlight and recent media clips fed from the Media studio.",
    titleLabel: "Section Header Title",
    titleHelper: "Heading shown on the live homepage directly above the video highlights.",
    ctaLabelName: "'View All' Link Label",
    ctaHelper: "Link leading to the media library (default: 'View all media' → /media)",
    defaultTitle: "Media Highlight",
    defaultCtaLabel: "View all media",
    defaultCtaUrl: "/media",
  },
  {
    slug: "latest-blog",
    name: "Latest Blog Posts Feed",
    badge: "Blog Feed",
    tagline: "Continuous loop carousel of recent articles fed from the Blog studio.",
    titleLabel: "Section Header Title",
    titleHelper: "Heading shown on the live homepage directly above the blog articles carousel.",
    ctaLabelName: "'View All' Link Label",
    ctaHelper: "Link leading to all articles (default: 'View all articles' → /blog)",
    defaultTitle: "Latest from our blog",
    defaultCtaLabel: "View all articles",
    defaultCtaUrl: "/blog",
  },
  {
    slug: "community-cta",
    name: "Community CTA Card",
    badge: "Subscription CTA",
    tagline: "Newsletter subscription card encouraging visitor signups.",
    headingHelper: "Main call-to-action headline inviting visitors to join the community.",
    descriptionHelper: "Subheadline explaining what subscribers receive.",
    defaultTitle: "Community CTA",
    defaultHeading: "Join a Thriving Community of Creatives & Innovators",
    defaultDescription: "Get weekly insights, talent spotlights, event invites, and opportunities delivered to your inbox.",
  },
  {
    slug: "testimonials",
    name: "Testimonials & Reviews",
    badge: "Member Stories",
    tagline: "Testimonials carousel showing member feedback and quotes.",
    eyebrowHelper: "Sub-badge tagline (e.g. 'TESTIMONIALS')",
    headingHelper: "Main carousel title (e.g. 'Impact - Changing Stories')",
    descriptionHelper: "Subtitle description under the headline.",
    defaultTitle: "Testimonials",
    defaultEyebrow: "TESTIMONIALS",
    defaultHeading: "Impact - Changing Stories",
    defaultDescription: "Explore the stories and experiences of members who have connected and found meaningful opportunities.",
    defaultTestimonials: DEFAULT_TESTIMONIALS,
  },
  {
    slug: "support-movement",
    name: "Support Movement Banner",
    badge: "Donation CTA",
    tagline: "Donation and mission partnership call-to-action banner.",
    eyebrowHelper: "Tagline badge above the headline (e.g. 'SUPPORT THE MOVEMENT')",
    ctaLabelName: "Donation Button Label",
    ctaHelper: "Button label and destination (default: 'Make A Donation' → /donate)",
    defaultTitle: "Support the Movement",
    defaultEyebrow: "SUPPORT THE MOVEMENT",
    defaultHeading: "Your Support Makes a Difference to Africa's Creative Future",
    defaultDescription: "Every donation funds mentorship programmes, creative workshops, and scholarships for Africa's next generation.",
    defaultCtaLabel: "Make A Donation",
    defaultCtaUrl: "/donate",
  },
];



const EMPTY_SECTION = {
  slug: "",
  title: "",
  summary: "",
  eyebrow: "",
  heading: "",
  headingHighlight: "",
  description: "",
  ctaLabel: "",
  ctaUrl: "",
  secondaryCtaLabel: "",
  secondaryCtaUrl: "",
  stats: DEFAULT_HERO_STATS,
  testimonials: DEFAULT_TESTIMONIALS,
  imageUrl: "",
  imageAlt: "",
  videoUrl: "",
  videoTitle: "",
  visible: true,
  sortOrder: 0,
  status: "published",
};

function getSupportedFields(slug) {
  const isPreset = HOMEPAGE_PRESETS.some((p) => p.slug === slug);
  if (!isPreset) {
    return {
      eyebrow: true,
      heading: true,
      description: true,
      cta: true,
      heroExtras: false,
      image: true,
      video: false,
    };
  }

  return {
    eyebrow: ["hero", "our-impact", "testimonials", "support-movement"].includes(slug),
    heading: ["hero", "our-impact", "community-cta", "testimonials", "support-movement"].includes(slug),
    description: ["hero", "our-impact", "community-cta", "testimonials", "support-movement"].includes(slug),
    cta: [
      "hero",
      "featured-talents",
      "our-impact",
      "upcoming-events",
      "media-highlight",
      "latest-blog",
      "support-movement",
    ].includes(slug),
    heroExtras: slug === "hero",
    testimonialsExtras: slug === "testimonials",
    image: ["hero", "our-impact"].includes(slug),
    video: ["our-impact"].includes(slug),
  };
}

function SectionForm({ value, onChange, isEditing = false, type = "homepage", onPickMedia }) {
  const isHomepage = type === "homepage";
  const matchedPreset = isHomepage ? HOMEPAGE_PRESETS.find((p) => p.slug === value.slug) : null;
  const fields = isHomepage
    ? getSupportedFields(value.slug)
    : { eyebrow: true, heading: true, description: true, cta: true, heroExtras: false, image: true, video: true };

  function set(field, fieldValue) {
    onChange({ ...value, [field]: fieldValue });
  }

  function handlePresetSelect(presetSlug) {
    if (presetSlug === "custom") {
      set("slug", "");
      return;
    }
    const preset = HOMEPAGE_PRESETS.find((p) => p.slug === presetSlug);
    if (!preset) return;
    onChange({
      ...value,
      slug: preset.slug,
      title: value.title || preset.defaultTitle,
      eyebrow: value.eyebrow || preset.defaultEyebrow || "",
      heading: value.heading || preset.defaultHeading || "",
      headingHighlight: value.headingHighlight || preset.defaultHeadingHighlight || "",
      description: value.description || preset.defaultDescription || "",
      ctaLabel: value.ctaLabel || preset.defaultCtaLabel || "",
      ctaUrl: value.ctaUrl || preset.defaultCtaUrl || "",
      secondaryCtaLabel: value.secondaryCtaLabel || preset.defaultSecondaryCtaLabel || "",
      secondaryCtaUrl: value.secondaryCtaUrl || preset.defaultSecondaryCtaUrl || "",
      stats: value.stats && value.stats.length > 0 ? value.stats : DEFAULT_HERO_STATS,
      testimonials: value.testimonials && value.testimonials.length > 0 ? value.testimonials : DEFAULT_TESTIMONIALS,
    });
  }

  const stats = Array.isArray(value.stats) && value.stats.length >= 4 ? value.stats : DEFAULT_HERO_STATS;

  function updateStat(index, key, val) {
    const updated = [...stats];
    updated[index] = { ...(updated[index] || {}), [key]: val };
    set("stats", updated);
  }

  return (
    <Box className={styles.form}>
      {/* Component identification banner */}
      {isHomepage && matchedPreset && (
        <Paper elevation={0} className={styles.presetBanner}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <LayersOutlined fontSize="small" sx={{ color: "#d97706" }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#92400e" }}>
              {matchedPreset.name}
            </Typography>
            <span className={styles.presetTag}>{matchedPreset.badge}</span>
          </Box>
          <Typography variant="caption" sx={{ color: "#78350f" }}>
            {matchedPreset.tagline}
          </Typography>
        </Paper>
      )}

      {/* Preset Selector when creating */}
      {isHomepage && !isEditing && (
        <TextField
          select
          label="Choose Section Component"
          value={matchedPreset ? matchedPreset.slug : (value.slug ? "custom" : "")}
          onChange={(e) => handlePresetSelect(e.target.value)}
          fullWidth
          required
          helperText="Select which landing page section component to configure."
        >
          {HOMEPAGE_PRESETS.map((p) => (
            <MenuItem key={p.slug} value={p.slug}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>{p.name}</span>
                <span className={styles.menuSlug}>({p.slug})</span>
              </Box>
            </MenuItem>
          ))}
          <MenuItem value="custom">Custom Section...</MenuItem>
        </TextField>
      )}

      {/* Slug field (editable only if custom) */}
      {(!isHomepage || !matchedPreset || !isEditing) && (
        <TextField
          label="Section Slug"
          value={value.slug}
          onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          fullWidth
          required
          disabled={Boolean(isEditing && matchedPreset)}
          helperText="Unique identifier matching code contracts (e.g. hero, upcoming-events, our-impact)."
        />
      )}

      {/* Visibility Toggle */}
      <Paper elevation={0} className={styles.visibilityCard}>
        <FormControlLabel
          control={
            <Switch
              checked={value.visible !== false}
              onChange={(e) => set("visible", e.target.checked)}
              color="success"
            />
          }
          label={
            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: value.visible !== false ? "#166534" : "#991b1b" }}
              >
                {value.visible !== false ? "Visible on Live Website" : "Hidden from Live Website"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {value.visible !== false
                  ? "Visitors can see and interact with this section on the public homepage."
                  : "This section is currently hidden from the public homepage."}
              </Typography>
            </Box>
          }
        />
      </Paper>

      {/* Title */}
      <TextField
        label={matchedPreset?.titleLabel || "Section Display Title"}
        value={value.title}
        onChange={(e) => set("title", e.target.value)}
        fullWidth
        required
        helperText={matchedPreset?.titleHelper || "Section name displayed in the admin table list."}
      />

      {/* Eyebrow and Headline Controls */}
      {value.slug === "hero" ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Eyebrow / Badge"
            value={value.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
            fullWidth
            placeholder="e.g. Welcome to Royz Houz"
            helperText="Small uppercase badge shown above the main headline."
          />

          <Box className={styles.row}>
            <TextField
              label="Primary Headline (White Text)"
              value={value.heading}
              onChange={(e) => set("heading", e.target.value)}
              fullWidth
              placeholder="BUILDING AFRICA'S NEXT GENERATION OF"
              helperText="First part of the headline, rendered in white text."
            />
            <TextField
              label="Headline Accent (Copper Highlight)"
              value={value.headingHighlight}
              onChange={(e) => set("headingHighlight", e.target.value)}
              fullWidth
              placeholder="CREATIVES, LEADERS & INNOVATORS"
              helperText="Second part of the headline, rendered in brand copper color."
            />
          </Box>

          {/* Live Color Preview Banner */}
          <Box sx={{ p: 1.5, bgcolor: "#0f172a", borderRadius: 2, border: "1px solid #1e293b" }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 0.5, fontWeight: 700 }}>
              Live Two-Color Headline Preview:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, textTransform: "uppercase", lineHeight: 1.25 }}>
              <span style={{ color: "#ffffff" }}>
                {value.heading || "BUILDING AFRICA'S NEXT GENERATION OF"}
              </span>{" "}
              <span style={{ color: "#B46A2C" }}>
                {value.headingHighlight || "CREATIVES, LEADERS & INNOVATORS"}
              </span>
            </Typography>
          </Box>
        </Box>
      ) : (
        (fields.eyebrow || fields.heading) && (
          <Box className={styles.row}>
            {fields.eyebrow && (
              <TextField
                label="Eyebrow / Category Tag"
                value={value.eyebrow}
                onChange={(e) => set("eyebrow", e.target.value)}
                fullWidth
                placeholder="e.g. OUR IMPACT, WELCOME TO ROYZ HOUZ"
                helperText={matchedPreset?.eyebrowHelper || "Small uppercase badge shown above the main heading."}
              />
            )}
            {fields.heading && (
              <TextField
                label="Section Headline"
                value={value.heading}
                onChange={(e) => set("heading", e.target.value)}
                fullWidth
                placeholder="Main headline seen by visitors"
                helperText={matchedPreset?.headingHelper || "Primary headline rendered on the live section."}
              />
            )}
          </Box>
        )
      )}

      {/* Description */}
      {fields.description && (
        <TextField
          label="Description / Paragraph"
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
          fullWidth
          multiline
          minRows={3}
          placeholder="Introductory text or story summary..."
          helperText={matchedPreset?.descriptionHelper || "Introductory paragraph shown on the section."}
        />
      )}

      {/* CTA Button Settings */}
      {fields.cta && (
        <Box className={styles.row}>
          <TextField
            label={matchedPreset?.ctaLabelName || "Primary CTA Button Label"}
            value={value.ctaLabel}
            onChange={(e) => set("ctaLabel", e.target.value)}
            fullWidth
            placeholder="e.g. Explore Talents, View all events"
            helperText={matchedPreset?.ctaHelper || "Button or link text."}
          />
          <TextField
            label="Primary CTA Destination URL"
            value={value.ctaUrl}
            onChange={(e) => set("ctaUrl", e.target.value)}
            fullWidth
            placeholder="e.g. /events, /talents, /about"
            helperText="Internal path (e.g. /talents) or external https:// URL."
          />
        </Box>
      )}

      {/* Hero-specific Secondary CTA */}
      {fields.heroExtras && (
        <Box className={styles.row}>
          <TextField
            label="Secondary CTA Button Label"
            value={value.secondaryCtaLabel}
            onChange={(e) => set("secondaryCtaLabel", e.target.value)}
            fullWidth
            placeholder="e.g. Support Our Mission, Explore Events"
            helperText="Secondary ghost button shown next to primary button (default: 'Support Our Mission')"
          />
          <TextField
            label="Secondary CTA Destination URL"
            value={value.secondaryCtaUrl}
            onChange={(e) => set("secondaryCtaUrl", e.target.value)}
            fullWidth
            placeholder="e.g. /about, /events"
            helperText="Destination link for the secondary button (default: /about)"
          />
        </Box>
      )}

      {/* Hero-specific Milestone Highlight Stats */}
      {fields.heroExtras && (
        <Box className={styles.subSectionBox}>
          <Box>
            <Typography className={styles.subSectionTitle}>
              Hero Milestone Highlights (4 Stat Counters)
            </Typography>
            <Typography className={styles.subSectionDescription}>
              These 4 key metrics are prominently showcased directly below the hero buttons.
            </Typography>
          </Box>
          <Box className={styles.statGrid}>
            {[0, 1, 2, 3].map((idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                <TextField
                  label={`Stat #${idx + 1} Value`}
                  value={stats[idx]?.value || ""}
                  onChange={(e) => updateStat(idx, "value", e.target.value)}
                  sx={{ width: { xs: "100%", sm: "38%" } }}
                  size="small"
                  placeholder="e.g. 500+"
                />
                <TextField
                  label={`Stat #${idx + 1} Label`}
                  value={stats[idx]?.label || ""}
                  onChange={(e) => updateStat(idx, "label", e.target.value)}
                  sx={{ width: { xs: "100%", sm: "62%" } }}
                  size="small"
                  placeholder="e.g. Verified Talents"
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Testimonials Central Management Notice */}
      {value.slug === "testimonials" && (
        
          <Button
            variant="contained"
            size="small"
            href="/testimonials"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNew fontSize="small" />}
            sx={{
              bgcolor: "#2563eb",
              "&:hover": { bgcolor: "#1d4ed8" },
              textTransform: "none",
              fontWeight: 600,
              mt: 0.5,
            }}
          >
            Open Testimonials Studio
          </Button>
      )}

      {/* Visual / Media */}
      {fields.image && (
        <>
          <MediaField
            label={matchedPreset?.imageLabel || "Section Visual (Image)"}
            value={value.imageUrl}
            mediaType="image"
            onChange={(url) => set("imageUrl", url)}
            onUploaded={(url) => set("imageUrl", url)}
            onBrowseLibrary={() => onPickMedia("image")}
            helperText={matchedPreset?.imageHelper || "Upload via Cloudinary, pick from library, or paste image URL."}
            showPreview={true}
            previewHeight={140}
          />

          <TextField
            label="Image Alt Text (SEO & Accessibility)"
            value={value.imageAlt}
            onChange={(e) => set("imageAlt", e.target.value)}
            fullWidth
            placeholder="Brief description of the image for screen readers."
          />
        </>
      )}

      {/* Video */}
      {fields.video && (
        <Box className={styles.row}>
          <TextField
            label="Playable Video URL"
            value={value.videoUrl}
            onChange={(e) => set("videoUrl", e.target.value)}
            fullWidth
            placeholder="e.g. https://www.youtube.com/... or Cloudinary video link"
            helperText="Embedded video loaded inside the interactive modal."
          />
          <Button
            onClick={() => onPickMedia("video")}
            startIcon={<Visibility />}
            variant="outlined"
            size="small"
            className={styles.mediaButton}
          >
            Select Video
          </Button>
        </Box>
      )}

      {/* Status */}
      <TextField
        label="Publishing Status"
        select
        value={value.status}
        onChange={(e) => set("status", e.target.value)}
        fullWidth
        helperText="Only 'Published' sections appear on the public website."
      >
        <MenuItem value="published">Published</MenuItem>
        <MenuItem value="draft">Draft</MenuItem>
      </TextField>
    </Box>
  );
}

export function SectionsEditor({ type = "homepage", title = "Homepage Sections", description }) {
  const isHomepage = type === "homepage";
  const listSections = useCallback(() => contentApi.listSections(type), [type]);
  const saveSection = useCallback((data, id) => contentApi.saveSection(type, data, id), [type]);
  const reorderSections = useCallback((ids) => contentApi.reorderSections(type, ids), [type]);
  const deleteSection = useCallback((id) => contentApi.deleteSection(type, id), [type]);
  const collection = useAdminCollection({
    list: listSections,
    save: saveSection,
    reorder: reorderSections,
    remove: deleteSection,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  function openCreate() {
    setSaveError("");
    setEditing({ ...EMPTY_SECTION });
    setDialogOpen(true);
  }

  function openEdit(item) {
    setSaveError("");
    const body = item.body || {};
    const stats =
      Array.isArray(body.stats) && body.stats.length >= 4
        ? body.stats
        : DEFAULT_HERO_STATS;
    const testimonials =
      Array.isArray(body.testimonials) && body.testimonials.length > 0
        ? body.testimonials
        : DEFAULT_TESTIMONIALS;

    setEditing({
      ...EMPTY_SECTION,
      ...body,
      id: item.id,
      slug: item.slug,
      title: item.title,
      summary: item.summary || "",
      sortOrder: item.sort_order,
      visible: item.featured !== false,
      status: item.status,
      heading: body.heading || "",
      headingHighlight: body.headingHighlight || "",
      secondaryCtaLabel: body.secondaryCtaLabel || body.ctaSecondary?.label || "",
      secondaryCtaUrl: body.secondaryCtaUrl || body.ctaSecondary?.href || "",
      stats,
      testimonials,
    });
    setDialogOpen(true);
  }

  async function submit(section = editing) {
    if (!section) return;
    setSaving(true);
    setSaveError("");
    try {
      await collection.save(section, section.id);
      setToastMessage(`Section "${section.title}" saved successfully.`);
      setDialogOpen(false);
    } catch (err) {
      setSaveError(err.message || "Unable to save section.");
    } finally {
      setSaving(false);
    }
  }

  async function openPreview() {
    try {
      const data = await contentApi.listSections(type, true);
      setPreviewData(data);
    } catch {
      setPreviewData([]);
    }
    setPreviewOpen(true);
  }

  if (collection.isLoading) return <AdminLoadingState />;
  if (collection.error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={collection.refresh}>
            Retry
          </Button>
        }
      >
        {collection.error}
      </Alert>
    );
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="h4" className={styles.pageTitle}>
              {title}
            </Typography>
            {isHomepage && (
              <Chip
                label={`${collection.items.length} Sections Configured`}
                size="small"
                sx={{ fontWeight: 600, bgcolor: "#f3f4f6" }}
              />
            )}
          </Box>
          <Typography variant="body1" className={styles.pageDescription}>
            {description ||
              "Arrange, customize, and control the live visibility of every section on the public landing page in real-time."}
          </Typography>
        </Box>
        <Box className={styles.headerActions}>
          {isHomepage && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNew />}
              href={getPublicSiteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
            >
              View Live Site
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            onClick={openPreview}
            className={styles.actionBtn}
          >
            Preview JSON
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={openCreate}
            className={styles.actionBtn}
          >
            Add Section
          </Button>
        </Box>
      </Box>

      {/* Guidance Card for Homepage */}
      {isHomepage && (
        <Paper elevation={0} className={styles.guidanceCard}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <HelpOutline sx={{ color: "#2563eb", mt: 0.25 }} fontSize="small" />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1e40af", mb: 0.25 }}>
                How Homepage Sections Work
              </Typography>
              <Typography variant="body2" sx={{ color: "#1e3a8a", lineHeight: 1.5 }}>
                • <strong>Reorder Flow:</strong> Drag and drop any row or use the arrow buttons to shift the section order on the live website.<br />
                • <strong>Customize Content:</strong> Click any section to adjust its headline, CTA button, and relevant imagery.<br />
                • <strong>Toggle Visibility:</strong> Turn off visibility to instantly hide a section from visitors without deleting it.<br />
                • <strong>Feed Items:</strong> The cards inside feeds (talents, events, blog posts, videos) are dynamically fed from their respective studio modules.
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {collection.items.length === 0 ? (
        <Paper elevation={0} className={styles.empty}>
          No sections yet. Add the first one to get started.
        </Paper>
      ) : (
        <SortableList
          items={collection.items}
          getKey={(item) => item.id}
          onMove={(from, to, updatedItems) => {
            let next = updatedItems;
            if (!next) {
              next = [...collection.items];
              const [moved] = next.splice(from, 1);
              next.splice(to, 0, moved);
            }
            collection.reorder(next.map((item) => item.id), next);
            setToastMessage("Section order updated.");
          }}
          onEdit={openEdit}
          onDelete={(item) => {
            collection.remove(item.id);
            setToastMessage(`Section "${item.title}" removed.`);
          }}
          renderPrimary={(item) => {
            const preset = isHomepage ? HOMEPAGE_PRESETS.find((p) => p.slug === item.slug) : null;
            const isVisible = item.featured !== false;
            const body = item.body || {};
            const heading = body.heading || item.title;
            const cta = body.ctaLabel ? `${body.ctaLabel} → ${body.ctaUrl || "#"}` : null;

            return (
              <Box sx={{ minWidth: 0, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body1" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                    {item.title}
                  </Typography>
                  {preset && <span className={styles.presetBadge}>{preset.name}</span>}
                </Box>

                {heading && heading !== item.title && (
                  <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word", mt: 0.25 }}>
                    Headline: &quot;{heading}&quot;
                  </Typography>
                )}

                {cta && (
                  <Typography variant="caption" sx={{ color: "#2563eb", fontWeight: 600, display: "block", mt: 0.25 }}>
                    CTA: {cta}
                  </Typography>
                )}

                <Box className={styles.chips}>
                  <span className={styles.orderBadge}>Position #{item.sort_order + 1}</span>
                  <StatusChip status={item.status} />
                  {isVisible ? (
                    <Chip
                      size="small"
                      label="Live on Homepage"
                      sx={{
                        height: 22,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: "rgba(16, 185, 129, 0.12)",
                        color: "#065f46",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Hidden from Site"
                      sx={{
                        height: 22,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: "rgba(239, 68, 68, 0.12)",
                        color: "#991b1b",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          }}
        />
      )}

      {/* Edit/Create Section Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 3 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            borderRadius: { xs: "12px", sm: "16px" },
            maxHeight: { xs: "calc(100% - 24px)", sm: "calc(100% - 64px)" },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 1.5, fontWeight: 700 }}>
          {editing?.id ? `Edit Section: ${editing.title}` : "Add Homepage Section"}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}
          <SectionForm
            value={editing || EMPTY_SECTION}
            onChange={setEditing}
            isEditing={Boolean(editing?.id)}
            type={type}
            onPickMedia={(pickerType) => {
              setMediaType(pickerType);
              setMediaPickerOpen(true);
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: { xs: 1, sm: 1.5 },
            "& > button": {
              width: { xs: "100%", sm: "auto" },
              minHeight: { xs: "40px", sm: "36px" },
            },
          }}
        >
          <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={() => submit({ ...editing, status: "draft" })}
            disabled={saving}
          >
            {saving ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null} Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={() => submit({ ...editing, status: "published" })}
            disabled={saving}
          >
            {saving ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null} Publish Live
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Picker Dialog */}
      <MediaPicker
        open={mediaPickerOpen}
        type={mediaType}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(media) => {
          if (mediaType === "image") {
            setEditing({ ...editing, imageUrl: media.imageUrl, imageAlt: media.altText || media.title });
          } else {
            setEditing({ ...editing, videoUrl: media.videoUrl, videoTitle: media.title });
          }
          setMediaPickerOpen(false);
        }}
      />

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 3 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            borderRadius: { xs: "12px", sm: "16px" },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 } }}>Public Preview JSON</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <pre className={styles.preview}>{JSON.stringify(previewData, null, 2)}</pre>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5 }}>
          <Button onClick={() => setPreviewOpen(false)} sx={{ width: { xs: "100%", sm: "auto" }, minHeight: "40px" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage("")}
        message={toastMessage}
      />
    </Box>
  );
}
