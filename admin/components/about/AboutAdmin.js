import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BurstModeOutlinedIcon from "@mui/icons-material/BurstModeOutlined";
import CollectionsOutlinedIcon from "@mui/icons-material/CollectionsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { contentApi } from "@/services/contentApi";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { MediaField } from "@/components/content/MediaField";
import { MediaPicker } from "@/components/content/MediaPicker";
import styles from "./AboutAdmin.module.css";

const DEFAULT_HERO = {
  slug: "hero",
  title: "Hero Banner",
  badge: "About Us",
  headline: "A MOVEMENT BORN FROM PASSION,",
  headlineAccent: "DRIVEN BY PURPOSE",
  description:
    "We discover. We develop. We empower. Together, we are a legacy that transforms lives and communities.",
  ctaHref: "/donate",
  ctaLabel: "Support Our Mission",
  image: "/assets/img/about-hero.jpg",
  imageAlt: "A movement born from passion, driven by purpose",
  status: "published",
  visible: true,
};

const DEFAULT_STORY = {
  slug: "story",
  title: "Our Story & Leadership",
  badge: "ABOUT ROYZ HOUZ",
  headline: "Bridging African Talent With The",
  headlineAccent: "World Creating Impact",
  leadDescription:
    "Royz Houz is a dynamic african organization committed to discovering, developing and empowering creatives, talents while driving positive change in communities through entertainment, education and innovation. We are the bridge between African talent and the world.",
  subDescription:
    "Today, Royz Houz is home to over 500 of Africa's most exceptional creatives across music, film, fashion, visual art, dance, photography, and innovation.",
  checklistItems: [
    "Creative Growth & Support",
    "Professional Talent Booking",
    "Events & Creative Experiences",
    "Creative Talent Discovery",
  ],
  ctaHref: "/talents",
  ctaLabel: "Explore Talents",
  teamImage: "/assets/img/about/team.jpg",
  teamImageAlt: "Royz Houz Creative Team collaborating",
  leader: {
    name: "Kennedy Donald",
    role: "CEO Royz Houz",
    image: "/assets/img/about/leader.jpg",
    imageAlt: "Kennedy Donald, CEO Royz Houz",
    quote:
      "Royz Houz exists to turn that belief into meaningful opportunities, lasting connections, and real impact.",
  },
  status: "published",
  visible: true,
};

const DEFAULT_WHY_CHOOSE_US = {
  slug: "why-choose-us",
  title: "Why Choose Us Overview",
  badge: "WHY CHOOSE US",
  headline: "We Connect Africa’s Creative Talent With Opportunities To Grow.",
  description:
    "We create a space where Africa’s creative talent can be discovered, celebrated, and connected with meaningful opportunities that inspire growth, collaboration, and lasting impact.",
  status: "published",
  visible: true,
};

const DEFAULT_MISSION_VISION = {
  slug: "mission-vision",
  title: "Mission and Vision Cards",
  cards: [
    {
      id: "mission",
      title: "Our Mission",
      description:
        "To discover, develop, and empower creatives through meaningful opportunities, collaboration, and experiences that create positive change in communities.",
      iconKey: "mission",
    },
    {
      id: "vision",
      title: "Our Vision",
      description:
        "To become a leading platform where aspiring creatives access opportunities, mentorship, and support that inspire growth, innovation, and lasting impact.",
      iconKey: "vision",
    },
  ],
  status: "published",
  visible: true,
};

const DEFAULT_IMPACT_METRICS = {
  slug: "impact-metrics",
  title: "Impact Metrics & Statistics",
  metrics: [
    {
      id: "talent-discovery",
      title: "Talent Discovery",
      percentage: 94,
      description:
        "Discover exceptional African creatives and connect with talented individuals whose skills, passion, and unique stories deserve to be seen.",
    },
    {
      id: "creative-development",
      title: "Creative Development",
      percentage: 89,
      description:
        "We support creatives with meaningful opportunities, guidance, and connections that help them develop their skills and grow their careers.",
    },
    {
      id: "meaningful-impact",
      title: "Meaningful Impact",
      percentage: 86,
      description:
        "From creative opportunities to community initiatives, we create experiences that empower people and contribute to lasting positive change.",
    },
  ],
  status: "published",
  visible: true,
};

