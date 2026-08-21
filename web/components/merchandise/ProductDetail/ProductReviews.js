import { useState } from "react";
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ProductReviews.module.css";

const REVIEWS_DATA = [
  {
    id: 1,
    author: "Ayomide B.",
    verified: true,
    date: "12 Oct 2024",
    rating: 5,
    title: "Better Than Expected",
    content:
      "The knit texture is so luxurious and comfortable. Fits like a custom-made blouse. The gold button pin adds a stunning accent!",
    tag: "Verified Purchase",
  },
  {
    id: 2,
    author: "Faith C.",
    verified: true,
    date: "08 Oct 2024",
    rating: 5,
    title: "So versatile",
    content:
      "Wore this to a dinner party and got so many compliments. Pairs well with both high-waisted trousers and sleek pencil skirts.",
    tag: "Verified Purchase",
  },
  {
    id: 3,
    author: "Omowumi F.",
    verified: true,
    date: "01 Oct 2024",
    rating: 5,
    title: "Rich Color & Structure",
    content:
      "The neckline detail gives it that signature quiet luxury feel. Fabric is soft, non-itchy, and holds its shape after washing.",
    tag: "Verified Purchase",
  },
  {
    id: 4,
    author: "Zainab A.",
    verified: true,
    date: "28 Sep 2024",
    rating: 5,
    title: "My New Favorite Top",
    content:
      "Fabric feels great on skin, breathable yet structured. The asymmetrical drape creates an ultra-flattering silhouette.",
    tag: "Verified Purchase",
  },
  {
    id: 5,
    author: "Grace E.",
    verified: true,
    date: "20 Sep 2024",
    rating: 5,
    title: "Huge thumbs up for quality",
    content:
      "Fast delivery and the fit is true to size. Royal look and feel. Will definitely be purchasing other colorways!",
    tag: "Verified Purchase",
  },
];

/**
 * ProductReviews Component
 * Displays customer ratings, verified purchase reviews, and review pagination.
 */
export function ProductReviews({
  overallRating = "4.9",
  totalReviews = 128,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section className={styles.section} aria-label="Customer Reviews">
      {/* Header with overall rating */}
      <div className={styles.header}>
        <div className={styles.ratingSummary}>
          <div className={styles.scoreRow}>
            <span className={styles.score}>{overallRating}</span>
            <span className={styles.outOf}>out of 5</span>
          </div>
          <span className={styles.basedOn}>Based on {totalReviews} reviews</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {REVIEWS_DATA.map((rev) => (
          <div key={rev.id} className={styles.reviewCard}>
            <div className={styles.cardHeader}>
              <div className={styles.authorMeta}>
                <span className={styles.authorName}>{rev.author}</span>
                {rev.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] fill-[#D1FADF]" />
                )}
              </div>
              <span className={styles.date}>{rev.date}</span>
            </div>

            <div className={styles.cardRating}>
              <div className={styles.stars}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-[#D98E3A] text-[#D98E3A]"
                  />
                ))}
              </div>
              <h4 className={styles.reviewTitle}>{rev.title}</h4>
            </div>

            <p className={styles.reviewContent}>{rev.content}</p>

            <div className={styles.verifiedTag}>
              <span>{rev.tag}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Bar */}
      <div className={styles.pagination}>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={styles.pageArrow}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className={styles.pageNumbers}>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`${styles.pageNumber} ${
                currentPage === p ? styles.pageNumberActive : ""
              }`}
            >
              {p}
            </button>
          ))}
          <span className={styles.dots}>...</span>
          {[8, 9, 10].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              className={`${styles.pageNumber} ${
                currentPage === p ? styles.pageNumberActive : ""
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}
          disabled={currentPage === 10}
          className={styles.pageArrow}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

export default ProductReviews;
