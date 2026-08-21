import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./ContactFAQ.module.css";

const CONTACT_FAQS = [
  {
    question: "How can I become part of Royz Houz as a talent?",
    answer:
      "You can apply through our Talent Hub page. Submit your portfolio, social profiles, and creative work samples. Our team reviews applications on a rolling basis and will contact you if you're a fit.",
  },
  {
    question: "How can I get information about upcoming events?",
    answer:
      "Visit our Events page for all upcoming showcases, workshops, and creative gatherings. You can also subscribe to our newsletter to receive early access and exclusive event invitations.",
  },
  {
    question: "How can I partner or collaborate with Royz Houz?",
    answer:
      "We welcome partnerships with brands, organizations, and creative institutions. Please fill out the contact form above with 'Partnership / Collaboration' as your reason, and our team will reach out.",
  },
  {
    question: "How can I contact Royz Houz for media or press enquiries?",
    answer:
      "For media and press enquiries, please email us at press@royzhouz.com or use the contact form and select 'Media / Press' as your reason. We aim to respond within 24 business hours.",
  },
  {
    question: "How can I support Royz Houz's community initiatives?",
    answer:
      "You can support our mission through donations, volunteering, or sponsoring our youth programs. Visit our Donate page or reach out via the contact form to learn more about how you can help.",
  },
  {
    question: "How can I contact Royz Houz?",
    answer:
      "You can reach us via email at hello@royzhouz.com, by phone at +234 124 231 3542 (Mon–Fri, 8AM–5PM), or visit our headquarters in Lekki Phase 2, Lagos. You can also use the form above.",
  },
];

/**
 * ContactFAQ component matching the 1440x362 SVG specification.
 * Enclosed in a 1275px wide white card with #DCA43E gold accent bar and 2-column accordion grid.
 */
export function ContactFAQ() {
  const [openIndices, setOpenIndices] = useState([]);

  const toggleIndex = (idx) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className={styles.section} aria-label="Frequently Asked Questions">
      <div className={styles.container}>
        {/* ── Outer 1275x350 Spec Card ─────────────── */}
        <div className={styles.cardWrapper}>
          {/* Header with #DCA43E Accent Bar */}
          <div className={styles.header}>
            <span className={styles.accentBar} aria-hidden="true" />
            <h2 className={styles.title}>Frequently Asked Questions</h2>
          </div>

          {/* 2-Column Accordion Grid */}
          <div className={styles.grid}>
            {CONTACT_FAQS.map((faq, idx) => {
              const isOpen = openIndices.includes(idx);

              return (
                <div
                  key={idx}
                  className={`${styles.accordionItem} ${
                    isOpen ? styles.accordionItemOpen : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(idx)}
                    className={styles.questionBtn}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.questionText}>{faq.question}</span>
                    <ChevronDown
                      className={`${styles.chevron} ${
                        isOpen ? styles.chevronOpen : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className={styles.answerContent}>
                      <p className={styles.answerText}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactFAQ;
