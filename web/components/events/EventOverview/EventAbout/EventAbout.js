import styles from "./EventAbout.module.css";

/**
 * EventAbout component displaying event summary paragraphs with amber accent title.
 */
export function EventAbout({ event }) {
  const paragraphs =
    event?.aboutParagraphs || [
      "West Africa's premier fashion showcase spotlighting the continent's next generation of design talent. Full runway show, designer meet-and-greet, and pop-up market.",
      "Join Africa's most influential creative minds for a day of powerful keynotes, intimate workshops, live performances, and unparalleled networking. This summit is where culture meets commerce.",
    ];

  return (
    <section className={styles.section} aria-label="About this Event">
      {/* Title with Amber Accent Bar */}
      <div className={styles.header}>
        <span className={styles.accentBar} aria-hidden="true" />
        <h2 className={styles.title}>About this Event</h2>
      </div>

      {/* Paragraphs */}
      <div className={styles.body}>
        {paragraphs.map((p, idx) => (
          <p key={idx} className={styles.paragraph}>
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export default EventAbout;
