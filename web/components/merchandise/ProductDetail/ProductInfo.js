import { useState } from "react";
import { Star, Minus, Plus, Check } from "lucide-react";
import styles from "./ProductInfo.module.css";

const COLORS = [
  { id: "brown", label: "Brown", hex: "#7D4A27" },
  { id: "green", label: "Forest Green", hex: "#214234" },
  { id: "navy", label: "Navy Blue", hex: "#1E2A3A" },
];

const SIZES = ["Small", "Medium", "Large", "X-Large"];

/**
 * ProductInfo Component
 * Displays product title, rating stars, pricing with discount badge, description,
 * color swatches, size selector, quantity stepper, and "Add to Cart" action.
 */
export function ProductInfo({
  title = "Women's Neckline Buttoned Elegant Fitted Top",
  price = 8500,
  oldPrice = 12500,
  discountPercent = "-32%",
  rating = 5,
  reviewsCount = 128,
  description = "An ultra-elegant, fitted knit short-sleeve silhouette with a draped asymmetric neckline featuring a signature gold button pin. Crafted from luxury textured chevron stretch knit, giving both structured elegance and breathable all-day comfort.",
  onAddToCart,
}) {
  const [selectedColor, setSelectedColor] = useState("brown");
  const [selectedSize, setSelectedSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncreaseQty = () => {
    setQuantity(quantity + 1);
  };

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart({
        title,
        price,
        selectedColor,
        selectedSize,
        quantity,
      });
    }
  };

  return (
    <div className={styles.infoContainer} aria-label="Product Information">
      {/* Product Title */}
      <h1 className={styles.title}>{title}</h1>

      {/* Ratings & Reviews Row */}
      <div className={styles.ratingRow}>
        <div className={styles.stars}>
          {[...Array(rating)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-[#D98E3A] text-[#D98E3A]"
            />
          ))}
        </div>
        <span className={styles.reviewsCount}>({reviewsCount}) reviews</span>
      </div>

      {/* Pricing & Discount Row */}
      <div className={styles.priceRow}>
        <span className={styles.price}>₦{Number(price).toLocaleString()}</span>
        {oldPrice && (
          <span className={styles.oldPrice}>
            ₦{Number(oldPrice).toLocaleString()}
          </span>
        )}
        {discountPercent && (
          <span className={styles.discountBadge}>{discountPercent}</span>
        )}
      </div>

      {/* Product Description */}
      <p className={styles.description}>{description}</p>

      <div className={styles.divider} />

      {/* Color Selector */}
      <div className={styles.optionSection}>
        <span className={styles.optionLabel}>Select color:</span>
        <div className={styles.colorSwatches}>
          {COLORS.map((c) => {
            const isSelected = selectedColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColor(c.id)}
                style={{ backgroundColor: c.hex }}
                className={`${styles.colorSwatch} ${
                  isSelected ? styles.colorSwatchSelected : ""
                }`}
                aria-label={c.label}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div className={styles.optionSection}>
        <span className={styles.optionLabel}>Select Size:</span>
        <div className={styles.sizesWrap}>
          {SIZES.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`${styles.sizePill} ${
                  isSelected ? styles.sizePillActive : ""
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Stepper & Add to Cart */}
      <div className={styles.actionsRow}>
        {/* Stepper Box */}
        <div className={styles.stepperWrap}>
          <button
            type="button"
            onClick={handleDecreaseQty}
            className={styles.stepperBtn}
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5 text-[#0A0D14]" />
          </button>
          <span className={styles.stepperValue}>{quantity}</span>
          <button
            type="button"
            onClick={handleIncreaseQty}
            className={styles.stepperBtn}
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5 text-[#0A0D14]" />
          </button>
        </div>

        {/* Add to Cart CTA */}
        <button
          type="button"
          onClick={handleAdd}
          className={styles.addToCartBtn}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductInfo;
