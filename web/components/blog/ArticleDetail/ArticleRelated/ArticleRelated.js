import Image from "next/image";
import Link from "next/link";
import styles from "./ArticleRelated.module.css";
import { BLOG_ARTICLES } from "@/constants/blog";

/**
 * ArticleRelated renders the 3 recommended story cards matching the 350x441 vector specification.
 */
export function ArticleRelated({ currentSlug }) {
  // Get 3 related articles (prioritizing the 3 key cards from design, or excluding currentSlug)
  const relatedArticles = BLOG_ARTICLES.filter(
    (a) => a.slug !== currentSlug
  ).slice(0, 3);

  // Fallback to top 3 articles if not enough
  const displayArticles =
    relatedArticles.length === 3 ? relatedArticles : BLOG_ARTICLES.slice(0, 3);

  return (
    <section className={styles.section} aria-label="You Might Also Like">
      <div className={styles.container}>
        {/* Section Header (1067x135 Spec) */}
        <div className={styles.headerArea}>
          <div className={styles.eyebrowRow}>
            <span className={styles.accentLine} aria-hidden="true" />
            <span className={styles.eyebrowText}>FROM ROYZ HOUZ</span>
            <span className={styles.accentLine} aria-hidden="true" />
          </div>

          <h2 className={styles.title}>You Might Also Like</h2>
          <p className={styles.subtitle}>
            Discover powerful stories, inspiring conversations and creative perspectives that bring the people, talent and experiences behind Royz Houz to life.
          </p>
        </div>

        {/* 3-Column Cards Grid (350x441 Card Vector Spec) */}
        <div className={styles.grid}>
          {displayArticles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className={styles.articleCard}
            >
              {/* Image Container with precise 7px margin and inner border */}
              <div className={styles.imageOuterFrame}>
                <div className={styles.imageContainer}>
                  <Image
                    src={article.image || "/assets/img/blog/post-ballet.jpg"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.articleImage}
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className={styles.cardContent}>
                {/* Meta Row: ★ PREMIUM   [ PODCAST ]   Date (Y: 231px) */}
                <div className={styles.metaRow}>
                  <div className={styles.badgeGroup}>
                    <span className={styles.premiumTag}>
                      <span aria-hidden="true" className={styles.star}>★</span> PREMIUM
                    </span>
                    <span className={styles.formatBracket}>
                      [ {article.format || "PODCAST"} ]
                    </span>
                  </div>
                  <span className={styles.metaDate}>{article.date}</span>
                </div>

                {/* Horizontal Divider Line (Y: 246.8px Spec) */}
                <div className={styles.metaDivider} />

                {/* Title & Excerpt Container */}
                <div className={styles.textBlock}>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>
                </div>

                {/* Footer Row: Author, Read Time, Arrow (Y: 414px) */}
                <div className={styles.footerRow}>
                  <div className={styles.footerMeta}>
                    <span className={styles.footerAuthor}>{article.author}</span>
                    <span className={styles.footerReadTime}>{article.readTime}</span>
                  </div>

                  <div className={styles.arrowWrapper}>
                    <svg
                      width="18"
                      height="8"
                      viewBox="0 0 18 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={styles.arrowIcon}
                    >
                      <path
                        d="M17.3536 4.35355C17.5488 4.15829 17.5488 3.84171 17.3536 3.64645L14.1716 0.464466C13.9763 0.269204 13.6597 0.269204 13.4645 0.464466C13.2692 0.659728 13.2692 0.976311 13.4645 1.17157L16.2929 4L13.4645 6.82843C13.2692 7.02369 13.2692 7.34027 13.4645 7.53553C13.6597 7.7308 13.9763 7.7308 14.1716 7.53553L17.3536 4.35355ZM0 4.5H17V3.5H0V4.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArticleRelated;
