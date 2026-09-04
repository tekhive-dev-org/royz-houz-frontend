import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { MediaPicker } from "@/components/content/MediaPicker";
import { blogApi } from "@/services/blogApi";
import { BlogStatsBanner } from "./BlogStatsBanner";
import { BlogPostsTable } from "./BlogPostsTable";
import { BlogPostEditorDialog } from "./BlogPostEditorDialog";
import { BlogPostPreviewDialog } from "./BlogPostPreviewDialog";
import { BlogPageSettingsEditor } from "./BlogPageSettingsEditor";
import { BlogCategoriesTable } from "./BlogCategoriesTable";
import { BlogCategoryDialog } from "./BlogCategoryDialog";
import { BlogAuthorsTable } from "./BlogAuthorsTable";
import { BlogAuthorDialog } from "./BlogAuthorDialog";
import { BlogFeaturedReorder } from "./BlogFeaturedReorder";
import { CommentsModerationTable } from "./CommentsModerationTable";
import styles from "./BlogAdmin.module.css";

const EMPTY_POST = {
  slug: "",
  title: "",
  summary: "",
  badge: "TALENT",
  format: "ARTICLE",
  readTime: "5 min read",
  displayDate: new Date().toISOString().slice(0, 10),
  image: "",
  alt: "",
  excerpt: "",
  content: [],
  author: "",
  authorId: "",
  categoryIds: [],
  primaryCategoryId: "",
  relatedPostIds: [],
  seo: {},
  featured: false,
  status: "draft",
};

const EMPTY_CATEGORY = {
  slug: "",
  title: "",
  summary: "",
  status: "published",
};

const EMPTY_AUTHOR = {
  slug: "",
  name: "",
  role: "STAFF WRITER",
  bio: "",
  avatar: "",
  status: "published",
};

