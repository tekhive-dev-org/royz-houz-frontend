import styles from "./ArticleBody.module.css";

/**
 * ArticleBody component rendering article paragraphs, featured blockquote,
 * and the Key Takeaway / Impact callout card matching the 709x147 vector specification.
 */
export function ArticleBody() {
  return (
    <div className={styles.bodyContainer}>
      <p className={styles.paragraph}>
        This initiative was born out of a simple yet powerful realization: Africa&apos;s creative economy is one of the continent&apos;s most untapped resources. For thousands of young people across Nigeria, access to mentorship, state-of-the-art studio facilities, and career pathways in music, film, design, and storytelling has remained elusive.
      </p>

      <p className={styles.paragraph}>
        At Royz Houz, we launched our 2026 Creative Fellowship with a bold mission: to train, mentor, and launch 500 youth into sustainable creative careers. Through an intensive 12-week immersive curriculum, fellows gained hands-on experience in creative production, digital distribution, brand storytelling, and international licensing.
      </p>

      {/* Featured Quote Callout */}
      <blockquote className={styles.blockquote}>
        <span className={styles.quoteMark}>“</span>
        <p className={styles.quoteText}>
          The creatives who succeed long-term are not the ones who shine first. They are the ones who show each day.
        </p>
        <span className={styles.quoteMark}>”</span>
      </blockquote>

      <p className={styles.paragraph}>
        Fellows worked side-by-side with seasoned industry mentors across Lagos, Accra, and London. They were challenged to produce original content that reflects the authenticity of modern African narratives while meeting global technical standards.
      </p>

      {/* Key Takeaway Highlight Callout Card (709x147 Vector Spec) */}
      <div className={styles.impactCard}>
        <div className={styles.impactTag}>KEY TAKEAWAY</div>
        <p className={styles.impactText}>
          Sustainable creative careers in Africa demand more than just talent; they require financial literacy, strategic collaboration, intentional branding, and a commitment to continuous mentorship.
        </p>
      </div>

      <p className={styles.paragraph}>
        The results were nothing short of extraordinary. Over 85% of our fellows transitioned directly into full-time roles, secured freelance commissions, or launched creative enterprises within three months of graduation.
      </p>

      <p className={styles.paragraph}>
        This is just the beginning. Our vision is to expand the fellowship model across 10 African cities by 2028, ensuring that no young creative with passion and dedication is held back by lack of opportunity.
      </p>
    </div>
  );
}

export default ArticleBody;
