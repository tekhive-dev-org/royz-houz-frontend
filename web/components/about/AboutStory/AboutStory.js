import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { LeaderCard } from "./LeaderCard";
import styles from "./AboutStory.module.css";

const CHECKLIST_ITEMS = [
  "Creative Growth & Support",
  "Professional Talent Booking",
  "Events & Creative Experiences",
  "Creative Talent Discovery",
];

/**
 * AboutStory section component detailing Royz Houz mission, checklist, team and leader card.
 */
export function AboutStory() {
  return (
    <section className={styles.section} id="about-story">
      <div className={styles.container}>
        <div className={styles.mainGrid}>

          {/* Left Column: Leader Spotlight Card */}
          <div className={styles.leaderCol}>
            <LeaderCard />
          </div>

          {/* Right Column: Mission Story, Checklist, & Team Image */}
          <div className={styles.storyCol}>
            {/* Tagline / Sub-badge */}
            <div className={styles.badgeRow}>
              <span className={styles.badgeLine} aria-hidden="true" />
              <span>ABOUT ROYZ HOUZ</span>
            </div>

            {/* Headline */}
            <h2 className={styles.headline}>
              Bridging African Talent With The
              <span className={styles.headlineAccent}>World Creating Impact</span>
            </h2>

            {/* Lead Narrative */}
            <p className={styles.leadDescription}>
              Royz Houz is a dynamic african organization committed to discovering,
              developing and empowering creatives, talents while driving positive change
              in communities through entertainment, education and innovation. We are the
              bridge between African talent and the world.
            </p>

            {/* Inner Split: Checklist & Team Image */}
            <div className={styles.innerGrid}>
              {/* Checklist & CTA */}
              <div className={styles.checklistCol}>
                <p className={styles.subDescription}>
                  Today, Royz Houz is home to over 500 of Africa&apos;s most exceptional
                  creatives across music, film, fashion, visual art, dance, photography,
                  and innovation.
                </p>

                <ul className={styles.checklist}>
                  {CHECKLIST_ITEMS.map((item) => (
                    <li key={item} className={styles.checkItem}>
                      <Check className={styles.checkIcon} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  <Link href="/talents" className={styles.ctaBtn}>
                    Explore Talents
                  </Link>
                </div>
              </div>

              {/* Team Collaboration Image */}
              <div className={styles.teamImageWrapper}>
                <Image
                  src="/assets/img/about/team.jpg"
                  alt="Royz Houz Creative Team collaborating"
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
