import { useState } from "react";
import styles from "./ArticleCommentForm.module.css";

/**
 * ArticleCommentForm provides an interactive form matching the 1026x364 vector specification.
 */
export function ArticleCommentForm({ onAddComment }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (onAddComment) {
        onAddComment({
          author: formData.name,
          email: formData.email,
          content: formData.comment,
        });
      }
      setFormData({ name: "", email: "", comment: "" });
      setIsSubmitting(false);
      setSubmittedMessage("Thank you! Your comment has been posted.");
      setTimeout(() => setSubmittedMessage(""), 4000);
    }, 400);
  };

  return (
    <section className={styles.formCard} aria-label="Leave a Comment">
      <h3 className={styles.heading}>Leave a Comment</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Name and Email Row */}
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

        {/* Comment Textarea */}
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

        {/* Action Button & Confirmation Message */}
        <div className={styles.actionRow}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting ? "POSTING..." : "POST COMMENT"}
          </button>

          {submittedMessage && (
            <p className={styles.successMessage} role="status">
              {submittedMessage}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

export default ArticleCommentForm;
