import Image from "next/image";
import { QuoteIcon } from "@/components/common/SocialIcons";
import styles from "./Testimonials.module.css";

/**
 * Single Testimonial Card displaying quote, avatar, author name, and location/role.
 */
export function TestimonialCard({ testimonial }) {
  return (
    <article className={styles.card}>
      {/* Decorative Quote Icon */}
      <QuoteIcon className={styles.quoteIcon} aria-hidden="true" />

      {/* Quote Statement */}
      <blockquote className={styles.quoteText}>
        {testimonial.quote}
      </blockquote>

      {/* Author Information */}
      <div className={styles.authorRow}>
        <div className={styles.avatar}>
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            fill
            className="object-cover"
          />
        </div>

        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{testimonial.name}</span>
          <span className={styles.authorRole}>{testimonial.role}</span>
        </div>
      </div>
    </article>
  );
}

export default TestimonialCard;
