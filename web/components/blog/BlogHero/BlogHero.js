import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./BlogHero.module.css";
import { BLOG_HERO_SLIDES } from "../../../constants/blog";

/**
 * BlogHero component with background carousel transition and exact minimalist long-arrow navigation controls.
 */
export function BlogHero({ slides = BLOG_HERO_SLIDES }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, total, handleNext]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      className={styles.heroSection}
      aria-label="Blog Featured Stories Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Carousel Slides */}
      <div className={styles.backgroundContainer}>
        {slides.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`${styles.slideImageWrapper} ${
              idx === currentIndex ? styles.slideActive : styles.slideInactive
            }`}
          >
            <Image
              src={slide.backgroundImage}
              alt={slide.titleHighlight || "Blog Hero"}
              fill
              sizes="100vw"
              priority={idx === 0}
              className={styles.bgImage}
            />
          </div>
        ))}
        {/* Soft Left Ambient Gradient for Text Contrast */}
        <div className={styles.ambientOverlay} />
      </div>

      {/* Main Hero Content Container */}
      <div className={styles.contentContainer}>
        <div className={styles.textColumn}>
          {/* Exact Top Minimalist Long-Arrow Navigation Controls */}
          <div className={styles.navControlsRow}>
            <button
              type="button"
              onClick={handlePrev}
              className={`${styles.arrowButton} ${currentIndex === 0 ? styles.arrowDimmed : styles.arrowActive}`}
              aria-label="Previous slide"
            >
              <svg width="24" height="10" viewBox="11 9 22 9" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowSvg}>
                <path d="M12.4998 13.3291L12.1463 13.6826C12.0525 13.5888 11.9998 13.4617 11.9998 13.3291C11.9998 13.1965 12.0525 13.0693 12.1463 12.9755L12.4998 13.3291ZM15.3283 10.5006L14.9747 10.1471C15.0446 10.0769 15.1338 10.0291 15.2308 10.0097C15.3279 9.99029 15.4286 10.0001 15.5201 10.038C15.6116 10.0759 15.6898 10.1401 15.7448 10.2224C15.7997 10.3048 15.829 10.4016 15.8289 10.5006L15.3283 10.5006ZM15.3283 16.1575L15.8289 16.1575C15.829 16.2565 15.7997 16.3533 15.7448 16.4357C15.6898 16.5181 15.6116 16.5822 15.5201 16.6201C15.4286 16.658 15.3279 16.6678 15.2309 16.6484C15.1338 16.629 15.0446 16.5812 14.9747 16.511L15.3283 16.1575ZM15.3283 12.8284L32.2988 12.8284L32.2988 13.8297L15.3283 13.8297V12.8284ZM12.1463 12.9755L14.9747 10.1471L15.6818 10.8542L12.8534 13.6826L12.1463 12.9755ZM15.8289 10.5006V16.1575L14.8276 16.1575L14.8276 10.5006L15.8289 10.5006ZM14.9747 16.511L12.1463 13.6826L12.8534 12.9755L15.6818 15.8039L14.9747 16.511Z" fill="currentColor"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={`${styles.arrowButton} ${currentIndex === total - 1 ? styles.arrowDimmed : styles.arrowActive}`}
              aria-label="Next slide"
            >
              <svg width="24" height="10" viewBox="59 9 22 9" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.arrowSvg}>
                <path d="M80.0978 13.3291L80.4514 13.6826C80.5451 13.5888 80.5978 13.4617 80.5978 13.3291C80.5978 13.1965 80.5451 13.0693 80.4514 12.9755L80.0978 13.3291ZM77.2694 10.5006L77.6229 10.1471C77.5531 10.0769 77.4639 10.0291 77.3668 10.0097C77.2697 9.99029 77.169 10.0001 77.0775 10.038C76.986 10.0759 76.9079 10.1401 76.8529 10.2224C76.7979 10.3048 76.7686 10.4016 76.7688 10.5006L77.2694 10.5006ZM77.2694 16.1575L76.7688 16.1575C76.7686 16.2565 76.7979 16.3533 76.8529 16.4357C76.9079 16.5181 76.986 16.5822 77.0775 16.6201C77.169 16.658 77.2697 16.6678 77.3668 16.6484C77.4639 16.629 77.5531 16.5812 77.6229 16.511L77.2694 16.1575ZM77.2694 12.8284L60.2988 12.8284L60.2988 13.8297L77.2694 13.8297V12.8284ZM80.4514 12.9755L77.6229 10.1471L76.9158 10.8542L79.7443 13.6826L80.4514 12.9755ZM76.7688 10.5006V16.1575L77.77 16.1575L77.77 10.5006L76.7688 10.5006ZM77.6229 16.511L80.4514 13.6826L79.7443 12.9755L76.9158 15.8039L77.6229 16.511Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Badge */}
          <div className={styles.badgeWrapper}>
            <span className={styles.badgePill}>{currentSlide.badge}</span>
          </div>

          {/* Headline */}
          <h1 className={styles.mainTitle}>
            {currentSlide.titlePrefix}{" "}
            <span className={styles.highlightText}>
              {currentSlide.titleHighlight}
            </span>
          </h1>

          {/* Subtitle / Excerpt */}
          <p className={styles.descriptionText}>{currentSlide.description}</p>

          {/* Action CTA */}
          <div className={styles.actionRow}>
            <Link
              href={currentSlide.ctaLink || "#"}
              className={styles.ctaButton}
            >
              {currentSlide.ctaText || "Read Story"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogHero;
