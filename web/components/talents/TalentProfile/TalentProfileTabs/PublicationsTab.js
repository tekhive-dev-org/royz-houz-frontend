import styles from "./TalentProfileTabs.module.css";

/**
 * PublicationsTab rendering written works, screenplays, and published books for writers.
 */
export function PublicationsTab({ talent }) {
  const publications = Array.isArray(talent?.publications)
    ? talent.publications
    : [];

  return (
    <div className={styles.pubList} role="tabpanel" aria-label="Publications">
      {publications.map((pub, idx) => {
        const publicationMeta = [pub.publisher, pub.year]
          .filter(Boolean)
          .join(" • ");
        const title = <h4 className={styles.pubTitle}>{pub.title}</h4>;

        return (
          <div key={pub.id || pub.url || idx} className={styles.pubCard}>
            <div>
              {pub.url ? (
                <a href={pub.url} target="_blank" rel="noopener noreferrer">
                  {title}
                </a>
              ) : (
                title
              )}
              <span className="text-xs text-slate-500">{publicationMeta}</span>
            </div>

            <span className={styles.pubType}>{pub.type}</span>
          </div>
        );
      })}
    </div>
  );
}

export default PublicationsTab;
