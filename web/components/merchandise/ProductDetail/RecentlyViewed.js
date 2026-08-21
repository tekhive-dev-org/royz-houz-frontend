import { CategoryProductCard } from "../CategoryPage/CategoryProductCard";
import styles from "./RecentlyViewed.module.css";

const RECENT_PRODUCTS = [
  {
    id: "recent-1",
    title: "Women's Floral Long Sleeve Blouse",
    category: "WOMEN'S BLOUSE",
    price: 15000,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-brown-blouse.jpg",
  },
  {
    id: "recent-2",
    title: "Women's Neckline Fitted Knit Blouse",
    category: "WOMEN'S KNIT",
    price: 8500,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/pdp-blouse-front.jpg",
  },
  {
    id: "recent-3",
    title: "Boho Floral Printed Peasant Blouse",
    category: "CASUAL WEAR",
    price: 9800,
    badge: "New",
    rating: 5,
    reviewsCount: 128,
    image: "/assets/img/merchandise/prod-houndstooth-pants.jpg",
  },
];

/**
 * RecentlyViewed Component
 * Grid of previously viewed products with quick actions.
 */
export function RecentlyViewed({
  products = RECENT_PRODUCTS,
  onAddToCart,
  onQuickView,
}) {
  return (
    <section className={styles.section} aria-label="Recently Viewed Products">
      <h2 className={styles.heading}>Recently Viewed</h2>
      <div className={styles.grid}>
        {products.map((product) => (
          <CategoryProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </section>
  );
}

export default RecentlyViewed;
