import Image from "next/image";
import Link from "next/link";
import styles from "./ArticleAuthorCard.module.css";

/**
 * ArticleAuthorCard displays the sticky sidebar author profile box
 * matching the 288x403 Figma specification.
 */
export function ArticleAuthorCard({ author = "Chisom Obi" }) {
  const isObject = typeof author === "object" && author !== null;
  const name = isObject ? author.name || "Chisom Obi" : author || "Chisom Obi";
  const avatar = isObject ? author.avatar || "/assets/img/blog/author-chisom.jpg" : "/assets/img/blog/author-chisom.jpg";
  const role = isObject ? author.role || "STAFF WRITER" : "STAFF WRITER";
  const bio = isObject
    ? author.bio ||
      "Chisom is an essayist, journalist, and creative strategist at Royz Houz focusing on contemporary African music, dance, film, and youth empowerment. Her work has appeared in leading global publications."
    : "Chisom is an essayist, journalist, and creative strategist at Royz Houz focusing on contemporary African music, dance, film, and youth empowerment. Her work has appeared in leading global publications.";

  return (
    <aside className={styles.stickyWrapper} aria-label="About the author">
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {/* Author Circular 80px Avatar with Brand Outer Ring */}
          <div className={styles.avatarRing}>
            <div className={styles.avatarContainer}>
              <Image
                src={avatar}
                alt={name}
                fill
                sizes="80px"
                className={styles.avatar}
              />
            </div>
          </div>

          {/* Author Name & Role */}
          <div className={styles.authorHeader}>
            <h3 className={styles.authorName}>{name}</h3>
            <span className={styles.roleTag}>{role}</span>
          </div>

          {/* Bio Narrative */}
          <p className={styles.bio}>{bio}</p>
        </div>

        {/* Footer Action Link */}
        <div className={styles.footerArea}>
          <Link href="/blog" className={styles.viewMoreLink}>
            <span>View all Articles</span>
            <span aria-hidden="true" className={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default ArticleAuthorCard;
