import { useState } from "react";
import { SlidersHorizontal, ChevronRight, ChevronUp, ChevronDown, Check } from "lucide-react";
import styles from "./CategorySidebar.module.css";

const CATEGORIES = [
  { id: "t-shirts", label: "T-shirts" },
  { id: "shorts", label: "Shorts" },
  { id: "shirts", label: "Shirts" },
  { id: "hoodie", label: "Hoodie" },
  { id: "jeans", label: "Jeans" },
];

const COLORS = [
  { id: "green", bg: "#00C12B" },
  { id: "red", bg: "#F50606" },
  { id: "yellow", bg: "#F5DD06" },
  { id: "orange", bg: "#F57906" },
  { id: "cyan", bg: "#06CAF5" },
  { id: "blue", bg: "#063AF5" },
  { id: "purple", bg: "#7D06F5" },
  { id: "pink", bg: "#F506A4" },
  { id: "white", bg: "#FFFFFF", border: true },
  { id: "black", bg: "#000000" },
];

const SIZES = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const DRESS_STYLES = [
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "party", label: "Party" },
  { id: "gym", label: "Gym" },
];

/**
 * CategorySidebar Component
 * Provides comprehensive e-commerce filtering by category, price, color, size, and dress style.
 */
export function CategorySidebar({
  selectedCategory,
  onSelectCategory,
  priceRange = [1000, 8000],
  onPriceChange,
  selectedColor = "blue",
  onSelectColor,
  selectedSize = "Large",
  onSelectSize,
  selectedDressStyle = "casual",
  onSelectDressStyle,
  onApplyFilters,
}) {
  const [openSections, setOpenSections] = useState({
    price: true,
    colors: true,
    size: true,
    dressStyle: true,
  });

  const [currentMaxPrice, setCurrentMaxPrice] = useState(priceRange[1]);
  const currentMinPrice = priceRange[0];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMaxPriceSlider = (e) => {
    const val = Number(e.target.value);
    setCurrentMaxPrice(val);
    if (onPriceChange) {
      onPriceChange([currentMinPrice, val]);
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="Product Filters">
      <div className={styles.sidebarCard}>
        {/* ── Sidebar Header ────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Filters</h2>
          <SlidersHorizontal className="w-5 h-5 text-[#525866]" />
        </div>

        {/* ── 1. Main Category List ─────────────────── */}
        <div className={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className={`${styles.categoryItem} ${
                selectedCategory === cat.id ? styles.categoryItemActive : ""
              }`}
            >
              <span>{cat.label}</span>
              <ChevronRight className="w-4 h-4 text-[#868C98]" />
            </button>
          ))}
        </div>

        <div className={styles.divider} />

        {/* ── 2. Price Filter Accordion ─────────────── */}
        <div className={styles.sectionBlock}>
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className={styles.sectionToggle}
          >
            <span className={styles.sectionHeading}>Price</span>
            {openSections.price ? (
              <ChevronUp className="w-4 h-4 text-[#0A0D14]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#0A0D14]" />
            )}
          </button>

          {openSections.price && (
            <div className={styles.sectionBody}>
              {/* Range Slider Track */}
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={currentMaxPrice}
                  onChange={handleMaxPriceSlider}
                  className={styles.rangeInput}
                  aria-label="Filter by maximum price"
                />
                <div
                  className={styles.sliderProgress}
                  style={{ width: `${Math.min(100, (currentMaxPrice / 30000) * 100)}%` }}
                />
              </div>

              <div className={styles.priceLabels}>
                <span className={styles.priceTag}>
                  ₦{currentMinPrice.toLocaleString()}
                </span>
                <span className={styles.priceTag}>
                  ₦{currentMaxPrice.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* ── 3. Colors Filter Accordion ────────────── */}
        <div className={styles.sectionBlock}>
          <button
            type="button"
            onClick={() => toggleSection("colors")}
            className={styles.sectionToggle}
          >
            <span className={styles.sectionHeading}>Colors</span>
            {openSections.colors ? (
              <ChevronUp className="w-4 h-4 text-[#0A0D14]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#0A0D14]" />
            )}
          </button>

          {openSections.colors && (
            <div className={styles.colorsGrid}>
              {COLORS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectColor && onSelectColor(c.id)}
                    style={{ backgroundColor: c.bg }}
                    className={`${styles.colorSwatch} ${
                      c.border ? styles.colorSwatchBorder : ""
                    } ${isSelected ? styles.colorSwatchSelected : ""}`}
                    aria-label={`Filter by color ${c.id}`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          c.id === "white" || c.id === "yellow"
                            ? "text-[#0A0D14]"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* ── 4. Size Filter Accordion ──────────────── */}
        <div className={styles.sectionBlock}>
          <button
            type="button"
            onClick={() => toggleSection("size")}
            className={styles.sectionToggle}
          >
            <span className={styles.sectionHeading}>Size</span>
            {openSections.size ? (
              <ChevronUp className="w-4 h-4 text-[#0A0D14]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#0A0D14]" />
            )}
          </button>

          {openSections.size && (
            <div className={styles.sizesWrap}>
              {SIZES.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onSelectSize && onSelectSize(sz)}
                    className={`${styles.sizePill} ${
                      isSelected ? styles.sizePillActive : ""
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* ── 5. Dress Style Accordion ──────────────── */}
        <div className={styles.sectionBlock}>
          <button
            type="button"
            onClick={() => toggleSection("dressStyle")}
            className={styles.sectionToggle}
          >
            <span className={styles.sectionHeading}>Dress Style</span>
            {openSections.dressStyle ? (
              <ChevronUp className="w-4 h-4 text-[#0A0D14]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#0A0D14]" />
            )}
          </button>

          {openSections.dressStyle && (
            <div className={styles.dressStyleList}>
              {DRESS_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() =>
                    onSelectDressStyle && onSelectDressStyle(style.id)
                  }
                  className={`${styles.dressStyleItem} ${
                    selectedDressStyle === style.id
                      ? styles.dressStyleItemActive
                      : ""
                  }`}
                >
                  <span>{style.label}</span>
                  <ChevronRight className="w-4 h-4 text-[#868C98]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Apply Filters Action Button ───────────── */}
        <div className={styles.actionContainer}>
          <button
            type="button"
            onClick={onApplyFilters}
            className={styles.applyBtn}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CategorySidebar;
