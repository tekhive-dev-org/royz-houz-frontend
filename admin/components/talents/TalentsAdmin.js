import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { MediaPicker } from "@/components/content/MediaPicker";
import { talentsApi } from "@/services/talentsApi";
import { formatMediaDuration, prepareTalentSavePayload } from "@/utils/talents";
import { TalentsTable } from "./TalentsTable";
import { TalentEditorDialog } from "./TalentEditorDialog";
import { TalentCategoryDialog } from "./TalentCategoryDialog";
import { TalentCategoriesTable } from "./TalentCategoriesTable";
import { TalentFeaturedReorder } from "./TalentFeaturedReorder";
import { TalentPreviewDialog } from "./TalentPreviewDialog";
import { TalentStatsBanner } from "./TalentStatsBanner";
import styles from "./TalentsAdmin.module.css";

const EMPTY_TALENT = {
  slug: "",
  name: "",
  category: "",
  categoryKey: "",
  categoryIds: [],
  primaryCategoryId: null,
  profession: "",
  genre: "",
  badge: "",
  subtitle: "",
  bio: "",
  location: "",
  rating: "",
  followers: "",
  bookingPrice: "",
  availability: "Available for Booking",
  image: "",
  alt: "",
  coverImage: "",
  isHot: false,
  featured: false,
  tabs: ["ABOUT", "GALLERY", "VIDEOS", "MUSIC"],
  awards: [],
  achievements: [],
  galleryImages: [],
  videos: [],
  musicTracks: [],
  publications: [],
  socials: {
    spotify: "",
    appleMusic: "",
    youtube: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    soundcloud: "",
  },
  status: "draft",
};

const EMPTY_CATEGORY = {
  slug: "",
  title: "",
  summary: "",
  status: "published",
};

