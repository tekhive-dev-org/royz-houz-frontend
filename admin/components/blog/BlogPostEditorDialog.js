import { useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import PermMediaOutlinedIcon from "@mui/icons-material/PermMediaOutlined";
import ViewHeadlineOutlinedIcon from "@mui/icons-material/ViewHeadlineOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import ImageIcon from "@mui/icons-material/Image";
import TitleIcon from "@mui/icons-material/Title";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { StatusChip } from "@/components/settings/StatusChip";
import { MediaField } from "@/components/content/MediaField";
import styles from "./BlogPostEditorDialog.module.css";

const FORMAT_OPTIONS = [
  { label: "Article / Story", value: "ARTICLE" },
  { label: "Podcast Episode", value: "PODCAST" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Spotlight / Essay", value: "ESSAY" },
  { label: "Documentary Feature", value: "DOCUMENTARY" },
];

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function BlogPostEditorDialog({
  open,
  onClose,
  post,
  setPost,
  onSave,
  onDuplicate,
  isSaving,
  onOpenMediaPicker,
  categories = [],
  authors = [],
}) {
  const [activeTab, setActiveTab] = useState(0);

  // The parent clears the selected post after close; avoid rendering the editor
  // during that transition before the dialog state finishes updating.
  if (!post) return null;

  const badgePresets = [
    "TALENT",
    "CULTURE",
    "ENTERTAINMENT",
    "COMMUNITY",
    "SPOTLIGHT",
    "OPINION",
    "INNOVATION",
    "STORIES",
  ];
  const categoryBadges = (categories || [])
    .map((c) => (c.title || c.name || "").trim().toUpperCase())
    .filter(Boolean);
  const badgeOptions = Array.from(new Set([...badgePresets, ...categoryBadges]));

  const setField = (field, value) => {
    setPost((prev) => ({ ...prev, [field]: value }));
  };

  const setSeoField = (field, value) => {
    setPost((prev) => ({
      ...prev,
      seo: { ...(prev.seo || {}), [field]: value },
    }));
  };

  // Structured Content Builder Handlers
  const contentBlocks = Array.isArray(post.content) ? post.content : [];

  const handleAddBlock = (type) => {
    const newBlock =
      type === "heading"
        ? { type: "heading", level: 2, text: "" }
        : type === "quote"
        ? { type: "quote", text: "" }
        : type === "callout"
        ? { type: "callout", title: "KEY TAKEAWAY", text: "" }
        : type === "image"
        ? { type: "image", src: "", alt: "", caption: "" }
        : type === "list"
        ? { type: "list", text: "" }
        : type === "divider"
        ? { type: "divider" }
        : { type: "paragraph", text: "" };

    setField("content", [...contentBlocks, newBlock]);
  };

  const handleUpdateBlock = (index, updates) => {
    const next = [...contentBlocks];
    next[index] = { ...next[index], ...updates };
    setField("content", next);
  };

  const handleDeleteBlock = (index) => {
    const next = contentBlocks.filter((_, i) => i !== index);
    setField("content", next);
  };

  const handleMoveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= contentBlocks.length) return;
    const next = [...contentBlocks];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setField("content", next);
  };

  const handleToggleCategory = (categoryId) => {
    const current = post.categoryIds || [];
    const isSelected = current.includes(categoryId);
    const next = isSelected ? current.filter((id) => id !== categoryId) : [...current, categoryId];
    setField("categoryIds", next);
    if (!isSelected && !post.primaryCategoryId) {
      setField("primaryCategoryId", categoryId);
      const matchedCat = categories.find((c) => c.id === categoryId);
      if (matchedCat && !post.badge) {
        setField("badge", (matchedCat.title || matchedCat.name || "").toUpperCase());
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ className: styles.dialogPaper }}>
      <Box className={styles.header}>
        <Box className={styles.titleGroup}>
          <Typography variant="h6" fontWeight={700}>
            {post.id ? `Edit Article: ${post.title || "Untitled"}` : "Write New Journal Post"}
          </Typography>
          <StatusChip status={post.status || "draft"} />
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close dialog">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        className={styles.tabs}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<EditNoteOutlinedIcon fontSize="small" />} iconPosition="start" label="Article Basics" />
        <Tab icon={<PermMediaOutlinedIcon fontSize="small" />} iconPosition="start" label="Media & Cover" />
        <Tab icon={<ViewHeadlineOutlinedIcon fontSize="small" />} iconPosition="start" label={`Content Blocks (${contentBlocks.length})`} />
        <Tab icon={<CategoryOutlinedIcon fontSize="small" />} iconPosition="start" label="Taxonomy & Author" />
        <Tab icon={<PublicOutlinedIcon fontSize="small" />} iconPosition="start" label="SEO & Publishing" />
      </Tabs>

      <DialogContent className={styles.content}>
        {/* TAB 0: BASICS */}
        {activeTab === 0 && (
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Article Title"
              value={post.title || ""}
              onChange={(e) => {
                const nextTitle = e.target.value;
                const currentSlug = post.slug || "";
                const prevExpected = toSlug(post.title || "");
                const isAutoSlug = !currentSlug || currentSlug === prevExpected;
                setPost((prev) => ({
                  ...prev,
                  title: nextTitle,
                  slug: isAutoSlug ? toSlug(nextTitle) : prev.slug,
                }));
              }}
              required
              helperText="The primary headline displayed across the web journal and article detail."
            />

            <Box className={styles.row}>
              <TextField
                fullWidth
                label="URL Slug"
                value={post.slug || ""}
                onChange={(e) => setField("slug", toSlug(e.target.value))}
                helperText="Auto-generated from title. Click the icon to re-sync anytime."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Auto-generate slug from current title">
                        <IconButton
                          size="small"
                          onClick={() => setField("slug", toSlug(post.title || ""))}
                          edge="end"
                          aria-label="Auto-generate slug from title"
                        >
                          <AutoAwesomeOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                fullWidth
                label="Content Format"
                value={post.format || "ARTICLE"}
                onChange={(e) => setField("format", e.target.value)}
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box className={styles.row}>
              <Autocomplete
                freeSolo
                fullWidth
                options={badgeOptions}
                value={post.badge || ""}
                onInputChange={(_, newInputValue) => {
                  setField("badge", newInputValue);
                }}
                onChange={(_, newValue) => {
                  setField("badge", newValue || "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category Badge"
                    placeholder="e.g. TALENT, CULTURE, ENTERTAINMENT, COMMUNITY"
                    helperText="Select from dropdown presets/categories or enter custom badge manually."
                  />
                )}
              />
              <TextField
                fullWidth
                label="Estimated Read Time"
                value={post.readTime || ""}
                onChange={(e) => setField("readTime", e.target.value)}
                placeholder="e.g. 6 min read"
              />
            </Box>

            <Box className={styles.row}>
              <TextField
                fullWidth
                type="date"
                label="Display Date"
                value={post.displayDate ? post.displayDate.slice(0, 10) : ""}
                onChange={(e) => setField("displayDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Date shown to readers on cards and article header."
              />
              <TextField
                fullWidth
                label="Author Name Override"
                value={post.author || ""}
                onChange={(e) => setField("author", e.target.value)}
                placeholder="e.g. Chisom Obi"
                helperText="Optional custom byline if not selecting from registered team authors."
              />
            </Box>

            <TextField
              fullWidth
              label="Summary / Deck"
              value={post.summary || ""}
              onChange={(e) => setField("summary", e.target.value)}
              multiline
              minRows={2}
              placeholder="A compelling subtitle for article cards and social previews"
            />

            <TextField
              fullWidth
              label="Excerpt"
              value={post.excerpt || ""}
              onChange={(e) => setField("excerpt", e.target.value)}
              multiline
              minRows={3}
              placeholder="Short lead paragraph summarizing the story."
            />
          </Stack>
        )}

        {/* TAB 1: MEDIA & COVER */}
        {activeTab === 1 && (
          <Stack spacing={2.5}>
            <MediaField
              label="Cover Image"
              value={post.image || ""}
              mediaType="image"
              onChange={(url) => setField("image", url)}
              onUploaded={(url, result) => {
                setField("image", url);
                if (!post.alt && result?.altText) {
                  setField("alt", result.altText);
                }
              }}
              onAltSuggested={(alt) => {
                if (!post.alt) setField("alt", alt);
              }}
              onBrowseLibrary={() =>
                onOpenMediaPicker?.({
                  type: "image",
                  onSelect: (url, media) => {
                    setField("image", url);
                    if (!post.alt && (media?.altText || media?.title)) {
                      setField("alt", media.altText || media.title);
                    }
                  },
                })
              }
              helperText="Upload cover image directly from your device, select from the media library, or paste an HTTPS URL."
              showPreview={true}
              previewHeight={240}
            />

            <TextField
              fullWidth
              label="Image Alt Text"
              value={post.alt || ""}
              onChange={(e) => setField("alt", e.target.value)}
              placeholder="Describe the image for screen readers and accessibility"
            />
          </Stack>
        )}

        {/* TAB 2: CONTENT BUILDER */}
        {activeTab === 2 && (
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Article Content Structure
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {contentBlocks.length} block(s) added
              </Typography>
            </Box>

            {contentBlocks.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center", border: "2px dashed #E5E7EB", borderRadius: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  No structured blocks yet. Add paragraphs, headings, blockquotes, or callout cards below.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {contentBlocks.map((block, idx) => (
                  <Box key={idx} className={styles.blockItem}>
                    <Box className={styles.blockHeader}>
                      <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase", color: "#6B7280" }}>
                        Block {idx + 1}: {block.type}
                      </Typography>
                      <Box className={styles.blockControls}>
                        <IconButton size="small" disabled={idx === 0} onClick={() => handleMoveBlock(idx, -1)}>
                          <ArrowUpwardIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton size="small" disabled={idx === contentBlocks.length - 1} onClick={() => handleMoveBlock(idx, 1)}>
                          <ArrowDownwardIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteBlock(idx)}>
                          <DeleteOutlineIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Block Fields based on type */}
                    {block.type === "paragraph" && (
                      <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        label="Paragraph text"
                        value={block.text || ""}
                        onChange={(e) => handleUpdateBlock(idx, { text: e.target.value })}
                      />
                    )}

                    {block.type === "heading" && (
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                          select
                          size="small"
                          label="Level"
                          value={block.level || 2}
                          onChange={(e) => handleUpdateBlock(idx, { level: Number(e.target.value) })}
                          sx={{ width: 100 }}
                        >
                          <MenuItem value={2}>H2</MenuItem>
                          <MenuItem value={3}>H3</MenuItem>
                          <MenuItem value={4}>H4</MenuItem>
                        </TextField>
                        <TextField
                          fullWidth
                          size="small"
                          label="Heading Text"
                          value={block.text || ""}
                          onChange={(e) => handleUpdateBlock(idx, { text: e.target.value })}
                        />
                      </Box>
                    )}

                    {block.type === "quote" && (
                      <Box className={styles.quotePreview}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Blockquote text"
                          value={block.text || ""}
                          onChange={(e) => handleUpdateBlock(idx, { text: e.target.value })}
                        />
                      </Box>
                    )}

                    {block.type === "callout" && (
                      <Box className={styles.calloutPreview}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Callout Tagline / Badge"
                          value={block.title || "KEY TAKEAWAY"}
                          onChange={(e) => handleUpdateBlock(idx, { title: e.target.value })}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          multiline
                          minRows={2}
                          label="Callout Highlight Text"
                          value={block.text || ""}
                          onChange={(e) => handleUpdateBlock(idx, { text: e.target.value })}
                        />
                      </Box>
                    )}

                    {block.type === "image" && (
                      <Stack spacing={1.5}>
                        <MediaField
                          label="Block Image"
                          value={block.src || ""}
                          mediaType="image"
                          onChange={(url) => handleUpdateBlock(idx, { src: url })}
                          onUploaded={(url, result) => {
                            handleUpdateBlock(idx, {
                              src: url,
                              alt: block.alt || result?.altText || "",
                            });
                          }}
                          onBrowseLibrary={() =>
                            onOpenMediaPicker?.({
                              type: "image",
                              onSelect: (url, media) => {
                                handleUpdateBlock(idx, {
                                  src: url,
                                  alt: block.alt || media?.altText || media?.title || "",
                                });
                              },
                            })
                          }
                          helperText="Upload image from device, choose from media library, or enter URL."
                          showPreview={true}
                          previewHeight={180}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Caption (optional)"
                          value={block.caption || ""}
                          onChange={(e) => handleUpdateBlock(idx, { caption: e.target.value })}
                        />
                      </Stack>
                    )}

                    {(block.type === "list" || block.type === "listItem") && (
                      <TextField
                        fullWidth
                        size="small"
                        label="List item text"
                        value={block.text || ""}
                        onChange={(e) => handleUpdateBlock(idx, { text: e.target.value })}
                      />
                    )}

                    {block.type === "divider" && (
                      <Divider sx={{ my: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Horizontal Divider
                        </Typography>
                      </Divider>
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            {/* Block creation button bar */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                ADD CONTENT BLOCK:
              </Typography>
              <Box className={styles.addBlockButtons}>
                <Button size="small" variant="outlined" startIcon={<TitleIcon fontSize="small" />} onClick={() => handleAddBlock("heading")}>
                  Heading
                </Button>
                <Button size="small" variant="outlined" startIcon={<AddIcon fontSize="small" />} onClick={() => handleAddBlock("paragraph")}>
                  Paragraph
                </Button>
                <Button size="small" variant="outlined" startIcon={<FormatQuoteIcon fontSize="small" />} onClick={() => handleAddBlock("quote")}>
                  Quote
                </Button>
                <Button size="small" variant="outlined" startIcon={<AnnouncementOutlinedIcon fontSize="small" />} onClick={() => handleAddBlock("callout")}>
                  Key Takeaway
                </Button>
                <Button size="small" variant="outlined" startIcon={<ImageIcon fontSize="small" />} onClick={() => handleAddBlock("image")}>
                  Image
                </Button>
                <Button size="small" variant="outlined" startIcon={<FormatListBulletedIcon fontSize="small" />} onClick={() => handleAddBlock("list")}>
                  List Item
                </Button>
                <Button size="small" variant="outlined" startIcon={<HorizontalRuleIcon fontSize="small" />} onClick={() => handleAddBlock("divider")}>
                  Divider
                </Button>
              </Box>
            </Box>
          </Stack>
        )}

        {/* TAB 3: TAXONOMY & AUTHORS */}
        {activeTab === 3 && (
          <Stack spacing={3}>
            {/* Registered Authors */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Editorial Author
              </Typography>
              <TextField
                select
                fullWidth
                label="Assign Registered Author"
                value={post.authorId || ""}
                onChange={(e) => setField("authorId", e.target.value)}
                helperText="The author's bio, avatar, and credentials will display on the sticky sidebar of the article page."
              >
                <MenuItem value="">-- Select an author --</MenuItem>
                {authors.map((author) => (
                  <MenuItem key={author.id} value={author.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={author.body?.avatar || author.avatar} sx={{ width: 24, height: 24 }} />
                      <span>{author.title || author.name}</span>
                      <Typography variant="caption" color="text.secondary">
                        ({author.body?.role || "Staff Writer"})
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Divider />

            {/* Primary Category */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Primary Category
              </Typography>
              <TextField
                select
                fullWidth
                label="Primary Category"
                value={post.primaryCategoryId || ""}
                onChange={(e) => {
                  const catId = e.target.value;
                  setField("primaryCategoryId", catId);
                  if (catId && !post.categoryIds?.includes(catId)) {
                    setField("categoryIds", [...(post.categoryIds || []), catId]);
                  }
                  const matchedCat = categories.find((c) => c.id === catId);
                  if (matchedCat && !post.badge) {
                    setField("badge", (matchedCat.title || matchedCat.name || "").toUpperCase());
                  }
                }}
              >
                <MenuItem value="">-- Select primary category --</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Additional Categories */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Additional Categories &amp; Tags
              </Typography>
              <FormGroup row sx={{ gap: 2 }}>
                {categories.map((cat) => (
                  <FormControlLabel
                    key={cat.id}
                    control={
                      <Checkbox
                        checked={(post.categoryIds || []).includes(cat.id)}
                        onChange={() => handleToggleCategory(cat.id)}
                      />
                    }
                    label={cat.title}
                  />
                ))}
              </FormGroup>
            </Box>

            <Divider />

            {/* Featured Toggle */}
            <Box sx={{ p: 2, bgcolor: "#F9FAFB", borderRadius: 2 }}>
              <FormControlLabel
                control={<Switch checked={Boolean(post.featured)} onChange={(e) => setField("featured", e.target.checked)} />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Featured Spotlight
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      When enabled, this story will be highlighted in the top featured section and spotlight carousel.
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Stack>
        )}

        {/* TAB 4: SEO & PUBLISHING */}
        {activeTab === 4 && (
          <Stack spacing={2.5}>
            <Box className={styles.row}>
              <TextField
                select
                fullWidth
                label="Publication Status"
                value={post.status || "draft"}
                onChange={(e) => setField("status", e.target.value)}
              >
                <MenuItem value="draft">Draft (Private / Work in Progress)</MenuItem>
                <MenuItem value="published">Published (Live on Website)</MenuItem>
                <MenuItem value="scheduled">Scheduled (Auto-publish at specified time)</MenuItem>
                <MenuItem value="archived">Archived (Unpublished / Read-only)</MenuItem>
              </TextField>

              {post.status === "scheduled" && (
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Scheduled Publication Time"
                  value={post.scheduledAt ? post.scheduledAt.slice(0, 16) : ""}
                  onChange={(e) => setField("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              )}
            </Box>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>
              Search Engine Optimization (SEO) Metadata
            </Typography>

            <TextField
              fullWidth
              label="SEO Title Tag"
              value={post.seo?.title || ""}
              onChange={(e) => setSeoField("title", e.target.value)}
              placeholder="e.g. Empowering Next-Gen Creators | Royz Houz Journal"
              helperText="Optimal length: 50-60 characters"
            />

            <TextField
              fullWidth
              label="Meta Description"
              value={post.seo?.description || ""}
              onChange={(e) => setSeoField("description", e.target.value)}
              multiline
              minRows={2}
              placeholder="Brief summary displayed in Google search results."
              helperText="Optimal length: 150-160 characters"
            />

            <TextField
              fullWidth
              label="OpenGraph Social Title"
              value={post.seo?.ogTitle || ""}
              onChange={(e) => setSeoField("ogTitle", e.target.value)}
              placeholder="Defaults to article title if empty"
            />

            <TextField
              fullWidth
              label="OpenGraph Social Description"
              value={post.seo?.ogDescription || ""}
              onChange={(e) => setSeoField("ogDescription", e.target.value)}
              multiline
              minRows={2}
            />

            <FormControlLabel
              control={<Switch checked={Boolean(post.seo?.noIndex)} onChange={(e) => setSeoField("noIndex", e.target.checked)} />}
              label="Discourage Search Engines (noindex, nofollow)"
            />
          </Stack>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          {post.id && onDuplicate && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopyOutlinedIcon fontSize="small" />}
              onClick={() => onDuplicate(post)}
            >
              Duplicate as Draft
            </Button>
          )}
        </Box>
        <Button variant="contained" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving Article..." : post.id ? "Update Post" : "Create Post"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BlogPostEditorDialog;
