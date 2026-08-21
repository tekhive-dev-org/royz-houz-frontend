import styles from "./EventSchedule.module.css";

/**
 * EventSchedule component rendering the event timetable and session breakdown.
 */
export function EventSchedule({ event }) {
  const scheduleItems = event?.schedule || [
    { time: "16:00", title: "Warm - up and technique" },
    { time: "17:00", title: "Repertory building" },
    { time: "18:00", title: "Opening show" },
  ];

  if (!scheduleItems || scheduleItems.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Event Schedule">
      {/* Title with Amber Accent Bar */}
      <div className={styles.header}>
        <span className={styles.accentBar} aria-hidden="true" />
        <h2 className={styles.title}>Schedule</h2>
      </div>

      {/* Schedule Table / Box */}
      <div className={styles.scheduleBox}>
        {scheduleItems.map((item, idx) => (
          <div key={idx} className={styles.scheduleRow}>
            <span className={styles.timePill}>{item.time}</span>
            <span className={styles.scheduleContent}>{item.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventSchedule;
