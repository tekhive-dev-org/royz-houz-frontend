import Image from "next/image";
import Link from "next/link";
import styles from "./LatestBlog.module.css";

/**
 * Individual Blog Card rendered in the LatestBlog carousel.
 */
export function BlogCard({ post }) {
  return (
    <Link href={post.link} className={styles.card}>
      {/* Thumbnail Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 464px"
          className={styles.cardImage}
        />
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        {/* Category & Read Time */}
        <div className={styles.metaRow}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.readTime}>{post.readTime}</span>
        </div>

        {/* Article Title */}
        <h3 className={styles.postTitle}>{post.title}</h3>

        {/* Publish Date */}
        <span className={styles.date}>{post.date}</span>
      </div>
    </Link>
  );
}
