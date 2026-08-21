import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./CategoryBreadcrumb.module.css";

/**
 * CategoryBreadcrumb Component
 * Displays breadcrumb trail (e.g., Home > Shop > Women > Product Name)
 */
export function CategoryBreadcrumb({
  categoryName = "Casual",
  currentProductTitle = null,
}) {
  const categorySlug =
    typeof categoryName === "string"
      ? categoryName.toLowerCase().replace(/\s+/g, "-")
      : "casual";

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
        </li>
        <li className={styles.separator} aria-hidden="true">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>
        <li className={styles.item}>
          <Link href="/merchandise" className={styles.link}>
            Shop
          </Link>
        </li>

        {categoryName && (
          <>
            <li className={styles.separator} aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className={currentProductTitle ? styles.item : styles.activeItem}>
              {currentProductTitle ? (
                <Link
                  href={`/merchandise/category/${categorySlug}`}
                  className={styles.link}
                >
                  {categoryName}
                </Link>
              ) : (
                <span aria-current="page">{categoryName}</span>
              )}
            </li>
          </>
        )}

        {currentProductTitle && (
          <>
            <li className={styles.separator} aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5" />
            </li>
            <li className={styles.activeItem} aria-current="page">
              <span className="truncate max-w-[200px] sm:max-w-none">
                {currentProductTitle}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

export default CategoryBreadcrumb;
