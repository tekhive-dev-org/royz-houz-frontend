import { useState } from "react";
import { ArrowRight, Tag } from "lucide-react";
import styles from "./OrderSummary.module.css";

/**
 * OrderSummary Component
 * Displays subtotal, discount, delivery fee, dynamic total, promo code input, and checkout action.
 */
export function OrderSummary({
  subtotal = 44000,
  discountAmount = 500,
  discountLabel = "Discount (-20%)",
  deliveryFee = 600,
  onCheckout,
}) {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setAppliedPromo(promoCode.trim().toUpperCase());
    }
  };

  return (
    <aside className={styles.summaryCard} aria-label="Order Summary">
      <h2 className={styles.cardTitle}>Order Summary</h2>

      <div className={styles.breakdownList}>
        {/* Subtotal */}
        <div className={styles.row}>
          <span className={styles.label}>Subtotal</span>
          <span className={styles.value}>₦{Number(subtotal).toLocaleString()}</span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className={styles.row}>
            <span className={styles.label}>{discountLabel}</span>
            <span className={styles.discountValue}>-₦{Number(discountAmount).toLocaleString()}</span>
          </div>
        )}

        {/* Delivery Fee */}
        <div className={styles.row}>
          <span className={styles.label}>Delivery Fee</span>
          <span className={styles.value}>₦{Number(deliveryFee).toLocaleString()}</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Total */}
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>₦{Number(total).toLocaleString()}</span>
      </div>

      {/* Promo Code Form */}
      <form onSubmit={handleApplyPromo} className={styles.promoForm}>
        <div className={styles.promoInputWrap}>
          <Tag className="w-4 h-4 text-[#868C98]" />
          <input
            type="text"
            placeholder="Add promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className={styles.promoInput}
          />
        </div>
        <button type="submit" className={styles.applyBtn}>
          Apply
        </button>
      </form>

      {appliedPromo && (
        <div className={styles.promoApplied}>
          <span>Promo code <strong>{appliedPromo}</strong> applied!</span>
        </div>
      )}

      {/* Go to Checkout Button */}
      <button
        type="button"
        onClick={onCheckout}
        className={styles.checkoutBtn}
      >
        <span>Go to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </aside>
  );
}

export default OrderSummary;
