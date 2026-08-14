import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import { TESTIMONIALS } from "@/constants/testimonials";
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
  interval: 6000,
  pauseOnHover: true,
  pauseOnFocus: true,
  speed: 700,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  drag: true,
  classes: {
    pagination: `splide__pagination ${styles.pagination}`,
    page: `splide__pagination__page ${styles.paginationDot}`,
  },
};

export function Testimonials() {
  return (
    <section className={styles.section} id="testimonials">
      <div className={styles.container}>

        {/* Section Header */}
        <div className={styles.header}>
          {/* Sub-badge Tagline */}
          <div className={styles.badgeRow}>
            <span className={styles.badgeLine} aria-hidden="true" />
            <span>TESTIMONIALS</span>
            <span className={styles.badgeLine} aria-hidden="true" />
          </div>

          {/* Headline */}
          <h2 className={styles.title}>Impact - changing Stories</h2>

          {/* Subheadline */}
          <p className={styles.description}>
            Explore the stories and experiences of members who have connected, and
            found meaningful opportunities.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className={styles.carouselWrapper}>
          <Splide
            options={SPLIDE_OPTIONS}
            aria-label="Member testimonials carousel"
            className={styles.carousel}
          >
            {TESTIMONIALS.map((item) => (
              <SplideSlide key={item.id}>
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
