import Image from "next/image";
import Link from "next/link";
import { HOMEPAGE_LATEST_BLOG_CONTENT } from "@/constants/homepageContent";
import { formatDate } from "@/utils/dateFormatter";
import styles from "./LatestBlog.module.css";

/**
 * Individual Blog Card rendered in the LatestBlog carousel.
 */
export function BlogCard({ post }) {
  const blogPost = { ...HOMEPAGE_LATEST_BLOG_CONTENT.posts[0], ...post };
  const readTime = blogPost.readTime || blogPost.duration || "5min read";
  const displayDate = formatDate(blogPost.date || blogPost.published_at || blogPost.created_at) || blogPost.date;

  return (
    <Link href={blogPost.link || (blogPost.slug ? `/blog/${blogPost.slug}` : "/blog")} className={styles.card}>
      {/* Thumbnail Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={blogPost.image || "/assets/img/blog/post-ballet.jpg"}
          alt={blogPost.title}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          className={styles.cardImage}
        />
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        {/* Read Time (Top Right) */}
        <div className={styles.metaRow}>
          {readTime && <span className={styles.readTime}>{readTime}</span>}
        </div>

        {/* Article Title */}
        <h3 className={styles.postTitle}>{blogPost.title}</h3>

        {/* Publish Date */}
        <span className={styles.date}>{displayDate}</span>
      </div>
    </Link>
  );
}

export default BlogCard;
