import styles from "./EventsTabs.module.css";

/**
 * EventsTabs component switching between UPCOMING EVENTS and PAST EVENTS.
 */
export function EventsTabs({
  activeTab = "upcoming",
  onTabChange,
}) {
  return (
    <nav className={styles.tabsContainer} aria-label="Events sub-navigation">
      <div className={styles.innerContainer} role="tablist">
        {/* Tab 1: Upcoming Events */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "upcoming"}
          onClick={() => onTabChange?.("upcoming")}
          className={`${styles.tabBtn} ${
            activeTab === "upcoming" ? styles.tabBtnActive : ""
          }`}
        >
          <span>Upcoming Events</span>
          {activeTab === "upcoming" && <span className={styles.activeIndicator} />}
        </button>

        {/* Tab 2: Past Events */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "past"}
          onClick={() => onTabChange?.("past")}
          className={`${styles.tabBtn} ${
            activeTab === "past" ? styles.tabBtnActive : ""
          }`}
        >
          <span>Past Events</span>
          {activeTab === "past" && <span className={styles.activeIndicator} />}
        </button>
      </div>
    </nav>
  );
}

export default EventsTabs;
