import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { ABOUT_STORY_CONTENT } from "@/constants/aboutContent";
import { LeaderCard } from "./LeaderCard";
import styles from "./AboutStory.module.css";

/**
 * AboutStory section component detailing Royz Houz mission, checklist, team and leader card.
 */
export function AboutStory({ content = ABOUT_STORY_CONTENT } = {}) {
  const story = { ...ABOUT_STORY_CONTENT, ...(content || {}) };
  const checklistItems = Array.isArray(story.checklistItems)
    ? story.checklistItems
    : ABOUT_STORY_CONTENT.checklistItems;

  return (
    <section className={styles.section} id="about-story">
      <div className={styles.container}>
        <div className={styles.mainGrid}>

          {/* Left Column: Leader Spotlight Card */}
          <div className={styles.leaderCol}>
            <LeaderCard content={story.leader} />
          </div>

          {/* Right Column: Mission Story, Checklist, & Team Image */}
          <div className={styles.storyCol}>
            {/* Tagline / Sub-badge */}
            <div className={styles.badgeRow}>
              <span className={styles.badgeLine} aria-hidden="true" />
              <span>{story.badge}</span>
            </div>

            {/* Headline */}
            <h2 className={styles.headline}>
              {story.headline}
              <span className={styles.headlineAccent}>{story.headlineAccent}</span>
            </h2>

            {/* Lead Narrative */}
            <p className={styles.leadDescription}>
              {story.leadDescription}
            </p>

            {/* Inner Split: Checklist & Team Image */}
            <div className={styles.innerGrid}>
              {/* Checklist & CTA */}
              <div className={styles.checklistCol}>
                <p className={styles.subDescription}>
                  {story.subDescription}
                </p>

                <ul className={styles.checklist}>
                  {checklistItems.map((item, index) => (
                    <li key={item || index} className={styles.checkItem}>
                      <Check className={styles.checkIcon} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  <Link href={story.ctaHref} className={styles.ctaBtn}>
                    {story.ctaLabel}
                  </Link>
                </div>
              </div>

              {/* Team Collaboration Image */}
              <div className={styles.teamImageWrapper}>
                <Image
                  src={story.teamImage}
                  alt={story.teamImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className={styles.teamImage}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default AboutStory;
