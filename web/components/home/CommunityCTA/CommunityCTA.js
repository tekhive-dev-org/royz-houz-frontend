import { useState } from "react";
import { HOMEPAGE_COMMUNITY_CTA_CONTENT } from "@/constants/homepageContent";
import styles from "./CommunityCTA.module.css";

export function CommunityCTA({ content }) {
  const [email, setEmail] = useState("");
  const communityContent = { ...HOMEPAGE_COMMUNITY_CTA_CONTENT, ...content };
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@") || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "community-cta" }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) throw new Error(payload?.error?.message || "Unable to subscribe right now.");
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (submitError) {
      setError(submitError.message || "Unable to subscribe right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.section} id="community-cta">
      <div className={styles.container}>
        {/* Main Headline */}
        <h2 className={styles.headline}>
          {communityContent.headline}
        </h2>

        {/* Subtitle */}
        <p className={styles.subheadline}>
          {communityContent.description}
        </p>

        {/* Subscription Form */}
        {isSubmitted ? (
          <div className={styles.successMessage}>
            {communityContent.successMessage}
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={communityContent.inputPlaceholder}
              required
              className={styles.input}
              aria-label={communityContent.inputAriaLabel}
            />
            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ? "Subscribing…" : communityContent.submitLabel}
            </button>
          </form>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </section>
  );
}

export default CommunityCTA;
