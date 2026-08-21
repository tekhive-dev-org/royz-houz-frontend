import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { CartItem } from "./CartItem";
import styles from "./CartItemsList.module.css";

/**
 * CartItemsList Component
 * Displays the list of cart items or a friendly empty state when cart is empty.
 */
export function CartItemsList({
  items = [],
  onUpdateQuantity,
  onRemoveItem,
}) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap}>
          <ShoppingBag className="w-8 h-8 text-[#868C98]" />
        </div>
        <h3 className={styles.emptyTitle}>Your cart is currently empty</h3>
        <p className={styles.emptySubtitle}>
          Looks like you haven&apos;t added any items to your shopping cart yet.
        </p>
        <Link href="/merchandise" className={styles.shopNowBtn}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
}

export default CartItemsList;
