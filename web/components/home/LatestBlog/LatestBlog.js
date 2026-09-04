import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOMEPAGE_LATEST_BLOG_CONTENT } from "@/constants/homepageContent";
import { Carousel } from "@/components/common/Carousel";
import { BlogCard } from "./BlogCard";
import styles from "./LatestBlog.module.css";

export function LatestBlog({ content }) {
  const sectionContent = { ...HOMEPAGE_LATEST_BLOG_CONTENT, ...content };
  const rawPosts = Array.isArray(sectionContent.posts) && sectionContent.posts.length > 0
    ? sectionContent.posts
    : HOMEPAGE_LATEST_BLOG_CONTENT.posts;

  // Guarantee at least 6 slides for continuous, non-stalling loop autoscroll
  const posts = rawPosts.length > 0 && rawPosts.length < 6
    ? [...rawPosts, ...rawPosts]
    : rawPosts;

  const carouselOptions = {
    type: "loop",
    autoplay: true,
    interval: 3500,
    speed: 800,
    pauseOnHover: true,
    pauseOnFocus: false,
    resetProgress: false,
    perMove: 1,
    fixedWidth: "440px",
    gap: "24px",
    pagination: true,
    arrows: false,
    drag: true,
    snap: true,
    clones: 6,
    breakpoints: {
      1280: {
        fixedWidth: "400px",
        gap: "20px",
      },
      1024: {
        fixedWidth: "340px",
        gap: "16px",
      },
      768: {
        fixedWidth: "85%",
        gap: "16px",
      },
      480: {
        fixedWidth: "90%",
        gap: "12px",
      },
    },
  };

  return (
    <section className={styles.section} id="latest-blog">
      <div className={styles.container}>

        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>{sectionContent.title}</h2>
          </div>

          <Link href={sectionContent.viewAllHref} className={styles.viewAllLink}>
            <span>{sectionContent.viewAllLabel}</span>
            <ChevronRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {/* Reusable Carousel */}
        <Carousel
          items={posts}
          options={carouselOptions}
          ariaLabel={sectionContent.carouselAriaLabel}
          renderItem={(post) => <BlogCard post={post} />}
        />

      </div>
    </section>
  );
}

export default LatestBlog;