export function BlogAdmin({ initialTab = 0 }) {
  const [tab, setTab] = useState(initialTab);
  const [posts, setPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [commentStatus, setCommentStatus] = useState("pending");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Debouncing refs
  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  // Post Dialogs & States
  const [editingPost, setEditingPost] = useState(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postPendingArchive, setPostPendingArchive] = useState(null);
  const [isArchivingPost, setIsArchivingPost] = useState(false);
  const [previewPost, setPreviewPost] = useState(null);
  const [revisions, setRevisions] = useState(null);

  // Category Dialogs & States
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryPendingDeletion, setCategoryPendingDeletion] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isReorderingCategories, setIsReorderingCategories] = useState(false);

  // Author Dialogs & States
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [isSavingAuthor, setIsSavingAuthor] = useState(false);
  const [authorPendingDeletion, setAuthorPendingDeletion] = useState(null);
  const [isDeletingAuthor, setIsDeletingAuthor] = useState(false);

  // Comments Deletion & Moderation
  const [commentPendingDeletion, setCommentPendingDeletion] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  // Featured reordering
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);

  // Media Picker state
  const [mediaPicker, setMediaPicker] = useState(null);

  async function loadAllData() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [postList, authorList, categoryList, commentsData] = await Promise.all([
        blogApi.listPosts({ search, status }),
        blogApi.listAuthors(),
        blogApi.listCategories(),
        blogApi.listComments({ status: commentStatus }),
      ]);
      setPosts(postList);
      setAuthors(authorList);
      setCategories(categoryList);
      setComments(commentsData);
      setFeaturedPosts(postList.filter((p) => p.featured));
    } catch (err) {
      setError(err.message || "Unable to load blog data.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    try {
      const [postList, authorList, categoryList, commentsData] = await Promise.all([
        blogApi.listPosts({ search, status }),
        blogApi.listAuthors(),
        blogApi.listCategories(),
        blogApi.listComments({ status: commentStatus }),
      ]);
      setPosts(postList);
      setAuthors(authorList);
      setCategories(categoryList);
      setComments(commentsData);
      setFeaturedPosts(postList.filter((p) => p.featured));
    } catch (err) {
      setError(err.message || "Unable to refresh content.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter effect (debounced)
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (filterDebounceTimerRef.current) {
      clearTimeout(filterDebounceTimerRef.current);
    }

    filterDebounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setIsUpdating(true);
      try {
        if (tab === 0 || tab === 5) {
          const postList = await blogApi.listPosts({ search, status });
          if (requestId === requestIdRef.current) {
            setPosts(postList);
            setFeaturedPosts(postList.filter((p) => p.featured));
          }
        } else if (tab === 4) {
          const commentsData = await blogApi.listComments({ status: commentStatus, search });
          if (requestId === requestIdRef.current) {
            setComments(commentsData);
          }
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to load filtered content.");
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
  }, [tab, search, status, commentStatus]);

  // Article Handlers
  function handleOpenCreatePost() {
    setEditingPost({
      ...EMPTY_POST,
      displayDate: new Date().toISOString().slice(0, 10),
      primaryCategoryId: categories[0]?.id || "",
      categoryIds: categories[0]?.id ? [categories[0].id] : [],
      authorId: authors[0]?.id || "",
    });
    setPostDialogOpen(true);
  }

  function handleOpenEditPost(post) {
    const body = post.body || {};
    setEditingPost({
      ...EMPTY_POST,
      ...body,
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary || body.summary || "",
      excerpt: body.excerpt || post.summary || "",
      authorId: post.blog_author_id || post.authorId || body.authorId || "",
      author: body.author || "",
      primaryCategoryId: post.primaryCategoryId || body.primaryCategoryId || "",
      categoryIds: post.categoryIds || (body.primaryCategoryId ? [body.primaryCategoryId] : []),
      featured: Boolean(post.featured),
      status: post.status || "draft",
      scheduledAt: post.scheduled_at || post.scheduledAt || "",
      content: Array.isArray(body.content) ? body.content : [],
    });
    setPostDialogOpen(true);
  }

  function handleDuplicatePost(post) {
    const body = post.body || {};
    const duplicateTitle = `${post.title || "Untitled"} (Copy)`;
    setEditingPost({
      ...EMPTY_POST,
      ...body,
      id: undefined,
      title: duplicateTitle,
      slug: "",
      summary: post.summary || body.summary || "",
      excerpt: body.excerpt || post.summary || "",
      authorId: post.blog_author_id || post.authorId || body.authorId || "",
      author: body.author || "",
      primaryCategoryId: post.primaryCategoryId || body.primaryCategoryId || "",
      categoryIds: post.categoryIds || (body.primaryCategoryId ? [body.primaryCategoryId] : []),
      featured: false,
      status: "draft",
      scheduledAt: "",
      displayDate: new Date().toISOString().slice(0, 10),
      content: Array.isArray(body.content) ? JSON.parse(JSON.stringify(body.content)) : [],
    });
    setPostDialogOpen(true);
    setToastMessage(`Duplicating "${post.title}". Adjust any details and save as a new post.`);
  }

  async function handleSavePost() {
    if (!editingPost.title?.trim()) {
      setError("Article title is required.");
      return;
    }
    setIsSavingPost(true);
    setError(null);
    try {
      const payload = {
        ...editingPost,
        slug: editingPost.slug?.trim() || undefined,
        scheduledAt:
          editingPost.status === "scheduled" && editingPost.scheduledAt?.trim()
            ? editingPost.scheduledAt
            : undefined,
      };
      await blogApi.savePost(payload, editingPost.id);
      setPostDialogOpen(false);
      setToastMessage(`Article "${editingPost.title}" saved successfully.`);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to save article.");
    } finally {
      setIsSavingPost(false);
    }
  }

  async function handleConfirmArchivePost() {
    if (!postPendingArchive) return;
    setIsArchivingPost(true);
    try {
      await blogApi.archivePost(postPendingArchive.id);
      setToastMessage(`Article "${postPendingArchive.title}" archived successfully.`);
      setPostPendingArchive(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to archive article.");
    } finally {
      setIsArchivingPost(false);
    }
  }

  async function handlePreview(post) {
    try {
      const payload = await blogApi.previewPost(post.id || post);
      setPreviewPost(payload);
    } catch (err) {
      setError(err.message || "Unable to load preview.");
    }
  }

  async function handleViewRevisions(post) {
    try {
      const payload = await blogApi.revisions(post.id || post);
      setRevisions(payload);
    } catch (err) {
      setError(err.message || "Unable to load revisions.");
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
    if (!editingCategory.title?.trim() || !editingCategory.slug?.trim()) {
      setError("Category title and slug are required.");
      return;
    }
    setIsSavingCategory(true);
    setError(null);
    try {
      await blogApi.saveCategory(editingCategory, editingCategory.id);
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
    setIsDeletingCategory(true);
    try {
      await blogApi.deleteCategory(categoryPendingDeletion.id);
      setToastMessage(`Category "${categoryPendingDeletion.title}" deleted.`);
      setCategoryPendingDeletion(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete category.");
      setCategoryPendingDeletion(null);
    } finally {
      setIsDeletingCategory(false);
    }
  }

  async function handleReorderCategories(ordered) {
    if (isReorderingCategories) return;
    const prev = categories;
    setCategories(ordered);
    setIsReorderingCategories(true);
    try {
      await blogApi.reorderCategories(ordered.map((c) => c.id));
      setToastMessage("Category sequence updated successfully.");
    } catch (err) {
      setCategories(prev);
      setError(err.message || "Unable to update category sequence.");
    } finally {
      setIsReorderingCategories(false);
    }
  }

  // Author Handlers
  function handleOpenCreateAuthor() {
    setEditingAuthor({ ...EMPTY_AUTHOR });
    setAuthorDialogOpen(true);
  }

  function handleOpenEditAuthor(author) {
    const body = author.body || {};
    setEditingAuthor({
      id: author.id,
      slug: author.slug,
      name: author.title || author.name || "",
      role: body.role || "STAFF WRITER",
      bio: author.summary || body.bio || "",
      avatar: body.avatar || author.avatar || "",
      status: author.status || "published",
    });
    setAuthorDialogOpen(true);
  }

  async function handleSaveAuthor() {
    if (!editingAuthor.name?.trim()) {
      setError("Author name is required.");
      return;
    }
    setIsSavingAuthor(true);
    setError(null);
    try {
      await blogApi.saveAuthor(editingAuthor, editingAuthor.id);
      setAuthorDialogOpen(false);
      setToastMessage(`Author "${editingAuthor.name}" saved successfully.`);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to save author.");
    } finally {
      setIsSavingAuthor(false);
    }
  }

  async function handleConfirmDeleteAuthor() {
    if (!authorPendingDeletion) return;
    setIsDeletingAuthor(true);
    try {
      await blogApi.deleteAuthor(authorPendingDeletion.id);
      setToastMessage(`Author "${authorPendingDeletion.title || authorPendingDeletion.name}" deleted.`);
      setAuthorPendingDeletion(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete author.");
      setAuthorPendingDeletion(null);
    } finally {
      setIsDeletingAuthor(false);
    }
  }

  // Featured Order Handlers
  function handleReorderFeatured(nextOrdered) {
    setFeaturedPosts(nextOrdered);
  }

  async function handleSaveFeaturedOrder() {
    setIsSavingFeatured(true);
    try {
      const ids = featuredPosts.map((p) => p.id);
      await blogApi.reorderFeatured(ids);
      setToastMessage("Featured articles sequence updated successfully.");
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update featured order.");
    } finally {
      setIsSavingFeatured(false);
    }
  }

  // Comments Handlers
  async function handleModerateComment(id, action) {
    try {
      await blogApi.moderateComment({ id, action });
      const actionLabel =
        action === "approve" || action === "approved"
          ? "approved"
          : action === "reject" || action === "rejected"
          ? "rejected"
          : `${action}ed`;
      setToastMessage(`Comment ${actionLabel} successfully.`);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to moderate comment.");
    }
  }

  async function handleConfirmDeleteComment() {
    if (!commentPendingDeletion) return;
    setIsDeletingComment(true);
    try {
      const commentId =
        typeof commentPendingDeletion === "object"
          ? commentPendingDeletion.id
          : commentPendingDeletion;
      await blogApi.deleteComment(commentId);
      setToastMessage("Comment deleted successfully.");
      setCommentPendingDeletion(null);
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to delete comment.");
      setCommentPendingDeletion(null);
    } finally {
      setIsDeletingComment(false);
    }
  }

  function openMediaPicker(target, callback) {
    if (typeof target === "function") {
      setMediaPicker({ type: "image", onSelect: target });
    } else if (typeof target === "string") {
      setMediaPicker({ type: target, onSelect: callback });
    } else {
      setMediaPicker(target);
    }
  }

  // Media picker callback
  function handleMediaSelected(media) {
    if (!mediaPicker) return;
    const url = mediaPicker.type === "video"
      ? media?.videoUrl || media?.secure_url || media?.url || ""
      : mediaPicker.type === "audio"
        ? media?.audioUrl || media?.secure_url || media?.url || ""
        : media?.imageUrl || media?.url || media?.secure_url || "";

    if (mediaPicker.onSelect) {
      mediaPicker.onSelect(url, media);
      setMediaPicker(null);
      return;
    }

    if (!url) {
      setMediaPicker(null);
      return;
    }

    if (mediaPicker.field === "image" && editingPost) {
      setEditingPost((prev) => ({
        ...prev,
        image: url,
        alt: prev.alt || media.altText || media.title || "",
      }));
    } else if (mediaPicker.field === "authorAvatar" && editingAuthor) {
      setEditingAuthor((prev) => ({ ...prev, avatar: url }));
    } else if (mediaPicker.collection === "contentBlocks" && Number.isInteger(mediaPicker.index) && editingPost) {
      setEditingPost((prev) => {
        const blocks = [...(prev.content || [])];
        blocks[mediaPicker.index] = {
          ...blocks[mediaPicker.index],
          src: url,
          alt: blocks[mediaPicker.index]?.alt || media.altText || media.title || "",
        };
        return { ...prev, content: blocks };
      });
    }

    setMediaPicker(null);
  }

  if (isInitialLoading) return <AdminLoadingState />;

  return (
    <Box className="animate-fade-in">
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>
            Journal &amp; Editorial Studio
          </Typography>
          <Typography variant="body1" className={styles.description}>
            Manage articles, page-level hero &amp; pillars, creative categories, editorial contributors, and reader comments.
          </Typography>
        </Box>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <BlogStatsBanner posts={posts} comments={comments} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        className={styles.tabs}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<ArticleOutlinedIcon fontSize="small" />} iconPosition="start" label={`Articles (${posts.length})`} />
        <Tab icon={<DashboardCustomizeOutlinedIcon fontSize="small" />} iconPosition="start" label="Page & Sections" />
        <Tab icon={<CategoryOutlinedIcon fontSize="small" />} iconPosition="start" label={`Creative Categories (${categories.length})`} />
        <Tab icon={<PersonOutlineIcon fontSize="small" />} iconPosition="start" label={`Editorial Authors (${authors.length})`} />
        <Tab icon={<ChatBubbleOutlineIcon fontSize="small" />} iconPosition="start" label={`Reader Comments (${comments.length})`} />
        <Tab icon={<StarBorderOutlinedIcon fontSize="small" />} iconPosition="start" label={`Featured Spotlight (${featuredPosts.length})`} />
      </Tabs>

      {/* TAB 0: ARTICLES & POSTS */}
      {tab === 0 && (
        <BlogPostsTable
          posts={posts}
          authors={authors}
          categories={categories}
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          isUpdating={isUpdating}
          onAddClick={handleOpenCreatePost}
          onEditClick={handleOpenEditPost}
          onDuplicateClick={handleDuplicatePost}
          onPreviewClick={handlePreview}
          onRevisionsClick={handleViewRevisions}
          onArchiveClick={(item) => setPostPendingArchive(item)}
        />
      )}

      {/* TAB 1: PAGE & SECTIONS CONTROL */}
      {tab === 1 && (
        <BlogPageSettingsEditor
          onSaved={(msg) => setToastMessage(msg)}
          onOpenMediaPicker={openMediaPicker}
        />
      )}

      {/* TAB 2: CREATIVE CATEGORIES */}
      {tab === 2 && (
        <BlogCategoriesTable
          categories={categories}
          posts={posts}
          onAddCategory={handleOpenCreateCategory}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={setCategoryPendingDeletion}
          onReorderCategories={handleReorderCategories}
          isReordering={isReorderingCategories}
        />
      )}

      {/* TAB 3: EDITORIAL AUTHORS */}
      {tab === 3 && (
        <BlogAuthorsTable
          authors={authors}
          posts={posts}
          onAddAuthor={handleOpenCreateAuthor}
          onEditAuthor={handleOpenEditAuthor}
          onDeleteAuthor={setAuthorPendingDeletion}
        />
      )}

      {/* TAB 4: READER COMMENTS */}
      {tab === 4 && (
        <CommentsModerationTable
          comments={comments}
          commentStatus={commentStatus}
          setCommentStatus={setCommentStatus}
          isUpdating={isUpdating}
          onModerate={handleModerateComment}
          onDelete={setCommentPendingDeletion}
        />
      )}

      {/* TAB 5: FEATURED SPOTLIGHT */}
      {tab === 5 && (
        <BlogFeaturedReorder
          featuredPosts={featuredPosts}
          onReorder={handleReorderFeatured}
          onSaveOrder={handleSaveFeaturedOrder}
          isSaving={isSavingFeatured}
        />
      )}

      {/* Post Editor Modal Dialog */}
      <BlogPostEditorDialog
        open={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        post={editingPost}
        setPost={setEditingPost}
        onSave={handleSavePost}
        onDuplicate={handleDuplicatePost}
        isSaving={isSavingPost}
        onOpenMediaPicker={openMediaPicker}
        categories={categories}
        authors={authors}
      />

      {/* Category Editor Modal Dialog */}
      <BlogCategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        category={editingCategory}
        setCategory={setEditingCategory}
        onSave={handleSaveCategory}
        isSaving={isSavingCategory}
      />

      {/* Author Editor Modal Dialog */}
      <BlogAuthorDialog
        open={authorDialogOpen}
        onClose={() => setAuthorDialogOpen(false)}
        author={editingAuthor}
        setAuthor={setEditingAuthor}
        onSave={handleSaveAuthor}
        isSaving={isSavingAuthor}
        onOpenMediaPicker={openMediaPicker}
      />

      {/* Visual Article Preview Dialog */}
      <BlogPostPreviewDialog preview={previewPost} onClose={() => setPreviewPost(null)} />

      {/* Article Revisions Dialog */}
      {revisions && (
        <Dialog open={Boolean(revisions)} onClose={() => setRevisions(null)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Article Revision History</span>
            <IconButton size="small" onClick={() => setRevisions(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <pre className={styles.preview}>{JSON.stringify(revisions, null, 2)}</pre>
          </DialogContent>
        </Dialog>
      )}

      {/* Media Picker Modal */}
      {mediaPicker && (
        <MediaPicker
          open={Boolean(mediaPicker)}
          type={mediaPicker.type || "image"}
          onClose={() => setMediaPicker(null)}
          onSelect={handleMediaSelected}
        />
      )}

      {/* Archive Post Confirmation */}
      <ConfirmationDialog
        open={Boolean(postPendingArchive)}
        title="Archive article?"
        description={
          postPendingArchive
            ? `“${postPendingArchive.title || "This article"}” will be un-published from the live website and retained in archive history.`
            : ""
        }
        confirmLabel="Archive Article"
        isConfirming={isArchivingPost}
        tone="danger"
        onCancel={() => setPostPendingArchive(null)}
        onConfirm={handleConfirmArchivePost}
      />

      {/* Delete Category Confirmation */}
      <ConfirmationDialog
        open={Boolean(categoryPendingDeletion)}
        title="Delete category?"
        description={
          categoryPendingDeletion
            ? `“${categoryPendingDeletion.title}” will be permanently removed. Categories in use by published articles cannot be deleted.`
            : ""
        }
        confirmLabel="Delete Category"
        isConfirming={isDeletingCategory}
        tone="danger"
        onCancel={() => setCategoryPendingDeletion(null)}
        onConfirm={handleConfirmDeleteCategory}
      />

      {/* Delete Author Confirmation */}
      <ConfirmationDialog
        open={Boolean(authorPendingDeletion)}
        title="Delete contributor profile?"
        description={
          authorPendingDeletion
            ? `“${authorPendingDeletion.title || authorPendingDeletion.name}” will be permanently deleted. Authors with published articles must be reassigned first.`
            : ""
        }
        confirmLabel="Delete Author"
        isConfirming={isDeletingAuthor}
        tone="danger"
        onCancel={() => setAuthorPendingDeletion(null)}
        onConfirm={handleConfirmDeleteAuthor}
      />

      {/* Delete Comment Confirmation */}
      <ConfirmationDialog
        open={Boolean(commentPendingDeletion)}
        title="Delete reader comment?"
        description={
          commentPendingDeletion?.author_name
            ? `Comment by “${commentPendingDeletion.author_name}” will be permanently removed from discussion threads.`
            : "This comment will be permanently removed from discussion threads."
        }
        confirmLabel="Delete Comment"
        isConfirming={isDeletingComment}
        tone="danger"
        onCancel={() => setCommentPendingDeletion(null)}
        onConfirm={handleConfirmDeleteComment}
      />

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
}

export default BlogAdmin;