const DEFAULT_MOMENTS = {
  slug: "moments",
  title: "Moments That Matter Overview",
  badge: "WHO WE ARE",
  headline: "Moments That Matters",
  subtitle:
    "A visual journey celebrating the people, stories and unforgettable moments that continue to shape Royz Houz.",
  proofTitle: "Trusted By 1500+ Clients",
  ratingScore: "4.8/5",
  ratingLabel: "4.8 out of 5 stars",
  reviewsCount: "975 Reviews",
  image: "/assets/img/about/moments.jpg",
  imageAlt: "Creative moments shaping Royz Houz",
  status: "published",
  visible: true,
};

const DEFAULT_MOMENTS_FEATURES = {
  slug: "moments-features",
  title: "Moments Feature Cards",
  features: [
    {
      id: "discovery",
      title: "Creative Talent Discovery",
      description:
        "Discover exceptional African creatives and explore their unique talents, stories, and journeys.",
      iconName: "TalentDiscovery",
      darkBadge: false,
    },
    {
      id: "development",
      title: "Talent Development",
      description:
        "Access meaningful opportunities, mentorship, and support designed to help creatives grow.",
      iconName: "Sprout",
      darkBadge: true,
    },
    {
      id: "opportunities",
      title: "Creative Opportunities",
      description:
        "Connect talented individuals with events, collaborations, projects, and career opportunities.",
      iconName: "Handshake",
      darkBadge: false,
    },
    {
      id: "impact",
      title: "Community Impact",
      description:
        "Be part of a growing movement creating positive change through creativity, education, and empowerment.",
      iconName: "Heart",
      darkBadge: true,
    },
  ],
  status: "published",
  visible: true,
};

const DEFAULT_GALLERY = {
  slug: "gallery",
  title: "Gallery Columns",
  badge: "OUR GALLERY",
  headline: "Moments That Matters",
  subtitle:
    "A visual journey celebrating the people, stories and unforgettable moments that continue to shape Royz Houz.",
  columns: [
    [
      {
        id: "gallery-1",
        title: "Cultural Heritage & Community",
        image: "/assets/img/about/gallery/gallery-1.jpg",
        alt: "African women in traditional headwraps and cultural attire",
        size: "tall",
      },
      {
        id: "gallery-4",
        title: "Festive Celebration & Unity",
        image: "/assets/img/about/gallery/gallery-4.jpg",
        alt: "Women in traditional white Habesha Kemis dresses celebrating cultural festival",
        size: "short",
      },
    ],
    [
      {
        id: "gallery-2",
        title: "Vibrant Dance & Expression",
        image: "/assets/img/about/gallery/gallery-2.jpg",
        alt: "African cultural dancers performing energetically outdoors",
        size: "short",
      },
      {
        id: "gallery-5",
        title: "Live Musical Performance",
        image: "/assets/img/about/gallery/gallery-5.jpg",
        alt: "Afrobeats artist singing on stage with microphone and sunglasses",
        size: "tall",
      },
    ],
    [
      {
        id: "gallery-3",
        title: "Regal Traditions & Leadership",
        image: "/assets/img/about/gallery/gallery-3.jpg",
        alt: "Distinguished African elder in ceremonial royal robes and headdress",
        size: "short",
      },
      {
        id: "gallery-6",
        title: "Concert Spotlight & Energy",
        image: "/assets/img/about/gallery/gallery-6.jpg",
        alt: "Live concert performance with electric guitarist under stage lights",
        size: "extraTall",
      },
    ],
  ],
  status: "published",
  visible: true,
};

