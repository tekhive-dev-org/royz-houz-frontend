import { useState } from "react";
import { formatBannerDuration, formatDisplayDuration } from "@/adapters/mediaAdapter";
import styles from "./TalentVideoPlayer.module.css";

function getVideoSubtitle(item) {
  return item.artist || item.subtitle || item.producer || item.role || item.genre || "";
}

function getMusicSubtitle(item) {
  return item.artist || item.producer || item.plays || item.streams || item.genre || "";
}

function ProductionRow({ item, index, isActive, subtitle, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`${styles.trackItem} ${isActive ? styles.trackItemActive : ""}`}
      aria-current={isActive ? "true" : undefined}
    >
      <span className={styles.trackLeft}>
        {isActive ? (
          <span className={styles.equalizerIcon} aria-label="Now playing">
            <span className={`${styles.equalizerBar} h-2.5`} />
            <span className={`${styles.equalizerBar} h-4`} />
            <span className={`${styles.equalizerBar} h-2`} />
            <span className={`${styles.equalizerBar} h-3`} />
          </span>
        ) : (
          <span className={styles.trackNumber}>{index + 1}</span>
        )}

        <span className={styles.trackInfo}>
          <span className={isActive ? styles.trackNameActive : styles.trackName}>
            {item.title}
          </span>
          {subtitle ? <span className={styles.trackMeta}>{subtitle}</span> : null}
        </span>
      </span>

      <span className={styles.trackDuration}>
        {formatBannerDuration(item.duration) || formatDisplayDuration(item.duration) || item.duration || item.readTime || ""}
      </span>
    </button>
  );
}

export function TalentProductions({
  talent = {},
  videos = [],
  music = [],
  activeMediaId,
  onSelectMedia,
}) {
  const videoItems = Array.isArray(videos) ? videos : [];
  const musicItems = Array.isArray(music) ? music : [];
  const allItems = [...videoItems, ...musicItems];
  const initialActiveId = allItems.find((item) => item.isActive)?.id || allItems[0]?.id || null;
  const [internalActiveId, setInternalActiveId] = useState(initialActiveId);
  const activeId = activeMediaId !== undefined ? activeMediaId : internalActiveId;

  const handleSelect = (item) => {
    setInternalActiveId(item.id);
    onSelectMedia?.(item);
  };

  return (
    <div className={styles.creditsCard} aria-label="Productions">
      <div className={styles.creditsHeader}>
        <h2 className={styles.creditsTitle}>Productions — {talent.name}</h2>
        <span className={styles.creditsCount}>
          {allItems.length} {allItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {allItems.length === 0 ? (
        <p className={styles.productionsEmpty}>
          No videos or music have been published for this talent.
        </p>
      ) : (
        <div className={styles.productionsGroups}>
          {videoItems.length ? (
            <section className={styles.productionGroup}>
              <h3 className={styles.productionGroupTitle}>Videos</h3>
              <div className={styles.trackList} role="list">
                {videoItems.map((item, index) => (
                  <ProductionRow
                    key={item.id || index}
                    item={item}
                    index={index}
                    isActive={String(activeId) === String(item.id)}
                    subtitle={getVideoSubtitle(item)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {musicItems.length ? (
            <section className={styles.productionGroup}>
              <h3 className={styles.productionGroupTitle}>Music</h3>
              <div className={styles.trackList} role="list">
                {musicItems.map((item, index) => (
                  <ProductionRow
                    key={item.id || index}
                    item={item}
                    index={index}
                    isActive={String(activeId) === String(item.id)}
                    subtitle={getMusicSubtitle(item)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default TalentProductions;
