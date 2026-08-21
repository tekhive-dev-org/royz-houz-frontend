import Image from "next/image";
import Link from "next/link";
import styles from "./BlogPillars.module.css";
import { BLOG_PILLARS } from "../../../constants/blog";

/**
 * BlogPillars component rendering the 4 creative pillars of Royz Houz
 * following exact vector proportions (303x564, 8px padding, 287x416 portrait ratio, vector arrow).
 */
export function BlogPillars({ pillars = BLOG_PILLARS }) {
  return (
    <section className={styles.section} aria-label="Discover the World of Royz Houz">
      <div className={styles.container}>
        {/* Section Header with exact dual accent lines */}
        <div className={styles.headerArea}>
          <div className={styles.tagline}>
            <span className={styles.accentLine} aria-hidden="true" />
            <span className={styles.tagText}>EXPLORE OUR STORIES</span>
            <span className={styles.accentLine} aria-hidden="true" />
          </div>
          <h2 className={styles.title}>Discover the World of Royz Houz</h2>
          <p className={styles.subtitle}>
            Explore the talent, culture, stories and creative experiences that make Royz Houz a platform for African creativity and impact.
          </p>
        </div>

        {/* 4 Pillars Responsive Grid */}
        <div className={styles.grid}>
          {pillars.map((pillar) => (
            <Link
              key={pillar.id}
              href={pillar.link || "#"}
              className={styles.pillarCard}
            >
              {/* Image Container with exact 8px padding and border stroke */}
              <div className={styles.imageOuterFrame}>
                <div className={styles.imageContainer}>
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={styles.pillarImage}
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  <svg
                    width="21"
                    height="8"
                    viewBox="0 0 21 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.arrowIcon}
                  >
                    <path
                      d="M19.799 4.001L20.153 4.354C20.246 4.261 20.299 4.134 20.299 4.001C20.299 3.868 20.246 3.741 20.153 3.647L19.799 4.001ZM16.971 1.173L17.324 0.819C17.254 0.749 17.165 0.701 17.068 0.682C16.971 0.662 16.87 0.672 16.779 0.71C16.687 0.748 16.609 0.812 16.554 0.894C16.499 0.977 16.47 1.073 16.47 1.173L16.971 1.173ZM16.971 6.829L16.47 6.829C16.47 6.928 16.499 7.025 16.554 7.108C16.609 7.19 16.687 7.254 16.779 7.292C16.87 7.33 16.971 7.34 17.068 7.32C17.165 7.301 17.254 7.253 17.324 7.183L16.971 6.829ZM16.971 3.5L0 3.5L0 4.502L16.971 4.502V3.5ZM20.153 3.647L17.324 0.819L16.617 1.526L19.446 4.354L20.153 3.647ZM16.47 1.173V6.829L17.471 6.829L17.471 1.173L16.47 1.173ZM17.324 7.183L20.153 4.354L19.446 3.647L16.617 6.476L17.324 7.183Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className={styles.pillarDescription}>
                  {pillar.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogPillars;
