import Image from "next/image";
import Link from "next/link";
import styles from "./BlogArticles.module.css";
import { BLOG_ARTICLES } from "../../../constants/blog";

/**
 * BlogArticles component rendering the 6 curated stories matching vector card design.
 */
export function BlogArticles({ articles = BLOG_ARTICLES }) {
  return (
    <section className={styles.section} aria-label="Latest Stories">
      <div className={styles.container}>
        {/* Section Header with dual accent lines */}
        <div className={styles.headerArea}>
          <div className={styles.tagline}>
            <span className={styles.accentLine} aria-hidden="true" />
            <span className={styles.tagText}>LATEST STORIES</span>
            <span className={styles.accentLine} aria-hidden="true" />
          </div>
          <h2 className={styles.title}>Stories, Voices &amp; Ideas That Matter</h2>
          <p className={styles.subtitle}>
            Discover inspiring stories, fresh perspectives and creative voices that celebrate the talent, culture and ideas shaping Royz Houz.
          </p>
        </div>

        {/* 6 Articles Grid (3 cols) */}
        <div className={styles.grid}>
          {articles.map((article) => (
            <article key={article.id} className={styles.articleCard}>
              <Link href={`/blog/${article.slug}`} className={styles.cardLink}>
                {/* Image container with inner border and margin */}
                <div className={styles.imageOuterFrame}>
                  <div className={styles.imageWrapper}>
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.articleImage}
                    />
                  </div>
                </div>

                {/* Meta Row below image */}
                <div className={styles.metaRow}>
                  <div className={styles.badgeGroup}>
                    {/* Red Premium Star Badge */}
                    <span className={styles.premiumTag}>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.starIcon}
                      >
                        <path
                          d="M6 0.5L7.4 4.3L11.5 4.6L8.3 7.3L9.3 11.3L6 9.1L2.7 11.3L3.7 7.3L0.5 4.6L4.6 4.3L6 0.5Z"
                          fill="#F81E00"
                        />
                      </svg>
                      PREMIUM
                    </span>
                    <span className={styles.formatBracket}>[ {article.format} ]</span>
                  </div>
                  <span className={styles.dateText}>{article.date}</span>
                </div>

                {/* Divider Line */}
                <div className={styles.dividerLine} />

                {/* Card Content Body */}
                <div className={styles.contentBody}>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  <p className={styles.articleExcerpt}>{article.excerpt}</p>

                  {/* Author, ReadTime & Arrow Footer */}
                  <div className={styles.footerRow}>
                    <div className={styles.authorMeta}>
                      <span className={styles.authorName}>{article.author}</span>
                      <span className={styles.readTime}>{article.readTime}</span>
                    </div>
                    <svg
                      width="16"
                      height="8"
                      viewBox="0 0 16 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={styles.footerArrow}
                    >
                      <path
                        d="M15.3536 4.35355C15.5488 4.15829 15.5488 3.84171 15.3536 3.64645L12.1716 0.464466C11.9763 0.269204 11.6597 0.269204 11.4645 0.464466C11.2692 0.659728 11.2692 0.976311 11.4645 1.17157L14.2929 4L11.4645 6.82843C11.2692 7.02369 11.2692 7.34027 11.4645 7.53553C11.6597 7.7308 11.9763 7.7308 12.1716 7.53553L15.3536 4.35355ZM0 4.5H15V3.5H0V4.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogArticles;
