import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import styles from "./OurImpact.module.css";

export function OurImpact() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* Left Column: Text & CTA */}
          <div className={styles.leftCol}>
            {/* Category Sub-badge */}
            <div className={styles.badgeRow}>
              <span className={styles.badgeLine} />
              <span>OUR IMPACT</span>
              <span className={styles.badgeLine} />
            </div>

            {/* Headline */}
            <h2 className={styles.headline}>
              Creating Opportunities
              <span className={styles.headlineAccent}>Transforming Lives.</span>
            </h2>

            {/* Description */}
            <p className={styles.description}>
              Through education, mentorship, creative programs and community initiatives, we are empowering the next generation to rise, create and lead.
            </p>

            {/* Support Our Mission CTA */}
            <div>
              <Link href="/about" className={styles.ctaBtn}>
                Support Our Mission
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
              aria-label="Play Impact Story Video"
            >
              <Image
                src="/assets/img/impact.jpg"
                alt="Empowering African Youth through Education and Mentorship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={styles.videoThumbnail}
              />

              {/* Overlay with Play Button */}
              <div className={styles.videoOverlay}>
                <div className={styles.playBtn}>
                  <Image
                    src="/assets/icons/playbtn.png"
                    alt="Play video"
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
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="RoyzHouse Impact Story"
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
