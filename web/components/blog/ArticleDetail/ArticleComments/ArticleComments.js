import { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, Trash2, Edit2, Check, X, MessageSquare } from "lucide-react";
import styles from "./ArticleComments.module.css";

const STORAGE_KEY = "royz_liked_comments_v1";

const INITIAL_COMMENTS = [
  {
    id: "c-1",
    author: "Amanda Doe",
    isCurrentUser: false,
    avatar: "/assets/img/events/speakers/amara.jpg",
    date: "2 days ago",
    content:
      "This is an incredible story! It's so empowering to see local initiatives creating massive real-world impact for creative youth in Nigeria. Kudos to the team at Royz Houz!",
    baseLikes: 14,
    order: 1,
    replies: [],
  },
  {
    id: "c-2",
    author: "Dr. Charles Kwame",
    isCurrentUser: false,
    avatar: "/assets/img/events/speakers/kwame.jpg",
    date: "4 days ago",
    content:
      "The impact reports like this are crucial for the creative ecosystem. Young Africans have immense talent but lack the structure to grow sustainably. Very well written piece!",
    baseLikes: 9,
    order: 2,
    replies: [],
  },
  {
    id: "c-3",
    author: "Precious Ayodele",
    isCurrentUser: false,
    avatar: "/assets/img/events/speakers/fatima.jpg",
    date: "1 week ago",
    content:
      "Music, dance, film and storytelling are the heart and soul of Africa. When we empower creators to tell authentic stories, we change the continent's narrative. Keep it up!",
    baseLikes: 21,
    order: 3,
    replies: [
      {
        id: "r-1",
        author: "Oluwaseun Adeyemi",
        avatar: "/assets/img/events/speakers/ngozi.jpg",
        date: "5 days ago",
        content:
          "Totally agree! Looking forward to the next cohort announcement and workshop series.",
        baseLikes: 4,
      },
    ],
  },
  {
    id: "c-4",
    author: "Marcus Okonjo",
    isCurrentUser: false,
    avatar: "/assets/img/about/leader.jpg",
    date: "2 weeks ago",
    content:
      "Where can we donate or partner with Royz Houz? The work being done here is vital for young creative leaders.",
    baseLikes: 6,
    order: 4,
    replies: [
      {
        id: "r-2",
        author: "Chisom Obi",
        isAuthor: true,
        avatar: "/assets/img/blog/author-chisom.jpg",
        date: "1 week ago",
        content:
          "Thanks for your interest Marcus! Please reach out to partnership@royzhouz.com or visit our partner page.",
        baseLikes: 12,
      },
      {
        id: "r-3",
        author: "Marcus Okonjo",
        avatar: "/assets/img/about/leader.jpg",
        date: "1 week ago",
        content: "Will do! Looking forward to supporting this vision.",
        baseLikes: 3,
      },
    ],
  },
  {
    id: "c-5",
    author: "Folashade Adeleke",
    isCurrentUser: false,
    avatar: "/assets/img/events/speakers/ngozi.jpg",
    date: "3 weeks ago",
    content:
      "I attended one of the creative incubators last quarter in Lagos. The curriculum and mentorship provided completely shifted how I price and license my photography work. Thank you Royz Houz!",
    baseLikes: 18,
    order: 5,
    replies: [],
  },
];

/**
 * Realistic Avatar Component handling photo or branded initials fallback
 */
function CommentAvatar({ src, name }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";

  if (src) {
    return (
      <div className={styles.avatarWrapper}>
        <Image
          src={src}
          alt={name || "User"}
          fill
          className={styles.avatar}
        />
      </div>
    );
  }

  return (
    <div className={styles.initialAvatar} aria-label={name || "User"}>
      <span>{initial}</span>
    </div>
  );
}

/**
 * ArticleComments component displaying realistic community discussion with guest persistence.
 */
