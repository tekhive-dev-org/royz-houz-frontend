import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LATEST_BLOG_POSTS } from "@/constants/blog";
import { Carousel } from "@/components/common/Carousel";
import { BlogCard } from "./BlogCard";
import styles from "./LatestBlog.module.css";

export function LatestBlog() {
  return (
    <section className={styles.section} id="latest-blog">
      <div className={styles.container}>

        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>Latest from our blog</h2>
          </div>

          <Link href="/blog" className={styles.viewAllLink}>
            <span>View all articles</span>
            <ChevronRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {/* Reusable Carousel */}
        <Carousel
          items={LATEST_BLOG_POSTS}
          ariaLabel="Latest blog posts carousel"
          renderItem={(post) => <BlogCard post={post} />}
        />

      </div>
    </section>
  );
}

export default LatestBlog;
