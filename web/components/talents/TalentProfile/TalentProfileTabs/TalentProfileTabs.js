import { useState } from "react";
import { AboutTab } from "./AboutTab";
import { GalleryTab } from "./GalleryTab";
import { VideosTab } from "./VideosTab";
import { MusicTab } from "./MusicTab";
import { PublicationsTab } from "./PublicationsTab";
import styles from "./TalentProfileTabs.module.css";

/**
 * TalentProfileTabs component orchestrating category-specific tab navigation and contents.
 */
export function TalentProfileTabs({ talent }) {
  const tabs = Array.isArray(talent?.tabs)
    ? talent.tabs
        .map((tab) => String(tab).trim().toUpperCase())
        .filter(Boolean)
    : [];
  const [activeTab, setActiveTab] = useState(tabs[0] || null);

  const renderTabContent = () => {
    switch (activeTab) {
      case "ABOUT":
        return <AboutTab talent={talent} />;
      case "GALLERY":
        return <GalleryTab talent={talent} />;
      case "VIDEOS":
        return <VideosTab talent={talent} />;
      case "MUSIC":
        return <MusicTab talent={talent} />;
      case "PUBLICATIONS":
        return <PublicationsTab talent={talent} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.tabContainer}>
      {/* Dynamic Tab Navigation */}
      <div className={styles.tabNav} role="tablist" aria-label="Talent Profile Navigation">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${
                isActive ? styles.tabBtnActive : ""
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Content */}
      <div className="w-full">{renderTabContent()}</div>
    </div>
  );
}

export default TalentProfileTabs;
