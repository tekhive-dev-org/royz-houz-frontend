import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { HOMEPAGE_TESTIMONIALS_CONTENT } from "@/constants/homepageContent";
import { TestimonialCard } from "./TestimonialCard";
import styles from "./Testimonials.module.css";

const SPLIDE_OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  gap: "24px",
  pagination: true,
  arrows: false,
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
  pauseOnFocus: true,
  resetProgress: false,
  speed: 700,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  drag: true,
  classes: {
    pagination: `splide__pagination ${styles.pagination}`,
    page: `splide__pagination__page ${styles.paginationDot}`,
  },
};

export function Testimonials({ content }) {
  const sectionContent = { ...HOMEPAGE_TESTIMONIALS_CONTENT, ...content };
  const testimonials = Array.isArray(sectionContent.testimonials)
    ? sectionContent.testimonials
    : HOMEPAGE_TESTIMONIALS_CONTENT.testimonials;
  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.container}>

        {/* Section Header */}
        <div className={styles.header}>
          {/* Sub-badge Tagline */}
          <div className={styles.badgeRow}>
            <span className={styles.badgeLine} aria-hidden="true" />
            <span>{sectionContent.badge}</span>
            <span className={styles.badgeLine} aria-hidden="true" />
          </div>

          {/* Headline */}
          <h2 className={styles.title}>{sectionContent.title}</h2>

          {/* Subheadline */}
          <p className={styles.description}>
            {sectionContent.description}
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className={styles.carouselWrapper}>
          <Splide
            options={SPLIDE_OPTIONS}
            aria-label={sectionContent.carouselAriaLabel}
            className={styles.carousel}
          >
            {testimonials.map((item, index) => (
              <SplideSlide key={item?.id || index}>
                <TestimonialCard testimonial={item} />
              </SplideSlide>
            ))}
          </Splide>
        </div>

      </div>
    </section>
  );
}

export default Testimonials;
