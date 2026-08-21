import styles from "./MerchWhyUs.module.css";

const VALUES = [
  {
    number: "01",
    title: "Made with Purpose",
    description:
      "Thoughtfully created products inspired by creativity, culture and community.",
  },
  {
    number: "02",
    title: "Quality You Can Trust",
    description:
      "Products selected with quality and experience in mind. No shortcuts ever.",
  },
  {
    number: "03",
    title: "Support the Movement",
    description:
      "Connect with the Royz Houz ecosystem through every purchase you make.",
  },
  {
    number: "04",
    title: "Designed for Expression",
    description:
      "Pieces created to reflect individually and the spirit of African creativity.",
  },
];

/**
 * MerchWhyUs Component
 * Displays "OUR VALUES" / "Why Shop at Royz Houz?" 4-column value pillars.
 */
export function MerchWhyUs() {
  return (
    <section className={styles.section} aria-label="Why Shop at Royz Houz">
      <div className={styles.container}>
        {/* ── Section Header ──────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.tagWrapper}>
            <span className={styles.tagLine} />
            <span className={styles.tagText}>OUR VALUES</span>
            <span className={styles.tagLine} />
          </div>
          <h2 className={styles.title}>Why Shop at Royz Houz?</h2>
        </div>

        {/* ── 4 Value Columns Grid ────────────────────── */}
        <div className={styles.grid}>
          {VALUES.map((val) => (
            <div key={val.number} className={styles.valueColumn}>
              <span className={styles.number}>{val.number}</span>
              <span className={styles.accentBar} />
              <h3 className={styles.valueTitle}>{val.title}</h3>
              <p className={styles.valueDesc}>{val.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MerchWhyUs;

