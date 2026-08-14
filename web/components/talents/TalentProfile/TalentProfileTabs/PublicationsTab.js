import styles from "./TalentProfileTabs.module.css";

/**
 * PublicationsTab rendering written works, screenplays, and published books for writers.
 */
export function PublicationsTab({ talent }) {
  const publications = talent?.publications || [
    { title: "Echoes of the River", type: "Novel", year: "2024" },
    { title: "Beneath the Baobab", type: "Short Story Collection", year: "2023" },
    { title: "Lagos in Solitude", type: "Screenplay", year: "2025" },
  ];

  return (
    <div className={styles.pubList} role="tabpanel" aria-label="Publications">
      {publications.map((pub, idx) => (
        <div key={idx} className={styles.pubCard}>
          <div>
            <h4 className={styles.pubTitle}>{pub.title}</h4>
            <span className="text-xs text-slate-500">{pub.year}</span>
          </div>

          <span className={styles.pubType}>{pub.type}</span>
        </div>
      ))}
    </div>
  );
}

export default PublicationsTab;
