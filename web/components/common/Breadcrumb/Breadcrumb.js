import Link from "next/link";
import styles from "./Breadcrumb.module.css";

/**
 * Reusable Breadcrumb navigation bar component for all subpages.
 *
 * @param {Object} props
 * @param {Array<{label: string, href?: string}>} props.items - Breadcrumb trail items
 * @param {string} [props.className] - Additional class names for the breadcrumb wrapper
 */
export function Breadcrumb({
  items = [
    { label: "Home", href: "/" },
    { label: "About Us" },
  ],
  className = "",
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.breadcrumbBar} ${className}`.trim()}
    >
      <div className={styles.container}>
        <ol className={styles.navList}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.label + index} className={styles.navItem}>
                {item.href && !isLast ? (
                  <Link href={item.href} className={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}

                {!isLast && (
                  <span className={styles.separator} aria-hidden="true">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export default Breadcrumb;
