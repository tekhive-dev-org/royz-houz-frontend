import { useState } from "react";
import { DocsSidebar } from "./DocsSidebar";
import { DocsHeader } from "./DocsHeader";
import { DocsChapterContent } from "./DocsChapterContent";
import { DocsPagination } from "./DocsPagination";
import styles from "./Docs.module.css";

export function DocsShell({ chapter }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Desktop Sticky Sidebar */}
      <DocsSidebar activeSlug={chapter.slug} />

      {/* Mobile Drawer */}
      <DocsSidebar
        mobile
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activeSlug={chapter.slug}
      />

      {/* Main Responsive Article */}
      <main className={styles.mainContent}>
        <DocsHeader chapter={chapter} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <DocsChapterContent chapter={chapter} />
        <DocsPagination currentSlug={chapter.slug} />
      </main>
    </div>
  );
}