export function TalentsAdmin() {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredTalents, setFeaturedTalents] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  // Dialogs
  const [editingTalent, setEditingTalent] = useState(null);
  const [talentDialogOpen, setTalentDialogOpen] = useState(false);
  const [isSavingTalent, setIsSavingTalent] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [categoryPendingDeletion, setCategoryPendingDeletion] = useState(null);
  const [isReorderingCategories, setIsReorderingCategories] = useState(false);

  const [previewTalent, setPreviewTalent] = useState(null);
  const [mediaPicker, setMediaPicker] = useState(null);
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);
  const [talentPendingArchive, setTalentPendingArchive] = useState(null);
  const [isArchivingTalent, setIsArchivingTalent] = useState(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [talentData, cats] = await Promise.all([
        talentsApi.list({ search, category: categoryFilter, status: statusFilter }),
        talentsApi.listCategories(),
      ]);
      setItems(talentData);
      setCategories(cats);
      setFeaturedTalents(talentData.filter((t) => t.featured));
    } catch (err) {
      setError(err.message || "Unable to load talents.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const [talentData, cats] = await Promise.all([
        talentsApi.list({ search, category: categoryFilter, status: statusFilter }),
        talentsApi.listCategories(),
      ]);
      setItems(talentData);
      setCategories(cats);
      setFeaturedTalents(talentData.filter((t) => t.featured));
    } catch (err) {
      setError(err.message || "Unable to load talents.");
    } finally {
      setIsUpdating(false);
    }
  }

  // Load once on initial mount
  useEffect(() => {
    void initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent background filter effect (debounced, never unmounts or reloads page)
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (filterDebounceTimerRef.current) {
      clearTimeout(filterDebounceTimerRef.current);
    }

    filterDebounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setIsUpdating(true);
      try {
        const talentData = await talentsApi.list({
          search,
          category: categoryFilter,
          status: statusFilter,
        });
        if (requestId === requestIdRef.current) {
          setItems(talentData);
          setFeaturedTalents(talentData.filter((t) => t.featured));
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to load talents.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsUpdating(false);
        }
      }
    }, 250);

    return () => {
      if (filterDebounceTimerRef.current) {
        clearTimeout(filterDebounceTimerRef.current);
      }
    };
  }, [search, categoryFilter, statusFilter]);

  // Talent Handlers
  function handleOpenCreateTalent() {
    setEditingTalent({ ...EMPTY_TALENT });
    setTalentDialogOpen(true);
  }

  function handleOpenEditTalent(item) {
    const body = item.body || {};
    const matchedLegacyCategory = categories.find(
      (category) => category.slug === body.categoryKey || category.title === body.category
    );
    const primaryCategoryId = item.primaryCategoryId || matchedLegacyCategory?.id || null;
    const categoryIds = item.categoryIds?.length ? item.categoryIds : primaryCategoryId ? [primaryCategoryId] : [];
    setEditingTalent({
      ...EMPTY_TALENT,
      ...body,
      id: item.id,
      slug: item.slug,
      name: body.name || item.title || "",
      subtitle: body.subtitle || item.summary || "",
      bio: body.bio || item.summary || "",
      location: item.location || body.location || "",
      featured: item.featured,
      isHot: Boolean(body.isHot),
      status: item.status || "draft",
      categoryIds,
      primaryCategoryId,
      category: body.category || matchedLegacyCategory?.title || "",
      categoryKey: body.categoryKey || matchedLegacyCategory?.slug || "",
      bookingPrice: body.bookingPrice || body.startingRate || "",
      awards: body.awards || EMPTY_TALENT.awards,
      achievements: body.achievements || EMPTY_TALENT.achievements,
      galleryImages: body.galleryImages || EMPTY_TALENT.galleryImages,
      galleryMediaRefs: body.galleryMediaRefs || [],
      videos: body.videos || EMPTY_TALENT.videos,
      musicTracks: body.musicTracks || EMPTY_TALENT.musicTracks,
      publications: body.publications || EMPTY_TALENT.publications,
      socials: body.socials || EMPTY_TALENT.socials,
      tabs: body.tabs || EMPTY_TALENT.tabs,
    });
    setTalentDialogOpen(true);
  }

  function handleDuplicateTalent(item) {
    const body = item.body || {};
    const matchedLegacyCategory = categories.find(
      (category) => category.slug === body.categoryKey || category.title === body.category
    );
    const primaryCategoryId = item.primaryCategoryId || matchedLegacyCategory?.id || null;
    const categoryIds = item.categoryIds?.length ? item.categoryIds : primaryCategoryId ? [primaryCategoryId] : [];
    const sourceName = body.name || item.title || "Creative";
    setEditingTalent({
      ...EMPTY_TALENT,
      ...body,
      id: undefined,
      slug: "",
      name: `${sourceName} (Copy)`,
      subtitle: body.subtitle || item.summary || "",
      bio: body.bio || item.summary || "",
      location: item.location || body.location || "",
      featured: false,
      isHot: false,
      status: "draft",
      scheduledAt: "",
      categoryIds,
      primaryCategoryId,
      category: body.category || matchedLegacyCategory?.title || "",
      categoryKey: body.categoryKey || matchedLegacyCategory?.slug || "",
      bookingPrice: body.bookingPrice || body.startingRate || "",
      awards: Array.isArray(body.awards) ? JSON.parse(JSON.stringify(body.awards)) : EMPTY_TALENT.awards,
      achievements: Array.isArray(body.achievements) ? JSON.parse(JSON.stringify(body.achievements)) : EMPTY_TALENT.achievements,
      galleryImages: Array.isArray(body.galleryImages) ? JSON.parse(JSON.stringify(body.galleryImages)) : EMPTY_TALENT.galleryImages,
      galleryMediaRefs: Array.isArray(body.galleryMediaRefs) ? JSON.parse(JSON.stringify(body.galleryMediaRefs)) : [],
      videos: Array.isArray(body.videos) ? JSON.parse(JSON.stringify(body.videos)) : EMPTY_TALENT.videos,
      musicTracks: Array.isArray(body.musicTracks) ? JSON.parse(JSON.stringify(body.musicTracks)) : EMPTY_TALENT.musicTracks,
      publications: Array.isArray(body.publications) ? JSON.parse(JSON.stringify(body.publications)) : EMPTY_TALENT.publications,
      socials: body.socials ? JSON.parse(JSON.stringify(body.socials)) : EMPTY_TALENT.socials,
      tabs: Array.isArray(body.tabs) ? [...body.tabs] : EMPTY_TALENT.tabs,
    });
    setTalentDialogOpen(true);
    setToastMessage(`Duplicating "${sourceName}". Adjust any details and save as a new talent.`);
  }

  async function handleSaveTalent() {
    if (!editingTalent.name) {
      setError("Talent name is required.");
      return;
    }
    if (!editingTalent.primaryCategoryId) {
      setError("Select a primary specialty/category before saving the talent.");
      return;
    }
    if (editingTalent.status === "scheduled" && !editingTalent.scheduledAt) {
      setError("Choose a scheduled publication date and time before saving.");
      return;
    }
    setIsSavingTalent(true);
    setError(null);
    try {
      const payload = prepareTalentSavePayload(editingTalent);
      await talentsApi.save(payload, editingTalent.id);
      setTalentDialogOpen(false);
      setToastMessage(`Talent "${editingTalent.name}" saved successfully.`);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to save talent.");
    } finally {
      setIsSavingTalent(false);
    }
  }

  async function handleConfirmArchiveTalent() {
    if (!talentPendingArchive) return;

    setIsArchivingTalent(true);
    setError(null);
    try {
      await talentsApi.archive(talentPendingArchive.id);
      setToastMessage(`Talent “${talentPendingArchive.title || talentPendingArchive.body?.name || "profile"}” archived successfully.`);
      setTalentPendingArchive(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to archive talent.");
      setTalentPendingArchive(null);
    } finally {
      setIsArchivingTalent(false);
    }
  }

  // Category Handlers
  function handleOpenCreateCategory() {
    setEditingCategory({ ...EMPTY_CATEGORY });
    setCategoryDialogOpen(true);
  }

  function handleOpenEditCategory(cat) {
    setEditingCategory({
      id: cat.id,
      slug: cat.slug,
      title: cat.title,
      summary: cat.summary || "",
      status: cat.status || "published",
    });
    setCategoryDialogOpen(true);
  }

  async function handleSaveCategory() {
    if (!editingCategory.title || !editingCategory.slug) {
      setError("Category title and slug are required.");
      return;
    }
    setIsSavingCategory(true);
    setError(null);
    try {
      await talentsApi.saveCategory(editingCategory, editingCategory.id);
      setCategoryDialogOpen(false);
      setToastMessage(`Category "${editingCategory.title}" saved successfully.`);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to save category.");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryPendingDeletion) return;

    const category = categoryPendingDeletion;
    setDeletingCategoryId(category.id);
    setError(null);
    try {
      await talentsApi.deleteCategory(category.id);
      setToastMessage(`Category "${category.title}" deleted successfully.`);
      setCategoryPendingDeletion(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete category.");
      setCategoryPendingDeletion(null);
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function handleReorderCategories(orderedCategories) {
    if (isReorderingCategories) return;

    const previousCategories = categories;
    setCategories(orderedCategories);
    setIsReorderingCategories(true);
    setError(null);
    try {
      await talentsApi.reorderCategories(orderedCategories.map((category) => category.id));
      setToastMessage("Talent category order updated successfully.");
    } catch (err) {
      setCategories(previousCategories);
      setError(err.message || "Unable to update category order.");
    } finally {
      setIsReorderingCategories(false);
    }
  }

  // Featured Reordering
  function handleReorderFeatured(nextOrdered) {
    setFeaturedTalents(nextOrdered);
  }

  async function handleSaveFeaturedOrder() {
    setIsSavingFeatured(true);
    try {
      const ids = featuredTalents.map((t) => t.id);
      await talentsApi.reorderFeatured(ids);
      setToastMessage("Featured spotlight order updated successfully.");
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update featured order.");
    } finally {
      setIsSavingFeatured(false);
    }
  }

  // Media Picker
  function handleOpenMediaPicker(target) {
    setMediaPicker(typeof target === "string" ? { field: target, type: "image" } : target);
  }

  function handleMediaSelected(media) {
    if (!editingTalent || !mediaPicker) return;
    const url =
      mediaPicker.type === "video"
        ? media?.videoUrl || media?.secure_url || media?.url || ""
        : mediaPicker.type === "audio"
          ? media?.audioUrl || media?.secure_url || media?.url || ""
          : media?.imageUrl || media?.secure_url || media?.url || "";
    if (!url) {
      setError(`The selected media does not have a usable ${mediaPicker.type || "media"} URL.`);
      setMediaPicker(null);
      return;
    }
    if (mediaPicker.field === "galleryAdd") {
      const alreadyAdded = (editingTalent.galleryImages || []).includes(url);
      if (!alreadyAdded) {
        setEditingTalent((prev) => {
          const existingImages = prev.galleryImages || [];
          const existingRefs = existingImages.map((image, index) =>
            prev.galleryMediaRefs?.[index] || { mediaAssetId: null, url: image }
          );
          return {
            ...prev,
            galleryImages: [...existingImages, url],
            galleryMediaRefs: [
              ...existingRefs,
              { mediaAssetId: media.id || null, url },
            ],
          };
        });
      }
    } else if (Number.isInteger(mediaPicker.index)) {
      setEditingTalent((prev) => {
        const collectionName = mediaPicker.collection || "videos";
        const collection = [...(prev[collectionName] || [])];
        const duration = formatMediaDuration(media.durationSeconds);
        const referenceField = mediaPicker.field === "thumbnail" ? "thumbnailMediaAssetId" : "mediaAssetId";
        collection[mediaPicker.index] = {
          ...collection[mediaPicker.index],
          [mediaPicker.field]: url,
          ...(media.id ? { [referenceField]: media.id } : {}),
          ...(duration && mediaPicker.field !== "thumbnail" ? { duration } : {}),
        };
        return { ...prev, [collectionName]: collection };
      });
    } else {
      setEditingTalent((prev) => ({
        ...prev,
        [mediaPicker.field]: url,
        ...(mediaPicker.field === "image" && !prev.alt ? { alt: media.altText || media.title || "" } : {}),
      }));
    }
    setMediaPicker(null);
  }

  if (isInitialLoading) return <AdminLoadingState />;

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.pageHeader}>
        <Box>
          <Typography variant="h4" className={styles.pageTitle}>
            Talent Hub &amp; Roster Studio
          </Typography>
          <Typography variant="body1" className={styles.pageDescription}>
            Manage Africa&apos;s creative roster, artist portfolios, awards recognition, streaming channels, and featured spotlight ordering.
          </Typography>
        </Box>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TalentStatsBanner
        items={items}
        categories={categories}
        featuredTalents={featuredTalents}
      />

      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        className={styles.tabs}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<PeopleOutlineIcon fontSize="small" />} iconPosition="start" label={`Talents Roster (${items.length})`} />
        <Tab icon={<StarBorderOutlinedIcon fontSize="small" />} iconPosition="start" label={`Featured Spotlight (${featuredTalents.length})`} />
        <Tab icon={<CategoryOutlinedIcon fontSize="small" />} iconPosition="start" label={`Creative Categories (${categories.length})`} />
      </Tabs>

      {/* TAB 0: ROSTER DIRECTORY */}
      {tab === 0 && (
        <TalentsTable
          items={items}
          categories={categories}
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isUpdating={isUpdating}
          onAddClick={handleOpenCreateTalent}
          onEditClick={handleOpenEditTalent}
          onDuplicateClick={handleDuplicateTalent}
          onPreviewClick={(item) => setPreviewTalent(item)}
          onArchiveClick={(item) => setTalentPendingArchive(item)}
        />
      )}

      {/* TAB 1: FEATURED SPOTLIGHT REORDER */}
      {tab === 1 && (
        <TalentFeaturedReorder
          featuredTalents={featuredTalents}
          onReorder={handleReorderFeatured}
          onSaveOrder={handleSaveFeaturedOrder}
          isSaving={isSavingFeatured}
        />
      )}

      {/* TAB 2: TALENT CATEGORIES */}
      {tab === 2 && (
        <TalentCategoriesTable
          categories={categories}
          talents={items}
          onAddCategory={handleOpenCreateCategory}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={setCategoryPendingDeletion}
          onReorderCategories={handleReorderCategories}
          isReordering={isReorderingCategories}
        />
      )}

      {/* Talent Editor Modal Dialog */}
      <TalentEditorDialog
        open={talentDialogOpen}
        onClose={() => setTalentDialogOpen(false)}
        talent={editingTalent}
        setTalent={setEditingTalent}
        onSave={handleSaveTalent}
        onDuplicate={handleDuplicateTalent}
        isSaving={isSavingTalent}
        onOpenMediaPicker={handleOpenMediaPicker}
        categories={categories}
      />

      {/* Category Editor Modal Dialog */}
      <TalentCategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        category={editingCategory}
        setCategory={setEditingCategory}
        onSave={handleSaveCategory}
        isSaving={isSavingCategory}
      />

      <ConfirmationDialog
        open={Boolean(talentPendingArchive)}
        title="Archive talent profile?"
        description={
          talentPendingArchive
            ? `“${talentPendingArchive.title || talentPendingArchive.body?.name || "This talent"}” will be removed from the public website and retained in the admin for future restoration.`
            : ""
        }
        confirmLabel="Archive talent"
        isConfirming={isArchivingTalent}
        tone="danger"
        onCancel={() => setTalentPendingArchive(null)}
        onConfirm={handleConfirmArchiveTalent}
      />

      <ConfirmationDialog
        open={Boolean(categoryPendingDeletion)}
        title="Delete talent category?"
        description={
          categoryPendingDeletion
            ? `“${categoryPendingDeletion.title}” will be permanently removed. Categories assigned to talents are protected and cannot be deleted.`
            : ""
        }
        confirmLabel="Delete category"
        isConfirming={Boolean(deletingCategoryId)}
        tone="danger"
        onCancel={() => setCategoryPendingDeletion(null)}
        onConfirm={handleConfirmDeleteCategory}
      />

      {/* Talent Payload Preview Dialog */}
      <TalentPreviewDialog preview={previewTalent} onClose={() => setPreviewTalent(null)} />

      {/* Media Picker Modal */}
      {mediaPicker && (
        <MediaPicker
          open={Boolean(mediaPicker)}
          type={mediaPicker.type || "image"}
          onClose={() => setMediaPicker(null)}
          onSelect={handleMediaSelected}
        />
      )}

      {/* Notification Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
}

export default TalentsAdmin;
