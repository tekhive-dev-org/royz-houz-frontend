import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Heart, Star } from "lucide-react";
import styles from "./CategoryProductCard.module.css";

/**
 * CategoryProductCard Component
 * Displays product card matching the exact 301x406 Figma SVG spec with sharp edges,
 * "New" badge, wishlist heart button, hover action buttons (Add to Cart + View), ratings, and price.
 */
export function CategoryProductCard({
  product,
  onAddToCart,
  onQuickView,
}) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productUrl = `/merchandise/product/${product.id || "womens-neckline-fitted-top"}`;

  const formatPrice = (price) => {
    return `₦${Number(price).toLocaleString()}`;
  };

  const handleView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      router.push(productUrl);
    }
  };

  return (
    <article className={styles.card} aria-label={product.title}>
      {/* ── Image & Action Overlay ─────────────────── */}
      <div className={styles.imageContainer}>
        {/* Top-Left "New" Badge */}
        {product.badge && (
          <span className={styles.badge}>{product.badge}</span>
        )}

        {/* Top-Right Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className={`${styles.wishlistBtn} ${
            isWishlisted ? styles.wishlistBtnActive : ""
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isWishlisted ? "fill-[#B46A2C] text-[#B46A2C]" : "text-[#0A0D14]"
            }`}
          />
        </button>

        {/* Product Photo */}
        <Link href={productUrl} className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.productImg}
            priority={false}
          />
        </Link>

        {/* Bottom Hover Actions Bar */}
        <div className={styles.overlayActions}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart(product);
            }}
            className={styles.addToCartBtn}
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleView}
            className={styles.viewBtn}
          >
            View
          </button>
        </div>
      </div>

      {/* ── Details & Pricing ──────────────────────── */}
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={styles.category}>{product.category}</span>
          <div className={styles.ratingWrap}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 fill-[#B46A2C] text-[#B46A2C]"
                />
              ))}
            </div>
            <span className={styles.reviewsCount}>
              ({product.reviewsCount || 128})
            </span>
          </div>
        </div>

        <h3 className={styles.title} title={product.title}>
          <Link href={productUrl} className="hover:text-[#B46A2C] transition-colors">
            {product.title}
          </Link>
        </h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
}

export default CategoryProductCard;
