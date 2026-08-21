import { useState } from "react";
import Image from "next/image";
import { Heart, Star, ChevronRight, ShoppingBag } from "lucide-react";
import styles from "./MerchProductGrid.module.css";

/**
 * MerchProductGrid Component
 * Renders product rows (e.g. New Arrivals, Community Favorites) matching the Figma specification.
 */
export function MerchProductGrid({
  sectionTag = "JUST IN",
  title = "New Arrivals",
  subtitle = "Fresh pieces. New energy. Discover what just landed.",
  viewAllLink = true,
  products = [],
  onAddToCart,
  onViewAll,
  bottomActionText,
  onBottomAction,
}) {
  const [wishlist, setWishlist] = useState({});

  const toggleWishlist = (id) => {
    setWishlist((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.container}>
        {/* ── Section Header ──────────────────────────── */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            {sectionTag && (
              <div className={styles.tagWrapper}>
                <span className={styles.tagLine} />
                <span className={styles.tagText}>{sectionTag}</span>
              </div>
            )}
            <h2 className={styles.heading}>{title}</h2>
          </div>
          <div className={styles.headerRight}>
            {subtitle && <p className={styles.subtitleText}>{subtitle}</p>}
            {viewAllLink && (
              <button
                type="button"
                onClick={onViewAll || onBottomAction}
                className={styles.viewAllBtn}
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#B46A2C]" />
              </button>
            )}
          </div>
        </div>

        {/* ── Products Grid (5-column layout on desktop) ──────── */}
        <div className={styles.productGrid}>
          {products.map((prod) => {
            const isWishlisted = !!wishlist[prod.id];
            return (
              <div key={prod.id} className={styles.productCard}>
                {/* Image & Badges Container */}
                <div className={styles.imageContainer}>
                  {prod.badge && (
                    <span className={styles.productBadge}>{prod.badge}</span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleWishlist(prod.id)}
                    className={`${styles.wishlistBtn} ${
                      isWishlisted ? styles.wishlistBtnActive : ""
                    }`}
                    aria-label="Save to wishlist"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isWishlisted ? "fill-rose-500 text-rose-500" : "text-[#0A0D14]"
                      }`}
                    />
                  </button>

                  <div className={styles.imageWrap}>
                    <Image
                      src={prod.image}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className={styles.prodImg}
                    />
                  </div>

                  {/* Quick Add Overlay Button on Hover */}
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(prod)}
                    className={styles.quickAddBtn}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Quick Add</span>
                  </button>
                </div>

                {/* Details */}
                <div className={styles.productDetails}>
                  <div className={styles.categoryAndRating}>
                    <span className={styles.categoryLabel}>{prod.category}</span>
                    <div className={styles.ratingRow} aria-label="5 out of 5 stars">
                      <div className={styles.starsGroup}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-2.5 h-2.5 fill-[#B46A2C] text-[#B46A2C]"
                          />
                        ))}
                      </div>
                      <span className={styles.ratingCount}>
                        ({prod.reviewsCount || 128})
                      </span>
                    </div>
                  </div>

                  <h3 className={styles.productTitle} title={prod.title}>
                    {prod.title}
                  </h3>

                  <div className={styles.priceRow}>
                    <span className={styles.priceAmount}>
                      ₦{prod.price?.toLocaleString()}
                    </span>
                    {prod.oldPrice && (
                      <span className={styles.oldPrice}>
                        ₦{prod.oldPrice?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Optional Bottom Action Button ───────────── */}
        {bottomActionText && (
          <div className={styles.bottomActionWrap}>
            <button
              type="button"
              onClick={onBottomAction}
              className={styles.bottomOutlineBtn}
            >
              <span>{bottomActionText}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default MerchProductGrid;


