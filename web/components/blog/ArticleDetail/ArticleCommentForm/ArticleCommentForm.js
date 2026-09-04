import { useState } from "react";
import styles from "./ArticleCommentForm.module.css";

/**
 * ArticleCommentForm submits comments through the moderated public endpoint.
 */
export function ArticleCommentForm({ postId }) {
  const [formData, setFormData] = useState({ name: "", email: "", comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!postId || !formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) return;

    setIsSubmitting(true);
    setSubmittedMessage("");
    setFormError("");

    try {
      const response = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorName: formData.name.trim(),
          authorEmail: formData.email.trim(),
          body: formData.comment.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        setFormError(payload?.error?.message || "We could not submit your comment. Please try again.");
        return;
      }

      setFormData({ name: "", email: "", comment: "" });
      setSubmittedMessage("Thank you! Your comment has been submitted for moderation.");
    } catch {
      setFormError("We could not submit your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.formCard} aria-label="Leave a Comment">
      <h3 className={styles.heading}>Leave a Comment</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputRow}>
          <div className={styles.fieldGroup}>
            <label htmlFor="commentName" className={styles.label}>
              Name <span className={styles.required}>*</span>
            </label>
            <input
              id="commentName"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="commentEmail" className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="commentEmail"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="commentContent" className={styles.label}>
            Comment <span className={styles.required}>*</span>
          </label>
          <textarea
            id="commentContent"
            name="comment"
            required
            rows={4}
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your thoughts..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.actionRow}>
          <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
            {isSubmitting ? "POSTING..." : "POST COMMENT"}
          </button>

          {submittedMessage && (
            <p className={styles.successMessage} role="status">
              {submittedMessage}
            </p>
          )}
          {formError && <p className={styles.errorMessage} role="alert">{formError}</p>}
        </div>
      </form>
    </section>
  );
}

export default ArticleCommentForm;
