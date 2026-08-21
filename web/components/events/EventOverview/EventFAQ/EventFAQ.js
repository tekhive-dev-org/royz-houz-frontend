import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./EventFAQ.module.css";

const DEFAULT_FAQS = [
  {
    question: "What's the dress code?",
    answer:
      "The dress code is Creative Black Tie / High Fashion. Guests are encouraged to celebrate African contemporary elegance.",
  },
  {
    question: "Can I transfer my ticket?",
    answer:
      "Yes, ticket transfers are permitted up to 48 hours before the event start time through your account portal or support.",
  },
  {
    question: "Is parking available?",
    answer:
      "Yes, dedicated on-site secure parking is available for all attendees, with valet services complimentary for VIP ticket holders.",
  },
  {
    question: "Will sessions be recorded?",
    answer:
      "Select keynote sessions and runway highlights will be recorded and shared with registered attendees following the event.",
  },
  {
    question: "What is the refund policy?",
    answer:
      "Tickets are refundable up to 7 days before the event date. After this period, tickets may be transferred to another attendee.",
  },
];

/**
 * EventFAQ component rendering an interactive accordion for event frequently asked questions.
 */
export function EventFAQ({ event }) {
  const faqs = (Array.isArray(event?.faqs) && event.faqs.length > 0)
    ? event.faqs
    : DEFAULT_FAQS;

  const [openIndices, setOpenIndices] = useState([]);

  const toggleIndex = (idx) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <section className={styles.section} aria-label="Frequently Asked Questions">
      {/* Title with Amber Accent Bar */}
      <div className={styles.header}>
        <span className={styles.accentBar} aria-hidden="true" />
        <h2 className={styles.title}>Frequently Asked Questions</h2>
      </div>

      {/* Accordion Container */}
      <div className={styles.accordionList}>
        {faqs.map((faq, idx) => {
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
    </section>
  );
}

export default EventFAQ;
