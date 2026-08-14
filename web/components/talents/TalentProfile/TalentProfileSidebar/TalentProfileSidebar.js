import { BookingCard } from "./BookingCard";
import { SocialStreaming } from "./SocialStreaming";
import { RelatedTalents } from "./RelatedTalents";
import styles from "./TalentProfileSidebar.module.css";

/**
 * TalentProfileSidebar orchestrating the three right-hand column widgets.
 */
export function TalentProfileSidebar({ talent, onBookClick }) {
  return (
    <aside className={styles.sidebar} aria-label="Talent Details Sidebar">
      <BookingCard talent={talent} onBookClick={onBookClick} />
      <SocialStreaming talent={talent} />
      <RelatedTalents talent={talent} />
    </aside>
  );
}

export default TalentProfileSidebar;
