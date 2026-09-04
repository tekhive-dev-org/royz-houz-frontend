import Image from "next/image";
import { QuoteIcon } from "@/components/common/SocialIcons";
import { HOMEPAGE_TESTIMONIALS_CONTENT } from "@/constants/homepageContent";
import styles from "./Testimonials.module.css";

/**
 * Single Testimonial Card displaying quote, avatar, author name, and location/role.
 */
export function TestimonialCard({ testimonial }) {
  const testimonialContent = {
    ...HOMEPAGE_TESTIMONIALS_CONTENT.testimonials[0],
    ...testimonial,
  };

  return (
    <article className={styles.card}>
      {/* Decorative Quote Icon */}
      <QuoteIcon className={styles.quoteIcon} aria-hidden="true" />

      {/* Quote Statement */}
      <blockquote className={styles.quoteText}>
        {testimonialContent.quote}
      </blockquote>

      {/* Author Information */}
      <div className={styles.authorRow}>
        <div className={styles.avatar}>
          <Image
            src={testimonialContent.avatar}
            alt={testimonialContent.name}
            fill
            className="object-cover"
          />
        </div>

        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{testimonialContent.name}</span>
          <span className={styles.authorRole}>{testimonialContent.role}</span>
        </div>
      </div>
    </article>
  );
}

export default TestimonialCard;
