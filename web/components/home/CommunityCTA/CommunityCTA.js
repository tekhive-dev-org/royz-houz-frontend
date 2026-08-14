import { useState } from "react";
import styles from "./CommunityCTA.module.css";

export function CommunityCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    // Handle newsletter subscription
    setIsSubmitted(true);
    setEmail("");
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <section className={styles.section} id="community-cta">
      <div className={styles.container}>
        {/* Main Headline */}
        <h2 className={styles.headline}>
          JOIN A THRIVING COMMUNITY OF CREATIVES &amp; INNOVATORS GROWING WITH ROYZ HOUZ
        </h2>

        {/* Subtitle */}
        <p className={styles.subheadline}>
          Get weekly insights, talent spotlights, event invites, and opportunities
          delivered to your inbox.
        </p>

        {/* Subscription Form */}
        {isSubmitted ? (
          <div className={styles.successMessage}>
            🎉 Thank you for subscribing! Check your inbox soon.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className={styles.input}
              aria-label="Email address"
            />
            <button type="submit" className={styles.button}>
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default CommunityCTA;
