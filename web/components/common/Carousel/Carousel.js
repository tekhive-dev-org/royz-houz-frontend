import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";
import styles from "./Carousel.module.css";

const DEFAULT_OPTIONS = {
  type: "loop",
  fixedWidth: "464px",
  gap: "24px",
  padding: { left: 0, right: 0 },
  pagination: true,
  arrows: false,
  autoplay: true,
  interval: 5000,
  pauseOnHover: true,
  pauseOnFocus: true,
  speed: 600,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  drag: true,
  snap: true,
  breakpoints: {
    768: {
      fixedWidth: "100%",
      gap: "16px",
      padding: { left: 0, right: 64 },
    },
  },
};

/**
 * Reusable Splide Carousel component with responsive card sizing,
 * loop autoplay, touch/drag support and branded pagination dots.
 *
 * @param {Object} props
 * @param {Array} [props.items] - Array of data items to map over
 * @param {Function} [props.renderItem] - Render function `(item, index) => ReactNode`
 * @param {React.ReactNode} [props.children] - Alternatively pass SplideSlide children directly
 * @param {string} [props.ariaLabel] - Accessible label for screen readers
 * @param {Object} [props.options] - Custom Splide options to override defaults
 * @param {string} [props.className] - Additional class names for the carousel container
 */
export function Carousel({
  items,
  renderItem,
  children,
  ariaLabel = "Content carousel",
  options = {},
  className = "",
}) {
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    classes: {
      pagination: `splide__pagination ${styles.pagination}`,
      page: `splide__pagination__page ${styles.paginationDot}`,
      ...options.classes,
    },
    breakpoints: {
      ...DEFAULT_OPTIONS.breakpoints,
      ...options.breakpoints,
    },
  };

  return (
    <Splide
      options={mergedOptions}
      aria-label={ariaLabel}
      className={`${styles.carousel} ${className}`.trim()}
    >
      {items && renderItem
        ? items.map((item, index) => (
            <SplideSlide key={item.id || index}>
              {renderItem(item, index)}
            </SplideSlide>
          ))
        : children}
    </Splide>
  );
}

export default Carousel;
