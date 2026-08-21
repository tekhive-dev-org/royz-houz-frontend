import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import styles from "./CartItem.module.css";

/**
 * CartItem Component
 * Single cart item card displaying thumbnail, title, size/color variants, price,
 * red delete trash button, and interactive quantity stepper.
 */
export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}) {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else {
      onRemove(item.id);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.id, (item.quantity || 1) + 1);
  };

  return (
    <div className={styles.itemCard}>
      {/* Product Image Thumbnail */}
      <div className={styles.imageWrap}>
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="110px"
          className={styles.productImg}
        />
      </div>

      {/* Product Details & Controls */}
      <div className={styles.contentWrap}>
        <div className={styles.headerRow}>
          <div className={styles.metaInfo}>
            <h3 className={styles.title}>{item.title}</h3>
            <div className={styles.variantDetails}>
              {item.size && <span>Size: <strong className={styles.variantValue}>{item.size}</strong></span>}
              {item.color && <span>Color: <strong className={styles.variantValue}>{item.color}</strong></span>}
            </div>
          </div>

          {/* Delete Trash Button (Red) */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className={styles.deleteBtn}
            aria-label={`Remove ${item.title} from cart`}
          >
            <Trash2 className="w-4 h-4 text-[#F04438]" />
          </button>
        </div>

        <div className={styles.bottomRow}>
          {/* Price */}
          <span className={styles.price}>
            ₦{Number(item.price * (item.quantity || 1)).toLocaleString()}
          </span>

          {/* Quantity Stepper */}
          <div className={styles.stepperWrap}>
            <button
              type="button"
              onClick={handleDecrease}
              className={styles.stepperBtn}
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 text-[#0A0D14]" />
            </button>
            <span className={styles.stepperValue}>{item.quantity || 1}</span>
            <button
              type="button"
              onClick={handleIncrease}
              className={styles.stepperBtn}
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 text-[#0A0D14]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
