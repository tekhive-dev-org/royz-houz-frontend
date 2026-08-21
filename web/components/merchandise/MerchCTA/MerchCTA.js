import { ArrowUpRight } from "lucide-react";
import styles from "./MerchCTA.module.css";

/**
 * MerchCTA component displaying the "Elevate Your Wardrobe" banner
 * with exact watermark motif, typography, and "Shop Now ↗" button from Figma.
 */
export function MerchCTA({ onShopNowClick }) {
  return (
    <section className={styles.section} aria-label="Elevate Your Wardrobe">
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          {/* Background Watermark Globe Motif */}
          <div className={styles.watermarkWrapper} aria-hidden="true">
            <svg
              className={styles.watermarkSvg}
              viewBox="0 0 524 524"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M346.2 431.087C320.77 473.463 290.03 492.56 262 492.56C233.97 492.56 203.228 473.463 177.802 431.087C152.753 389.337 136.24 329.63 136.24 262C136.24 194.369 152.753 134.663 177.802 92.914C203.228 50.538 233.97 31.44 262 31.44C290.03 31.44 320.77 50.538 346.2 92.914C371.25 134.663 387.76 194.369 387.76 262C387.76 329.63 371.25 389.337 346.2 431.087ZM524 262C524 117.301 406.7 0 262 0C117.301 0 0 117.301 0 262C0 406.697 117.301 524 262 524C406.7 524 524 406.697 524 262ZM31.44 262C31.44 356.137 87.855 437.095 168.721 472.91C129.947 425.197 104.8 348.494 104.8 262C104.8 175.507 129.947 98.802 168.721 51.089C87.855 86.906 31.44 167.864 31.44 262ZM492.56 262C492.56 356.137 436.14 437.095 355.28 472.91C394.05 425.197 419.2 348.494 419.2 262C419.2 175.507 394.05 98.802 355.28 51.089C436.14 86.906 492.56 167.864 492.56 262ZM262 290.82C277.92 290.82 290.82 277.916 290.82 262C290.82 246.083 277.92 233.18 262 233.18C246.08 233.18 233.18 246.083 233.18 262C233.18 277.916 246.08 290.82 262 290.82Z"
                fill="#B8A893"
                fillOpacity="0.21"
              />
            </svg>
          </div>

          <div className={styles.contentWrap}>
            <div className={styles.textContent}>
              <h2 className={styles.title}>Elevate Your Wardrobe</h2>
              <p className={styles.subtitle}>
                Don&apos;t miss out on these limited-edition pieces designed to elevate your everyday style.
              </p>
            </div>

            <div className={styles.actionWrap}>
              <button
                type="button"
                onClick={onShopNowClick}
                className={styles.shopNowBtn}
              >
                <span>Shop Now</span>
                <ArrowUpRight className={`w-4 h-4 transition-transform duration-300 ${styles.arrowIcon}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MerchCTA;
