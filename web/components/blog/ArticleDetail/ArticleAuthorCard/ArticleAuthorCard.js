import Image from "next/image";
import Link from "next/link";
import styles from "./ArticleAuthorCard.module.css";

/**
 * ArticleAuthorCard displays the sticky sidebar author profile box
 * matching the 288x403 Figma specification.
 */
export function ArticleAuthorCard({ author = "Chisom Obi" }) {
  return (
    <aside className={styles.stickyWrapper} aria-label="About the author">
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {/* Author Circular 80px Avatar with Brand Outer Ring */}
          <div className={styles.avatarRing}>
            <div className={styles.avatarContainer}>
              <Image
                src="/assets/img/blog/author-chisom.jpg"
                alt={author}
                fill
                sizes="80px"
                className={styles.avatar}
              />
            </div>
          </div>

          {/* Author Name & Role */}
          <div className={styles.authorHeader}>
            <h3 className={styles.authorName}>{author}</h3>
            <span className={styles.roleTag}>STAFF WRITER</span>
          </div>

          {/* Bio Narrative */}
          <p className={styles.bio}>
            Chisom is an essayist, journalist, and creative strategist at Royz Houz focusing on contemporary African music, dance, film, and youth empowerment. Her work has appeared in leading global publications.
          </p>
        </div>

        {/* Footer Action Link */}
        <div className={styles.footerArea}>
          <Link href="/blog" className={styles.viewMoreLink}>
            <span>View all 12 Articles</span>
            <span aria-hidden="true" className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default ArticleAuthorCard;
