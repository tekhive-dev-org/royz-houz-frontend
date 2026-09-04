import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { formatDate } from "@/utils/dateFormatter";
import styles from "./ArticleComments.module.css";

const STORAGE_KEY = "royz_liked_comments_v1";

function CommentAvatar({ src, name }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "G";

  if (!src) return <div className={styles.initialAvatar}>{initial}</div>;

  return (
    <div className={styles.avatarWrapper}>
      <Image src={src} alt="" fill sizes="40px" className={styles.avatar} />
    </div>
  );
}

function formatCommentDate(value) {
  return formatDate(value);
}

/**
 * Renders only comments returned by the approved-comment public service.
 */
export function ArticleComments({ comments = [] }) {
  const [likedIds, setLikedIds] = useState({});
  const [activeSort, setActiveSort] = useState("Newest");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLikedIds(JSON.parse(saved));
    } catch {
      // Local preference persistence is optional.
    }
  }, []);

  const getLikeCount = (comment) => (comment.baseLikes || 0) + (likedIds[comment.id] ? 1 : 0);
  const sortedComments = [...comments].sort((first, second) => {
    if (activeSort === "Most Popular") return getLikeCount(second) - getLikeCount(first);
    const firstOrder = new Date(first.order || first.date || 0).getTime();
    const secondOrder = new Date(second.order || second.date || 0).getTime();
    return activeSort === "Oldest" ? firstOrder - secondOrder : secondOrder - firstOrder;
  });

  const handleToggleLike = (id) => {
    setLikedIds((previous) => {
      const next = { ...previous, [id]: !previous[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Local preference persistence is optional.
      }
      return next;
    });
  };

  return (
    <section className={styles.commentsSection} aria-label="Article Discussion">
      <div className={styles.sectionHeader}>
        <h3 className={styles.commentsCount}>{comments.length} Comments</h3>
        <div className={styles.sortTabs} role="tablist">
          {["Newest", "Oldest", "Most Popular"].map((sort) => (
            <button
              key={sort}
              type="button"
              role="tab"
              aria-selected={activeSort === sort}
              onClick={() => setActiveSort(sort)}
              className={`${styles.sortTab} ${activeSort === sort ? styles.sortTabActive : ""}`}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.commentsList}>
        {sortedComments.map((comment) => (
          <div key={comment.id} className={styles.commentCard}>
            <div className={styles.commentMainRow}>
              <CommentAvatar src={comment.avatar} name={comment.author} />
              <div className={styles.commentBody}>
                <div className={styles.commentMetaRow}>
                  <div className={styles.authorBadgeGroup}>
                    <span className={styles.authorName}>{comment.author}</span>
                    <span className={styles.commentDate}>{formatCommentDate(comment.date)}</span>
                  </div>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
                <div className={styles.commentActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleLike(comment.id)}
                    className={`${styles.likeButton} ${likedIds[comment.id] ? styles.liked : ""}`}
                    aria-label={likedIds[comment.id] ? "Unlike comment" : "Like comment"}
                    aria-pressed={Boolean(likedIds[comment.id])}
                  >
                    <Heart className="w-3.5 h-3.5" fill={likedIds[comment.id] ? "currentColor" : "none"} />
                    <span>{getLikeCount(comment)}</span>
                  </button>
                </div>

                {comment.replies?.length > 0 && (
                  <div className={styles.repliesList}>
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className={styles.replyItem}>
                        <CommentAvatar src={reply.avatar} name={reply.author} />
                        <div className={styles.replyBody}>
                          <div className={styles.commentMetaRow}>
                            <div className={styles.authorBadgeGroup}>
                              <span className={styles.authorName}>{reply.author}</span>
                              <span className={styles.commentDate}>{formatCommentDate(reply.date)}</span>
                            </div>
                          </div>
                          <p className={styles.commentContent}>{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ArticleComments;