export function AboutAdmin() {
  const [tab, setTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Section States
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [story, setStory] = useState(DEFAULT_STORY);
  const [whyChooseUs, setWhyChooseUs] = useState(DEFAULT_WHY_CHOOSE_US);
  const [missionVision, setMissionVision] = useState(DEFAULT_MISSION_VISION);
  const [impactMetrics, setImpactMetrics] = useState(DEFAULT_IMPACT_METRICS);
  const [moments, setMoments] = useState(DEFAULT_MOMENTS);
  const [momentsFeatures, setMomentsFeatures] = useState(DEFAULT_MOMENTS_FEATURES);
  const [gallery, setGallery] = useState(DEFAULT_GALLERY);
  const [mediaPicker, setMediaPicker] = useState(null);

  function openMediaPicker(target, callback) {
    if (typeof target === "function") {
      setMediaPicker({ type: "image", onSelect: target });
    } else if (typeof callback === "function") {
      setMediaPicker({ type: target || "image", onSelect: callback });
    } else {
      setMediaPicker(target);
    }
  }

  function handleSelectMedia(media) {
    if (!mediaPicker) return;
    const url =
      mediaPicker.type === "video"
        ? media?.videoUrl || media?.secure_url || media?.url || ""
        : media?.imageUrl || media?.secure_url || media?.url || "";
    if (mediaPicker.onSelect) {
      mediaPicker.onSelect(url, media);
    }
    setMediaPicker(null);
  }

  useEffect(() => {
    async function loadAboutData() {
      setIsLoading(true);
      setError(null);
      try {
        const rows = await contentApi.listSections("about");
        if (Array.isArray(rows)) {
          const bySlug = new Map(rows.map((r) => [r.slug, r]));

          function populate(defaultVal, slug) {
            const row = bySlug.get(slug);
            if (!row) return defaultVal;
            const body = row.body && typeof row.body === "object" ? row.body : {};
            return {
              ...defaultVal,
              ...body,
              id: row.id,
              slug: row.slug,
              title: row.title || defaultVal.title,
              summary: row.summary,
              status: row.status || defaultVal.status,
              visible: row.featured !== false,
              sortOrder: row.sort_order ?? defaultVal.sortOrder,
            };
          }

          setHero(populate(DEFAULT_HERO, "hero"));
          setStory(populate(DEFAULT_STORY, "story"));
          setWhyChooseUs(populate(DEFAULT_WHY_CHOOSE_US, "why-choose-us"));
          setMissionVision(populate(DEFAULT_MISSION_VISION, "mission-vision"));
          setImpactMetrics(populate(DEFAULT_IMPACT_METRICS, "impact-metrics"));
          setMoments(populate(DEFAULT_MOMENTS, "moments"));
          setMomentsFeatures(populate(DEFAULT_MOMENTS_FEATURES, "moments-features"));
          setGallery(populate(DEFAULT_GALLERY, "gallery"));
        }
      } catch (err) {
        setError(err.message || "Failed to load About page data.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadAboutData();
  }, []);

  async function handleSaveSection(sectionData, sectionName) {
    setIsSaving(true);
    setError(null);
    try {
      await contentApi.saveSection("about", sectionData, sectionData.id);
      setToastMessage(`${sectionName} saved and published successfully.`);
    } catch (err) {
      setError(err.message || `Unable to save ${sectionName}.`);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <AdminLoadingState />;

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.pageHeader}>
        <Box>
          <Typography variant="h4" className={styles.pageTitle}>
            About Page Studio
          </Typography>
          <Typography variant="body1" className={styles.pageDescription}>
            Tailored visual controls for every section of the public About page. Edit storytelling narratives, leader spotlights, mission &amp; vision cards, impact metrics, and photo galleries.
          </Typography>
        </Box>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        className={styles.tabs}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<ViewAgendaOutlinedIcon fontSize="small" />} iconPosition="start" label="Hero Banner" />
        <Tab icon={<AutoStoriesOutlinedIcon fontSize="small" />} iconPosition="start" label="Story & Leadership" />
        <Tab icon={<FlagOutlinedIcon fontSize="small" />} iconPosition="start" label="Mission & Vision" />
        <Tab icon={<AssessmentOutlinedIcon fontSize="small" />} iconPosition="start" label="Impact Metrics" />
        <Tab icon={<BurstModeOutlinedIcon fontSize="small" />} iconPosition="start" label="Moments & Proof" />
        <Tab icon={<CollectionsOutlinedIcon fontSize="small" />} iconPosition="start" label="Gallery Showcase" />
      </Tabs>

      {/* TAB 0: HERO BANNER */}
      {tab === 0 && (
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Box>
              <Typography className={styles.cardTitle}>Hero Banner Section</Typography>
              <Typography className={styles.cardSubtitle}>
                Bold introductory statement, badge, background concert media, and primary CTA.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                select
                size="small"
                label="Status"
                value={hero.status}
                onChange={(e) => setHero({ ...hero, status: e.target.value })}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={hero.visible}
                    onChange={(e) => setHero({ ...hero, visible: e.target.checked })}
                    color="primary"
                  />
                }
                label="Visible"
              />
            </Box>
          </Box>

          <Box className={styles.formGrid}>
            <TextField
              label="Pill Badge"
              value={hero.badge || ""}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
              fullWidth
              helperText="e.g. About Us"
            />
            <TextField
              label="Headline (Primary)"
              value={hero.headline || ""}
              onChange={(e) => setHero({ ...hero, headline: e.target.value })}
              fullWidth
            />
            <TextField
              label="Headline Accent (Gold Highlight)"
              value={hero.headlineAccent || ""}
              onChange={(e) => setHero({ ...hero, headlineAccent: e.target.value })}
              fullWidth
            />
            <Box className={styles.fullWidth}>
              <MediaField
                label="Hero Background Image"
                value={hero.image || ""}
                onChange={(value) => setHero({ ...hero, image: value })}
                onBrowseLibrary={() => openMediaPicker((url) => setHero({ ...hero, image: url }))}
                helperText="Upload or choose from library for high-resolution hero background (1920×1080 recommended)"
                fullWidth
              />
            </Box>
            <TextField
              label="CTA Button Label"
              value={hero.ctaLabel || ""}
              onChange={(e) => setHero({ ...hero, ctaLabel: e.target.value })}
              fullWidth
            />
            <TextField
              label="CTA Destination Link"
              value={hero.ctaHref || ""}
              onChange={(e) => setHero({ ...hero, ctaHref: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mission Statement / Description"
              value={hero.description || ""}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              fullWidth
              multiline
              minRows={3}
              className={styles.fullWidth}
            />
          </Box>

          {/* Live Preview */}
          <Box className={styles.livePreview}>
            <div className={styles.previewBadge}>{hero.badge || "About Us"}</div>
            <div className={styles.previewHeadline}>
              {hero.headline} <span className={styles.previewAccent}>{hero.headlineAccent}</span>
            </div>
            <div className={styles.previewDesc}>{hero.description}</div>
          </Box>

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" /> Ready to publish
            </span>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={() => handleSaveSection(hero, "Hero Banner")}
              disabled={isSaving}
            >
              Save Hero Banner
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 1: STORY & LEADERSHIP */}
      {tab === 1 && (
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Box>
              <Typography className={styles.cardTitle}>Our Story &amp; Leadership Spotlight</Typography>
              <Typography className={styles.cardSubtitle}>
                Brand story, checklist pillars, team photo, and CEO leader spotlight card.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                select
                size="small"
                label="Status"
                value={story.status}
                onChange={(e) => setStory({ ...story, status: e.target.value })}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={story.visible}
                    onChange={(e) => setStory({ ...story, visible: e.target.checked })}
                    color="primary"
                  />
                }
                label="Visible"
              />
            </Box>
          </Box>

          <Box className={styles.formGrid}>
            <TextField
              label="Tagline Badge"
              value={story.badge || ""}
              onChange={(e) => setStory({ ...story, badge: e.target.value })}
              fullWidth
            />
            <TextField
              label="Story Headline"
              value={story.headline || ""}
              onChange={(e) => setStory({ ...story, headline: e.target.value })}
              fullWidth
            />
            <TextField
              label="Story Headline Accent"
              value={story.headlineAccent || ""}
              onChange={(e) => setStory({ ...story, headlineAccent: e.target.value })}
              fullWidth
            />
            <Box className={styles.fullWidth}>
              <MediaField
                label="Team Collaboration Image"
                value={story.teamImage || ""}
                onChange={(value) => setStory({ ...story, teamImage: value })}
                onBrowseLibrary={() => openMediaPicker((url) => setStory({ ...story, teamImage: url }))}
                helperText="Upload or choose from library for team studio collaboration photograph"
                fullWidth
              />
            </Box>
            <TextField
              label="CTA Button Label"
              value={story.ctaLabel || ""}
              onChange={(e) => setStory({ ...story, ctaLabel: e.target.value })}
              fullWidth
            />
            <TextField
              label="CTA Destination Link"
              value={story.ctaHref || ""}
              onChange={(e) => setStory({ ...story, ctaHref: e.target.value })}
              fullWidth
            />
            <TextField
              label="Lead Narrative Paragraph"
              value={story.leadDescription || ""}
              onChange={(e) => setStory({ ...story, leadDescription: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              className={styles.fullWidth}
            />
            <TextField
              label="Sub-Description Paragraph"
              value={story.subDescription || ""}
              onChange={(e) => setStory({ ...story, subDescription: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              className={styles.fullWidth}
            />
          </Box>

          {/* Checklist Items */}
          <Box className={styles.subSection}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography className={styles.subSectionTitle}>
                Key Organizational Pillars (Checklist Items)
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setStory({ ...story, checklistItems: [...(story.checklistItems || []), ""] })}
                variant="outlined"
                className={styles.addBtn}
              >
                Add Bullet Item
              </Button>
            </Box>
            <Box className={styles.itemsList}>
              {(story.checklistItems || []).map((item, idx) => (
                <Box key={idx} className={styles.checkItemRow}>
                  <TextField
                    size="small"
                    value={item}
                    onChange={(e) => {
                      const next = [...story.checklistItems];
                      next[idx] = e.target.value;
                      setStory({ ...story, checklistItems: next });
                    }}
                    fullWidth
                    placeholder="e.g. Creative Growth & Support"
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const next = story.checklistItems.filter((_, i) => i !== idx);
                      setStory({ ...story, checklistItems: next });
                    }}
                    className={styles.deleteBtn}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Leader Spotlight Card */}
          <Box className={styles.subSection}>
            <Typography className={styles.subSectionTitle}>
              Leader Spotlight Card (Executive Quote &amp; Profile)
            </Typography>
            <Box className={styles.formGrid}>
              <TextField
                label="Leader Full Name"
                value={story.leader?.name || ""}
                onChange={(e) =>
                  setStory({ ...story, leader: { ...(story.leader || {}), name: e.target.value } })
                }
                fullWidth
              />
              <TextField
                label="Leader Official Role"
                value={story.leader?.role || ""}
                onChange={(e) =>
                  setStory({ ...story, leader: { ...(story.leader || {}), role: e.target.value } })
                }
                fullWidth
              />
              <Box className={styles.fullWidth}>
                <MediaField
                  label="Leader Portrait Photo"
                  value={story.leader?.image || ""}
                  onChange={(value) =>
                    setStory({ ...story, leader: { ...(story.leader || {}), image: value } })
                  }
                  onBrowseLibrary={() =>
                    openMediaPicker((url) =>
                      setStory({ ...story, leader: { ...(story.leader || {}), image: url } })
                    )
                  }
                  helperText="Portrait photograph of the leader / CEO (high-res square or 4:5 portrait)"
                  fullWidth
                />
              </Box>
              <TextField
                label="Leader Executive Quote"
                value={story.leader?.quote || ""}
                onChange={(e) =>
                  setStory({ ...story, leader: { ...(story.leader || {}), quote: e.target.value } })
                }
                fullWidth
                multiline
                minRows={2}
                className={styles.fullWidth}
              />
            </Box>
          </Box>

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" /> Ready to publish
            </span>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={() => handleSaveSection(story, "Story & Leadership")}
              disabled={isSaving}
            >
              Save Story &amp; Leadership
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 2: MISSION & VISION */}
      {tab === 2 && (
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Box>
              <Typography className={styles.cardTitle}>Why Choose Us &amp; Mission/Vision</Typography>
              <Typography className={styles.cardSubtitle}>
                Pillars defining why clients and creatives choose Royz Houz.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                select
                size="small"
                label="Status"
                value={missionVision.status}
                onChange={(e) => setMissionVision({ ...missionVision, status: e.target.value })}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={missionVision.visible}
                    onChange={(e) => setMissionVision({ ...missionVision, visible: e.target.checked })}
                    color="primary"
                  />
                }
                label="Visible"
              />
            </Box>
          </Box>

          <Box className={styles.subSection}>
            <Typography className={styles.subSectionTitle}>Section Overview Text</Typography>
            <Box className={styles.formGrid}>
              <TextField
                label="Section Badge"
                value={whyChooseUs.badge || ""}
                onChange={(e) => setWhyChooseUs({ ...whyChooseUs, badge: e.target.value })}
                fullWidth
              />
              <TextField
                label="Section Headline"
                value={whyChooseUs.headline || ""}
                onChange={(e) => setWhyChooseUs({ ...whyChooseUs, headline: e.target.value })}
                fullWidth
              />
              <TextField
                label="Section Description"
                value={whyChooseUs.description || ""}
                onChange={(e) => setWhyChooseUs({ ...whyChooseUs, description: e.target.value })}
                fullWidth
                multiline
                minRows={2}
                className={styles.fullWidth}
              />
            </Box>
          </Box>

          <Box className={styles.subSection}>
            <Typography className={styles.subSectionTitle}>Mission &amp; Vision Cards</Typography>
            <Box className={styles.formGrid}>
              {(missionVision.cards || []).map((card, idx) => (
                <Box key={card.id || idx} className={styles.itemCard}>
                  <span className={styles.itemNumber}>{card.id === "mission" ? "MISSION" : "VISION"}</span>
                  <TextField
                    label="Card Title"
                    value={card.title}
                    onChange={(e) => {
                      const next = [...missionVision.cards];
                      next[idx] = { ...card, title: e.target.value };
                      setMissionVision({ ...missionVision, cards: next });
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Card Description"
                    value={card.description}
                    onChange={(e) => {
                      const next = [...missionVision.cards];
                      next[idx] = { ...card, description: e.target.value };
                      setMissionVision({ ...missionVision, cards: next });
                    }}
                    fullWidth
                    multiline
                    minRows={3}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" /> Ready to publish
            </span>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={async () => {
                await handleSaveSection(whyChooseUs, "Why Choose Us Overview");
                await handleSaveSection(missionVision, "Mission & Vision Cards");
              }}
              disabled={isSaving}
            >
              Save Mission &amp; Vision
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 3: IMPACT METRICS */}
      {tab === 3 && (
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Box>
              <Typography className={styles.cardTitle}>Impact Metrics &amp; Growth Statistics</Typography>
              <Typography className={styles.cardSubtitle}>
                Progress percentages and capability numbers featured on the About page.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                variant="outlined"
                className={styles.addBtn}
                onClick={() => {
                  const newMetric = {
                    id: `metric-${Date.now()}`,
                    title: "New Metric Title",
                    percentage: 85,
                    description: "Highlight creative empowerment and measurable community outcomes.",
                  };
                  setImpactMetrics({
                    ...impactMetrics,
                    metrics: [...(impactMetrics.metrics || []), newMetric],
                  });
                }}
              >
                Add Impact Metric
              </Button>
              <TextField
                select
                size="small"
                label="Status"
                value={impactMetrics.status}
                onChange={(e) => setImpactMetrics({ ...impactMetrics, status: e.target.value })}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={impactMetrics.visible}
                    onChange={(e) => setImpactMetrics({ ...impactMetrics, visible: e.target.checked })}
                    color="primary"
                  />
                }
                label="Visible"
              />
            </Box>
          </Box>

          <Box className={styles.formGrid}>
            {(impactMetrics.metrics || []).map((metric, idx) => (
              <Box key={metric.id || idx} className={styles.itemCard}>
                <Box className={styles.itemHeader}>
                  <span className={styles.itemNumber}>METRIC #{idx + 1}</span>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span style={{ fontWeight: 800, color: "#B46A2C", fontSize: "1.1rem" }}>
                      {metric.percentage}%
                    </span>
                    <Tooltip title="Delete metric">
                      <IconButton
                        size="small"
                        aria-label="Delete metric"
                        className={styles.deleteBtn}
                        onClick={() => {
                          const next = impactMetrics.metrics.filter((_, i) => i !== idx);
                          setImpactMetrics({ ...impactMetrics, metrics: next });
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <TextField
                  label="Metric Title"
                  value={metric.title}
                  onChange={(e) => {
                    const next = [...impactMetrics.metrics];
                    next[idx] = { ...metric, title: e.target.value };
                    setImpactMetrics({ ...impactMetrics, metrics: next });
                  }}
                  fullWidth
                />
                <TextField
                  label="Percentage (0 - 100)"
                  type="number"
                  value={metric.percentage}
                  onChange={(e) => {
                    const next = [...impactMetrics.metrics];
                    next[idx] = { ...metric, percentage: Number(e.target.value) };
                    setImpactMetrics({ ...impactMetrics, metrics: next });
                  }}
                  fullWidth
                />
                <TextField
                  label="Impact Summary Description"
                  value={metric.description}
                  onChange={(e) => {
                    const next = [...impactMetrics.metrics];
                    next[idx] = { ...metric, description: e.target.value };
                    setImpactMetrics({ ...impactMetrics, metrics: next });
                  }}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Box>
            ))}
          </Box>

          {(!impactMetrics.metrics || impactMetrics.metrics.length === 0) && (
            <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                No impact metrics configured. Click &quot;Add Impact Metric&quot; to create your first metric.
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => {
                  const newMetric = {
                    id: `metric-${Date.now()}`,
                    title: "Talent Empowerment",
                    percentage: 90,
                    description: "Describe the positive impact and creative growth achieved.",
                  };
                  setImpactMetrics({ ...impactMetrics, metrics: [newMetric] });
                }}
              >
                Add First Metric
              </Button>
            </Box>
          )}

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" /> Ready to publish
            </span>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={() => handleSaveSection(impactMetrics, "Impact Metrics")}
              disabled={isSaving}
            >
              Save Impact Metrics
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 4: MOMENTS & PROOF */}
      {tab === 4 && (
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Box>
              <Typography className={styles.cardTitle}>Moments That Matter &amp; Social Proof</Typography>
              <Typography className={styles.cardSubtitle}>
                Highlight cards, showcase photography, client review ratings, and trust metrics.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                select
                size="small"
                label="Status"
                value={moments.status}
                onChange={(e) => setMoments({ ...moments, status: e.target.value })}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={moments.visible}
                    onChange={(e) => setMoments({ ...moments, visible: e.target.checked })}
                    color="primary"
                  />
                }
                label="Visible"
              />
            </Box>
          </Box>

          <Box className={styles.subSection}>
            <Typography className={styles.subSectionTitle}>Header &amp; Showcase Media</Typography>
            <Box className={styles.formGrid}>
              <TextField
                label="Badge"
                value={moments.badge || ""}
                onChange={(e) => setMoments({ ...moments, badge: e.target.value })}
                fullWidth
              />
              <TextField
                label="Headline"
                value={moments.headline || ""}
                onChange={(e) => setMoments({ ...moments, headline: e.target.value })}
                fullWidth
              />
              <Box className={styles.fullWidth}>
                <MediaField
                  label="Showcase Image"
                  value={moments.image || ""}
                  onChange={(value) => setMoments({ ...moments, image: value })}
                  onBrowseLibrary={() => openMediaPicker((url) => setMoments({ ...moments, image: url }))}
                  helperText="High-impact creative showcase photo displayed alongside social proof"
                  fullWidth
                />
              </Box>
              <TextField
                label="Subtitle Description"
                value={moments.subtitle || ""}
                onChange={(e) => setMoments({ ...moments, subtitle: e.target.value })}
                fullWidth
                multiline
                minRows={2}
                className={styles.fullWidth}
              />
            </Box>
          </Box>

          <Box className={styles.subSection}>
            <Typography className={styles.subSectionTitle}>Social Proof &amp; Reviews Rating</Typography>
            <Box className={styles.formGrid}>
              <TextField
                label="Proof Title (e.g. Trusted By 1500+ Clients)"
                value={moments.proofTitle || ""}
                onChange={(e) => setMoments({ ...moments, proofTitle: e.target.value })}
                fullWidth
              />
              <TextField
                label="Rating Score (e.g. 4.8/5)"
                value={moments.ratingScore || ""}
                onChange={(e) => setMoments({ ...moments, ratingScore: e.target.value })}
                fullWidth
              />
              <TextField
                label="Reviews Count (e.g. 975 Reviews)"
                value={moments.reviewsCount || ""}
                onChange={(e) => setMoments({ ...moments, reviewsCount: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>

          <Box className={styles.subSection}>
            <Typography className={styles.subSectionTitle}>Feature Highlights (4 Pillars)</Typography>
            <Box className={styles.formGrid}>
              {(momentsFeatures.features || []).map((feat, idx) => (
                <Box key={feat.id || idx} className={styles.itemCard}>
                  <span className={styles.itemNumber}>FEATURE #{idx + 1}</span>
                  <TextField
                    label="Feature Title"
                    value={feat.title}
                    onChange={(e) => {
                      const next = [...momentsFeatures.features];
                      next[idx] = { ...feat, title: e.target.value };
                      setMomentsFeatures({ ...momentsFeatures, features: next });
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Feature Description"
                    value={feat.description}
                    onChange={(e) => {
                      const next = [...momentsFeatures.features];
                      next[idx] = { ...feat, description: e.target.value };
                      setMomentsFeatures({ ...momentsFeatures, features: next });
                    }}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={feat.darkBadge}
                        onChange={(e) => {
                          const next = [...momentsFeatures.features];
                          next[idx] = { ...feat, darkBadge: e.target.checked };
                          setMomentsFeatures({ ...momentsFeatures, features: next });
                        }}
                      />
                    }
                    label="Dark badge styling"
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" /> Ready to publish
            </span>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={async () => {
                await handleSaveSection(moments, "Moments Overview");
                await handleSaveSection(momentsFeatures, "Moments Features");
              }}
              disabled={isSaving}
            >
              Save Moments Section
            </Button>
          </Box>
        </Paper>
      )}

      {/* TAB 5: GALLERY SHOWCASE */}
      {tab === 5 && (
        <Paper elevation={0} className={styles.card}>
          <Box className={styles.cardHeader}>
            <Box>
              <Typography className={styles.cardTitle}>Gallery Showcase (Masonry Columns)</Typography>
              <Typography className={styles.cardSubtitle}>
                Visual performance, dance, and cultural images displayed in 3 masonry columns.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                select
                size="small"
                label="Status"
                value={gallery.status}
                onChange={(e) => setGallery({ ...gallery, status: e.target.value })}
                sx={{ minWidth: 130 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={gallery.visible}
                    onChange={(e) => setGallery({ ...gallery, visible: e.target.checked })}
                    color="primary"
                  />
                }
                label="Visible"
              />
            </Box>
          </Box>

          <Box className={styles.formGrid}>
            <TextField
              label="Gallery Badge"
              value={gallery.badge || ""}
              onChange={(e) => setGallery({ ...gallery, badge: e.target.value })}
              fullWidth
            />
            <TextField
              label="Gallery Headline"
              value={gallery.headline || ""}
              onChange={(e) => setGallery({ ...gallery, headline: e.target.value })}
              fullWidth
            />
            <TextField
              label="Gallery Subtitle"
              value={gallery.subtitle || ""}
              onChange={(e) => setGallery({ ...gallery, subtitle: e.target.value })}
              fullWidth
              multiline
              minRows={2}
              className={styles.fullWidth}
            />
          </Box>

          {/* 3 Masonry Columns */}
          <Box className={styles.formGrid}>
            {(gallery.columns || []).map((col, colIdx) => (
              <Box key={colIdx} className={styles.subSection}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography className={styles.subSectionTitle}>Column #{colIdx + 1}</Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const next = [...gallery.columns];
                      next[colIdx] = [
                        ...(next[colIdx] || []),
                        {
                          id: `gallery-new-${Date.now()}`,
                          title: "New Photo",
                          image: "/assets/img/about/gallery/gallery-1.jpg",
                          alt: "Performance image",
                          size: "short",
                        },
                      ];
                      setGallery({ ...gallery, columns: next });
                    }}
                    variant="outlined"
                    className={styles.addBtn}
                  >
                    Add Image
                  </Button>
                </Box>

                <Box className={styles.itemsList}>
                  {(col || []).map((img, imgIdx) => (
                    <Box key={img.id || imgIdx} className={styles.itemCard}>
                      <Box className={styles.itemHeader}>
                        <span className={styles.itemNumber}>CARD #{imgIdx + 1}</span>
                        <IconButton
                          size="small"
                          onClick={() => {
                            const next = [...gallery.columns];
                            next[colIdx] = next[colIdx].filter((_, i) => i !== imgIdx);
                            setGallery({ ...gallery, columns: next });
                          }}
                          className={styles.deleteBtn}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <TextField
                        size="small"
                        label="Image Title"
                        value={img.title || ""}
                        onChange={(e) => {
                          const next = [...gallery.columns];
                          next[colIdx][imgIdx] = { ...img, title: e.target.value };
                          setGallery({ ...gallery, columns: next });
                        }}
                        fullWidth
                      />
                      <MediaField
                        label="Gallery Photo"
                        value={img.image || ""}
                        onChange={(value) => {
                          const next = [...gallery.columns];
                          next[colIdx][imgIdx] = { ...img, image: value };
                          setGallery({ ...gallery, columns: next });
                        }}
                        onBrowseLibrary={() =>
                          openMediaPicker((url) => {
                            const next = [...gallery.columns];
                            next[colIdx][imgIdx] = { ...img, image: url };
                            setGallery({ ...gallery, columns: next });
                          })
                        }
                        helperText="Upload, browse library, or paste image URL"
                        fullWidth
                      />
                      <TextField
                        select
                        size="small"
                        label="Card Aspect Size"
                        value={img.size || "short"}
                        onChange={(e) => {
                          const next = [...gallery.columns];
                          next[colIdx][imgIdx] = { ...img, size: e.target.value };
                          setGallery({ ...gallery, columns: next });
                        }}
                        fullWidth
                      >
                        <MenuItem value="short">Short Card</MenuItem>
                        <MenuItem value="tall">Tall Card</MenuItem>
                        <MenuItem value="extraTall">Extra Tall Card</MenuItem>
                      </TextField>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          <Box className={styles.saveBar}>
            <span className={styles.syncBadge}>
              <CheckCircleOutlineIcon fontSize="small" /> Ready to publish
            </span>
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
              onClick={() => handleSaveSection(gallery, "Gallery Showcase")}
              disabled={isSaving}
            >
              Save Gallery Showcase
            </Button>
          </Box>
        </Paper>
      )}

      {/* Confirmation Snackbar */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />

      {/* Media Picker Modal */}
      {mediaPicker && (
        <MediaPicker
          open={Boolean(mediaPicker)}
          type={mediaPicker.type || "image"}
          onClose={() => setMediaPicker(null)}
          onSelect={handleSelectMedia}
        />
      )}
    </Box>
  );
}
