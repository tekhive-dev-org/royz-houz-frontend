import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { HOMEPAGE_OUR_IMPACT_CONTENT } from "@/constants/homepageContent";
import styles from "./OurImpact.module.css";

export function OurImpact({ content }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const impact = {
    ...HOMEPAGE_OUR_IMPACT_CONTENT,
    ...content,
    cta: { ...HOMEPAGE_OUR_IMPACT_CONTENT.cta, ...content?.cta },
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Left Column: Text & CTA */}
          <div className={styles.leftCol}>
            {/* Category Sub-badge */}
            <div className={styles.badgeRow}>
              <span className={styles.badgeLine} />
              <span>{impact.badge}</span>
              <span className={styles.badgeLine} />
            </div>

            {/* Headline */}
            <h2 className={styles.headline}>
              {impact.headline}
              <span className={styles.headlineAccent}>{impact.headlineAccent}</span>
            </h2>

            {/* Description */}
            <p className={styles.description}>
              {impact.description}
            </p>

            {/* Support Our Mission CTA */}
            <div>
              <Link href={impact.cta.href} className={styles.ctaBtn}>
                {impact.cta.label}
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Video Component */}
          <div className={styles.rightCol}>
            <div
              className={`${styles.videoCard} group`}
              onClick={() => setIsVideoOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setIsVideoOpen(true);
                }
              }}
              aria-label={impact.videoAriaLabel}
            >
              <Image
                src={impact.image}
                alt={impact.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={styles.videoThumbnail}
              />

              {/* Overlay with Play Button */}
              <div className={styles.videoOverlay}>
                <div className={styles.playBtn}>
                  <Image
                    src={impact.playImage}
                    alt={impact.playImageAlt}
                    width={64}
                    height={64}
                    className={styles.playImage}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Video Modal Player */}
      {isVideoOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsVideoOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeBtn}
              onClick={() => setIsVideoOpen(false)}
              aria-label="Close Video"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <iframe
              src={impact.videoUrl}
              title={impact.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default OurImpact;