export function ArticleComments({
  newComments = [],
  onDeleteComment,
  onEditComment,
}) {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [extraReplies, setExtraReplies] = useState({});
  const [likedIds, setLikedIds] = useState({});
  const [activeSort, setActiveSort] = useState("Newest");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyData, setReplyData] = useState({ name: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Load liked comments from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLikedIds(JSON.parse(saved));
      }
    } catch {
      // ignore localStorage error if blocked
    }
  }, []);

  // Merge extraReplies into comments list
  const combined = [...newComments, ...comments].map((c) => {
    const customReplies = extraReplies[c.id] || [];
    return {
      ...c,
      replies: [...(c.replies || []), ...customReplies],
    };
  });

  // Helper to compute live like count
  const getLikeCount = (item) => {
    const base = item.baseLikes ?? item.likes ?? 0;
    const isLiked = !!likedIds[item.id];
    return base + (isLiked ? 1 : 0);
  };

  // Sorting
  const sortedComments = [...combined].sort((a, b) => {
    if (activeSort === "Most Popular") {
      return getLikeCount(b) - getLikeCount(a);
    }
    if (activeSort === "Oldest") {
      return (b.order || 0) - (a.order || 0);
    }
    // Newest
    return (a.order || 0) - (b.order || 0);
  });

  // Toggle like with persistent localStorage tracking
  const handleToggleLike = (id) => {
    setLikedIds((prev) => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = true;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleDelete = (id) => {
    // Check if it is a top-level parent comment in initial state
    setComments((prev) => prev.filter((c) => c.id !== id));

    // Call parent handler to remove from newComments (userComments state in [slug].js)
    if (onDeleteComment) {
      onDeleteComment(id);
    }

    // Check if it's a nested reply in extraReplies
    setExtraReplies((prev) => {
      const next = {};
      Object.keys(prev).forEach((parentKey) => {
        next[parentKey] = prev[parentKey].filter((r) => r.id !== id);
      });
      return next;
    });

    setDeleteConfirmId(null);
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    const trimmed = editText.trim();

    // Update in local state
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: trimmed } : c))
    );

    // Update in parent newComments state
    if (onEditComment) {
      onEditComment(id, trimmed);
    }

    // Update in extraReplies
    setExtraReplies((prev) => {
      const next = {};
      Object.keys(prev).forEach((parentKey) => {
        next[parentKey] = prev[parentKey].map((r) =>
          r.id === id ? { ...r, content: trimmed } : r
        );
      });
      return next;
    });

    setEditingId(null);
    setEditText("");
  };

  const handleAddReply = (commentId) => {
    if (!replyData.content.trim()) return;
    const authorName = replyData.name.trim() || "Guest Reader";

    const newReply = {
      id: `r-${Date.now()}`,
      author: authorName,
      isCurrentUser: true,
      avatar: null,
      date: "Just now",
      content: replyData.content.trim(),
      baseLikes: 0,
    };

    setExtraReplies((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), newReply],
    }));

    setReplyData({ name: "", content: "" });
    setActiveReplyId(null);
  };

  return (
    <section className={styles.commentsSection} aria-label="Article Discussion">
      {/* Header & Filter Sort Tabs (1026x76 Spec) */}
      <div className={styles.sectionHeader}>
        <h3 className={styles.commentsCount}>
          {combined.length} Comments
        </h3>

        <div className={styles.sortTabs} role="tablist">
          {["Newest", "Oldest", "Most Popular"].map((sort) => (
            <button
              key={sort}
              type="button"
              role="tab"
              aria-selected={activeSort === sort}
              onClick={() => setActiveSort(sort)}
              className={`${styles.sortTab} ${
                activeSort === sort ? styles.sortTabActive : ""
              }`}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List (1026x169 Card Spec) */}
      <div className={styles.commentsList}>
        {sortedComments.map((comment) => {
          const isLiked = !!likedIds[comment.id];
          const likeCount = getLikeCount(comment);

          return (
            <div key={comment.id} className={styles.commentCard}>
              <div className={styles.commentMainRow}>
                {/* Author Avatar with Initial Fallback */}
                <CommentAvatar src={comment.avatar} name={comment.author} />

                {/* Comment Body & Header Row */}
                <div className={styles.commentBody}>
                  <div className={styles.commentMetaRow}>
                    <div className={styles.authorBadgeGroup}>
                      <span className={styles.authorName}>{comment.author}</span>
                      {comment.isCurrentUser && (
                        <span className={styles.youBadge}>YOU</span>
                      )}
                      <span className={styles.commentDate}>{comment.date}</span>
                    </div>

                    {/* Header Actions (Only for user-posted comments in active session) */}
                    {comment.isCurrentUser && (
                      <div className={styles.headerActions}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment)}
                          className={styles.iconBtn}
                          title="Edit your comment"
                          aria-label="Edit comment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(comment.id)}
                          className={styles.iconBtnDelete}
                          title="Delete your comment"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Delete Confirmation Alert */}
                  {deleteConfirmId === comment.id && (
                    <div className={styles.deleteConfirmBanner}>
                      <span className={styles.deleteConfirmText}>
                        Are you sure you want to delete this comment?
                      </span>
                      <div className={styles.deleteBtnGroup}>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className={styles.deleteConfirmBtn}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Content or Edit Mode */}
                  {editingId === comment.id ? (
                    <div className={styles.editArea}>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        className={styles.editTextarea}
                        autoFocus
                      />
                      <div className={styles.editActionRow}>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comment.id)}
                          className={styles.saveEditBtn}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className={styles.cancelBtn}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.commentContent}>{comment.content}</p>
                  )}

                  {/* Bottom Actions: Reply & Like */}
                  <div className={styles.commentActions}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
                      }
                      className={styles.replyButton}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      className={`${styles.likeButton} ${
                        isLiked ? styles.liked : ""
                      }`}
                      aria-label={isLiked ? "Unlike comment" : "Like comment"}
                      aria-pressed={isLiked}
                    >
                      <Heart className="w-3.5 h-3.5" fill={isLiked ? "currentColor" : "none"} />
                      <span>{likeCount}</span>
                    </button>
                  </div>

                  {/* Realistic Guest Reply Form */}
                  {activeReplyId === comment.id && (
                    <div className={styles.replyInputArea}>
                      <div className={styles.replyInputRow}>
                        <input
                          type="text"
                          value={replyData.name}
                          onChange={(e) =>
                            setReplyData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="Your name (optional)"
                          className={styles.replyNameInput}
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={replyData.content}
                        onChange={(e) =>
                          setReplyData((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder={`Reply to ${comment.author}...`}
                        className={styles.replyTextarea}
                        autoFocus
                      />
                      <div className={styles.replyBtnRow}>
                        <button
                          type="button"
                          onClick={() => handleAddReply(comment.id)}
                          className={styles.replySubmitBtn}
                        >
                          Post Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyId(null);
                            setReplyData({ name: "", content: "" });
                          }}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className={styles.repliesList}>
                      {comment.replies.map((reply) => {
                        const isReplyLiked = !!likedIds[reply.id];
                        const replyLikeCount = getLikeCount(reply);

                        return (
                          <div key={reply.id} className={styles.replyItem}>
                            <CommentAvatar src={reply.avatar} name={reply.author} />
                            <div className={styles.replyBody}>
                              <div className={styles.commentMetaRow}>
                                <div className={styles.authorBadgeGroup}>
                                  <span className={styles.authorName}>
                                    {reply.author}
                                  </span>
                                  {reply.isCurrentUser && (
                                    <span className={styles.youBadge}>YOU</span>
                                  )}
                                  {reply.isAuthor && (
                                    <span className={styles.authorBadge}>
                                      AUTHOR
                                    </span>
                                  )}
                                  <span className={styles.commentDate}>{reply.date}</span>
                                </div>

                                {reply.isCurrentUser && (
                                  <div className={styles.headerActions}>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(reply)}
                                      className={styles.iconBtn}
                                      title="Edit your reply"
                                      aria-label="Edit reply"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(reply.id)}
                                      className={styles.iconBtnDelete}
                                      title="Delete your reply"
                                      aria-label="Delete reply"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Inline Delete Confirmation Alert for reply */}
                              {deleteConfirmId === reply.id && (
                                <div className={styles.deleteConfirmBanner}>
                                  <span className={styles.deleteConfirmText}>
                                    Delete this reply?
                                  </span>
                                  <div className={styles.deleteBtnGroup}>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(reply.id)}
                                      className={styles.deleteConfirmBtn}
                                    >
                                      Delete
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmId(null)}
                                      className={styles.cancelBtn}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              {editingId === reply.id ? (
                                <div className={styles.editArea}>
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={2}
                                    className={styles.editTextarea}
                                    autoFocus
                                  />
                                  <div className={styles.editActionRow}>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(reply.id)}
                                      className={styles.saveEditBtn}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Save</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingId(null)}
                                      className={styles.cancelBtn}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Cancel</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className={styles.commentContent}>{reply.content}</p>
                              )}

                              {/* Reply Like Action */}
                              <div className={styles.replyActions}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleLike(reply.id)}
                                  className={`${styles.likeButton} ${
                                    isReplyLiked ? styles.liked : ""
                                  }`}
                                  aria-label={isReplyLiked ? "Unlike reply" : "Like reply"}
                                  aria-pressed={isReplyLiked}
                                >
                                  <Heart
                                    className="w-3 h-3"
                                    fill={isReplyLiked ? "currentColor" : "none"}
                                  />
                                  <span className="text-[11px]">{replyLikeCount}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ArticleComments;
