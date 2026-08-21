import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./CartDrawer.module.css";

/**
 * CartDrawer Component
 * Interactive slide-over shopping cart drawer with quantity adjustments, free shipping progress, and checkout.
 */
export function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) {
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  const freeShippingThreshold = 50000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    setIsCheckoutProcessing(true);
    setTimeout(() => {
      setIsCheckoutProcessing(false);
      if (onCheckout) {
        onCheckout();
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} aria-label="Shopping Cart">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* ── Drawer Header ──────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <ShoppingBag className="w-5 h-5 text-[#B46A2C]" />
            <h2 className={styles.title}>Your Shopping Bag</h2>
            <span className={styles.itemCountBadge}>{cartItems.length}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Free Shipping Progress Bar ─────────────── */}
        <div className={styles.shippingBanner}>
          <div className={styles.shippingTextRow}>
            {remainingForFreeShipping === 0 ? (
              <span className="font-bold text-emerald-700">
                🎉 Congratulations! You have unlocked Free Express Shipping!
              </span>
            ) : (
              <span>
                Add <strong>₦{remainingForFreeShipping.toLocaleString()}</strong> more to enjoy{" "}
                <strong>Free Shipping</strong>!
              </span>
            )}
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Cart Items List ────────────────────────── */}
        <div className={styles.itemsList}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <ShoppingBag className="w-8 h-8 text-[#868C98]" />
              </div>
              <h3 className={styles.emptyTitle}>Your bag is empty</h3>
              <p className={styles.emptyDesc}>
                Explore our latest merchandise collections and support talented African creatives.
              </p>
              <button
                type="button"
                onClick={onClose}
                className={styles.emptyActionBtn}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImgWrap}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className={styles.itemImg}
                  />
                </div>

                <div className={styles.itemInfo}>
                  <div className={styles.itemTopRow}>
                    <div>
                      <span className={styles.itemCategory}>{item.category}</span>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className={styles.deleteBtn}
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className={styles.itemBottomRow}>
                    {/* Quantity Selector */}
                    <div className={styles.quantityWrap}>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))
                        }
                        className={styles.qtyBtn}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={styles.qtyNumber}>{item.quantity || 1}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                        className={styles.qtyBtn}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className={styles.itemPrice}>
                      ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Drawer Footer & Checkout ───────────────── */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalAmount}>₦{subtotal.toLocaleString()}</span>
            </div>
            <p className={styles.taxNotice}>Taxes and shipping calculated at checkout.</p>

            <button
              type="button"
              onClick={handleCheckoutClick}
              disabled={isCheckoutProcessing}
              className={styles.checkoutBtn}
            >
              <span>{isCheckoutProcessing ? "Processing..." : "Proceed to Checkout"}</span>
              {!isCheckoutProcessing && <ArrowRight className="w-4 h-4" />}
            </button>

            <Link
              href="/cart"
              onClick={onClose}
              className="text-center text-xs font-bold text-[#B46A2C] hover:underline pt-1 cursor-pointer"
            >
              View Full Cart Page
            </Link>

            <div className={styles.securityBadge}>
              <ShieldCheck className="w-4 h-4 text-[#868C98]" />
              <span>Guaranteed safe &amp; secure checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
