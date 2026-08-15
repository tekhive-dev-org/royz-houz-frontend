import { useState } from "react";
import { useRouter } from "next/router";
import { TalentProfileHero } from "./TalentProfileHero";
import { TalentProfileStickyBar } from "./TalentProfileStickyBar";
import { TalentProfileTabs } from "./TalentProfileTabs";
import { TalentProfileSidebar } from "./TalentProfileSidebar";
import { ShareModal } from "./ShareModal";
import { TalentCTA } from "../TalentCTA";
import styles from "./TalentProfile.module.css";

/**
 * TalentProfile root orchestrator composing hero, sticky bar, 2-column tabs/sidebar, and CTA.
 */
export function TalentProfile({ talent }) {
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!talent) return null;

  const handleBookClick = () => {
    router.push(`/talents/${talent.slug || talent.id}/book`);
  };

  return (
    <article className="w-full bg-white pb-10">
      {/* Hero Header */}
      <TalentProfileHero talent={talent} />

      {/* Sticky Action Bar */}
      <TalentProfileStickyBar
        talent={talent}
        onBookClick={handleBookClick}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      {/* Main Content (Tabs + Sidebar) */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.layoutGrid}>
            {/* Left Column: Category Tabs & Content */}
            <div className={styles.leftColumn}>
              <TalentProfileTabs talent={talent} />
            </div>

            {/* Right Column: Booking Card & Widgets */}
            <div className={styles.rightColumn}>
              <TalentProfileSidebar talent={talent} onBookClick={handleBookClick} />
            </div>
          </div>
        </div>
      </div>

      {/* Share Profile Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        talent={talent}
      />

      {/* "Are you a talented Individual?" CTA Section */}
      <TalentCTA />
    </article>
  );
}

export default TalentProfile;
