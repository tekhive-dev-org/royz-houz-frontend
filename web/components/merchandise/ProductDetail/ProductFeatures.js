import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import styles from "./ProductFeatures.module.css";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Fast nationwide delivery across Nigeria with live order tracking.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free 7-day exchange and return policy on all fashion items.",
  },
  {
    icon: ShieldCheck,
    title: "Authentic Quality",
    description: "Handcrafted with premium fabrics empowering African creative talents.",
  },
];

/**
 * ProductFeatures Component
 * Displays 3 value propositions for delivery, returns, and authentic quality.
 */
export function ProductFeatures() {
  return (
    <section className={styles.section} aria-label="Product Benefits">
      <div className={styles.grid}>
        {FEATURES.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.iconWrap}>
                <IconComponent className="w-5 h-5 text-[#B46A2C]" />
              </div>
              <div className={styles.textContent}>
                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.featureDesc}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProductFeatures;
