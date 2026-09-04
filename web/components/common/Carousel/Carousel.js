import React, { useEffect, useMemo, useRef, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import styles from "./Carousel.module.css";

const DEFAULT_OPTIONS = {
  type: "loop",
  fixedWidth: "440px",
  gap: "24px",
  padding: { left: 0, right: 0 },
  pagination: true,
  arrows: false,
  autoplay: true,
  interval: 3500,
  pauseOnHover: true,
  pauseOnFocus: false,
  resetProgress: false,
  rewind: true,
  rewindSpeed: 800,
  speed: 800,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  drag: true,
  snap: true,
  clones: 6,
  perMove: 1,
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

/**
 * Reusable Splide Carousel component with responsive card sizing,
 * loop autoplay, touch/drag support and clean 3-dot branded pagination.
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
  const splideRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  const originalItemCount = Array.isArray(items)
    ? items.length
    : children
      ? React.Children.count(children)
      : 0;
  const isSingle = originalItemCount <= 1;

  // For Splide "loop" mode with fixedWidth, we need at least 8 slides
  // so Splide's clone & loop mechanism has plenty of buffer and never stalls at the end.
  const carouselItems = useMemo(() => {
    if (!Array.isArray(items) || items.length <= 1) return items;
    if (items.length >= 8) return items;
    let multiplied = [...items];
    while (multiplied.length < 8) {
      multiplied = [...multiplied, ...items];
    }
    return multiplied;
  }, [items]);

  const carouselChildren = useMemo(() => {
    if (!children || items) return null;
    const childArray = React.Children.toArray(children);
    if (childArray.length <= 1 || childArray.length >= 8) return children;
    let multiplied = [...childArray];
    while (multiplied.length < 8) {
      multiplied = [...multiplied, ...childArray];
    }
    return multiplied.map((child, idx) =>
      React.isValidElement(child)
        ? React.cloneElement(child, { key: `${child.key || "child"}-${idx}` })
        : child
    );
  }, [children, items]);

  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...(isSingle ? { type: "slide", autoplay: false, pagination: false } : {}),
    ...options,
    breakpoints: {
      ...DEFAULT_OPTIONS.breakpoints,
      ...options.breakpoints,
    },
  };

  const showPagination = mergedOptions.pagination !== false && !isSingle;

  useEffect(() => {
    const splide = splideRef.current?.splide;
    if (!splide) return;

    if (options.autoplay !== false) {
      const { Autoplay } = splide.Components || {};
      if (Autoplay && typeof Autoplay.play === "function") {
        Autoplay.play();
      }
    }

    const count = originalItemCount || splide.length || 1;
    const updateActiveDot = (destIndex) => {
      const idx = typeof destIndex === "number" ? destIndex : splide.index;
      const normalized = ((idx % count) + count) % count;
      const dot = count <= 3
        ? Math.min(2, normalized)
        : Math.min(2, Math.floor((normalized / count) * 3));
      setActiveDot(dot);
    };

    splide.on("mounted move active", updateActiveDot);
    updateActiveDot(splide.index);

    return () => {
      splide.off("mounted move active", updateActiveDot);
    };
  }, [options.autoplay, originalItemCount]);

  const handleDotClick = (dotIndex) => {
    const splide = splideRef.current?.splide;
    if (!splide) return;
    const count = originalItemCount || splide.length || 1;
    const targetSlide = Math.min(count - 1, Math.floor((dotIndex / 3) * count));
    splide.go(targetSlide);
    setActiveDot(dotIndex);
  };

  return (
    <div className={`${styles.carousel} ${className}`.trim()}>
      <Splide
        ref={splideRef}
        options={{
          ...mergedOptions,
          pagination: false,
        }}
        aria-label={ariaLabel}
      >
        {carouselItems && renderItem
          ? carouselItems.map((item, index) => (
              <SplideSlide key={`${item.id || "item"}-${index}`}>
                {renderItem(item, index % (originalItemCount || 1))}
              </SplideSlide>
            ))
          : carouselChildren || children}
      </Splide>

      {showPagination && (
        <ul
          className={styles.pagination}
          role="tablist"
          aria-label="Carousel pagination"
        >
          {[0, 1, 2].map((dotIndex) => {
            const isActive = activeDot === dotIndex;
            return (
              <li key={dotIndex} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide group ${dotIndex + 1}`}
                  className={`${styles.paginationDot} ${isActive ? styles.isActive : ""}`}
                  onClick={() => handleDotClick(dotIndex)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Carousel;

